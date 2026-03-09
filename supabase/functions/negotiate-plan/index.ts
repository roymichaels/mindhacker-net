import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user_id, action_type, task_title, task_title_en, task_pillar, task_duration, user_input, milestone_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get user's practice library for swap suggestions
    let practiceContext = "";
    if (action_type === "swap") {
      const { data: practices } = await supabase
        .from("life_plan_milestones")
        .select("title, title_en, focus_area, tasks")
        .eq("plan_id", (await supabase.from("life_plans").select("id").eq("user_id", user_id).eq("status", "active").maybeSingle()).data?.id || "")
        .eq("is_completed", false)
        .limit(20);

      if (practices?.length) {
        practiceContext = `\nAvailable milestones in user's plan:\n${practices.map(p => `- ${p.title_en || p.title} (${p.focus_area || 'general'})`).join("\n")}`;
      }
    }

    const systemPrompt = `You are Aurora, an AI life coach. A user wants to ${action_type} a task in their daily plan.

Current task: "${task_title_en || task_title}" (pillar: ${task_pillar}, duration: ${task_duration} min)
User request: "${user_input}"
${practiceContext}

Rules for evaluation:
- SWAP: Approve if the replacement is equivalent in training value, duration (±20%), and targets the same pillar/muscle group. Suggest a specific replacement from their plan or a reasonable alternative.
- RESCHEDULE: Approve if user has a valid reason. Suggest the best alternative day.
- SKIP: Approve only for valid reasons (injury, illness, emergency). Suggest a lighter alternative if possible.

Respond in JSON format:
{
  "approved": true/false,
  "reason": "explanation in ${task_title === task_title_en ? 'English' : 'Hebrew'}",
  "suggestion": "alternative suggestion if not approved (optional)",
  "replacement": { "title": "Hebrew title", "titleEn": "English title", "durationMin": number, "pillar": "pillar_id" } // only for approved swaps
}`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: user_input },
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });

    const aiData = await res.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { approved: false, reason: "Failed to parse AI response", suggestion: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Negotiate error:", error);
    return new Response(JSON.stringify({ approved: false, reason: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
