/**
 * Layer 1: Context Builder (deterministic)
 * 
 * Reads DB → returns structured JSON. No LLM calls.
 * Pure function: same DB state always produces same output.
 * Now reads from unified `action_items` table instead of legacy tables.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Types ─────────────────────────────────────────────────

export interface AuroraContext {
  // Metadata
  context_hash: string;
  built_at: string;

  // User profile
  profile: {
    full_name: string;
    bio: string | null;
    gender: string | null;
    preferred_tone: string;
    challenge_intensity: string;
  };

  // Dates & plan
  today: string;
  current_time: string;
  life_plan: {
    active: boolean;
    start_date: string | null;
    current_week: number;
    total_weeks: number;
  } | null;

  // Action Items (unified)
  action_items: {
    overdue_tasks: { title: string; due_at: string; pillar: string | null }[];
    today_tasks: { id: string; title: string; status: string; pillar: string | null }[];
    habits: { id: string; title: string; completed_today: boolean; streak: number }[];
    milestones: { title: string; week_number: number | null; is_completed: boolean; plan_id: string | null }[];
    open_checklists: { id: string; title: string; children_total: number; children_done: number }[];
  };

  // Daily habits status
  habits_status: { completed: number; total: number };

  // Identity & direction
  direction: { content: string; clarity_score: number | null } | null;
  identity: {
    values: string[];
    principles: string[];
    self_concepts: string[];
    vision_statements: string[];
  };
  visions: { timeframe: string; title: string }[];
  commitments: string[];

  // Patterns
  energy_patterns: { type: string; description: string }[];
  behavioral_patterns: { type: string; description: string }[];

  // Focus & minimums
  focus: { title: string; duration_days: number } | null;
  daily_minimums: string[];

  // Progress
  onboarding: {
    direction_clarity: string;
    identity_understanding: string;
    energy_patterns_status: string;
  };

  // Memory & reminders
  conversation_memories: { date: string; summary: string; action_items: string[] }[];
  pending_reminders: { message: string; created_at: string }[];

  // Launchpad
  launchpad_summary: {
    summary: string | null;
    consciousness_analysis: string | null;
    transformation_readiness: number | null;
    clarity_score: number | null;
  } | null;

  // Recent insights
  recent_insights: { type: string; content: string }[];

  // Projects
  projects: {
    name: string;
    category: string | null;
    progress: number;
    target_date: string | null;
    vision: string | null;
    desired_outcome: string | null;
    priority: string;
    days_since_update: number;
  }[];

  // Opener hints (computed)
  opener_hints: string[];

  // Adaptive Feedback Loop
  pulse_today: { energy: number; mood: string; sleep: string; task_confidence: number; screen_discipline: boolean } | null;
  pulse_week: { avg_energy: number; avg_confidence: number; compliance: number; recovery_debt: number; days_logged: number } | null;
  behavioral_risks: { risk: string; severity: string; action: string }[];
  last_recalibration: { week: number; compliance: number; cognitive_load: number; recovery_debt: number; adjustments: string } | null;
}

// ─── Hash ──────────────────────────────────────────────────

async function computeHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── Main Builder ──────────────────────────────────────────

export async function buildContext(
  supabase: SupabaseClient,
  userId: string,
  language: string
): Promise<AuroraContext> {
  const today = new Date().toISOString().split("T")[0];

  if (!userId) {
    const emptyCtx = createEmptyContext(today);
    emptyCtx.context_hash = await computeHash(JSON.stringify(emptyCtx));
    return emptyCtx;
  }

  // ── Parallel DB queries ────────────────────────────────
  const [
    profileRes,
    directionRes,
    identityRes,
    visionsRes,
    commitmentsRes,
    energyRes,
    behavioralRes,
    focusRes,
    minimumsRes,
    onboardingRes,
    lifePlanRes,
    conversationMemoryRes,
    remindersRes,
    recentInsightsRes,
    projectsRes,
    launchpadSummaryRes,
    // Action items queries (unified table)
    overdueRes,
    todayTasksRes,
    habitsRes,
    milestonesRes,
    parentTasksRes,
    pulseTodayRes,
    pulseWeekRes,
    recalibRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("aurora_life_direction").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
    supabase.from("aurora_identity_elements").select("*").eq("user_id", userId),
    supabase.from("aurora_life_visions").select("*").eq("user_id", userId),
    supabase.from("aurora_commitments").select("*").eq("user_id", userId).eq("status", "active"),
    supabase.from("aurora_energy_patterns").select("*").eq("user_id", userId),
    supabase.from("aurora_behavioral_patterns").select("*").eq("user_id", userId),
    supabase.from("aurora_focus_plans").select("*").eq("user_id", userId).eq("status", "active").limit(1),
    supabase.from("aurora_daily_minimums").select("*").eq("user_id", userId).eq("is_active", true),
    supabase.from("aurora_onboarding_progress").select("*").eq("user_id", userId).single(),
    supabase.from("life_plans").select("*, life_plan_milestones(*)").eq("user_id", userId).eq("status", "active").single(),
    supabase.from("aurora_conversation_memory").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("aurora_reminders").select("*").eq("user_id", userId).eq("is_delivered", false).lte("reminder_date", today).order("reminder_date", { ascending: true }),
    supabase.from("aurora_identity_elements").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    supabase.from("user_projects").select("*").eq("user_id", userId).in("status", ["active", "paused"]).order("updated_at", { ascending: false }),
    supabase.from("launchpad_summary").select("*").eq("user_id", userId).single(),
    // Overdue tasks from action_items
    supabase.from("action_items").select("id, title, due_at, pillar").eq("user_id", userId).eq("type", "task").in("status", ["todo", "doing"]).lt("due_at", `${today}T00:00:00`),
    // Today's tasks from action_items
    supabase.from("action_items").select("id, title, status, pillar").eq("user_id", userId).in("type", ["task"]).in("status", ["todo", "doing"]).gte("due_at", `${today}T00:00:00`).lte("due_at", `${today}T23:59:59`),
    // Habits from action_items
    supabase.from("action_items").select("id, title, completed_at, metadata").eq("user_id", userId).eq("type", "habit"),
    // Milestones from action_items
    supabase.from("action_items").select("id, title, status, metadata, plan_id").eq("user_id", userId).eq("type", "milestone").order("order_index"),
    // Parent tasks (checklists) with child counts
    supabase.from("action_items").select("id, title").eq("user_id", userId).eq("type", "task").is("parent_id", null).in("status", ["todo", "doing"]),
    // Pulse: today
    supabase.from("daily_pulse_logs").select("*").eq("user_id", userId).eq("log_date", today).maybeSingle(),
    // Pulse: last 7 days
    supabase.from("daily_pulse_logs").select("*").eq("user_id", userId).gte("log_date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]).order("log_date", { ascending: false }),
    // Latest recalibration
    supabase.from("recalibration_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
  ]);

  const profile = profileRes.data;
  const direction = directionRes.data?.[0];
  const identityData = identityRes.data || [];
  const visions = visionsRes.data || [];
  const commitments = commitmentsRes.data || [];
  const energy = energyRes.data || [];
  const behavioral = behavioralRes.data || [];
  const focus = focusRes.data?.[0];
  const minimums = minimumsRes.data || [];
  const onboarding = onboardingRes.data;
  const lifePlan = lifePlanRes.data;
  const conversationMemories = conversationMemoryRes.data || [];
  const pendingReminders = remindersRes.data || [];
  const recentInsights = recentInsightsRes.data || [];
  const userProjects = projectsRes.data || [];
  const launchpadSummary = launchpadSummaryRes.data;
  const overdueTasks = overdueRes.data || [];
  const todayTasks = todayTasksRes.data || [];
  const habits = habitsRes.data || [];
  const milestones = milestonesRes.data || [];
  const parentTasks = parentTasksRes.data || [];

  // Pulse data
  const pulseToday = pulseTodayRes.data;
  const pulseWeekData = pulseWeekRes.data || [];
  const latestRecalib = recalibRes.data?.[0];

  // Compute pulse week stats
  let pulseWeekStats: AuroraContext["pulse_week"] = null;
  if (pulseWeekData.length > 0) {
    const avgEnergy = pulseWeekData.reduce((s: number, p: any) => s + p.energy_rating, 0) / pulseWeekData.length;
    const avgConfidence = pulseWeekData.reduce((s: number, p: any) => s + p.task_confidence, 0) / pulseWeekData.length;
    const sleepYes = pulseWeekData.filter((p: any) => p.sleep_compliance === 'yes').length;
    const screenYes = pulseWeekData.filter((p: any) => p.screen_discipline).length;
    const compliance = ((sleepYes + screenYes + (avgConfidence / 5 * pulseWeekData.length)) / (pulseWeekData.length * 3)) * 100;
    const recoveryDebt = ((pulseWeekData.length - sleepYes) + pulseWeekData.filter((p: any) => p.energy_rating <= 2).length + (pulseWeekData.length - screenYes)) / (pulseWeekData.length * 3) * 100;
    pulseWeekStats = { avg_energy: Math.round(avgEnergy * 10) / 10, avg_confidence: Math.round(avgConfidence * 10) / 10, compliance: Math.round(compliance), recovery_debt: Math.round(recoveryDebt), days_logged: pulseWeekData.length };
  }

  // Extract behavioral risks from latest recalibration
  const behavioralRisks: AuroraContext["behavioral_risks"] = (latestRecalib?.behavioral_risks as any[]) || [];

  // ── Compute habit completion status ────────────────────
  const todayStart = `${today}T00:00:00`;
  const todayEnd = `${today}T23:59:59`;
  const habitsWithStatus = habits.map((h: any) => {
    const completedToday = h.completed_at && h.completed_at >= todayStart && h.completed_at <= todayEnd;
    const streak = (h.metadata as any)?.streak || 0;
    return { id: h.id, title: h.title, completed_today: !!completedToday, streak };
  });

  const habitsCompleted = habitsWithStatus.filter(h => h.completed_today).length;

  // ── Compute checklist child counts (single aggregation query) ──
  let checklistsWithCounts: { id: string; title: string; children_total: number; children_done: number }[] = [];
  if (parentTasks.length > 0) {
    const parentIds = parentTasks.map((p: any) => p.id);
    const { data: childCounts } = await supabase
      .from("action_items")
      .select("parent_id, status")
      .in("parent_id", parentIds);
    
    // Aggregate in memory — one query replaces 2N queries
    const countMap = new Map<string, { total: number; done: number }>();
    for (const row of (childCounts || [])) {
      const entry = countMap.get(row.parent_id) || { total: 0, done: 0 };
      entry.total++;
      if (row.status === "done") entry.done++;
      countMap.set(row.parent_id, entry);
    }
    
    checklistsWithCounts = parentTasks.map((p: any) => {
      const counts = countMap.get(p.id) || { total: 0, done: 0 };
      return { id: p.id, title: p.title, children_total: counts.total, children_done: counts.done };
    });
  }

  // ── Compute plan week ──────────────────────────────────
  let currentWeek = 0;
  if (lifePlan) {
    const startDate = new Date(lifePlan.start_date);
    const diffDays = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    currentWeek = Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
  }

  // ── Compute opener hints ───────────────────────────────
  const openerHints: string[] = [];
  if (pendingReminders.length > 0) openerHints.push(`reminders:${pendingReminders.length}`);
  if (overdueTasks.length > 0) openerHints.push(`overdue:${overdueTasks.length}`);
  if (todayTasks.length > 0) openerHints.push(`today_tasks:${todayTasks.length}`);
  const remainingHabits = habits.length - habitsCompleted;
  if (remainingHabits > 0) openerHints.push(`habits_remaining:${remainingHabits}`);

  // ── Identity breakdown ─────────────────────────────────
  const values = identityData.filter((i: any) => i.element_type === "value").map((i: any) => i.content);
  const principles = identityData.filter((i: any) => i.element_type === "principle").map((i: any) => i.content);
  const selfConcepts = identityData.filter((i: any) => i.element_type === "self_concept").map((i: any) => i.content);
  const visionStatements = identityData.filter((i: any) => i.element_type === "vision_statement").map((i: any) => i.content);

  // ── Assemble context ───────────────────────────────────
  const now = new Date();
  const ctx: AuroraContext = {
    context_hash: "", // computed below
    built_at: now.toISOString(),

    profile: {
      full_name: profile?.full_name || "Unknown",
      bio: profile?.bio || null,
      gender: profile?.aurora_preferences?.gender || null,
      preferred_tone: profile?.aurora_preferences?.tone || "warm",
      challenge_intensity: profile?.aurora_preferences?.intensity || "balanced",
    },

    today,
    current_time: now.toISOString().slice(11, 16),
    life_plan: lifePlan ? {
      active: true,
      start_date: lifePlan.start_date,
      current_week: currentWeek,
      total_weeks: 12,
    } : null,

    action_items: {
      overdue_tasks: overdueTasks.map((t: any) => ({ title: t.title, due_at: t.due_at, pillar: t.pillar })),
      today_tasks: todayTasks.map((t: any) => ({ id: t.id, title: t.title, status: t.status, pillar: t.pillar })),
      habits: habitsWithStatus,
      milestones: milestones.map((m: any) => ({
        title: m.title,
        week_number: (m.metadata as any)?.week_number || null,
        is_completed: m.status === "done",
        plan_id: m.plan_id,
      })),
      open_checklists: checklistsWithCounts,
    },

    habits_status: { completed: habitsCompleted, total: habits.length },

    direction: direction ? { content: direction.content, clarity_score: direction.clarity_score } : null,
    identity: { values, principles, self_concepts: selfConcepts, vision_statements: visionStatements },
    visions: visions.map((v: any) => ({ timeframe: v.timeframe, title: v.title })),
    commitments: commitments.map((c: any) => c.title),

    energy_patterns: energy.map((e: any) => ({ type: e.pattern_type, description: e.description })),
    behavioral_patterns: behavioral.map((b: any) => ({ type: b.pattern_type, description: b.description })),

    focus: focus ? { title: focus.title, duration_days: focus.duration_days } : null,
    daily_minimums: minimums.map((m: any) => m.title),

    onboarding: {
      direction_clarity: onboarding?.direction_clarity || "incomplete",
      identity_understanding: onboarding?.identity_understanding || "shallow",
      energy_patterns_status: onboarding?.energy_patterns_status || "unknown",
    },

    conversation_memories: conversationMemories.map((m: any) => ({
      date: new Date(m.created_at).toISOString().split("T")[0],
      summary: m.summary,
      action_items: m.action_items || [],
    })),
    pending_reminders: pendingReminders.map((r: any) => ({
      message: r.message,
      created_at: r.created_at,
    })),

    launchpad_summary: launchpadSummary ? {
      summary: launchpadSummary.summary_data?.summary || null,
      consciousness_analysis: launchpadSummary.summary_data?.consciousness_analysis || null,
      transformation_readiness: launchpadSummary.transformation_readiness || null,
      clarity_score: launchpadSummary.clarity_score || null,
    } : null,

    recent_insights: recentInsights.slice(0, 5).map((i: any) => ({ type: i.element_type, content: i.content })),

    projects: userProjects.map((p: any) => ({
      name: p.name,
      category: p.category || null,
      progress: p.progress_percentage || 0,
      target_date: p.target_date || null,
      vision: p.vision || null,
      desired_outcome: p.desired_outcome || null,
      priority: p.priority || "medium",
      days_since_update: Math.floor((now.getTime() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24)),
    })),

    opener_hints: openerHints,

    // Adaptive feedback loop
    pulse_today: pulseToday ? {
      energy: pulseToday.energy_rating,
      mood: pulseToday.mood_signal,
      sleep: pulseToday.sleep_compliance,
      task_confidence: pulseToday.task_confidence,
      screen_discipline: pulseToday.screen_discipline,
    } : null,
    pulse_week: pulseWeekStats,
    behavioral_risks: behavioralRisks,
    last_recalibration: latestRecalib ? {
      week: latestRecalib.week_number,
      compliance: latestRecalib.compliance_score,
      cognitive_load: latestRecalib.cognitive_load_score,
      recovery_debt: latestRecalib.recovery_debt_score,
      adjustments: JSON.stringify(latestRecalib.adjustments_made),
    } : null,
  };

  // Compute hash for tracing
  const { context_hash: _, built_at: __, ...hashable } = ctx;
  ctx.context_hash = await computeHash(JSON.stringify(hashable));

  return ctx;
}

// ─── Empty context fallback ────────────────────────────────

function createEmptyContext(today: string): AuroraContext {
  return {
    context_hash: "",
    built_at: new Date().toISOString(),
    profile: { full_name: "Unknown", bio: null, gender: null, preferred_tone: "warm", challenge_intensity: "balanced" },
    today,
    current_time: new Date().toISOString().slice(11, 16),
    life_plan: null,
    action_items: { overdue_tasks: [], today_tasks: [], habits: [], milestones: [], open_checklists: [] },
    habits_status: { completed: 0, total: 0 },
    direction: null,
    identity: { values: [], principles: [], self_concepts: [], vision_statements: [] },
    visions: [],
    commitments: [],
    energy_patterns: [],
    behavioral_patterns: [],
    focus: null,
    daily_minimums: [],
    onboarding: { direction_clarity: "incomplete", identity_understanding: "shallow", energy_patterns_status: "unknown" },
    conversation_memories: [],
    pending_reminders: [],
    launchpad_summary: null,
    recent_insights: [],
    projects: [],
    opener_hints: [],
    pulse_today: null,
    pulse_week: null,
    behavioral_risks: [],
    last_recalibration: null,
  };
}
