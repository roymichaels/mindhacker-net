import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

/**
 * generate-today-queue v3
 * 
 * ARCHITECTURE: Strategy → Tactics → Now
 * Now derives ALL daily actions from the milestone chain:
 *   life_plans → plan_missions → life_plan_milestones → mini_milestones
 * 
 * No independent task generation. Every action traces back to a milestone.
 * Fallback templates only used when NO strategy exists at all.
 */

// ─── Pillar metadata ──────────────────────────────────────────
const ARENA_PILLARS = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play'];

function getHub(pillar: string): 'core' | 'arena' {
  return ARENA_PILLARS.includes(pillar) ? 'arena' : 'core';
}

// ─── Tier limits ──────────────────────────────────────────────
function getMaxActions(tier: string): number {
  switch (tier) {
    case "mastery":
    case "consistency": return 9;
    case "structure": return 7;
    default: return 5;
  }
}

// ─── Day intensity ────────────────────────────────────────────
function getDayIntensity(): { label: string; multiplier: number } {
  const dow = new Date().getDay();
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

// ─── Execution template inference ─────────────────────────────
type ExecutionTemplate = 'tts_guided' | 'video_embed' | 'sets_reps_timer' | 'step_by_step' | 'timer_focus' | 'social_checklist';

function inferExecutionTemplate(pillarId: string, actionType: string): ExecutionTemplate {
  const combined = `${actionType} ${pillarId}`.toLowerCase();
  if (/meditation|breathwork|body.?scan|visualization|mindful|breathing|מדיטציה|נשימ/.test(combined)) return 'tts_guided';
  if (/yoga|tai.?chi|qigong|pilates|stretching|mobility|יוגה/.test(combined)) return 'video_embed';
  if (/combat|shadow|boxing|strength|power|hiit|calisthenics|לחימה|אגרוף|כוח|אימון/.test(combined) && !/influence|השפעה/.test(combined)) return 'sets_reps_timer';
  if (/relation|networking|social|outreach|call|meeting|יחסים/.test(combined) && pillarId !== 'business') return 'social_checklist';
  if (/deep.?work|business|wealth|project|sprint|revenue|content|study|learn|עבודה|עסק|פרויקט|למידה/.test(combined)) return 'timer_focus';
  if (['wealth', 'business', 'projects', 'expansion', 'influence'].includes(pillarId)) return 'timer_focus';
  return 'step_by_step';
}

// ─── Simple execution steps ───────────────────────────────────
interface ExecStep { label: string; detail?: string; durationSec: number; }

function generateSimpleSteps(title: string, durationMin: number, isHe: boolean): ExecStep[] {
  const coreMin = Math.max(1, durationMin - 4);
  return isHe ? [
    { label: "הכנה — נשימות + מיקוד כוונה", detail: "מה בדיוק אני עומד לעשות?", durationSec: 60 },
    { label: `ביצוע — ${coreMin} דקות`, detail: title, durationSec: coreMin * 60 },
    { label: "סגירה — מה למדתי? מה הצעד הבא?", durationSec: 120 },
  ] : [
    { label: "Prepare — breathe & set intention", detail: "What exactly am I about to do?", durationSec: 60 },
    { label: `Execute — ${coreMin} minutes`, detail: title, durationSec: coreMin * 60 },
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
  isTimeBased: boolean;
  urgencyScore: number;
  reason: string;
  sourceType: "milestone" | "mini_milestone" | "habit" | "overdue" | "template";
  sourceId?: string;
  // Lineage
  missionId?: string;
  missionTitle?: string;
  milestoneId?: string;
  milestoneTitle?: string;
  traitName?: string;
  executionSteps?: ExecStep[];
  executionTemplate?: ExecutionTemplate;
}

// Check if a task title contains explicit time references
function detectTimeBased(title: string, actionType: string): boolean {
  const timePattern = /\b\d+\s*(min|minutes|דקות|דק׳|sec|seconds|שניות|rounds?|סיבוב|שעה|hour)\b/i;
  const timedTypes = ['breathing', 'meditation', 'timer', 'warmup', 'cooldown', 'stretch', 'plank', 'hold'];
  if (timePattern.test(title)) return true;
  return timedTypes.some(t => actionType.includes(t));
}

// ─── Fallback templates (ONLY when no strategy exists) ────────
interface FallbackAction {
  pillar: string;
  action_en: string;
  action_he: string;
  duration_min: number;
  urgency: number;
}

const FALLBACK_ACTIONS: FallbackAction[] = [
  { pillar: 'vitality', action_en: 'Morning Sunlight Walk — 10 min', action_he: 'הליכת אור בוקר — 10 דקות', duration_min: 10, urgency: 9 },
  { pillar: 'power', action_en: 'Strength Training — Compound Lifts', action_he: 'אימון כוח — הרמות מורכבות', duration_min: 40, urgency: 7 },
  { pillar: 'combat', action_en: 'Combat Workout — Shadowboxing 3 Rounds', action_he: 'אימון לחימה — 3 סיבובי צללים', duration_min: 20, urgency: 6 },
  { pillar: 'focus', action_en: 'Deep Work Block — 45 min', action_he: 'בלוק עבודה עמוקה — 45 דקות', duration_min: 45, urgency: 8 },
  { pillar: 'consciousness', action_en: 'Meditation — 15 min', action_he: 'מדיטציה — 15 דקות', duration_min: 15, urgency: 6 },
  { pillar: 'expansion', action_en: 'Learning Block — Read / Study', action_he: 'בלוק למידה — קריאה / לימוד', duration_min: 30, urgency: 5 },
  { pillar: 'wealth', action_en: 'Revenue Action', action_he: 'פעולת הכנסה', duration_min: 25, urgency: 7 },
  { pillar: 'influence', action_en: 'Content Creation', action_he: 'יצירת תוכן', duration_min: 20, urgency: 4 },
];

// ─── Current day/phase of the plan ────────────────────────────
function getCurrentDayAndPhase(startDate: string): { day: number; phase: number } {
  const start = new Date(startDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const day = Math.min(100, Math.max(1, diffDays + 1));
  const phase = Math.min(10, Math.max(1, Math.ceil(day / 10)));
  return { day, phase };
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
      const steps = generateSimpleSteps(action_type || pillar || "work", duration_min || 15, isHe);
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
      plansRes,
      habitsRes,
      overdueRes,
      pulseRes,
      todayTasksRes,
    ] = await Promise.all([
      // All active plans
      supabase.from("life_plans").select("id, start_date, status, plan_data")
        .eq("user_id", user_id).eq("status", "active").order("created_at", { ascending: false }),
      // Habits
      supabase.from("action_items").select("id, title, pillar, completed_at")
        .eq("user_id", user_id).eq("type", "habit"),
      // Overdue tasks
      supabase.from("action_items").select("id, title, pillar, due_at")
        .eq("user_id", user_id).eq("type", "task").in("status", ["todo", "doing"])
        .lt("due_at", `${today}T00:00:00`).order("due_at").limit(3),
      // Today pulse
      supabase.from("daily_pulse_logs").select("energy_rating, mood")
        .eq("user_id", user_id).eq("log_date", today).maybeSingle(),
      // Today's scheduled action_items (tasks scheduled for today)
      supabase.from("action_items").select("id, title, description, pillar, milestone_id, type, scheduled_date, status, start_time, end_time")
        .eq("user_id", user_id).eq("scheduled_date", today).in("status", ["todo", "doing"])
        .neq("type", "habit")
        .order("order_index", { ascending: true }),
    ]);

    const plans = plansRes.data || [];
    const habits = habitsRes.data || [];
    const overdue = overdueRes.data || [];
    const pulse = pulseRes.data;
    const todayTasks = todayTasksRes.data || [];

    const coreStrategy = plans.find((s: any) => s.plan_data?.hub === 'core');
    const arenaStrategy = plans.find((s: any) => s.plan_data?.hub === 'arena');
    const allPlanIds = plans.map((p: any) => p.id);
    const hasStrategy = allPlanIds.length > 0;

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
        sourceType: "overdue",
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

    // 3. TODAY'S SCHEDULED ACTION ITEMS
    const usedActionIds = new Set(queue.map(q => q.sourceId).filter(Boolean));
    for (const task of todayTasks) {
      if (queue.length >= maxActions) break;
      if (usedActionIds.has(task.id)) continue; // skip if already added as overdue
      const pillar = task.pillar || "focus";
      queue.push({
        pillarId: pillar,
        hub: getHub(pillar),
        actionType: task.type === 'task' ? pillar + '_task' : (task.type || pillar + '_action'),
        title: task.title,
        titleEn: task.title,
        durationMin: 20,
        urgencyScore: 7.5,
        reason: isHe ? "משימה מתוכננת להיום" : "Scheduled for today",
        sourceType: "plan",
        sourceId: task.id,
        milestoneId: task.milestone_id || undefined,
      });
      usedActionIds.add(task.id);
      usedPillars.add(pillar);
    }

    // 4. MILESTONE-DERIVED ACTIONS (the core of v3)
    if (hasStrategy) {
      // Determine current day & phase for each plan
      const planPhases = plans.map((p: any) => ({
        ...p,
        ...getCurrentDayAndPhase(p.start_date),
      }));

      const currentPhases = planPhases.map((p: any) => p.phase);
      const currentDay = planPhases[0]?.day || 1;

      // Fetch current-phase milestones (no FK join — mission_id has no FK constraint)
      const { data: milestones, error: milestoneErr } = await supabase
        .from("life_plan_milestones")
        .select("id, title, title_en, focus_area, week_number, is_completed, mission_id, plan_id")
        .in("plan_id", allPlanIds)
        .in("week_number", [...new Set(currentPhases)])
        .order("mission_id")
        .order("id");

      if (milestoneErr) console.error("Milestone fetch error:", milestoneErr);

      // Fetch missions separately for lineage
      const missionIds = [...new Set((milestones || []).map((m: any) => m.mission_id).filter(Boolean))];
      let missionLookup: Record<string, any> = {};
      if (missionIds.length > 0) {
        const { data: missions } = await supabase
          .from("plan_missions")
          .select("id, title, title_en, pillar, primary_skill_id")
          .in("id", missionIds);
        for (const m of (missions || [])) {
          missionLookup[m.id] = m;
        }
      }

      // Fetch mini_milestones for these milestones (today's scheduled actions)
      const milestoneIds = (milestones || []).map((m: any) => m.id);

      let todayMinis: any[] = [];
      if (milestoneIds.length > 0) {
        const { data: minis } = await supabase
          .from("mini_milestones")
          .select("id, title, title_en, milestone_id, scheduled_day, is_completed, execution_template, action_type")
          .in("milestone_id", milestoneIds)
          .eq("is_completed", false)
          .order("scheduled_day")
          .order("mini_number");

        todayMinis = minis || [];
      }

      // Build a milestone lookup for lineage
      const milestoneLookup: Record<string, any> = {};
      for (const m of (milestones || [])) {
        milestoneLookup[m.id] = m;
      }

      // Strategy 1: Add mini_milestones scheduled for today (±2 days buffer)
      const dayBuffer = 2;
      const relevantMinis = todayMinis.filter((mini: any) => {
        if (!mini.scheduled_day) return true; // no scheduled day = always available
        return Math.abs(mini.scheduled_day - currentDay) <= dayBuffer;
      });

      for (const mini of relevantMinis) {
        if (queue.length >= maxActions) break;
        const milestone = milestoneLookup[mini.milestone_id];
        if (!milestone) continue;

        const mission = missionLookup[milestone.mission_id] || null;
        const pillar = mission?.pillar || milestone.focus_area || "focus";

        if (usedPillars.has(pillar) && queue.length > 3) continue; // allow some pillar overlap early

        queue.push({
          pillarId: pillar,
          hub: getHub(pillar),
          actionType: mini.action_type || pillar + '_milestone',
          title: isHe ? (mini.title || mini.title_en) : (mini.title_en || mini.title),
          titleEn: mini.title_en || mini.title,
          durationMin: Math.round(20 * dayIntensity.multiplier),
          urgencyScore: 7,
          reason: isHe
            ? `${mission?.title || milestone.title} — שלב ${milestone.week_number}`
            : `${mission?.title_en || milestone.title_en || milestone.title} — Phase ${milestone.week_number}`,
          sourceType: "mini_milestone",
          sourceId: mini.id,
          missionId: mission?.id,
          missionTitle: isHe ? (mission?.title || mission?.title_en) : (mission?.title_en || mission?.title),
          milestoneId: milestone.id,
          milestoneTitle: isHe ? (milestone.title || milestone.title_en) : (milestone.title_en || milestone.title),
          executionTemplate: mini.execution_template || undefined,
        });
        usedPillars.add(pillar);
      }

      // Strategy 2: If not enough minis, fall back to milestones themselves
      if (queue.length < maxActions) {
        const incompleteMilestones = (milestones || []).filter((m: any) => !m.is_completed);
        for (const milestone of incompleteMilestones) {
          if (queue.length >= maxActions) break;

          const mission = missionLookup[milestone.mission_id] || null;
          const pillar = mission?.pillar || milestone.focus_area || "focus";

          // Skip if we already have an action for this milestone
          if (queue.some(q => q.milestoneId === milestone.id)) continue;
          if (usedPillars.has(pillar) && queue.length > 4) continue;

          queue.push({
            pillarId: pillar,
            hub: getHub(pillar),
            actionType: pillar + '_milestone',
            title: isHe ? (milestone.title || milestone.title_en) : (milestone.title_en || milestone.title),
            titleEn: milestone.title_en || milestone.title,
            durationMin: Math.round(25 * dayIntensity.multiplier),
            urgencyScore: 6,
            reason: isHe
              ? `${mission?.title || 'משימה'} — שלב ${milestone.week_number}`
              : `${mission?.title_en || 'Mission'} — Phase ${milestone.week_number}`,
            sourceType: "milestone",
            sourceId: milestone.id,
            missionId: mission?.id,
            missionTitle: isHe ? (mission?.title || mission?.title_en) : (mission?.title_en || mission?.title),
            milestoneId: milestone.id,
            milestoneTitle: isHe ? (milestone.title || milestone.title_en) : (milestone.title_en || milestone.title),
          });
          usedPillars.add(pillar);
        }
      }
    }

    // 4. Fill remaining slots from fallback templates ONLY if no strategy
    if (!hasStrategy && queue.length < maxActions) {
      const energyMult = pulse?.energy_rating ? pulse.energy_rating / 5 : 0.8;
      const candidates = FALLBACK_ACTIONS
        .filter(t => !usedPillars.has(t.pillar))
        .map(t => ({
          ...t,
          score: (t.urgency * energyMult * dayIntensity.multiplier) + Math.random() * 2,
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
        });
        usedPillars.add(c.pillar);
      }
    }

    // Sort final queue by urgency
    queue.sort((a, b) => b.urgencyScore - a.urgencyScore);

    // Attach execution steps and template
    for (const item of queue) {
      if (!item.executionSteps) {
        item.executionSteps = generateSimpleSteps(item.title, item.durationMin, isHe);
      }
      if (!item.executionTemplate) {
        item.executionTemplate = inferExecutionTemplate(item.pillarId, item.actionType);
      }
    }

    // Current phase info
    const currentPhaseCore = coreStrategy ? getCurrentDayAndPhase(coreStrategy.start_date) : null;
    const currentPhaseArena = arenaStrategy ? getCurrentDayAndPhase(arenaStrategy.start_date) : null;

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
        core_week: currentPhaseCore?.phase || null,
        arena_week: currentPhaseArena?.phase || null,
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
