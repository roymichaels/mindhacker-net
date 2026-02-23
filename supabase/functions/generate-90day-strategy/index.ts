import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

const CORE_PILLAR_IDS = ['consciousness', 'presence', 'power', 'vitality', 'focus', 'combat', 'expansion'];
const ARENA_PILLAR_IDS = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play', 'order'];

interface PillarAssessment {
  domain_id: string;
  domain_config: Record<string, any>;
  status: string;
}

// ========== ASSESSMENT FIELD RESOLVER ==========
function resolveAssessmentBlock(assessment: PillarAssessment | undefined): string {
  if (!assessment) return 'No assessment data — generate goals based on general best practices for this pillar.';
  
  const cfg = assessment.domain_config || {};
  const latest = cfg.latest_assessment;
  if (!latest) return 'No assessment data — generate goals based on general best practices for this pillar.';
  
  const formData = cfg.form_data || cfg.onboarding_data || {};
  const overallScore = latest.overall_index ?? latest.domain_index ?? latest.consciousness_index ?? latest.overallScore ?? null;
  const mirrorStatement = latest.mirror_statement || latest.mirrorStatement || '';
  const nextStep = latest.one_next_step || latest.nextStep || '';
  const subscores = latest.subscores || latest.subsystems || latest.subScores || {};
  const findings = latest.findings?.slice(0, 5) || [];

  return `Score: ${overallScore ?? '?'}/100
Mirror Statement: ${mirrorStatement || 'N/A'}
Subscores: ${JSON.stringify(subscores, null, 1)}
Findings: ${JSON.stringify(findings, null, 1)}
Next Step: ${nextStep || 'N/A'}
Assessed At: ${latest.assessed_at || 'Unknown'}
Form Data: ${JSON.stringify(formData, null, 1).slice(0, 500)}`;
}

// ========== 3-LAYER PROMPT PIPELINE ==========

function buildUserContext(
  profileData: any,
  userProjects: any[],
  userBusinesses: any[],
  auroraMemory: any[],
): string {
  const projectsSection = userProjects
    .map(p => `- "${p.name}" (${p.status}) — ${p.description || ''} | Pillar: ${p.life_pillar || 'general'} | Goals: ${JSON.stringify(p.goals || []).slice(0, 200)}`)
    .join('\n') || 'None';

  const businessSection = userBusinesses.length > 0
    ? userBusinesses.map(b => {
        const vision = b.step_1_vision ? JSON.stringify(b.step_1_vision).slice(0, 300) : '';
        const model = b.step_2_business_model ? JSON.stringify(b.step_2_business_model).slice(0, 300) : '';
        const marketing = b.step_8_marketing ? JSON.stringify(b.step_8_marketing).slice(0, 200) : '';
        return `- "${b.business_name || 'Unnamed'}" (step ${b.current_step}/10, ${b.journey_complete ? 'complete' : 'in progress'})
  Vision: ${vision || 'N/A'}
  Model: ${model || 'N/A'}
  Marketing: ${marketing || 'N/A'}`;
      }).join('\n')
    : 'None';

  const memorySnippets = auroraMemory.slice(0, 25)
    .map(m => `- [${m.created_at?.slice(0, 10) || '?'}] [${m.emotional_state || 'neutral'}] ${m.summary}`)
    .join('\n') || 'None';

  return `## USER
Name: ${profileData?.name || 'Unknown'} | Level: ${profileData?.level || 1}
Intention: ${JSON.stringify(profileData?.intention || '')}
Today: ${new Date().toISOString().split('T')[0]}

## PROJECTS (with goals and pillar mapping)
${projectsSection}

## BUSINESSES (with journey data)
${businessSection}

## USER MEMORY (25 most recent, timeline-aware)
${memorySnippets}`;
}

// LAYER 1: Generate 3 strategic main goals per pillar
function buildLayer1Prompt(
  pillarId: string,
  hub: 'core' | 'arena',
  assessment: PillarAssessment | undefined,
  userContext: string,
): string {
  const assessmentBlock = resolveAssessmentBlock(assessment);
  
  return `You are Aurora, elite life transformation AI for "Mind OS" (מיינד OS).

TASK: Generate exactly 3 MAIN STRATEGIC GOALS for the pillar "${pillarId}" (${hub} hub).

${userContext}

## PILLAR "${pillarId.toUpperCase()}" ASSESSMENT
${assessmentBlock}

## RULES:
1. Goals MUST directly address assessment findings and weak subscores.
2. Reference user's actual projects/businesses BY NAME where relevant.
3. Use recent memory to understand current context and struggles.
4. Platform is "Mind OS" — never use old branding.
5. Hebrew must be natural, not translated.

## OUTPUT (JSON only, NO markdown):
{
  "goals": [
    { "goal_en": "Strategic goal addressing specific finding", "goal_he": "מטרה אסטרטגית" },
    { "goal_en": "...", "goal_he": "..." },
    { "goal_en": "...", "goal_he": "..." }
  ]
}`;
}

// LAYER 2: Generate 3 sub-goals for each main goal
function buildLayer2Prompt(
  pillarId: string,
  goals: { goal_en: string; goal_he: string }[],
  assessmentBlock: string,
): string {
  const goalsStr = goals.map((g, i) => `  ${i+1}. "${g.goal_en}" / "${g.goal_he}"`).join('\n');
  
  return `You are Aurora for "Mind OS". TASK: Break down each main goal into exactly 3 SUB-GOALS.

## PILLAR: ${pillarId.toUpperCase()}

## MAIN GOALS:
${goalsStr}

## ASSESSMENT CONTEXT:
${assessmentBlock}

## RULES:
- Sub-goals must be specific and actionable, building toward the main goal.
- Each sub-goal should target a different aspect of the main goal.
- Hebrew must be natural. Keep text concise.

## OUTPUT (JSON only, NO markdown):
{
  "goals": [
    {
      "goal_en": "${goals[0]?.goal_en || ''}",
      "goal_he": "${goals[0]?.goal_he || ''}",
      "sub_goals": [
        { "sub_goal_en": "Specific sub-goal", "sub_goal_he": "מטרת משנה" },
        { "sub_goal_en": "...", "sub_goal_he": "..." },
        { "sub_goal_en": "...", "sub_goal_he": "..." }
      ]
    },
    {
      "goal_en": "${goals[1]?.goal_en || ''}",
      "goal_he": "${goals[1]?.goal_he || ''}",
      "sub_goals": [...]
    },
    {
      "goal_en": "${goals[2]?.goal_en || ''}",
      "goal_he": "${goals[2]?.goal_he || ''}",
      "sub_goals": [...]
    }
  ]
}`;
}

// LAYER 3: Generate 5 milestones for each sub-goal
function buildLayer3Prompt(
  pillarId: string,
  goalsWithSubGoals: any[],
): string {
  const structure = goalsWithSubGoals.map((g, gi) => {
    const sgs = (g.sub_goals || []).map((sg: any, si: number) => 
      `    ${gi+1}.${si+1} "${sg.sub_goal_en}" / "${sg.sub_goal_he}"`
    ).join('\n');
    return `  Goal ${gi+1}: "${g.goal_en}"\n${sgs}`;
  }).join('\n');
  
  return `You are Aurora for "Mind OS". TASK: Generate exactly 5 CONCRETE MILESTONES for each sub-goal.

## PILLAR: ${pillarId.toUpperCase()}

## STRUCTURE:
${structure}

## RULES:
- Milestones must be CONCRETE action steps (not vague).
- Each milestone under 12 words.
- Milestones should be progressively challenging within each sub-goal.
- Hebrew must be natural. No generic filler.

## OUTPUT (JSON only, NO markdown):
{
  "goals": [
    {
      "goal_en": "...", "goal_he": "...",
      "sub_goals": [
        {
          "sub_goal_en": "...", "sub_goal_he": "...",
          "milestones_en": ["step1", "step2", "step3", "step4", "step5"],
          "milestones_he": ["צעד1", "צעד2", "צעד3", "צעד4", "צעד5"]
        }
      ]
    }
  ]
}`;
}

// ========== AI CALL HELPER ==========
async function callAI(apiKey: string, prompt: string, systemMsg: string, maxTokens = 4000, retries = 2): Promise<any | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          max_tokens: maxTokens,
          temperature: 0.4,
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        console.error(`AI call failed: ${response.status} (attempt ${attempt+1})`);
        if (attempt < retries) continue;
        return null;
      }

      const result = await response.json();
      const raw = result.choices?.[0]?.message?.content || '';
      const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to fix truncated JSON by closing open brackets
      let parsed: any;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        // Attempt auto-repair: count open/close brackets and append missing ones
        let fixed = jsonStr;
        const openBraces = (fixed.match(/{/g) || []).length;
        const closeBraces = (fixed.match(/}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;
        
        // Remove trailing comma if present
        fixed = fixed.replace(/,\s*$/, '');
        // Remove incomplete string values
        fixed = fixed.replace(/,?\s*"[^"]*$/, '');
        
        for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += ']';
        for (let i = 0; i < openBraces - closeBraces; i++) fixed += '}';
        
        try {
          parsed = JSON.parse(fixed);
          console.log(`  JSON auto-repaired successfully (attempt ${attempt+1})`);
        } catch (e2) {
          console.error(`AI parse error (attempt ${attempt+1}):`, e2);
          if (attempt < retries) continue;
          return null;
        }
      }
      return parsed;
    } catch (e) {
      console.error(`AI call exception (attempt ${attempt+1}):`, e);
      if (attempt < retries) continue;
      return null;
    }
  }
  return null;
}

// ========== 3-LAYER ORCHESTRATION PER PILLAR ==========
async function generatePillarStrategy(
  apiKey: string,
  pillarId: string,
  hub: 'core' | 'arena',
  assessment: PillarAssessment | undefined,
  userContext: string,
): Promise<{ goals: any[] } | null> {
  const assessmentBlock = resolveAssessmentBlock(assessment);
  const sysMsg = "Output ONLY valid JSON. No markdown. No explanation.";

  // LAYER 1: Strategic goals
  console.log(`  [${pillarId}] Layer 1: generating goals...`);
  const layer1 = await callAI(apiKey, buildLayer1Prompt(pillarId, hub, assessment, userContext), sysMsg, 1200);
  if (!layer1?.goals || layer1.goals.length < 3) {
    console.error(`  [${pillarId}] Layer 1 failed, using fallback`);
    return null;
  }

  // LAYER 2: Sub-goals (builds on Layer 1 output)
  console.log(`  [${pillarId}] Layer 2: generating sub-goals...`);
  const layer2 = await callAI(apiKey, buildLayer2Prompt(pillarId, layer1.goals, assessmentBlock), sysMsg, 2500);
  if (!layer2?.goals) {
    console.error(`  [${pillarId}] Layer 2 failed, using Layer 1 with generic sub-goals`);
    return null;
  }

  // LAYER 3: Milestones (builds on Layer 2 output) — needs most tokens
  console.log(`  [${pillarId}] Layer 3: generating milestones...`);
  const layer3 = await callAI(apiKey, buildLayer3Prompt(pillarId, layer2.goals), sysMsg, 6000);
  if (!layer3?.goals) {
    console.error(`  [${pillarId}] Layer 3 failed, using Layer 2 without milestones`);
    return layer2;
  }

  console.log(`  ✅ [${pillarId}] All 3 layers complete`);
  return layer3;
}

// ========== FALLBACK ==========
function _g(id: string, e1: string, h1: string, e2: string, h2: string, e3: string, h3: string) {
  const ms = (label: string) => Array.from({length:5}, (_,i) => `${label} step ${i+1}`);
  const msH = (label: string) => Array.from({length:5}, (_,i) => `${label} צעד ${i+1}`);
  const sg = (en: string, he: string) => ({ sub_goal_en: en, sub_goal_he: he, milestones_en: ms(en), milestones_he: msH(he) });
  return { goals: [
    { goal_en: e1, goal_he: h1, sub_goals: [sg("Foundation","בסיס"), sg("Practice","תרגול"), sg("Mastery","שליטה")] },
    { goal_en: e2, goal_he: h2, sub_goals: [sg("Assessment","הערכה"), sg("Training","אימון"), sg("Integration","שילוב")] },
    { goal_en: e3, goal_he: h3, sub_goals: [sg("Planning","תכנון"), sg("Execution","ביצוע"), sg("Optimization","אופטימיזציה")] },
  ]};
}

function buildFallbackStrategy(hub: 'core' | 'arena') {
  const pillarIds = hub === 'core' ? CORE_PILLAR_IDS : ARENA_PILLAR_IDS;
  const pillars: Record<string, any> = {};
  for (const id of pillarIds) {
    pillars[id] = _g(id, "Transform " + id, "טרנספורמציה " + id, "Master " + id, "שליטה ב" + id, "Scale " + id, "הרחבת " + id);
  }
  return { hub, pillars };
}

// ========== MAIN HANDLER ==========
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

    // === GENERATION LOCK: Prevent concurrent generation ===
    // Check for any plans in "generating" status (indicates another call in progress)
    const { data: generatingPlans } = await supabase
      .from('life_plans').select('id, created_at')
      .eq('user_id', user_id).eq('status', 'generating');
    
    if (generatingPlans && generatingPlans.length > 0) {
      // Check if generating plan is stale (> 5 min old = likely crashed)
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const stale = generatingPlans.filter((p: any) => p.created_at < fiveMinAgo);
      if (stale.length > 0) {
        // Clean up stale locks
        await supabase.from('life_plans').delete().in('id', stale.map((p: any) => p.id));
        console.log(`Cleaned ${stale.length} stale generation locks`);
      } else {
        // Active generation in progress — reject
        return new Response(JSON.stringify({ message: "Generation already in progress, please wait." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check existing plans
    if (!force_regenerate) {
      const { data: existing } = await supabase
        .from('life_plans').select('id, plan_data')
        .eq('user_id', user_id).eq('status', 'active')
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

    // Fetch user data
    const [domainsRes, profileRes, launchpadRes, projectsRes, businessRes, memoryRes] = await Promise.all([
      supabase.from('life_domains').select('domain_id, domain_config, status').eq('user_id', user_id),
      supabase.from('profiles').select('full_name, display_name, level, experience').eq('id', user_id).single(),
      supabase.from('launchpad_progress').select('step_1_intention, step_2_profile_data, step_3_lifestyle_data').eq('user_id', user_id).single(),
      supabase.from('user_projects').select('name, description, status, life_pillar, goals, milestones').eq('user_id', user_id).in('status', ['active', 'in_progress', 'planning']),
      supabase.from('business_journeys').select('business_name, current_step, journey_complete, step_1_vision, step_2_business_model, step_8_marketing').eq('user_id', user_id),
      supabase.from('aurora_conversation_memory').select('summary, emotional_state, key_topics, action_items, created_at').eq('user_id', user_id).order('created_at', { ascending: false }).limit(25),
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

    const userContext = buildUserContext(profileContext, userProjects, userBusinesses, auroraMemory);

    // Archiving moved to AFTER generation (atomic flip) — see below
    const hubsToGenerate = targetHub === 'both' ? ['core', 'arena'] as const : [targetHub as 'core' | 'arena'];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const results: any[] = [];

    for (const h of hubsToGenerate) {
      const pillarIds = h === 'core' ? CORE_PILLAR_IDS : ARENA_PILLAR_IDS;
      const hubAssessments = allDomains.filter(d => pillarIds.includes(d.domain_id));
      
      const pillarResults: Record<string, any> = {};
      let allAiSuccess = true;

      if (LOVABLE_API_KEY) {
        // Run 3-layer pipeline for each pillar (parallel across pillars)
        console.log(`\n🚀 Generating ${h} hub with 3-layer pipeline...`);
        
        const aiPromises = pillarIds.map(async (pillarId) => {
          const assessment = hubAssessments.find(a => a.domain_id === pillarId);
          const result = await generatePillarStrategy(LOVABLE_API_KEY, pillarId, h, assessment, userContext);
          return { pillarId, data: result };
        });

        const aiResults = await Promise.allSettled(aiPromises);
        for (const result of aiResults) {
          if (result.status === 'fulfilled' && result.value.data) {
            pillarResults[result.value.pillarId] = result.value.data;
          } else {
            const pid = result.status === 'fulfilled' ? result.value.pillarId : 'unknown';
            pillarResults[pid] = _g(pid, "Transform","טרנספורמציה","Master","שליטה","Scale","הרחבה");
            allAiSuccess = false;
          }
        }
      } else {
        console.error("LOVABLE_API_KEY not configured, using fallback for all");
        const fallback = buildFallbackStrategy(h);
        for (const [k, v] of Object.entries(fallback.pillars)) {
          pillarResults[k] = v;
        }
        allAiSuccess = false;
      }

      const strategyData = {
        hub: h,
        title_en: h === 'core' ? '90-Day Core Transformation' : '90-Day Arena Execution',
        title_he: h === 'core' ? 'טרנספורמציה פנימית — 90 יום' : 'ביצוע בזירה — 90 יום',
        vision_en: h === 'core' ? 'Build unshakable internal systems for consciousness, energy, and identity.' : 'Create unstoppable momentum in wealth, influence, and impact.',
        vision_he: h === 'core' ? 'בנה מערכות פנימיות בלתי ניתנות לערעור.' : 'צור מומנטום בלתי ניתן לעצירה בעושר, השפעה ואימפקט.',
        pillars: pillarResults,
        ai_generated: allAiSuccess,
      };

      // Store plan
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 90);

      // Insert plan with "generating" status (lock) then flip to "active" after milestones
      const { data: plan, error: planError } = await supabase
        .from('life_plans')
        .insert({
          user_id,
          duration_months: 3,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          plan_data: { hub: h, strategy: strategyData },
          status: 'generating',
          progress_percentage: 0,
        })
        .select('id')
        .single();

      if (planError) {
        console.error("Plan insert error:", planError);
        continue;
      }

      // Generate milestones — each sub-goal = one row
      const milestoneRows: any[] = [];

      for (const [pillarId, pillarObj] of Object.entries(pillarResults)) {
        const goals = (pillarObj as any)?.goals || [];
        goals.forEach((goal: any, gi: number) => {
          const subGoals = goal.sub_goals || [];
          subGoals.forEach((sg: any, si: number) => {
            milestoneRows.push({
              plan_id: plan.id,
              week_number: gi * 5 + si + 1,
              month_number: gi + 1,
              title: sg.sub_goal_he || sg.sub_goal_en || goal.goal_he,
              title_en: sg.sub_goal_en || sg.sub_goal_he || goal.goal_en,
              description: goal.goal_he || goal.goal_en,
              description_en: goal.goal_en || goal.goal_he,
              goal: sg.sub_goal_he || sg.sub_goal_en,
              goal_en: sg.sub_goal_en || sg.sub_goal_he,
              focus_area: pillarId,
              focus_area_en: pillarId,
              tasks: sg.milestones_he || sg.milestones_en || [],
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

      // === ATOMIC FLIP: Only now archive old plans and activate the new one ===
      // This ensures we never lose data — old plan stays active until new one is fully ready
      const { data: oldPlansForHub } = await supabase
        .from('life_plans').select('id, plan_data')
        .eq('user_id', user_id).eq('status', 'active');
      
      const hubPlanIds = (oldPlansForHub || [])
        .filter((p: any) => p.plan_data?.hub === h)
        .map((p: any) => p.id);
      
      if (hubPlanIds.length > 0) {
        await supabase.from('action_items').delete().eq('user_id', user_id).in('plan_id', hubPlanIds);
        await supabase.from('life_plan_milestones').delete().in('plan_id', hubPlanIds);
        await supabase.from('life_plans').update({ status: 'archived' }).in('id', hubPlanIds);
        console.log(`Archived ${hubPlanIds.length} old ${h} plans`);
      }

      // Now activate the new plan
      await supabase.from('life_plans').update({ status: 'active' }).eq('id', plan.id);

      console.log(`✅ ${h} hub: ${milestoneRows.length} milestones created (AI: ${allAiSuccess})`);
      results.push({ hub: h, plan_id: plan.id, goals_count: milestoneRows.length, ai_generated: allAiSuccess });
    }

    return new Response(
      JSON.stringify({ success: true, plans: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-90day-strategy error:", e);
    // Clean up any "generating" locks on error
    try {
      const body2 = await req.clone().json().catch(() => ({}));
      if (body2?.user_id) {
        const supabase2 = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await supabase2.from('life_plans').delete().eq('user_id', body2.user_id).eq('status', 'generating');
      }
    } catch (_) { /* ignore cleanup errors */ }
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
