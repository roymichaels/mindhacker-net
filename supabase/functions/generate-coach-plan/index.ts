import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { clientName, clientGoals, clientBackground, coachMethodology, coachingNiche, coachId } = await req.json();

    if (!clientName || !coachId) {
      throw new Error("Missing required fields: clientName, coachId");
    }

    // Build a comprehensive prompt based on coach's methodology
    const prompt = `You are a professional coaching plan generator. Create a detailed, personalized coaching plan.

COACH'S METHODOLOGY:
${JSON.stringify(coachMethodology || {}, null, 2)}

COACHING NICHE: ${coachingNiche || 'General Life Coaching'}

CLIENT INFORMATION:
- Name: ${clientName}
- Goals: ${clientGoals || 'Not specified'}
- Background: ${clientBackground || 'Not specified'}

Create a structured coaching plan in JSON format with these keys:
{
  "plan_title": "A compelling plan title",
  "duration_weeks": number (8-12),
  "overview": "Brief plan overview",
  "phases": [
    {
      "phase_number": 1,
      "title": "Phase title",
      "duration_weeks": number,
      "focus": "What this phase focuses on",
      "goals": ["goal1", "goal2"],
      "sessions": [
        {
          "session_number": 1,
          "title": "Session title",
          "objectives": ["obj1", "obj2"],
          "exercises": ["exercise1", "exercise2"],
          "homework": "What the client should do between sessions"
        }
      ]
    }
  ],
  "success_metrics": ["metric1", "metric2"],
  "tools_and_techniques": ["tool1", "tool2"]
}

IMPORTANT: The plan must align with the coach's specific methodology and niche. Make it practical and actionable.
Respond ONLY with valid JSON.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://api.lovable.dev/v1/ai-gateway", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        "x-supabase-project-ref": Deno.env.get("SUPABASE_URL")?.split("//")[1]?.split(".")[0] || "",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI Gateway error: ${aiResponse.status} - ${errText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle markdown code blocks)
    let planData;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      planData = JSON.parse(jsonMatch[1].trim());
    } catch {
      planData = { raw_plan: content, parse_error: true };
    }

    // Save to database
    const { data: plan, error: insertError } = await supabaseClient
      .from('coach_client_plans')
      .insert({
        coach_id: coachId,
        client_name: clientName,
        plan_data: planData,
        methodology: coachMethodology || {},
        coaching_niche: coachingNiche,
        status: 'active',
        notes: `Generated for ${clientName}. Goals: ${clientGoals || 'N/A'}`,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating coach plan:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
