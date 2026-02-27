import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return handleCorsPreFlight();

  try {
    const { user_id, date, language = "he" } = await req.json();
    if (!user_id) throw new Error("user_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = date || new Date().toISOString().slice(0, 10);

    // Idempotency: check existing quests for today
    const { data: existingQuests } = await supabase
      .from("action_items")
      .select("*")
      .eq("user_id", user_id)
      .eq("source", "maple")
      .eq("scheduled_date", today)
      .in("status", ["todo", "doing", "done"]);

    const dailyQuests = (existingQuests || []).filter((q: any) => q.metadata?.quest_type === "daily");
    const bossQuests = (existingQuests || []).filter((q: any) => q.metadata?.is_boss === true);

    if (dailyQuests.length >= 5 && bossQuests.length >= 1) {
      return json({ quests: existingQuests, cached: true });
    }

    // Ensure active build exists
    let { data: build } = await supabase
      .from("user_builds")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!build) {
      // Generate a build first
      const buildRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-weekly-build`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({ user_id, language }),
      });
      const buildResult = await buildRes.json();
      build = buildResult.build;
    }

    // Gather user context
    const [profileRes, skillGapsRes] = await Promise.all([
      supabase.from("profiles").select("level, session_streak, selected_pillars, full_name").eq("id", user_id).single(),
      supabase.from("user_skill_progress").select("skill_id, current_xp, current_level").eq("user_id", user_id).order("current_xp", { ascending: true }).limit(5),
    ]);

    const profile = profileRes.data;
    const skillGaps = skillGapsRes.data || [];
    const buildData = build?.build_data || {};

    // Generate quests via AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const needDaily = 5 - dailyQuests.length;
    const needBoss = bossQuests.length < 1;

    const prompt = questPrompt(profile, buildData, skillGaps, needDaily, needBoss, today, language);

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
            name: "create_quests",
            description: "Create daily quests and optionally a boss quest",
            parameters: {
              type: "object",
              properties: {
                quests: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      zone: { type: "string", description: "pillar/zone name" },
                      difficulty: { type: "integer", minimum: 1, maximum: 10 },
                      xp_reward: { type: "integer", minimum: 10, maximum: 200 },
                      is_boss: { type: "boolean" },
                      quest_type: { type: "string", enum: ["daily", "boss"] },
                    },
                    required: ["title", "description", "zone", "difficulty", "xp_reward", "is_boss", "quest_type"],
                  },
                },
              },
              required: ["quests"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_quests" } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI error:", aiRes.status, errText);
      // Fallback quests
      const fallbackQuests = getFallbackQuests(buildData, profile, language, needDaily, needBoss);
      const inserted = await insertQuests(supabase, user_id, today, fallbackQuests);
      return json({ quests: [...(existingQuests || []), ...inserted], fallback: true });
    }

    const aiData = await aiRes.json();
    let questsData: any[];
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      const parsed = JSON.parse(toolCall.function.arguments);
      questsData = parsed.quests;
    } catch {
      const fallbackQuests = getFallbackQuests(buildData, profile, language, needDaily, needBoss);
      const inserted = await insertQuests(supabase, user_id, today, fallbackQuests);
      return json({ quests: [...(existingQuests || []), ...inserted], fallback: true });
    }

    // Clamp and validate
    questsData = questsData.map((q: any) => ({
      ...q,
      difficulty: Math.max(1, Math.min(10, q.difficulty || 3)),
      xp_reward: Math.max(10, Math.min(200, q.xp_reward || 25)),
    }));

    const inserted = await insertQuests(supabase, user_id, today, questsData);
    return json({ quests: [...(existingQuests || []), ...inserted], cached: false });
  } catch (e) {
    console.error("generate-daily-quests error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function insertQuests(supabase: any, userId: string, date: string, quests: any[]) {
  const rows = quests.map((q: any, i: number) => ({
    user_id: userId,
    type: "task",
    source: "maple",
    status: "todo",
    title: q.title,
    description: q.description,
    pillar: q.zone,
    xp_reward: q.xp_reward,
    scheduled_date: date,
    order_index: i,
    metadata: {
      quest_type: q.quest_type || "daily",
      difficulty: q.difficulty,
      zone: q.zone,
      loot_table: q.is_boss ? "boss" : "daily_basic",
      is_boss: q.is_boss || false,
    },
  }));

  const { data, error } = await supabase.from("action_items").insert(rows).select();
  if (error) throw error;
  return data;
}

function json(data: any) {
  return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function getSystemPrompt(lang: string): string {
  return lang === "he"
    ? `אתה מעצב קוויסטים ל-RPG של התפתחות אישית. צור קוויסטים מדידים, בריאים ומאתגרים. כל קוויסט חייב לכלול קריטריון הצלחה ברור. הבוס קוויסט חייב להיות מאתגר אבל בטוח. אל תעודד התנהגויות מסוכנות.`
    : `You are a quest designer for a self-development RPG. Create measurable, healthy, challenging quests. Each quest must include clear success criteria. Boss quests must be challenging but safe. Never encourage dangerous behaviors.`;
}

function questPrompt(profile: any, build: any, skillGaps: any[], needDaily: number, needBoss: boolean, date: string, lang: string): string {
  const level = profile?.level || 1;
  const pillars = profile?.selected_pillars || ["mind", "vitality"];
  const zones = build?.zone_focus || pillars;
  const buildName = build?.name || "Default";
  const gaps = skillGaps.map((s: any) => s.skill_id).join(", ");

  return `Date: ${date}
User Level: ${level}, Streak: ${profile?.session_streak || 0}
Active Build: "${buildName}"
Zone Focus: ${zones.join(", ")}
Skill Gaps: ${gaps || "none"}
Buffs: ${JSON.stringify(build?.buffs || [])}

Generate ${needDaily} daily quests${needBoss ? " and 1 boss quest" : ""}.
Each quest should:
- Map to a zone from: ${zones.join(", ")} (vary across zones)
- Have clear, measurable success criteria in the description
- Difficulty 1-10 scaled to user level ${level}
- XP reward: daily 15-50, boss 50-200
- Boss quest should target the biggest growth lever and push comfort zone
Language: ${lang}`;
}

function getFallbackQuests(build: any, profile: any, lang: string, needDaily: number, needBoss: boolean): any[] {
  const zones = build?.zone_focus || ["mind", "vitality", "focus"];
  const level = profile?.level || 1;
  const isHe = lang === "he";

  const templates = [
    { title: isHe ? "הליכת בוקר — 15 דקות" : "Morning Walk — 15 min", zone: "vitality", difficulty: 2, xp_reward: 20 },
    { title: isHe ? "עבודה עמוקה — 30 דקות" : "Deep Work — 30 min", zone: "focus", difficulty: 4, xp_reward: 30 },
    { title: isHe ? "מדיטציה — 10 דקות" : "Meditation — 10 min", zone: "consciousness", difficulty: 3, xp_reward: 25 },
    { title: isHe ? "יומן ערב — כתוב 3 תובנות" : "Evening Journal — 3 insights", zone: "expansion", difficulty: 2, xp_reward: 20 },
    { title: isHe ? "אימון גופני — 20 דקות" : "Physical Training — 20 min", zone: "power", difficulty: 5, xp_reward: 35 },
    { title: isHe ? "קריאה ממוקדת — 20 דקות" : "Focused Reading — 20 min", zone: "expansion", difficulty: 3, xp_reward: 25 },
    { title: isHe ? "יצירת קשר משמעותי" : "Meaningful Connection", zone: "relationships", difficulty: 3, xp_reward: 25 },
  ];

  const quests: any[] = [];

  for (let i = 0; i < needDaily && i < templates.length; i++) {
    const t = templates[i % templates.length];
    quests.push({
      ...t,
      description: isHe ? `השלם את המשימה הזו היום. קריטריון: ${t.title}` : `Complete this quest today. Criteria: ${t.title}`,
      is_boss: false,
      quest_type: "daily",
    });
  }

  if (needBoss) {
    const bossXp = Math.min(200, 50 + level * 10);
    quests.push({
      title: isHe ? "🔥 בוס: אתגר הנוחות" : "🔥 Boss: Comfort Zone Challenge",
      description: isHe
        ? "עשה דבר אחד שמפחיד אותך היום. צא מאזור הנוחות. תעד מה עשית ומה הרגשת."
        : "Do one thing that scares you today. Step out of your comfort zone. Document what you did and how you felt.",
      zone: zones[0] || "mind",
      difficulty: Math.min(10, 5 + Math.floor(level / 3)),
      xp_reward: bossXp,
      is_boss: true,
      quest_type: "boss",
    });
  }

  return quests;
}
