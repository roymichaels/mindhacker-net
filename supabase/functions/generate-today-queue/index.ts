import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Pillar weights (higher = more likely to appear daily) ─────
const PILLAR_WEIGHTS: Record<string, number> = {
  vitality: 10,
  focus: 9,
  power: 7,
  presence: 6,
  consciousness: 5,
  combat: 4,
  expansion: 5,
  wealth: 6,
  influence: 4,
  relationships: 4,
  business: 5,
  projects: 6,
  play: 3,
};

// ─── Action templates by pillar ────────────────────────────────
interface ActionTemplate {
  pillar: string;
  hub: "core" | "arena";
  actionType: string;
  titleHe: string;
  titleEn: string;
  durationMin: number;
  urgencyBase: number;
}

const ACTION_TEMPLATES: ActionTemplate[] = [
  // Vitality (high priority base)
  { pillar: "vitality", hub: "core", actionType: "morning_sunlight", titleHe: "חשיפה לאור בוקר — 10 דקות", titleEn: "Morning sunlight — 10 min", durationMin: 10, urgencyBase: 9 },
  { pillar: "vitality", hub: "core", actionType: "hydration", titleHe: "שתייה ותזונה מעוגנת", titleEn: "Hydration & anchored nutrition", durationMin: 5, urgencyBase: 8 },
  { pillar: "vitality", hub: "core", actionType: "sleep_shutdown", titleHe: "מנגנון כיבוי ערב", titleEn: "Evening shutdown protocol", durationMin: 15, urgencyBase: 7 },
  { pillar: "vitality", hub: "core", actionType: "recovery_reset", titleHe: "הפוגה והתאוששות", titleEn: "Recovery reset", durationMin: 10, urgencyBase: 6 },
  // Focus
  { pillar: "focus", hub: "core", actionType: "deep_work_block", titleHe: "בלוק עבודה עמוקה", titleEn: "Deep work block", durationMin: 45, urgencyBase: 8 },
  { pillar: "focus", hub: "core", actionType: "breathwork_focus", titleHe: "נשימות מיקוד — 5 דקות", titleEn: "Focus breathwork — 5 min", durationMin: 5, urgencyBase: 7 },
  { pillar: "focus", hub: "core", actionType: "dopamine_clean", titleHe: "ניקוי דופמין — הפסקת מסכים", titleEn: "Dopamine detox — screen break", durationMin: 20, urgencyBase: 6 },
  // Power
  { pillar: "power", hub: "core", actionType: "strength_session", titleHe: "אימון כוח / קליסטניקס", titleEn: "Strength / calisthenics session", durationMin: 40, urgencyBase: 7 },
  // Presence
  { pillar: "presence", hub: "core", actionType: "presence_action", titleHe: "פעולת תדמית — תוכן / טיפוח / יציבה", titleEn: "Presence action — content / grooming / posture", durationMin: 15, urgencyBase: 5 },
  // Combat (gated)
  { pillar: "combat", hub: "core", actionType: "shadowboxing_session", titleHe: "אימון צללים — 3 סיבובים", titleEn: "Shadowboxing — 3 rounds", durationMin: 20, urgencyBase: 6 },
  { pillar: "combat", hub: "core", actionType: "footwork_drills", titleHe: "תרגילי דריכה", titleEn: "Footwork drills", durationMin: 15, urgencyBase: 5 },
  // Expansion
  { pillar: "expansion", hub: "core", actionType: "learning_block", titleHe: "בלוק למידה / שפה / פילוסופיה", titleEn: "Learning / language / philosophy block", durationMin: 30, urgencyBase: 5 },
  // Consciousness
  { pillar: "consciousness", hub: "core", actionType: "meditation_focus", titleHe: "מדיטציה ומודעות עצמית", titleEn: "Meditation & self-awareness", durationMin: 15, urgencyBase: 6 },
  // Wealth
  { pillar: "wealth", hub: "arena", actionType: "money_action", titleHe: "פעולת כסף — חשבונית / הצעה / תמחור", titleEn: "Money action — invoice / outreach / pricing", durationMin: 20, urgencyBase: 7 },
  // Business
  { pillar: "business", hub: "arena", actionType: "business_milestone", titleHe: "אבן דרך עסקית", titleEn: "Business milestone step", durationMin: 30, urgencyBase: 6 },
  // Projects
  { pillar: "projects", hub: "arena", actionType: "project_next_task", titleHe: "משימה הבאה בפרויקט", titleEn: "Next project task", durationMin: 25, urgencyBase: 6 },
  // Influence
  { pillar: "influence", hub: "arena", actionType: "influence_action", titleHe: "פעולת השפעה — תקשורת / נוכחות", titleEn: "Influence action — communication / presence", durationMin: 15, urgencyBase: 4 },
  // Relationships
  { pillar: "relationships", hub: "arena", actionType: "relationships_action", titleHe: "פעולת קשרים — יצירת קשר / שיחה", titleEn: "Connection action — reach out / meaningful conversation", durationMin: 15, urgencyBase: 4 },
  // Play
  { pillar: "play", hub: "arena", actionType: "play_session", titleHe: "חוויית משחק — תנועה / טבע / הרפתקה", titleEn: "Play session — movement / nature / adventure", durationMin: 30, urgencyBase: 3 },
];

// ─── Tier limits ───────────────────────────────────────────────
function getMaxActions(tier: string): number {
  switch (tier) {
    case "mastery":
    case "consistency":
      return 6; // Apex
    case "structure":
      return 5; // Plus
    default:
      return 3; // Free
  }
}

// ─── Core logic ───────────────────────────────────────────────
interface QueueItem {
  pillarId: string;
  hub: "core" | "arena";
  actionType: string;
  title: string;
  titleEn: string;
  durationMin: number;
  urgencyScore: number;
  reason: string;
  sourceType: "plan" | "assessment" | "template" | "habit";
  sourceId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request
    const { user_id, language = "he" } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user tier
    const { data: tierData } = await supabase.rpc("get_user_tier", { p_user_id: user_id });
    const tier = tierData || "clarity";
    const maxActions = getMaxActions(tier);

    const today = new Date().toISOString().split("T")[0];

    // ── Parallel data fetch ──────────────────────────────
    const [
      habitsRes,
      todayActionsRes,
      overdueRes,
      milestonesRes,
      minimumsRes,
      assessmentsRes,
      projectsRes,
      pulseRes,
    ] = await Promise.all([
      // Active habits
      supabase.from("action_items").select("id, title, pillar, completed_at").eq("user_id", user_id).eq("type", "habit"),
      // Today tasks already scheduled
      supabase.from("action_items").select("id, title, pillar, status, type").eq("user_id", user_id).in("status", ["todo", "doing"]).in("type", ["task"]).or(`due_at.gte.${today}T00:00:00,due_at.lte.${today}T23:59:59,scheduled_date.eq.${today}`),
      // Overdue tasks
      supabase.from("action_items").select("id, title, pillar, due_at").eq("user_id", user_id).eq("type", "task").in("status", ["todo", "doing"]).lt("due_at", `${today}T00:00:00`).order("due_at").limit(3),
      // Upcoming milestones
      supabase.from("action_items").select("id, title, pillar, plan_id, metadata").eq("user_id", user_id).eq("type", "milestone").in("status", ["todo", "doing"]).order("order_index").limit(3),
      // Daily minimums (anchors)
      supabase.from("aurora_daily_minimums").select("id, title, category").eq("user_id", user_id).eq("is_active", true),
      // Pillar assessments (onboarding diagnostic data)
      supabase.from("aurora_onboarding_progress").select("direction_clarity, identity_understanding, energy_patterns_status").eq("user_id", user_id).single(),
      // Active projects
      supabase.from("user_projects").select("id, name, category, priority, updated_at").eq("user_id", user_id).eq("status", "active").order("priority").limit(5),
      // Today's pulse (energy level)
      supabase.from("daily_pulse_logs").select("energy_rating, mood").eq("user_id", user_id).eq("log_date", today).maybeSingle(),
    ]);

    const habits = habitsRes.data || [];
    const todayActions = todayActionsRes.data || [];
    const overdue = overdueRes.data || [];
    const milestones = milestonesRes.data || [];
    const minimums = minimumsRes.data || [];
    const assessment = assessmentsRes.data;
    const projects = projectsRes.data || [];
    const pulse = pulseRes.data;

    // ── Build queue ──────────────────────────────────────
    const queue: QueueItem[] = [];
    const usedPillars = new Set<string>();
    const usedActionTypes = new Set<string>();

    // 1. Overdue tasks (highest priority)
    for (const task of overdue) {
      if (queue.length >= maxActions) break;
      queue.push({
        pillarId: task.pillar || "focus",
        hub: ["wealth", "influence", "relationships", "business", "projects", "play"].includes(task.pillar || "") ? "arena" : "core",
        actionType: "overdue_task",
        title: task.title,
        titleEn: task.title,
        durationMin: 15,
        urgencyScore: 10,
        reason: language === "he" ? "משימה באיחור" : "Overdue task",
        sourceType: "plan",
        sourceId: task.id,
      });
      if (task.pillar) usedPillars.add(task.pillar);
    }

    // 2. Incomplete habits for today
    const todayStart = `${today}T00:00:00`;
    const todayEnd = `${today}T23:59:59`;
    for (const habit of habits) {
      if (queue.length >= maxActions) break;
      const completedToday = habit.completed_at && habit.completed_at >= todayStart && habit.completed_at <= todayEnd;
      if (completedToday) continue;
      queue.push({
        pillarId: habit.pillar || "vitality",
        hub: "core",
        actionType: "daily_habit",
        title: habit.title,
        titleEn: habit.title,
        durationMin: 5,
        urgencyScore: 8,
        reason: language === "he" ? "הרגל יומי" : "Daily habit",
        sourceType: "habit",
        sourceId: habit.id,
      });
      if (habit.pillar) usedPillars.add(habit.pillar);
    }

    // 3. Milestone-derived actions
    for (const ms of milestones) {
      if (queue.length >= maxActions) break;
      const pillar = ms.pillar || "focus";
      if (usedPillars.has(pillar) && queue.length >= 2) continue;
      queue.push({
        pillarId: pillar,
        hub: ["wealth", "influence", "relationships", "business", "projects", "play"].includes(pillar) ? "arena" : "core",
        actionType: "milestone_step",
        title: ms.title,
        titleEn: ms.title,
        durationMin: 30,
        urgencyScore: 7,
        reason: language === "he" ? "צעד לקראת אבן דרך" : "Milestone step",
        sourceType: "plan",
        sourceId: ms.id,
      });
      usedPillars.add(pillar);
    }

    // 4. Project-based actions
    for (const proj of projects) {
      if (queue.length >= maxActions) break;
      if (usedPillars.has("projects")) continue;
      queue.push({
        pillarId: "projects",
        hub: "arena",
        actionType: "project_next_task",
        title: language === "he" ? `${proj.name} — צעד הבא` : `${proj.name} — Next step`,
        titleEn: `${proj.name} — Next step`,
        durationMin: 25,
        urgencyScore: 6,
        reason: language === "he" ? "פרויקט פעיל" : "Active project",
        sourceType: "plan",
        sourceId: proj.id,
      });
      usedPillars.add("projects");
    }

    // 5. Fill remaining slots from templates (weighted selection)
    if (queue.length < maxActions) {
      // Energy-based adjustments
      const energyMultiplier = pulse?.energy_rating ? pulse.energy_rating / 5 : 0.7;

      // Combat gating: only if vitality + focus are represented
      const canCombat = usedPillars.has("vitality") || usedPillars.has("focus");

      const candidates = ACTION_TEMPLATES
        .filter((t) => !usedPillars.has(t.pillar) && !usedActionTypes.has(t.actionType))
        .filter((t) => t.pillar !== "combat" || canCombat)
        .map((t) => ({
          ...t,
          score: (PILLAR_WEIGHTS[t.pillar] || 5) * t.urgencyBase * energyMultiplier + Math.random() * 3,
        }))
        .sort((a, b) => b.score - a.score);

      for (const c of candidates) {
        if (queue.length >= maxActions) break;
        queue.push({
          pillarId: c.pillar,
          hub: c.hub,
          actionType: c.actionType,
          title: language === "he" ? c.titleHe : c.titleEn,
          titleEn: c.titleEn,
          durationMin: c.durationMin,
          urgencyScore: Math.round(c.score),
          reason: language === "he" ? "מנוע יומי" : "Daily engine",
          sourceType: "template",
        });
        usedPillars.add(c.pillar);
        usedActionTypes.add(c.actionType);
      }
    }

    // Sort final queue by urgency
    queue.sort((a, b) => b.urgencyScore - a.urgencyScore);

    // Return
    return new Response(
      JSON.stringify({
        today_queue: queue,
        generated_at: new Date().toISOString(),
        tier,
        max_actions: maxActions,
        energy_level: pulse?.energy_rating || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-today-queue error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
