import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

/**
 * generate-90day-strategy
 * 
 * Generates a pillar-based 90-day plan:
 * - Per pillar: 3 main goals
 * - Per main goal: 5 sub-goals
 * - Per sub-goal: 10 milestones
 * Stores in life_plans (plan_data) + life_plan_milestones.
 */

const CORE_PILLAR_IDS = ['consciousness', 'presence', 'power', 'vitality', 'focus', 'combat', 'expansion'];
const ARENA_PILLAR_IDS = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play', 'order'];

interface PillarAssessment {
  domain_id: string;
  domain_config: Record<string, any>;
  status: string;
}

function buildStrategyPrompt(
  hub: 'core' | 'arena',
  assessments: PillarAssessment[],
  profileData: any,
  userProjects: any[],
  userBusinesses: any[],
  auroraMemory: any[],
): string {
  const pillarSummaries = assessments
    .filter(a => a.status === 'configured')
    .map(a => {
      const cfg = a.domain_config || {};
      const latest = cfg.latest_assessment;
      const formData = cfg.form_data || cfg.onboarding_data || {};
      return `### ${a.domain_id.toUpperCase()} (score: ${latest?.overallScore ?? '?'}/100)
Mirror: ${latest?.mirrorStatement || 'N/A'}
Subsystems: ${JSON.stringify(latest?.subsystems || latest?.subScores || {}, null, 1)}
Findings: ${JSON.stringify(latest?.findings?.slice(0, 3) || [], null, 1)}
Next Step: ${latest?.nextStep || 'N/A'}
Form Data: ${JSON.stringify(formData, null, 1).slice(0, 800)}`;
    })
    .join('\n\n');

  const projectsSection = userProjects.length > 0
    ? userProjects.map(p => `- "${p.name}" (${p.status}) — ${p.description || 'no description'}. Pillar: ${p.life_pillar || 'general'}. Goals: ${JSON.stringify(p.goals || [])}`).join('\n')
    : 'No active projects.';

  const businessSection = userBusinesses.length > 0
    ? userBusinesses.map(b => {
        const vision = b.step_1_vision;
        return `- "${b.business_name || 'Unnamed'}" (step ${b.current_step}/10)
  Vision: ${JSON.stringify(vision || {}).slice(0, 400)}
  Marketing: ${JSON.stringify(b.step_8_marketing || {}).slice(0, 300)}`;
      }).join('\n')
    : 'No businesses configured.';

  const memorySection = auroraMemory.length > 0
    ? auroraMemory.slice(0, 10).map(m => `- [${m.emotional_state || 'neutral'}] ${m.summary}. Topics: ${(m.key_topics || []).join(', ')}`).join('\n')
    : 'No conversation memory.';

  const hubLabel = hub === 'core' ? 'Core (Internal Development)' : 'Arena (External Execution)';
  const pillarIds = hub === 'core' ? CORE_PILLAR_IDS : ARENA_PILLAR_IDS;

  return `You are Aurora, an elite life transformation AI. Generate a 90-day strategic plan organized BY PILLAR for the user's ${hubLabel} hub.

## USER IDENTITY
Name: ${profileData?.name || 'Unknown'}
Level: ${profileData?.level || 1}
Intention: ${JSON.stringify(profileData?.intention || 'Not set')}
Lifestyle: ${JSON.stringify(profileData?.lifestyle || {}).slice(0, 600)}
Profile: ${JSON.stringify(profileData?.profile || {}).slice(0, 600)}

## PILLAR ASSESSMENTS
${pillarSummaries || 'No assessments completed yet.'}

## USER'S ACTIVE PROJECTS
${projectsSection}

## USER'S BUSINESSES
${businessSection}

## AURORA'S MEMORY
${memorySection}

## PILLARS TO GENERATE: ${JSON.stringify(pillarIds)}

## STRUCTURE — CRITICAL (3 × 5 × 10 hierarchy):
For EACH pillar above, generate exactly 3 MAIN GOALS for the next 90 days.
For EACH main goal, generate exactly 5 SUB-GOALS (focused objectives within the main goal).
For EACH sub-goal, generate exactly 10 MILESTONES (concrete checkpoints/deliverables).

## RULES:
1. Main goals must be BIG PICTURE themes — the 3 most important strategic directions for that pillar.
2. Sub-goals break each main goal into 5 focused objectives.
3. Milestones are ACTIONABLE steps that clearly lead to the sub-goal.
4. Reference the user's ACTUAL projects and businesses BY NAME.
5. Reference assessment data: if sleep score is low, include specific sleep goals; if combat training exists, reference the actual discipline.
6. Progressive difficulty: early milestones are foundational, later ones are advanced.
7. Both Hebrew and English for all text. Hebrew must be natural, not literal translation.

## OUTPUT FORMAT (JSON only, no markdown fences):
{
  "hub": "${hub}",
  "title_en": "90-Day ${hubLabel} Plan",
  "title_he": "תוכנית 90 יום — ${hub === 'core' ? 'ליבה' : 'זירה'}",
  "vision_en": "One concrete measurable 90-day vision statement",
  "vision_he": "...",
  "pillars": {
    "${pillarIds[0]}": {
      "goals": [
        {
          "goal_en": "Main goal title",
          "goal_he": "כותרת מטרה ראשית",
          "sub_goals": [
            {
              "sub_goal_en": "Sub-goal title",
              "sub_goal_he": "כותרת מטרת משנה",
              "milestones_en": ["Step 1", "Step 2", "...", "Step 10"],
              "milestones_he": ["צעד 1", "צעד 2", "...", "צעד 10"]
            }
          ]
        }
      ]
    }
  }
}

Generate ALL ${pillarIds.length} pillars, each with exactly 3 main goals, each main goal with 5 sub-goals, each sub-goal with 10 milestones.`;
}

serve(async (req) => {
  if (isCorsPreFlight(req)) return handleCorsPreFlight();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { user_id, hub, force_regenerate } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetHub = hub || 'both';

    // Check for existing active plans (skip if force)
    if (!force_regenerate) {
      const { data: existing } = await supabase
        .from('life_plans')
        .select('id, plan_data')
        .eq('user_id', user_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const existingHubs = (existing || []).map((p: any) => p.plan_data?.hub).filter(Boolean);
      if (targetHub === 'both' && existingHubs.includes('core') && existingHubs.includes('arena')) {
        return new Response(JSON.stringify({ message: "Plans already exist", plans: existing }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (targetHub !== 'both' && existingHubs.includes(targetHub)) {
        return new Response(JSON.stringify({ message: "Plan already exists", plans: existing }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch ALL user data in parallel
    const [domainsRes, profileRes, launchpadRes, projectsRes, businessRes, memoryRes] = await Promise.all([
      supabase.from('life_domains').select('domain_id, domain_config, status').eq('user_id', user_id),
      supabase.from('profiles').select('full_name, display_name, level, experience').eq('id', user_id).single(),
      supabase.from('launchpad_progress').select('step_1_intention, step_2_profile_data, step_3_lifestyle_data').eq('user_id', user_id).single(),
      supabase.from('user_projects').select('name, description, status, life_pillar, goals, milestones').eq('user_id', user_id).in('status', ['active', 'in_progress', 'planning']),
      supabase.from('business_journeys').select('business_name, current_step, journey_complete, step_1_vision, step_2_business_model, step_8_marketing').eq('user_id', user_id),
      supabase.from('aurora_conversation_memory').select('summary, emotional_state, key_topics, action_items').eq('user_id', user_id).order('created_at', { ascending: false }).limit(15),
    ]);

    const allDomains = (domainsRes.data || []) as PillarAssessment[];
    const profile = profileRes.data || {};
    const launchpad = launchpadRes.data || {};
    const userProjects = projectsRes.data || [];
    const userBusinesses = businessRes.data || [];
    const auroraMemory = memoryRes.data || [];

    const profileContext = {
      name: profile.full_name || profile.display_name,
      level: profile.level,
      intention: launchpad.step_1_intention,
      lifestyle: launchpad.step_3_lifestyle_data,
      profile: launchpad.step_2_profile_data,
    };

    // Archive old active plans and clean up their action items
    const { data: oldActivePlans } = await supabase
      .from('life_plans')
      .select('id')
      .eq('user_id', user_id)
      .eq('status', 'active');
    
    const oldPlanIds = (oldActivePlans || []).map((p: any) => p.id);
    if (oldPlanIds.length > 0) {
      await supabase.from('action_items').delete().eq('user_id', user_id).in('plan_id', oldPlanIds);
      await supabase.from('life_plan_milestones').delete().in('plan_id', oldPlanIds);
      await supabase.from('life_plans').update({ status: 'archived' }).in('id', oldPlanIds);
    }

    // Clean up orphaned plan-generated action items
    await supabase
      .from('action_items')
      .delete()
      .eq('user_id', user_id)
      .is('plan_id', null)
      .in('source', ['plan', 'aurora'])
      .in('type', ['habit', 'task'])
      .neq('status', 'done');

    const hubsToGenerate = targetHub === 'both' ? ['core', 'arena'] as const : [targetHub as 'core' | 'arena'];
    const results: any[] = [];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    for (const h of hubsToGenerate) {
      const pillarIds = h === 'core' ? CORE_PILLAR_IDS : ARENA_PILLAR_IDS;
      const hubAssessments = allDomains.filter(d => pillarIds.includes(d.domain_id));

      const prompt = buildStrategyPrompt(h, hubAssessments, profileContext, userProjects, userBusinesses, auroraMemory);

      let strategyData: any;

      if (!LOVABLE_API_KEY) {
        console.error("LOVABLE_API_KEY not configured, using fallback");
        strategyData = buildFallbackStrategy(h, userProjects, userBusinesses);
      } else {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are Aurora, an elite transformation AI. Output ONLY valid JSON, no markdown fences. Be HYPER-SPECIFIC — reference user's actual projects, businesses, and assessment data by name. Generate the FULL structure as requested: 3 main goals per pillar, 5 sub-goals per main goal, 10 milestones per sub-goal." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiResult = await aiResponse.json();
          const raw = aiResult.choices?.[0]?.message?.content || '';
          const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          try {
            strategyData = JSON.parse(jsonStr);
          } catch {
            console.error("Failed to parse AI response:", jsonStr.slice(0, 500));
            strategyData = buildFallbackStrategy(h, userProjects, userBusinesses);
          }
        } else {
          const errText = await aiResponse.text();
          console.error("AI call failed:", aiResponse.status, errText);
          strategyData = buildFallbackStrategy(h, userProjects, userBusinesses);
        }
      }

      // Store in life_plans
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 90);

      const { data: plan, error: planError } = await supabase
        .from('life_plans')
        .insert({
          user_id,
          duration_months: 3,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          plan_data: { hub: h, strategy: strategyData },
          status: 'active',
          progress_percentage: 0,
        })
        .select('id')
        .single();

      if (planError) {
        console.error("Plan insert error:", planError);
        continue;
      }

      // Generate life_plan_milestones from the 3×5×10 structure
      // Each sub-goal becomes a milestone row; milestones stored in tasks/tasks_en
      const pillarsData = strategyData?.pillars || {};
      const milestoneRows: any[] = [];

      for (const [pillarId, pillarObj] of Object.entries(pillarsData)) {
        const goals = (pillarObj as any)?.goals || [];
        goals.forEach((goal: any, gi: number) => {
          const subGoals = goal.sub_goals || [];
          subGoals.forEach((sg: any, si: number) => {
            milestoneRows.push({
              plan_id: plan.id,
              week_number: gi * 5 + si + 1, // unique index within pillar
              month_number: gi + 1, // main goal index (1-3)
              title: sg.sub_goal_he || sg.sub_goal_en || goal.goal_he,
              title_en: sg.sub_goal_en || sg.sub_goal_he || goal.goal_en,
              description: goal.goal_he || goal.goal_en,
              description_en: goal.goal_en || goal.goal_he,
              goal: sg.sub_goal_he || sg.sub_goal_en,
              goal_en: sg.sub_goal_en || sg.sub_goal_he,
              focus_area: pillarId,
              focus_area_en: pillarId,
              tasks: sg.milestones_he || [],
              tasks_en: sg.milestones_en || [],
              is_completed: false,
              xp_reward: 50,
              tokens_reward: 10,
            });
          });
        });
      }

      if (milestoneRows.length > 0) {
        const BATCH_SIZE = 50;
        for (let i = 0; i < milestoneRows.length; i += BATCH_SIZE) {
          const batch = milestoneRows.slice(i, i + BATCH_SIZE);
          const { error: milestoneError } = await supabase
            .from('life_plan_milestones')
            .insert(batch);
          if (milestoneError) console.error("Milestone insert error:", milestoneError);
        }
      }

      results.push({ hub: h, plan_id: plan.id, goals_count: milestoneRows.length });
    }

    return new Response(
      JSON.stringify({ success: true, plans: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-90day-strategy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fallback strategy — 3×5×10 structure
function buildFallbackStrategy(hub: 'core' | 'arena', projects: any[] = [], businesses: any[] = []) {
  const pillarIds = hub === 'core' ? CORE_PILLAR_IDS : ARENA_PILLAR_IDS;

  const pillars: Record<string, { goals: any[] }> = {};

  for (const pillarId of pillarIds) {
    const goals: any[] = [];
    for (let g = 0; g < 3; g++) {
      const sub_goals: any[] = [];
      for (let s = 0; s < 5; s++) {
        const milestones_en: string[] = [];
        const milestones_he: string[] = [];
        for (let m = 0; m < 10; m++) {
          milestones_en.push(`${pillarId} goal ${g + 1} sub ${s + 1} — milestone ${m + 1}`);
          milestones_he.push(`${pillarId} מטרה ${g + 1} משנה ${s + 1} — אבן דרך ${m + 1}`);
        }
        sub_goals.push({
          sub_goal_en: `${pillarId.charAt(0).toUpperCase() + pillarId.slice(1)} G${g + 1} — Sub-goal ${s + 1}`,
          sub_goal_he: `${pillarId} מ${g + 1} — מטרת משנה ${s + 1}`,
          milestones_en,
          milestones_he,
        });
      }
      goals.push({
        goal_en: `${pillarId.charAt(0).toUpperCase() + pillarId.slice(1)} — Main Goal ${g + 1}`,
        goal_he: `${pillarId} — מטרה ראשית ${g + 1}`,
        sub_goals,
      });
    }
    pillars[pillarId] = { goals };
  }

  return {
    hub,
    title_en: hub === 'core' ? '90-Day Core Transformation' : '90-Day Arena Execution',
    title_he: hub === 'core' ? 'טרנספורמציה פנימית — 90 יום' : 'ביצוע בזירה — 90 יום',
    vision_en: hub === 'core' ? 'Build unshakable daily systems for body, mind, and identity.' : 'Create momentum in wealth, influence, and external impact.',
    vision_he: hub === 'core' ? 'בנה מערכות יומיות בלתי ניתנות לערעור.' : 'צור מומנטום בעושר, השפעה והשפעה חיצונית.',
    pillars,
  };
}
