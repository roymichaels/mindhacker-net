import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { milestone_id, milestone_title, milestone_description, focus_area, duration_minutes, language } = await req.json();

    if (!milestone_id || !milestone_title) {
      return new Response(JSON.stringify({ error: "Missing milestone_id or title" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isHe = language === "he";
    const dur = duration_minutes || 30;

    const prompt = `You are a world-class personal development coach creating an immersive journey experience for a milestone activity.

MILESTONE: "${milestone_title}"
DESCRIPTION: ${milestone_description || "N/A"}
FOCUS AREA: ${focus_area || "general"}
TOTAL DURATION: ~${dur} minutes
LANGUAGE: ${isHe ? "Hebrew" : "English"}

Generate a journey with sequential steps that transforms this milestone into an adventure. Each step is a "stop" on a visual roadmap path.

The AI decides the optimal number of steps (3-8) based on the milestone type:
- Physical training: 5-7 steps (warm-up → drills → peak → cool-down → reflect)
- Breathing/meditation: 3-5 steps (ground → deepen → core practice → integrate)
- Business/creative tasks: 4-6 steps (intention → research → create → refine → celebrate)
- Social/relationship: 3-5 steps (prepare → engage → reflect)

Each step MUST have:
- "title": Short catchy name (${isHe ? "in Hebrew" : "in English"})
- "description": 1-2 sentence guidance (${isHe ? "in Hebrew" : "in English"})
- "icon": One emoji that represents the step
- "duration_seconds": Duration in seconds
- "type": One of "prepare" | "warm_up" | "core" | "challenge" | "cool_down" | "reflect" | "celebrate"
- "guidance_lines": Array of 3-5 short coaching lines spoken during this step (${isHe ? "in Hebrew" : "in English"})
- "completion_criteria": What marks this step as done (${isHe ? "in Hebrew" : "in English"})

Make it feel like a hero's journey — each step builds on the previous one, culminating in a peak moment, then integration.

CRITICAL: The total duration of all steps combined should approximately equal ${dur} minutes (${dur * 60} seconds).

Return ONLY valid JSON: { "steps": [...], "journey_theme": "short theme name", "journey_emoji": "🔥" }`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing AI API key" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI API error:", errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      return new Response(JSON.stringify({ error: "Empty AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error("Cannot parse AI response");
    }

    const steps = parsed.steps || [];
    const journeyTheme = parsed.journey_theme || milestone_title;
    const journeyEmoji = parsed.journey_emoji || "🎯";

    // Upsert into milestone_journey_steps
    const { data: upserted, error: dbError } = await supabase
      .from("milestone_journey_steps")
      .upsert(
        {
          milestone_id,
          user_id: user.id,
          steps: { steps, journey_theme: journeyTheme, journey_emoji: journeyEmoji },
          total_steps: steps.length,
          completed_steps: 0,
          current_step: 0,
          status: "active",
          generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "milestone_id,user_id" }
      )
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to save journey" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, journey: upserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
