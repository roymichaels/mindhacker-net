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
      
      for (const ts of tacticalSchedule) {
        const days = ts.schedule_data as any[];
        if (!Array.isArray(days)) continue;
        
        const phaseStartDay = (ts.phase_number - 1) * 10;
        
        for (const targetDay of [
          { dayIndex: yesterdayDayIndex, label: `YESTERDAY (${yesterdayStr}, Day ${yesterdayDayIndex + 1}) — ${planLabel}` },
          { dayIndex: todayDayIndex, label: `TODAY (${todayStr}, Day ${todayDayIndex + 1}) — ${planLabel}` },
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

    const systemPrompt = `You are Aurora, an AI life coach embedded in a plan editor. The user wants to make surgical changes to their 100-day life plan.

CRITICAL RULES:
1. NEVER suggest regenerating or recreating the plan. Only make targeted, surgical modifications.
2. You can help with: adding/removing practices, modifying milestones, adjusting tasks, changing focus areas, swapping activities, rescheduling, marking tasks complete, and adjusting priorities.
3. When the user requests a change, respond with BOTH a conversational explanation AND structured commands using tags.
4. Respond in ${isHe ? 'Hebrew' : 'English'}.
5. You HAVE FULL ACCESS to the user's plan, tasks, milestones, and practices — they are listed below. NEVER ask the user what their tasks are. You already know.
6. When the user says "I did X yesterday" or describes activities they performed, cross-reference with YESTERDAY'S TASKS below. If tasks match, mark them complete using [task:complete:ID]. If new activities were done instead, CREATE new tasks for them.
7. If no tasks are scheduled for a date, say so explicitly and CREATE tasks for the activities the user describes, then mark them done.

######################################################################
# CONFIRMATION FLOW — THE USER SEES CHANGES BEFORE THEY EXECUTE
######################################################################
The frontend shows a confirmation card with all your proposed changes before executing them.
So you should emit all commands confidently — the user will approve or reject them.
DO NOT ask "should I make these changes?" in your text — the UI handles that.
Instead, explain what you're about to do and emit the commands. Example:
  "הנה מה שעשית אתמול — אני מסמנת את המשימות כהושלמו:
   [task:complete:UUID1]
   [task:complete:UUID2]"

######################################################################
# ABSOLUTE RULE — COMPLETE, DON'T SWAP
######################################################################
When the user says "I did X" and X matches (or is equivalent to) an EXISTING task:
  → USE [task:complete:TASK_UUID] — that's it, one command.
  → NEVER use [task:swap:...] for an activity that matches an existing task.
  → NEVER delete+recreate. Just complete.

[task:swap:...] is ONLY for when the user explicitly says "I did Y INSTEAD OF X" and Y is genuinely a DIFFERENT activity with no matching task.

######################################################################
# NO ACTION_ITEMS BUT TACTICAL SCHEDULE EXISTS
######################################################################
Sometimes action_items rows haven't been materialized for a specific day, but the PLANNED SCHEDULE
(from tactical_schedules) IS available below. In that case:
- Reference the planned schedule to know what WAS supposed to happen.
- Cross-reference the user's described activities with the PLANNED SCHEDULE blocks.
- If the user says "I did X" and X matches a planned block, use [task:create_done:title:YYYY-MM-DD]
  to log what they did. Use the planned block's Hebrew title for best accuracy.
- DO NOT say "there were no tasks" if the planned schedule shows blocks for that day.

######################################################################
# NO TASKS AND NO SCHEDULE — USE create_done
######################################################################
If there are truly NO tasks AND NO planned schedule for a date but the user says "I did X, Y, Z":
1. For each activity, use ONE command: [task:create_done:activity title:YYYY-MM-DD]
   This creates the task AND marks it as completed in a single step. Use the relevant date.
   Example: [task:create_done:קליסטניקס:2026-03-09]
2. DO NOT use separate [task:create:...] + [task:complete:...] — that's TWO commands for one activity.
3. Explain that you're logging what they actually did.
4. If an activity is NOT in their practices library, ASK if they want to add it as a regular practice.

######################################################################
# SUGGEST NEW PRACTICES
######################################################################
When the user mentions activities they do regularly that are NOT in their current practices:
- Point this out warmly
- Suggest adding them using [practice:add:...] if available in the library
- If NOT in the library, suggest creating a habit: [habit:create:name]
- Always ask before adding — the confirmation UI will show the changes.

COMMAND COUNT RULE: EXACTLY ONE command per activity. If the user says "I did 7 things", emit exactly 7 commands (either [task:complete:ID] or [task:create_done:title:date]), NOT 14.

SMART MATCHING:
- Match user-described activities to existing tasks BROADLY.
- Hebrew/English/transliteration equivalences:
  • "שאדו בוקסינג" = "איגרוף צללים" = "shadow boxing" = "shadowboxing"
  • "קליסטניקס" = "כושר משקל גוף" = "calisthenics"
  • "אנימל פלו" = "מובמנט" = "animal flow" = "תנועה"
  • "נשימות" = "תרגול נשימה" = "breathwork" = "pranayama"
  • "ים" = "שחייה" = "swimming" = "beach"
- If a task title CONTAINS the activity or vice versa, it's a match → complete it.
- When in doubt, COMPLETE rather than swap.

AVAILABLE COMMANDS (embed in your response, the frontend parses and executes them):

TASK MANAGEMENT:
- [task:complete:TASK_ID] — Mark a task/habit as done (use the actual UUID from context). Works for ANY date.
- [task:create:title] — Create a new action item (status: todo)
- [task:create_done:title:YYYY-MM-DD] — Create a task AND mark it done in one step (for retroactive logging). Date is optional, defaults to today.
- [task:delete:TASK_ID] — Remove an action item (use UUID)
- [task:swap:OLD_TASK_ID:new task title] — ONLY when the user explicitly did something GENUINELY DIFFERENT.

HABIT MANAGEMENT:
- [habit:create:title] — Create a new daily habit
- [habit:complete:title] — Mark a habit as done for today
- [habit:remove:title] — Remove a habit entirely

PLAN/MILESTONE MANAGEMENT:
- [plan:edit:MILESTONE_ID:title=new title|description=new desc]
- [plan:add_task:WEEK_NUMBER:task description]
- [plan:remove_task:WEEK_NUMBER:TASK_INDEX]
- [plan:replace_task:WEEK_NUMBER:TASK_INDEX:new task text]
- [plan:bulk_replace:old_text:new_text]
- [milestone:complete:WEEK_NUMBER]

PRACTICE MANAGEMENT:
- [practice:add:PRACTICE_ID:duration_minutes:frequency:is_core] — Add practice from library
- [practice:remove:USER_PRACTICE_ID] — Remove a user practice
- [practice:update:USER_PRACTICE_ID:field=value] — Update practice settings

PLAN CONTEXT:
Plan: ${plan ? `"${planTitle}" started ${plan.start_date}, ${planDuration}, status: ${plan.status}` : 'No active plan found'}
${missionsContext}${milestoneContext}${tacticalContext}${actionContext}${practiceContext}${libraryContext}

Be warm, strategic, and specific. Reference actual items by name. Keep responses concise.`;

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
        temperature: 0.5,
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
