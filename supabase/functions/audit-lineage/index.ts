/**
 * audit-lineage — Lightweight lineage integrity checker.
 * 
 * Scans existing records for broken hierarchy links:
 * - action_items missing milestone_id when they should have one
 * - milestones missing mission_id
 * - missions missing primary_skill_id
 * 
 * Returns a summary with counts. No mutations — read-only audit.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

serve(async (req) => {
  if (isCorsPreFlight(req)) return handleCorsPreFlight();

  try {
    const { user_id } = await req.json();
    if (!user_id) throw new Error("user_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Missions missing primary_skill_id
    const { data: orphanMissions, error: e1 } = await supabase
      .from("plan_missions")
      .select("id, pillar, title_en, plan_id")
      .eq("plan_id", await getActivePlanIds(supabase, user_id))
      .is("primary_skill_id", null);

    // Fallback: get all missions for user's active plans
    const planIds = await getActivePlanIds(supabase, user_id);
    
    const { data: missionsNoSkill } = await supabase
      .from("plan_missions")
      .select("id, pillar, title_en")
      .in("plan_id", planIds)
      .is("primary_skill_id", null);

    // 2. Milestones missing mission_id
    const { data: milestonesNoMission } = await supabase
      .from("life_plan_milestones")
      .select("id, title_en, plan_id")
      .in("plan_id", planIds)
      .is("mission_id", null);

    // 3. Action items from plan/daily_engine missing milestone_id
    const { data: actionsNoMilestone } = await supabase
      .from("action_items")
      .select("id, title, source, type")
      .eq("user_id", user_id)
      .in("source", ["plan", "daily_engine"])
      .is("milestone_id", null)
      .limit(50);

    // 4. Action items from plan/daily_engine missing plan_id
    const { data: actionsNoPlan } = await supabase
      .from("action_items")
      .select("id, title, source")
      .eq("user_id", user_id)
      .in("source", ["plan", "daily_engine"])
      .is("plan_id", null)
      .limit(50);

    // 5. Skills (traits) without any linked missions
    const { data: allSkills } = await supabase
      .from("skills")
      .select("id, name, pillar")
      .eq("user_id", user_id)
      .eq("is_active", true);

    let orphanSkillCount = 0;
    if (allSkills && allSkills.length > 0) {
      const skillIds = allSkills.map(s => s.id);
      const { data: linkedMissions } = await supabase
        .from("plan_missions")
        .select("primary_skill_id")
        .in("primary_skill_id", skillIds);
      const linkedSkillIds = new Set((linkedMissions || []).map(m => m.primary_skill_id));
      orphanSkillCount = allSkills.filter(s => !linkedSkillIds.has(s.id)).length;
    }

    const summary = {
      missions_without_skill: (missionsNoSkill || []).length,
      milestones_without_mission: (milestonesNoMission || []).length,
      actions_without_milestone: (actionsNoMilestone || []).length,
      actions_without_plan: (actionsNoPlan || []).length,
      skills_without_missions: orphanSkillCount,
      total_active_skills: (allSkills || []).length,
      total_issues: (missionsNoSkill || []).length + (milestonesNoMission || []).length + (actionsNoMilestone || []).length + (actionsNoPlan || []).length,
      details: {
        missions_no_skill: (missionsNoSkill || []).slice(0, 10).map(m => ({ id: m.id, pillar: m.pillar, title: m.title_en })),
        milestones_no_mission: (milestonesNoMission || []).slice(0, 10).map(m => ({ id: m.id, title: m.title_en })),
        actions_no_milestone: (actionsNoMilestone || []).slice(0, 10).map(a => ({ id: a.id, title: a.title, source: a.source })),
      },
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("audit-lineage error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getActivePlanIds(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("life_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active");
  return (data || []).map((p: any) => p.id);
}
