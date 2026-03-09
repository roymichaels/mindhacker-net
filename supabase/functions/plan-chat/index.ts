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

      // Active action items
      const { data: actions } = await supabase
        .from("action_items")
        .select("id, title, type, pillar, status, scheduled_date, source")
        .eq("user_id", user_id)
        .in("status", ["pending", "active"])
        .limit(30);

      if (actions?.length) {
        actionContext = `\n\nActive tasks (${actions.length}):\n${actions.map(a =>
          `- "${a.title}" [${a.pillar || 'general'}] type:${a.type} source:${a.source} date:${a.scheduled_date || 'unscheduled'} (id: ${a.id})`
        ).join("\n")}`;
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
2. You can help with: adding/removing practices, modifying milestones, adjusting tasks, changing focus areas, swapping activities, rescheduling, and adjusting priorities.
3. When the user requests a change, respond with BOTH a conversational explanation AND structured commands using tags.
4. Always confirm what you understood before making changes.
5. Respond in ${isHe ? 'Hebrew' : 'English'}.

AVAILABLE COMMANDS (embed in your response):
- [plan:edit:MILESTONE_ID:title=new title|description=new desc] — Edit milestone fields
- [plan:add_task:WEEK_NUMBER:task description] — Add task to a week
- [plan:remove_task:WEEK_NUMBER:task text to remove] — Remove task from week
- [plan:replace_task:WEEK_NUMBER:old task text:new task text] — Replace a task
- [plan:bulk_replace:old_text:new_text] — Replace text across all milestones
- [task:create:title|type|pillar] — Create a new action item
- [task:delete:TASK_ID] — Remove an action item
- [habit:create:title|pillar|frequency] — Create a new habit
- [habit:remove:HABIT_ID] — Remove a habit

For PRACTICE changes, use these specific instructions (the frontend will handle the DB writes):
- To add a practice: respond with [practice:add:PRACTICE_ID:duration_minutes:frequency:is_core]
- To remove a practice: respond with [practice:remove:USER_PRACTICE_ID]
- To update a practice: respond with [practice:update:USER_PRACTICE_ID:field=value]

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
