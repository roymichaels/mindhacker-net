/**
 * Career Wizard Edge Function
 * 
 * Handles AI-driven career application conversations.
 * The AI asks follow-up questions based on structured answers and career path.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

const CAREER_PROMPTS: Record<string, string> = {
  coach: `You are a professional career assessment AI for a coaching platform. 
The user wants to become a Coach on our platform. Based on their structured answers, conduct a brief but thorough interview (3-5 follow-up questions).
Focus on: coaching methodology, target audience, credentials/experience, unique value proposition, and growth goals.
Ask ONE question at a time. Be warm, professional, and encouraging.
When you feel you have enough info (after 3-5 exchanges), respond with a JSON block:
\`\`\`json
{"complete": true, "summary": "brief professional summary of the applicant"}
\`\`\``,

  therapist: `You are a professional career assessment AI for a therapy platform.
The user wants to become a Therapist on our platform. Based on their structured answers, conduct a brief interview (3-5 follow-up questions).
Focus on: therapeutic approach, specializations, licensing/credentials, experience with specific populations, and professional development goals.
Ask ONE question at a time. Be empathetic and professional.
When you feel you have enough info (after 3-5 exchanges), respond with a JSON block:
\`\`\`json
{"complete": true, "summary": "brief professional summary of the applicant"}
\`\`\``,

  freelancer: `You are a professional career assessment AI for a freelancer platform.
The user wants to become a Freelancer on our platform. Based on their structured answers, conduct a brief interview (3-5 follow-up questions).
Focus on: core skills, portfolio highlights, ideal project types, pricing strategy, and availability.
Ask ONE question at a time. Be practical and encouraging.
When you feel you have enough info (after 3-5 exchanges), respond with a JSON block:
\`\`\`json
{"complete": true, "summary": "brief professional summary of the applicant"}
\`\`\``,

  creator: `You are a professional career assessment AI for a content creator platform.
The user wants to become a Content Creator on our platform. Based on their structured answers, conduct a brief interview (3-5 follow-up questions).
Focus on: content expertise areas, content formats, audience building experience, monetization strategy, and creative vision.
Ask ONE question at a time. Be creative and motivating.
When you feel you have enough info (after 3-5 exchanges), respond with a JSON block:
\`\`\`json
{"complete": true, "summary": "brief professional summary of the applicant"}
\`\`\``,

  business: `You are a professional career assessment AI for a business platform.
The user wants to register their Business on our platform. Based on their structured answers, conduct a brief interview (3-5 follow-up questions).
Focus on: business model, target market, competitive advantage, current stage, and growth objectives.
Ask ONE question at a time. Be strategic and supportive.
When you feel you have enough info (after 3-5 exchanges), respond with a JSON block:
\`\`\`json
{"complete": true, "summary": "brief professional summary of the applicant"}
\`\`\``,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  try {
    const { career_path, structured_answers, messages, language } = await req.json();

    if (!career_path || !CAREER_PROMPTS[career_path]) {
      return new Response(JSON.stringify({ error: "Invalid career path" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile for context
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, bio")
      .eq("id", userId)
      .single();

    const langInstruction = language === "he"
      ? "\nIMPORTANT: Respond in Hebrew. The user speaks Hebrew."
      : "\nRespond in English.";

    const systemPrompt = CAREER_PROMPTS[career_path] + langInstruction + `

User Profile: ${profile?.full_name || "Unknown"}
Structured Answers: ${JSON.stringify(structured_answers)}

Remember: Ask ONE question at a time. After 3-5 good exchanges, provide the completion JSON.`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []),
    ];

    // Call Lovable AI Gateway
    const gatewayRes = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_AI_GATEWAY_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "x-project-id": Deno.env.get("SUPABASE_URL")?.match(/\/\/([^.]+)/)?.[1] || "",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!gatewayRes.ok) {
      const errText = await gatewayRes.text();
      console.error("AI Gateway error:", errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await gatewayRes.json();
    const reply = aiData.choices?.[0]?.message?.content || "";

    // Check if AI indicates completion
    const jsonMatch = reply.match(/```json\s*(\{[\s\S]*?"complete"\s*:\s*true[\s\S]*?\})\s*```/);
    let isComplete = false;
    let summary = "";

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        isComplete = parsed.complete === true;
        summary = parsed.summary || "";
      } catch {}
    }

    return new Response(JSON.stringify({
      reply: isComplete ? reply.replace(/```json[\s\S]*?```/, "").trim() : reply,
      is_complete: isComplete,
      summary,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Career wizard error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
