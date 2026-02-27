import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return handleCorsPreFlight();

  try {
    const { user_id, week_start, language = "he" } = await req.json();
    if (!user_id) throw new Error("user_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const weekStartDate = week_start || getMonday();
    const weekEndDate = addDays(weekStartDate, 6);

    // Check if active build already exists for this week
    const { data: existing } = await supabase
      .from("user_builds")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true)
      .gte("valid_to", weekStartDate)
      .lte("valid_from", weekEndDate)
      .maybeSingle();

    if (existing) {
      return json({ build: existing, cached: true });
    }

    // Gather context
    const [profileRes, skillsRes] = await Promise.all([
      supabase.from("profiles").select("level, session_streak, selected_pillars, full_name").eq("id", user_id).single(),
      supabase.from("user_skill_progress").select("skill_id, current_xp, current_level").eq("user_id", user_id).order("current_xp", { ascending: true }).limit(10),
    ]);

    const profile = profileRes.data;
    const weakSkills = skillsRes.data || [];

    // Generate build via AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = buildPrompt(profile, weakSkills, language);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: getSystemPrompt(language) },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_build",
            description: "Create a weekly character build",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "Creative build name" },
                theme: { type: "string", description: "One-line theme description" },
                buffs: {
                  type: "array",
                  items: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } }, required: ["name", "description"] },
                  minItems: 3, maxItems: 3,
                },
                weakness: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } }, required: ["name", "description"] },
                skill_multipliers: {
                  type: "object",
                  additionalProperties: { type: "number" },
                  description: "skill_id -> multiplier (0.9 to 1.2)",
                },
                zone_focus: { type: "array", items: { type: "string" }, description: "Top 2-3 pillar zones to focus on" },
                quest_seed: { type: "string", description: "Creative seed phrase for quest generation" },
              },
              required: ["name", "theme", "buffs", "weakness", "skill_multipliers", "zone_focus", "quest_seed"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_build" } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI error:", aiRes.status, errText);
      // Fallback build
      return json({ build: await insertBuild(supabase, user_id, weekStartDate, weekEndDate, getFallbackBuild(language)), cached: false, fallback: true });
    }

    const aiData = await aiRes.json();
    let buildData: any;

    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      buildData = JSON.parse(toolCall.function.arguments);
    } catch {
      return json({ build: await insertBuild(supabase, user_id, weekStartDate, weekEndDate, getFallbackBuild(language)), cached: false, fallback: true });
    }

    // Clamp multipliers
    if (buildData.skill_multipliers) {
      for (const key of Object.keys(buildData.skill_multipliers)) {
        buildData.skill_multipliers[key] = Math.max(0.9, Math.min(1.2, buildData.skill_multipliers[key]));
      }
    }

    const build = await insertBuild(supabase, user_id, weekStartDate, weekEndDate, buildData);
    return json({ build, cached: false });
  } catch (e) {
    console.error("generate-weekly-build error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function insertBuild(supabase: any, userId: string, validFrom: string, validTo: string, buildData: any) {
  // Deactivate previous builds
  await supabase.from("user_builds").update({ is_active: false }).eq("user_id", userId).eq("is_active", true);

  const { data, error } = await supabase
    .from("user_builds")
    .insert({ user_id: userId, valid_from: validFrom, valid_to: validTo, is_active: true, build_data: buildData })
    .select()
    .single();

  if (error) throw error;
  return data;
}

function getMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function json(data: any) {
  return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function getSystemPrompt(lang: string): string {
  return lang === "he"
    ? `אתה מעצב משחקי RPG. צור "Build" שבועי שמותאם אישית למשתמש. ה-Build חייב להיות בריא, מאתגר, ולא קיצוני. אל תעודד התנהגויות מסוכנות. השתמש בעברית.`
    : `You are an RPG game designer. Create a personalized weekly "Build" for the user. The build must be healthy, challenging, and not extreme. Do not encourage dangerous behaviors. Use English.`;
}

function buildPrompt(profile: any, weakSkills: any[], lang: string): string {
  const pillars = profile?.selected_pillars || ["mind", "vitality", "focus"];
  const level = profile?.level || 1;
  const streak = profile?.session_streak || 0;
  const name = profile?.full_name || "User";
  const weakList = weakSkills.map((s: any) => s.skill_id).join(", ");

  return `User: ${name}, Level ${level}, Streak ${streak}
Pillars: ${pillars.join(", ")}
Weakest skills: ${weakList || "unknown"}
Create a unique weekly build that emphasizes growth in weak areas while leveraging strengths.
Build should have a creative name, theme, 3 buffs, 1 weakness, skill multipliers (0.9-1.2x), and 2-3 zone focuses.
Language: ${lang}`;
}

function getFallbackBuild(lang: string) {
  return {
    name: lang === "he" ? "לוחם האיזון" : "The Balanced Warrior",
    theme: lang === "he" ? "שבוע של איזון בין גוף, נפש ועשייה" : "A week of balance between body, mind, and action",
    buffs: [
      { name: lang === "he" ? "מיקוד עמוק" : "Deep Focus", description: lang === "he" ? "+10% XP ממשימות מיקוד" : "+10% XP from focus quests" },
      { name: lang === "he" ? "עמידות" : "Resilience", description: lang === "he" ? "בוס קוויסט קל יותר ב-1 דרגה" : "Boss quest easier by 1 difficulty" },
      { name: lang === "he" ? "מומנטום" : "Momentum", description: lang === "he" ? "סטריק בונוס כפול" : "Double streak bonus" },
    ],
    weakness: { name: lang === "he" ? "חוסר סבלנות" : "Impatience", description: lang === "he" ? "משימות ארוכות נותנות פחות XP" : "Long quests give less XP" },
    skill_multipliers: { focus: 1.1, vitality: 1.05, combat: 0.95 },
    zone_focus: ["mind", "vitality"],
    quest_seed: "balanced-warrior-default",
  };
}
