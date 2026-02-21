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

// ─── Execution step generator ─────────────────────────────────
interface ExecStep { label: string; detail?: string; durationSec: number; }

function generateExecutionSteps(actionType: string, pillar: string, durationMin: number, isHe: boolean): ExecStep[] {
  const dur = durationMin;
  // Specific templates per action type
  const templates: Record<string, () => ExecStep[]> = {
    shadowboxing_session: () => isHe ? [
      { label: "חימום — קפיצות + סיבובי מפרקים", durationSec: 120 },
      { label: "סיבוב 1 — ג׳אב-קרוס, קצב נמוך", detail: "התמקד בטכניקה נקייה", durationSec: 180 },
      { label: "סיבוב 2 — קומבינציות + תנועה", detail: "הוסף ווים ואפרקאטים", durationSec: 180 },
      { label: "סיבוב 3 — אינטנסיביות מקסימלית", detail: "דמיין יריב. תלחם.", durationSec: 180 },
      { label: "שחרור ונשימה — 2 דקות", durationSec: 120 },
    ] : [
      { label: "Warm-up — jump rope + joint circles", durationSec: 120 },
      { label: "Round 1 — Jab-cross, slow tempo", detail: "Focus on clean technique", durationSec: 180 },
      { label: "Round 2 — Combinations + movement", detail: "Add hooks and uppercuts", durationSec: 180 },
      { label: "Round 3 — Max intensity", detail: "Visualize opponent. Fight.", durationSec: 180 },
      { label: "Cooldown & breathwork — 2 min", durationSec: 120 },
    ],
    deep_work_block: () => isHe ? [
      { label: "הגדר כוונה — מה בדיוק תעשה ב-45 הדקות?", durationSec: 60 },
      { label: "סגור הסחות — טלפון במצב טיסה", durationSec: 30 },
      { label: "בלוק עבודה עמוקה — 40 דקות רצופות", detail: "אל תעצור. אל תבדוק הודעות.", durationSec: 2400 },
      { label: "סיכום — מה הושג? מה הצעד הבא?", durationSec: 120 },
    ] : [
      { label: "Set intention — what exactly will you do?", durationSec: 60 },
      { label: "Remove distractions — phone on airplane mode", durationSec: 30 },
      { label: "Deep work block — 40 unbroken minutes", detail: "Don't stop. Don't check messages.", durationSec: 2400 },
      { label: "Recap — what was achieved? What's next?", durationSec: 120 },
    ],
    strength_session: () => isHe ? [
      { label: "חימום דינמי — 3 דקות", durationSec: 180 },
      { label: "סט 1 — שכיבות סמיכה / פול-אפ", detail: "3 סטים × מקסימום חזרות", durationSec: 300 },
      { label: "סט 2 — סקוואט / לאנג'ים", detail: "3 סטים × 12 חזרות", durationSec: 300 },
      { label: "סט 3 — פלאנק + ליבה", detail: "3 × 30 שניות", durationSec: 180 },
      { label: "מתיחות — 3 דקות", durationSec: 180 },
    ] : [
      { label: "Dynamic warm-up — 3 min", durationSec: 180 },
      { label: "Set 1 — Push-ups / Pull-ups", detail: "3 sets × max reps", durationSec: 300 },
      { label: "Set 2 — Squats / Lunges", detail: "3 sets × 12 reps", durationSec: 300 },
      { label: "Set 3 — Plank + Core", detail: "3 × 30 seconds", durationSec: 180 },
      { label: "Stretching — 3 min", durationSec: 180 },
    ],
    meditation_focus: () => isHe ? [
      { label: "שב בנוחות. עיניים עצומות.", durationSec: 30 },
      { label: "5 נשימות עמוקות — שאיפה 4, עצירה 4, נשיפה 6", durationSec: 120 },
      { label: "סריקת גוף — ראש עד רגליים", detail: "שחרר כל מתח שאתה מרגיש", durationSec: 180 },
      { label: "ישיבה בשקט — תצפית על מחשבות", detail: "אל תשפוט, רק צפה", durationSec: 360 },
      { label: "חזרה — 3 נשימות, פתח עיניים", durationSec: 60 },
    ] : [
      { label: "Sit comfortably. Close your eyes.", durationSec: 30 },
      { label: "5 deep breaths — inhale 4, hold 4, exhale 6", durationSec: 120 },
      { label: "Body scan — head to toes", detail: "Release any tension you feel", durationSec: 180 },
      { label: "Quiet sitting — observe thoughts", detail: "Don't judge, just watch", durationSec: 360 },
      { label: "Return — 3 breaths, open eyes", durationSec: 60 },
    ],
  };

  if (templates[actionType]) return templates[actionType]();

  // Generic fallback
  const coreMin = Math.max(1, dur - 4);
  return isHe ? [
    { label: "הכנה — נשימות עמוקות ומיקוד כוונה", durationSec: 60 },
    { label: `ביצוע ליבה — ${coreMin} דקות`, detail: "עבודה ממוקדת ללא הסחות", durationSec: coreMin * 60 },
    { label: "סגירה — מה למדתי? מה הצעד הבא?", durationSec: 120 },
  ] : [
    { label: "Prepare — deep breaths & set intention", durationSec: 60 },
    { label: `Core execution — ${coreMin} minutes`, detail: "Focused work without distractions", durationSec: coreMin * 60 },
    { label: "Close — what did I learn? What's next?", durationSec: 120 },
  ];
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
    const body = await req.json();
    const { user_id, language = "he", mode } = body;
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── MODE: execution_steps ────────────────────────────
    if (mode === "execution_steps") {
      const { action_type, pillar, duration_min } = body;
      const isHe = language === "he";
      const steps = generateExecutionSteps(action_type, pillar, duration_min || 15, isHe);
      const auroraMessage = isHe
        ? `בוא נתחיל. ${duration_min || 15} דקות של ${pillar || "עבודה"}. אני איתך.`
        : `Let's begin. ${duration_min || 15} minutes of ${pillar || "work"}. I'm with you.`;
      return new Response(
        JSON.stringify({ steps, aurora_message: auroraMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      planMilestonesRes,
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
      // Upcoming milestones from action_items
      supabase.from("action_items").select("id, title, pillar, plan_id, metadata").eq("user_id", user_id).eq("type", "milestone").in("status", ["todo", "doing"]).order("order_index").limit(3),
      // Fallback: milestones directly from life_plan_milestones (if not yet synced to action_items)
      supabase.from("life_plan_milestones").select("id, title, description, week_number, is_completed, plan_id, focus_area").eq("is_completed", false).order("week_number").limit(3),
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
    let milestones = milestonesRes.data || [];
    const minimums = minimumsRes.data || [];
    const assessment = assessmentsRes.data;
    const projects = projectsRes.data || [];
    const pulse = pulseRes.data;

    // If no milestones in action_items, use life_plan_milestones directly
    // Filter plan milestones to only include those belonging to user's active plan
    if (milestones.length === 0 && (planMilestonesRes.data || []).length > 0) {
      // Verify the plan belongs to this user
      const planMilestones = planMilestonesRes.data || [];
      if (planMilestones.length > 0) {
        const planId = planMilestones[0].plan_id;
        const { data: planCheck } = await supabase
          .from("life_plans")
          .select("id")
          .eq("id", planId)
          .eq("user_id", user_id)
          .eq("status", "active")
          .maybeSingle();
        if (planCheck) {
          milestones = planMilestones.map((pm: any) => ({
            id: pm.id,
            title: pm.title,
            pillar: pm.focus_area || "focus",
            plan_id: pm.plan_id,
            metadata: { week_number: pm.week_number, source: "life_plan_milestones" },
          }));
        }
      }
    }

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
