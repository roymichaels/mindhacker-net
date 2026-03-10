/**
 * plan-chat — Surgical plan editor via Aurora conversation.
 * Supports: add/remove practices, modify milestones, adjust tasks, change plan details.
 * NEVER regenerates the plan — only makes targeted changes.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, messages, language, timezone } = await req.json();
    if (!user_id) throw new Error("user_id required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Gather plan context — user may have multiple active plans (e.g. core + arena)
    const { data: activePlans } = await supabase
      .from("life_plans")
      .select("id, start_date, duration_months, status, plan_data, summary_id")
      .eq("user_id", user_id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // Use all active plans for context
    const plans = activePlans || [];
    // Pick the first plan as "primary" for backward-compat references
    const plan = plans.length > 0 ? plans[0] : null;

    let milestoneContext = "";
    let practiceContext = "";
    let actionContext = "";
    let missionsContext = "";

    // Use user's timezone for date calculations
    const userTz = timezone || 'UTC';
    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: userTz,
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
    const todayStr = dateFormatter.format(new Date());
    
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = dateFormatter.format(yesterdayDate);
    
    const twoDaysAgoDate = new Date();
    twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);
    const twoDaysAgoStr = dateFormatter.format(twoDaysAgoDate);

    // Collect context from ALL active plans
    const allPlanIds: string[] = [];
    for (const p of plans) {
      allPlanIds.push(p.id);

      const planLabel = p.plan_data?.strategy?.title_he || p.plan_data?.strategy?.title_en || p.plan_data?.title || 'Plan';

      // Milestones
      const { data: milestones } = await supabase
        .from("life_plan_milestones")
        .select("id, title, title_en, week_number, focus_area, is_completed, tasks, description")
        .eq("plan_id", p.id)
        .order("week_number");

      if (milestones?.length) {
        milestoneContext += `\n\n📌 Milestones for "${planLabel}" (${milestones.length}):\n${milestones.map(m =>
          `- Week ${m.week_number}: "${m.title_en || m.title}" [${m.focus_area || 'general'}] ${m.is_completed ? '✅' : '⬜'} (id: ${m.id})`
        ).join("\n")}`;
      }

      // Missions
      const { data: missions } = await supabase
        .from("plan_missions")
        .select("id, title, title_en, pillar, is_completed, skill_id")
        .eq("plan_id", p.id)
        .order("created_at");

      if (missions?.length) {
        missionsContext += `\n\n🎯 Missions for "${planLabel}" (${missions.length}):\n${missions.map(m =>
          `- "${m.title_en || m.title}" [${m.pillar || 'general'}] ${m.is_completed ? '✅' : '⬜'} (id: ${m.id})`
        ).join("\n")}`;
      }
    }

    // Fetch tactical schedules from ALL active plans
    let tacticalContext = "";
    for (const p of plans) {
      if (!p.start_date) continue;

      const { data: tacticalSchedule } = await supabase
        .from("tactical_schedules")
        .select("phase_number, schedule_data")
        .eq("plan_id", p.id)
        .order("phase_number")
        .limit(2);

      if (!tacticalSchedule?.length) continue;

      const planLabel = p.plan_data?.strategy?.title_he || p.plan_data?.strategy?.title_en || 'Plan';
      const planStartDate = new Date(p.start_date + "T00:00:00");
      const todayDate = new Date(todayStr + "T00:00:00");
      const yesterdayDateObj = new Date(yesterdayStr + "T00:00:00");
      
      const todayDayIndex = Math.floor((todayDate.getTime() - planStartDate.getTime()) / 86400000);
      const yesterdayDayIndex = Math.floor((yesterdayDateObj.getTime() - planStartDate.getTime()) / 86400000);
      
      const twoDaysAgoDateObj = new Date(twoDaysAgoStr + "T00:00:00");
      const twoDaysAgoDayIndex = Math.floor((twoDaysAgoDateObj.getTime() - planStartDate.getTime()) / 86400000);

      for (const ts of tacticalSchedule) {
        const days = ts.schedule_data as any[];
        if (!Array.isArray(days)) continue;
        
        const phaseStartDay = (ts.phase_number - 1) * 10;
        
        for (const targetDay of [
          { dayIndex: twoDaysAgoDayIndex, label: `TWO DAYS AGO / שלשום (${twoDaysAgoStr}, Day ${twoDaysAgoDayIndex + 1}) — ${planLabel}` },
          { dayIndex: yesterdayDayIndex, label: `YESTERDAY / אתמול (${yesterdayStr}, Day ${yesterdayDayIndex + 1}) — ${planLabel}` },
          { dayIndex: todayDayIndex, label: `TODAY / היום (${todayStr}, Day ${todayDayIndex + 1}) — ${planLabel}` },
        ]) {
          const arrayIndex = targetDay.dayIndex - phaseStartDay;
          if (arrayIndex >= 0 && arrayIndex < days.length) {
            const dayData = days[arrayIndex];
            if (dayData?.blocks?.length) {
              tacticalContext += `\n\n📋 ${targetDay.label}:\n`;
              for (const block of dayData.blocks) {
                tacticalContext += `  [${block.block_emoji || '📦'} ${block.block_title_he || block.block_title_en || 'Block'} ${block.start_time}-${block.end_time}]\n`;
                if (block.milestones?.length) {
                  for (const m of block.milestones) {
                    tacticalContext += `    - "${m.title_he || m.title_en}" [${m.pillar || 'general'}] ${m.duration_minutes}min\n`;
                  }
                }
              }
            }
          }
        }
      }
    }

    // ALWAYS fetch tasks regardless of plan (tasks exist even without active plan)
    const { data: recentAndUpcoming } = await supabase
      .from("action_items")
      .select("id, title, type, pillar, status, scheduled_date, source, completed_at, start_time, end_time, time_block")
      .eq("user_id", user_id)
      .in("status", ["todo", "doing", "done"])
      .gte("scheduled_date", twoDaysAgoStr)
      .order("scheduled_date")
      .limit(150);

    if (recentAndUpcoming?.length) {
      const yesterdayTasks = recentAndUpcoming.filter(a => a.scheduled_date === yesterdayStr);
      const todayTasks = recentAndUpcoming.filter(a => a.scheduled_date === todayStr);
      const futureTasks = recentAndUpcoming.filter(a => a.scheduled_date && a.scheduled_date > todayStr);
      const olderTasks = recentAndUpcoming.filter(a => a.scheduled_date && a.scheduled_date < yesterdayStr);

      actionContext = `\n\nToday's date: ${todayStr}\nYesterday's date: ${yesterdayStr}`;

      if (yesterdayTasks.length) {
        const yPending = yesterdayTasks.filter(a => a.status !== 'done');
        const yDone = yesterdayTasks.filter(a => a.status === 'done');
        actionContext += `\n\n📅 YESTERDAY'S TASKS (${yesterdayStr}) — ${yesterdayTasks.length} total:`;
        if (yPending.length) {
          actionContext += `\nIncomplete (${yPending.length}):\n${yPending.map(a =>
            `- "${a.title}" [${a.pillar || 'general'}] type:${a.type} status:${a.status} source:${a.source} time:${a.start_time || '?'}-${a.end_time || '?'} block:${a.time_block || '?'} (id: ${a.id})`
          ).join("\n")}`;
        }
        if (yDone.length) {
          actionContext += `\nCompleted (${yDone.length}):\n${yDone.map(a =>
            `- "${a.title}" [${a.pillar || 'general'}] type:${a.type} ✅ (id: ${a.id})`
          ).join("\n")}`;
        }
      } else {
        actionContext += `\n\n📅 YESTERDAY (${yesterdayStr}): No tasks were scheduled.`;
      }

      if (olderTasks.length) {
        const olderPending = olderTasks.filter(a => a.status !== 'done');
        if (olderPending.length) {
          actionContext += `\n\n📅 OLDER INCOMPLETE:\n${olderPending.map(a =>
            `- "${a.title}" [${a.pillar || 'general'}] date:${a.scheduled_date} status:${a.status} (id: ${a.id})`
          ).join("\n")}`;
        }
      }

      if (todayTasks.length) {
        const tPending = todayTasks.filter(a => a.status !== 'done');
        const tDone = todayTasks.filter(a => a.status === 'done');
        actionContext += `\n\n📅 TODAY'S TASKS (${todayStr}) — ${todayTasks.length} total:`;
        if (tPending.length) {
          actionContext += `\nPending (${tPending.length}):\n${tPending.map(a =>
            `- "${a.title}" [${a.pillar || 'general'}] type:${a.type} status:${a.status} source:${a.source} time:${a.start_time || '?'}-${a.end_time || '?'} block:${a.time_block || '?'} (id: ${a.id})`
          ).join("\n")}`;
        }
        if (tDone.length) {
          actionContext += `\nCompleted (${tDone.length}):\n${tDone.map(a =>
            `- "${a.title}" [${a.pillar || 'general'}] type:${a.type} ✅ (id: ${a.id})`
          ).join("\n")}`;
        }
      } else {
        actionContext += `\n\n📅 TODAY (${todayStr}): No tasks scheduled yet.`;
      }

      if (futureTasks.length) {
        actionContext += `\n\nUpcoming (${futureTasks.length}):\n${futureTasks.slice(0, 15).map(a =>
          `- "${a.title}" [${a.pillar || 'general'}] date:${a.scheduled_date} status:${a.status} (id: ${a.id})`
        ).join("\n")}`;
      }
    } else {
      actionContext = `\n\nToday's date: ${todayStr}\nYesterday's date: ${yesterdayStr}\n⚠️ No tasks found for the last 2 days. The user may need a tactical schedule generated.`;
    }

    // User practices
    const { data: userPractices } = await supabase
      .from("user_practices")
      .select("id, practice_id, duration_minutes, frequency, is_core, practices(name, name_he, category, pillar)")
      .eq("user_id", user_id);

    if (userPractices?.length) {
      practiceContext = `\n\nUser's active practices:\n${userPractices.map((up: any) => {
        const p = up.practices;
        return `- "${p?.name || 'Unknown'}" (${p?.name_he || ''}) [${p?.pillar || p?.category || 'general'}] ${up.duration_minutes}min, ${up.frequency}, core:${up.is_core} (user_practice_id: ${up.id}, practice_id: ${up.practice_id})`;
      }).join("\n")}`;
    }

    // Available practices library
    const { data: allPractices } = await supabase
      .from("practices")
      .select("id, name, name_he, category, pillar, difficulty_level")
      .eq("is_active", true)
      .limit(50);

    let libraryContext = "";
    if (allPractices?.length) {
      const userPracticeIds = new Set(userPractices?.map((up: any) => up.practice_id) || []);
      const available = allPractices.filter(p => !userPracticeIds.has(p.id));
      if (available.length) {
        libraryContext = `\n\nAvailable practices to add:\n${available.map(p =>
          `- "${p.name}" (${p.name_he || ''}) [${p.pillar || p.category}] difficulty:${p.difficulty_level || 'medium'} (practice_id: ${p.id})`
        ).join("\n")}`;
      }
    }

    const isHe = language === "he";

    const planTitle = plan?.plan_data?.title || plan?.plan_data?.plan_title || 'Untitled Plan';
    const planDuration = plan?.duration_months ? `${plan.duration_months} months` : '100 days';

    const systemPrompt = `You are Aurora, a plan editor AI. You output COMMAND TAGS that the frontend executes.

FORMAT: One brief ${isHe ? 'Hebrew' : 'English'} sentence, then ONLY command tags. Nothing else.

CRITICAL DEDUPLICATION RULE:
- Each UNIQUE activity the user did = EXACTLY ONE tag. NEVER emit the same title twice.
- If user says "I did calisthenics" → ONE tag: [task:create_done:קליסתניקס:DATE]
- If user says "I ran" → ONE tag: [task:create_done:ריצה:DATE]
- WRONG: creating both [task:create_done:ריצה] AND [task:create_done:10 דקות ריצה] for the same run

MATCHING RULES:
- Use [task:complete:UUID] when the EXACT task exists in the action_items list below
- Use [task:create_done:TITLE:YYYY-MM-DD] ONLY when NO matching action_item exists
- The title in create_done MUST match a title from the TACTICAL SCHEDULE below. Use the EXACT Hebrew title shown there.
- If no schedule item matches, use the activity name the user reported.

FORBIDDEN: Bullet points, asterisks (**), explanations, headers. Only tags.

COMMANDS:
[task:complete:UUID] — mark existing action_item done
[task:create_done:title:YYYY-MM-DD] — log + complete (title must match tactical schedule)
[task:create:title] — new task
[task:delete:UUID] — remove
[task:swap:UUID:new_title] — replace
[habit:create:name] [habit:complete:name] [habit:remove:name]
[milestone:complete:WEEK] [plan:edit:ID:field=val]
[practice:add:ID:dur:freq:is_core] [practice:remove:ID]

CONTEXT:
${plans.length > 0 ? plans.map(p => {
  const t = p.plan_data?.strategy?.title_he || p.plan_data?.strategy?.title_en || p.plan_data?.title || 'Plan';
  return `Plan: "${t}" started ${p.start_date}, status: ${p.status}`;
}).join("\n") : 'No active plan'}
${tacticalContext}${actionContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.3,
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("plan-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
