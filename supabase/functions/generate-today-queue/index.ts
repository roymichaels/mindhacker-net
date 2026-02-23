import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

/**
 * generate-today-queue v2
 * 
 * Now reads from the 90-day strategy (life_plans.plan_data.strategy)
 * to produce assessment-informed, concrete daily tasks like
 * "Combat Workout — Shadowboxing 3 Rounds", "Strength Training — Upper Body", etc.
 * 
 * Falls back to smart templates if no strategy exists yet.
 */

// ─── Pillar metadata ──────────────────────────────────────────
const BODY_PILLARS = ['vitality', 'power', 'combat'];
const MIND_PILLARS = ['focus', 'consciousness', 'expansion'];
const ARENA_PILLARS = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play'];

function getHub(pillar: string): 'core' | 'arena' {
  return ARENA_PILLARS.includes(pillar) ? 'arena' : 'core';
}

// ─── Tier limits ──────────────────────────────────────────────
function getMaxActions(tier: string): number {
  switch (tier) {
    case "mastery":
    case "consistency": return 9;  // Apex
    case "structure": return 7;    // Plus
    default: return 5;             // Free
  }
}

// ─── Intensity multiplier for the day ─────────────────────────
function getDayIntensity(): { label: string; multiplier: number } {
  const dow = new Date().getDay(); // 0=Sun
  // Pattern: Sun=recovery, Mon=high, Tue=medium, Wed=high, Thu=medium, Fri=light, Sat=medium
  const pattern: Record<number, { label: string; multiplier: number }> = {
    0: { label: 'recovery', multiplier: 0.5 },
    1: { label: 'high', multiplier: 1.2 },
    2: { label: 'medium', multiplier: 1.0 },
    3: { label: 'high', multiplier: 1.2 },
    4: { label: 'medium', multiplier: 1.0 },
    5: { label: 'light', multiplier: 0.7 },
    6: { label: 'medium', multiplier: 1.0 },
  };
  return pattern[dow] || { label: 'medium', multiplier: 1.0 };
}

// ─── Fallback templates (used when no strategy exists) ────────
interface FallbackAction {
  pillar: string;
  action_en: string;
  action_he: string;
  duration_min: number;
  block_type: string;
  urgency: number;
}

const FALLBACK_ACTIONS: FallbackAction[] = [
  { pillar: 'vitality', action_en: 'Morning Sunlight Walk — 10 min', action_he: 'הליכת אור בוקר — 10 דקות', duration_min: 10, block_type: 'body', urgency: 9 },
  { pillar: 'vitality', action_en: 'Evening Shutdown Protocol', action_he: 'פרוטוקול כיבוי ערב', duration_min: 15, block_type: 'body', urgency: 7 },
  { pillar: 'power', action_en: 'Strength Training — Compound Lifts', action_he: 'אימון כוח — הרמות מורכבות', duration_min: 40, block_type: 'body', urgency: 7 },
  { pillar: 'combat', action_en: 'Combat Workout — Shadowboxing 3 Rounds', action_he: 'אימון לחימה — 3 סיבובי צללים', duration_min: 20, block_type: 'body', urgency: 6 },
  { pillar: 'combat', action_en: 'Footwork & Defense Drills', action_he: 'תרגילי דריכה והגנה', duration_min: 15, block_type: 'body', urgency: 5 },
  { pillar: 'focus', action_en: 'Deep Work Block — 45 min', action_he: 'בלוק עבודה עמוקה — 45 דקות', duration_min: 45, block_type: 'mind', urgency: 8 },
  { pillar: 'focus', action_en: 'Focus Breathwork — 5 min', action_he: 'נשימות מיקוד — 5 דקות', duration_min: 5, block_type: 'mind', urgency: 7 },
  { pillar: 'consciousness', action_en: 'Meditation & Self-Awareness — 15 min', action_he: 'מדיטציה ומודעות עצמית — 15 דקות', duration_min: 15, block_type: 'mind', urgency: 6 },
  { pillar: 'consciousness', action_en: 'Evening Reflection Journal', action_he: 'יומן רפלקציה ערבי', duration_min: 10, block_type: 'mind', urgency: 5 },
  { pillar: 'expansion', action_en: 'Learning Block — Read / Study', action_he: 'בלוק למידה — קריאה / לימוד', duration_min: 30, block_type: 'mind', urgency: 5 },
  { pillar: 'presence', action_en: 'Posture & Style Audit', action_he: 'בדיקת יציבה וסגנון', duration_min: 10, block_type: 'mind', urgency: 4 },
  { pillar: 'wealth', action_en: 'Revenue Action — Invoice / Outreach / Pricing', action_he: 'פעולת הכנסה — חשבונית / פנייה / תמחור', duration_min: 25, block_type: 'arena', urgency: 7 },
  { pillar: 'business', action_en: 'Business Strategy Step', action_he: 'צעד אסטרטגיה עסקית', duration_min: 30, block_type: 'arena', urgency: 6 },
  { pillar: 'projects', action_en: 'Project Execution — Next Task', action_he: 'ביצוע פרויקט — משימה הבאה', duration_min: 25, block_type: 'arena', urgency: 6 },
  { pillar: 'influence', action_en: 'Content Creation / Outreach', action_he: 'יצירת תוכן / הפצה', duration_min: 20, block_type: 'arena', urgency: 4 },
  { pillar: 'relationships', action_en: 'Meaningful Connection — Reach Out', action_he: 'קשר משמעותי — יצירת קשר', duration_min: 15, block_type: 'arena', urgency: 4 },
  { pillar: 'play', action_en: 'Play Session — Movement / Nature / Adventure', action_he: 'זמן משחק — תנועה / טבע / הרפתקה', duration_min: 30, block_type: 'arena', urgency: 3 },
];

// ─── Execution step templates ─────────────────────────────────
interface ExecStep { label: string; detail?: string; durationSec: number; }

function generateExecutionSteps(actionType: string, pillar: string, durationMin: number, isHe: boolean): ExecStep[] {
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
      { label: "הגדר כוונה — מה בדיוק תעשה?", durationSec: 60 },
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
      { label: "סריקת גוף — ראש עד רגליים", detail: "שחרר כל מתח", durationSec: 180 },
      { label: "ישיבה בשקט — תצפית על מחשבות", detail: "אל תשפוט, רק צפה", durationSec: 360 },
      { label: "חזרה — 3 נשימות, פתח עיניים", durationSec: 60 },
    ] : [
      { label: "Sit comfortably. Close your eyes.", durationSec: 30 },
      { label: "5 deep breaths — inhale 4, hold 4, exhale 6", durationSec: 120 },
      { label: "Body scan — head to toes", detail: "Release any tension", durationSec: 180 },
      { label: "Quiet sitting — observe thoughts", detail: "Don't judge, just watch", durationSec: 360 },
      { label: "Return — 3 breaths, open eyes", durationSec: 60 },
    ],
  };

  if (templates[actionType]) return templates[actionType]();

  const coreMin = Math.max(1, durationMin - 4);
  return isHe ? [
    { label: "הכנה — נשימות + מיקוד כוונה", durationSec: 60 },
    { label: `ביצוע ליבה — ${coreMin} דקות`, detail: "עבודה ממוקדת ללא הסחות", durationSec: coreMin * 60 },
    { label: "סגירה — מה למדתי? מה הצעד הבא?", durationSec: 120 },
  ] : [
    { label: "Prepare — deep breaths & set intention", durationSec: 60 },
    { label: `Core execution — ${coreMin} minutes`, detail: "Focused work", durationSec: coreMin * 60 },
    { label: "Close — what did I learn? What's next?", durationSec: 120 },
  ];
}

// ─── Queue item type ──────────────────────────────────────────
interface QueueItem {
  pillarId: string;
  hub: "core" | "arena";
  actionType: string;
  title: string;
  titleEn: string;
  durationMin: number;
  urgencyScore: number;
  reason: string;
  sourceType: "strategy" | "plan" | "assessment" | "template" | "habit";
  sourceId?: string;
  blockType?: string;
}

// ─── Get current week of the strategy ─────────────────────────
function getCurrentWeek(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(12, Math.max(1, Math.ceil((diffDays + 1) / 7)));
}

serve(async (req) => {
  if (isCorsPreFlight(req)) return handleCorsPreFlight();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { user_id, language = "he", mode } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    // ── Get user tier ────────────────────────────────────
    const { data: tierData } = await supabase.rpc("get_user_tier", { p_user_id: user_id });
    const tier = tierData || "clarity";
    const maxActions = getMaxActions(tier);
    const dayIntensity = getDayIntensity();
    const today = new Date().toISOString().split("T")[0];
    const isHe = language === "he";

    // ── Parallel data fetch ──────────────────────────────
    const [
      strategiesRes,
      habitsRes,
      todayActionsRes,
      overdueRes,
      projectsRes,
      pulseRes,
      assessmentsRes,
    ] = await Promise.all([
      // Active 90-day strategies
      supabase.from("life_plans").select("id, plan_data, start_date, status")
        .eq("user_id", user_id).eq("status", "active").order("created_at", { ascending: false }),
      // Habits
      supabase.from("action_items").select("id, title, pillar, completed_at")
        .eq("user_id", user_id).eq("type", "habit"),
      // Today tasks already scheduled
      supabase.from("action_items").select("id, title, pillar, status, type")
        .eq("user_id", user_id).in("status", ["todo", "doing"]).eq("type", "task")
        .or(`scheduled_date.eq.${today}`),
      // Overdue tasks
      supabase.from("action_items").select("id, title, pillar, due_at")
        .eq("user_id", user_id).eq("type", "task").in("status", ["todo", "doing"])
        .lt("due_at", `${today}T00:00:00`).order("due_at").limit(3),
      // Active projects
      supabase.from("user_projects").select("id, name, category, priority")
        .eq("user_id", user_id).eq("status", "active").order("priority").limit(5),
      // Today pulse
      supabase.from("daily_pulse_logs").select("energy_rating, mood")
        .eq("user_id", user_id).eq("log_date", today).maybeSingle(),
      // Pillar assessments
      supabase.from("life_domains").select("domain_id, domain_config, status")
        .eq("user_id", user_id),
    ]);

    const strategies = strategiesRes.data || [];
    const habits = habitsRes.data || [];
    const todayActions = todayActionsRes.data || [];
    const overdue = overdueRes.data || [];
    const projects = projectsRes.data || [];
    const pulse = pulseRes.data;
    const assessments = assessmentsRes.data || [];

    // ── Parse strategies ─────────────────────────────────
    const coreStrategy = strategies.find((s: any) => s.plan_data?.hub === 'core');
    const arenaStrategy = strategies.find((s: any) => s.plan_data?.hub === 'arena');

    // ── Build queue ──────────────────────────────────────
    const queue: QueueItem[] = [];
    const usedPillars = new Set<string>();

    // 1. Overdue tasks (highest priority)
    for (const task of overdue) {
      if (queue.length >= maxActions) break;
      queue.push({
        pillarId: task.pillar || "focus",
        hub: getHub(task.pillar || "focus"),
        actionType: "overdue_task",
        title: task.title,
        titleEn: task.title,
        durationMin: 15,
        urgencyScore: 10,
        reason: isHe ? "משימה באיחור" : "Overdue task",
        sourceType: "plan",
        sourceId: task.id,
      });
      if (task.pillar) usedPillars.add(task.pillar);
    }

    // 2. Habits not completed today
    const todayStart = `${today}T00:00:00`;
    const todayEnd = `${today}T23:59:59`;
    for (const habit of habits) {
      if (queue.length >= maxActions) break;
      const completedToday = habit.completed_at && habit.completed_at >= todayStart && habit.completed_at <= todayEnd;
      if (completedToday) continue;
      queue.push({
        pillarId: habit.pillar || "vitality",
        hub: getHub(habit.pillar || "vitality"),
        actionType: "daily_habit",
        title: habit.title,
        titleEn: habit.title,
        durationMin: 5,
        urgencyScore: 8,
        reason: isHe ? "הרגל יומי" : "Daily habit",
        sourceType: "habit",
        sourceId: habit.id,
      });
      if (habit.pillar) usedPillars.add(habit.pillar);
    }

    // 3. Strategy-derived actions (CORE)
    if (coreStrategy) {
      const weekNum = getCurrentWeek(coreStrategy.start_date);
      const strategy = coreStrategy.plan_data?.strategy;
      const weekPlan = strategy?.weeks?.find((w: any) => w.week === weekNum);

      if (weekPlan?.daily_actions) {
        for (const action of weekPlan.daily_actions) {
          if (queue.length >= maxActions) break;
          if (usedPillars.has(action.pillar)) continue;

          queue.push({
            pillarId: action.pillar,
            hub: 'core',
            actionType: action.pillar + '_strategy',
            title: isHe ? action.action_he : action.action_en,
            titleEn: action.action_en,
            durationMin: Math.round(action.duration_min * dayIntensity.multiplier),
            urgencyScore: 7,
            reason: isHe
              ? `${strategy.title_he || 'אסטרטגיה'} — שבוע ${weekNum}`
              : `${strategy.title_en || 'Strategy'} — Week ${weekNum}`,
            sourceType: "strategy",
            sourceId: coreStrategy.id,
            blockType: action.block_type,
          });
          usedPillars.add(action.pillar);
        }
      }
    }

    // 4. Strategy-derived actions (ARENA)
    if (arenaStrategy) {
      const weekNum = getCurrentWeek(arenaStrategy.start_date);
      const strategy = arenaStrategy.plan_data?.strategy;
      const weekPlan = strategy?.weeks?.find((w: any) => w.week === weekNum);

      if (weekPlan?.daily_actions) {
        for (const action of weekPlan.daily_actions) {
          if (queue.length >= maxActions) break;
          if (usedPillars.has(action.pillar)) continue;

          queue.push({
            pillarId: action.pillar,
            hub: 'arena',
            actionType: action.pillar + '_strategy',
            title: isHe ? action.action_he : action.action_en,
            titleEn: action.action_en,
            durationMin: Math.round(action.duration_min * dayIntensity.multiplier),
            urgencyScore: 6,
            reason: isHe
              ? `${strategy.title_he || 'אסטרטגיה'} — שבוע ${weekNum}`
              : `${strategy.title_en || 'Strategy'} — Week ${weekNum}`,
            sourceType: "strategy",
            sourceId: arenaStrategy.id,
            blockType: action.block_type,
          });
          usedPillars.add(action.pillar);
        }
      }
    }

    // 5. Project-based actions
    for (const proj of projects) {
      if (queue.length >= maxActions) break;
      if (usedPillars.has("projects")) continue;
      queue.push({
        pillarId: "projects",
        hub: "arena",
        actionType: "project_next_task",
        title: isHe ? `${proj.name} — צעד הבא` : `${proj.name} — Next step`,
        titleEn: `${proj.name} — Next step`,
        durationMin: 25,
        urgencyScore: 6,
        reason: isHe ? "פרויקט פעיל" : "Active project",
        sourceType: "plan",
        sourceId: proj.id,
      });
      usedPillars.add("projects");
    }

    // 6. Fill remaining slots from fallback templates
    if (queue.length < maxActions) {
      const energyMult = pulse?.energy_rating ? pulse.energy_rating / 5 : 0.8;

      // Ensure Body + Mind + Arena coverage
      const hasBody = queue.some(q => BODY_PILLARS.includes(q.pillarId));
      const hasMind = queue.some(q => MIND_PILLARS.includes(q.pillarId));
      const hasArena = queue.some(q => ARENA_PILLARS.includes(q.pillarId));

      const prioritize = (a: FallbackAction) => {
        let bonus = 0;
        if (!hasBody && a.block_type === 'body') bonus += 5;
        if (!hasMind && a.block_type === 'mind') bonus += 5;
        if (!hasArena && a.block_type === 'arena') bonus += 5;
        return bonus;
      };

      const candidates = FALLBACK_ACTIONS
        .filter(t => !usedPillars.has(t.pillar))
        .map(t => ({
          ...t,
          score: (t.urgency * energyMult * dayIntensity.multiplier) + prioritize(t) + Math.random() * 2,
        }))
        .sort((a, b) => b.score - a.score);

      for (const c of candidates) {
        if (queue.length >= maxActions) break;
        queue.push({
          pillarId: c.pillar,
          hub: getHub(c.pillar),
          actionType: c.pillar + '_template',
          title: isHe ? c.action_he : c.action_en,
          titleEn: c.action_en,
          durationMin: Math.round(c.duration_min * dayIntensity.multiplier),
          urgencyScore: Math.round(c.score),
          reason: isHe ? "מנוע יומי" : "Daily engine",
          sourceType: "template",
          blockType: c.block_type,
        });
        usedPillars.add(c.pillar);
      }
    }

    // Sort final queue by urgency
    queue.sort((a, b) => b.urgencyScore - a.urgencyScore);

    // Current week info for UI
    const currentWeekCore = coreStrategy ? getCurrentWeek(coreStrategy.start_date) : null;
    const currentWeekArena = arenaStrategy ? getCurrentWeek(arenaStrategy.start_date) : null;

    return new Response(
      JSON.stringify({
        today_queue: queue,
        generated_at: new Date().toISOString(),
        tier,
        max_actions: maxActions,
        energy_level: pulse?.energy_rating || null,
        day_intensity: dayIntensity.label,
        has_core_strategy: !!coreStrategy,
        has_arena_strategy: !!arenaStrategy,
        core_week: currentWeekCore,
        arena_week: currentWeekArena,
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
