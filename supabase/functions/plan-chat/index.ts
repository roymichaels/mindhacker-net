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
    const { user_id, messages, language } = await req.json();
    if (!user_id) throw new Error("user_id required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Gather plan context
    const { data: plan } = await supabase
      .from("life_plans")
      .select("id, title, start_date, duration_days, status")
      .eq("user_id", user_id)
      .eq("status", "active")
      .maybeSingle();

    let milestoneContext = "";
    let practiceContext = "";
    let actionContext = "";

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10);

    if (plan?.id) {
      // Milestones
      const { data: milestones } = await supabase
        .from("life_plan_milestones")
        .select("id, title, title_en, week_number, focus_area, is_completed, tasks, description")
        .eq("plan_id", plan.id)
        .order("week_number");

      if (milestones?.length) {
        milestoneContext = `\n\nCurrent plan milestones (${milestones.length} total):\n${milestones.map(m =>
          `- Week ${m.week_number}: "${m.title_en || m.title}" [${m.focus_area || 'general'}] ${m.is_completed ? '✅' : '⬜'} (id: ${m.id})`
        ).join("\n")}`;
      }

      // Fetch tasks from last 2 days + today + upcoming
      const { data: recentAndUpcoming } = await supabase
        .from("action_items")
        .select("id, title, type, pillar, status, scheduled_date, source, completed_at")
        .eq("user_id", user_id)
        .in("status", ["todo", "doing", "done"])
        .gte("scheduled_date", twoDaysAgoStr)
        .order("scheduled_date")
        .limit(100);

      if (recentAndUpcoming?.length) {
        // Group by date
        const yesterdayTasks = recentAndUpcoming.filter(a => a.scheduled_date === yesterdayStr);
        const todayTasks = recentAndUpcoming.filter(a => a.scheduled_date === todayStr);
        const futureTasks = recentAndUpcoming.filter(a => a.scheduled_date && a.scheduled_date > todayStr);
        const olderTasks = recentAndUpcoming.filter(a => a.scheduled_date && a.scheduled_date < yesterdayStr);

        actionContext = `\n\nToday's date: ${todayStr}\nYesterday's date: ${yesterdayStr}`;

        // Yesterday's tasks (critical for retroactive management)
        if (yesterdayTasks.length) {
          const yPending = yesterdayTasks.filter(a => a.status !== 'done');
          const yDone = yesterdayTasks.filter(a => a.status === 'done');
          actionContext += `\n\n📅 YESTERDAY'S TASKS (${yesterdayStr}):`;
          if (yPending.length) {
            actionContext += `\nIncomplete (${yPending.length}):\n${yPending.map(a =>
              `- "${a.title}" [${a.pillar || 'general'}] type:${a.type} status:${a.status} source:${a.source} (id: ${a.id})`
            ).join("\n")}`;
          }
          if (yDone.length) {
            actionContext += `\nCompleted (${yDone.length}):\n${yDone.map(a =>
              `- "${a.title}" [${a.pillar || 'general'}] type:${a.type} ✅ (id: ${a.id})`
            ).join("\n")}`;
          }
        }

        // Older incomplete
        if (olderTasks.length) {
          const olderPending = olderTasks.filter(a => a.status !== 'done');
          if (olderPending.length) {
            actionContext += `\n\n📅 OLDER INCOMPLETE:\n${olderPending.map(a =>
              `- "${a.title}" [${a.pillar || 'general'}] date:${a.scheduled_date} status:${a.status} (id: ${a.id})`
            ).join("\n")}`;
          }
        }

        // Today's tasks
        if (todayTasks.length) {
          const tPending = todayTasks.filter(a => a.status !== 'done');
          const tDone = todayTasks.filter(a => a.status === 'done');
          actionContext += `\n\n📅 TODAY'S TASKS (${todayStr}):`;
          if (tPending.length) {
            actionContext += `\nPending (${tPending.length}):\n${tPending.map(a =>
              `- "${a.title}" [${a.pillar || 'general'}] type:${a.type} status:${a.status} source:${a.source} (id: ${a.id})`
            ).join("\n")}`;
          }
          if (tDone.length) {
            actionContext += `\nCompleted (${tDone.length}):\n${tDone.map(a =>
              `- "${a.title}" [${a.pillar || 'general'}] type:${a.type} ✅ (id: ${a.id})`
            ).join("\n")}`;
          }
        }

        // Upcoming
        if (futureTasks.length) {
          actionContext += `\n\nUpcoming (${futureTasks.length}):\n${futureTasks.slice(0, 15).map(a =>
            `- "${a.title}" [${a.pillar || 'general'}] date:${a.scheduled_date} status:${a.status} (id: ${a.id})`
          ).join("\n")}`;
        }
      }
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

    const systemPrompt = `You are Aurora, an AI life coach embedded in a plan editor. The user wants to make surgical changes to their 100-day life plan.

CRITICAL RULES:
1. NEVER suggest regenerating or recreating the plan. Only make targeted, surgical modifications.
2. You can help with: adding/removing practices, modifying milestones, adjusting tasks, changing focus areas, swapping activities, rescheduling, marking tasks complete, and adjusting priorities.
3. When the user requests a change, respond with BOTH a conversational explanation AND structured commands using tags.
4. Always confirm what you understood before making changes.
5. Respond in ${isHe ? 'Hebrew' : 'English'}.

AVAILABLE COMMANDS (embed in your response, the frontend parses and executes them):

TASK MANAGEMENT:
- [task:complete:TASK_ID] — Mark a task/habit as done (use the actual UUID id from the context). Works for ANY date including yesterday.
- [task:create:title] — Create a new action item for today
- [task:delete:TASK_ID] — Remove an action item (use UUID)
- [task:swap:OLD_TASK_ID:new task title] — Remove old task and create a replacement with a new title

HABIT MANAGEMENT:
- [habit:create:title] — Create a new daily habit
- [habit:complete:title] — Mark a habit as done for today
- [habit:remove:title] — Remove a habit entirely

PLAN/MILESTONE MANAGEMENT:
- [plan:edit:MILESTONE_ID:title=new title|description=new desc] — Edit milestone fields
- [plan:add_task:WEEK_NUMBER:task description] — Add task to a week's milestone
- [plan:remove_task:WEEK_NUMBER:TASK_INDEX] — Remove task by index from week
- [plan:replace_task:WEEK_NUMBER:TASK_INDEX:new task text] — Replace a task in milestone
- [plan:bulk_replace:old_text:new_text] — Replace text across all milestones
- [milestone:complete:WEEK_NUMBER] — Mark a milestone week as complete

PRACTICE MANAGEMENT:
- [practice:add:PRACTICE_ID:duration_minutes:frequency:is_core] — Add practice to user
- [practice:remove:USER_PRACTICE_ID] — Remove a user practice
- [practice:update:USER_PRACTICE_ID:field=value] — Update practice settings

CRITICAL BEHAVIORS FOR RETROACTIVE TASK MANAGEMENT:
- You have full visibility of YESTERDAY's tasks (both completed and incomplete).
- When the user says "I actually did X instead of Y yesterday", you should:
  1. Find the task Y from yesterday's list by matching the title/description
  2. Use [task:swap:OLD_ID:new equivalent title] to replace it, OR
  3. Use [task:complete:ID] to mark the original as done if they did do it
  4. Use [task:delete:OLD_ID] + [task:create:new title] if the replacement is very different
- When the user says "I did these yesterday" or "mark yesterday's tasks as done", find the matching tasks from YESTERDAY'S TASKS section and use [task:complete:ID] for each one.
- When the user says "I didn't do X but I did Y instead which is equivalent", swap the task and mark the new one as done.
- Be smart about equivalences: if the user says "I did yoga instead of stretching", those are equivalent body practices - swap and complete.
- You CAN emit MULTIPLE commands in a single response. Do it when handling multiple tasks at once.
- Always use the actual task UUIDs from the context. Never guess IDs.

PLAN CONTEXT:
Plan: ${plan ? `"${plan.title}" started ${plan.start_date}, ${plan.duration_days} days, status: ${plan.status}` : 'No active plan'}
${milestoneContext}${actionContext}${practiceContext}${libraryContext}

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
