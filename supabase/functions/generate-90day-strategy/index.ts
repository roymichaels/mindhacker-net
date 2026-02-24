import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

const CORE_PILLAR_IDS = ['consciousness', 'presence', 'power', 'vitality', 'focus', 'combat', 'expansion'];
const ARENA_PILLAR_IDS = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play', 'order'];

const TOTAL_PHASES = 10;
const TOTAL_DAYS = 100;
const DAYS_PER_PHASE = TOTAL_DAYS / TOTAL_PHASES; // 10 days per phase

// Phase labels A-J
const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

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

// Pillar scope definitions — strict boundaries for AI generation
const PILLAR_SCOPES: Record<string, { scope_en: string; NOT_en: string }> = {
  consciousness: { scope_en: 'Self-awareness, ego states, shadow work, emotional intelligence, mindfulness, inner dialogue, psychological patterns, self-understanding', NOT_en: 'NOT meditation techniques (→focus), NOT physical health (→vitality), NOT breathing exercises (→focus)' },
  presence: { scope_en: 'Social confidence, charisma, public speaking, body language, first impressions, voice projection, stage presence, personal magnetism', NOT_en: 'NOT physical strength (→power), NOT fighting skills (→combat), NOT networking strategy (→influence)' },
  power: { scope_en: 'Physical strength, max lifts (squat/bench/deadlift), bodyweight strength, calisthenics progressions (muscle-up/planche/handstand), explosive power, grip strength, structural strength', NOT_en: 'NOT sleep optimization (→vitality), NOT cardio/endurance (→vitality), NOT flexibility/yoga (→focus), NOT fighting/martial arts (→combat), NOT nutrition (→vitality)' },
  vitality: { scope_en: 'Energy management, sleep optimization, nutrition, hydration, cardiovascular health, hormonal health, recovery, cold/heat exposure, circadian rhythm, longevity protocols', NOT_en: 'NOT strength training (→power), NOT fighting (→combat), NOT meditation (→focus), NOT body awareness practices (→focus)' },
  focus: { scope_en: 'Breath work, meditation, guided meditation, hypnosis/trance, somatic awareness (tai chi/qigong), structural calm (yoga), attention training, CO2 tolerance, nervous system regulation', NOT_en: 'NOT physical strength (→power), NOT sleep/nutrition (→vitality), NOT social skills (→presence), NOT productivity systems (→order)' },
  combat: { scope_en: 'Martial arts training, boxing, Muay Thai, kickboxing, shadowboxing, heavy bag work, sparring, fighting technique, combat conditioning, self-defense', NOT_en: 'NOT general strength (→power), NOT flexibility (→focus), NOT cardio (→vitality), NOT mental toughness without combat context (→consciousness)' },
  expansion: { scope_en: 'Learning new skills, intellectual growth, reading, courses, creative pursuits, exploring new domains, curiosity, knowledge acquisition, personal development beyond other pillars', NOT_en: 'NOT business learning (→business), NOT financial education (→wealth), NOT social skills (→presence/influence)' },
  wealth: { scope_en: 'Financial planning, investing, savings, budgeting, income growth, passive income, financial literacy, asset building, debt management, financial freedom strategy', NOT_en: 'NOT business operations (→business), NOT selling/marketing (→influence), NOT project management (→projects)' },
  influence: { scope_en: 'Networking, personal branding, social media presence, content creation, thought leadership, persuasion, sales, marketing, community building, reputation management', NOT_en: 'NOT social confidence (→presence), NOT financial planning (→wealth), NOT business operations (→business)' },
  relationships: { scope_en: 'Romantic relationships, family bonds, friendships, communication skills, conflict resolution, intimacy, boundaries, dating, social connection, emotional support systems', NOT_en: 'NOT networking/branding (→influence), NOT charisma (→presence), NOT self-awareness (→consciousness)' },
  business: { scope_en: 'Business strategy, operations, product development, team management, scaling, business model, customer acquisition, systems, processes, entrepreneurship', NOT_en: 'NOT personal finance (→wealth), NOT personal branding (→influence), NOT project execution (→projects)' },
  projects: { scope_en: 'Project planning, execution, milestones, deliverables, time management for specific projects, MVP development, shipping, iteration, portfolio management', NOT_en: 'NOT business strategy (→business), NOT financial planning (→wealth), NOT general productivity (→order)' },
  play: { scope_en: 'Recreation, hobbies, fun, adventure, travel, games, sports for enjoyment, creative play, entertainment, joy, work-life balance', NOT_en: 'NOT competitive training (→combat/power), NOT skill building (→expansion), NOT social networking (→influence)' },
  order: { scope_en: 'Daily routines, habits, organization, environment design, productivity systems, time blocking, decluttering, discipline, accountability, life admin', NOT_en: 'NOT project-specific tasks (→projects), NOT business processes (→business), NOT meditation/focus practices (→focus)' },
};

// LAYER 1: Generate 3 strategic main goals per pillar
function buildLayer1Prompt(
  pillarId: string,
  hub: 'core' | 'arena',
  assessment: PillarAssessment | undefined,
  userContext: string,
): string {
  const assessmentBlock = resolveAssessmentBlock(assessment);
  const scope = PILLAR_SCOPES[pillarId];
  const scopeBlock = scope
    ? `\n## PILLAR SCOPE (STRICT BOUNDARIES):\nIN SCOPE: ${scope.scope_en}\n${scope.NOT_en}\n`
    : '';
  
  return `You are Aurora, elite life transformation AI for "Mind OS" (מיינד OS).

TASK: Generate exactly 3 MAIN STRATEGIC GOALS for the pillar "${pillarId}" (${hub} hub).
This is part of a 100-DAY TRANSFORMATION PLAN divided into 10 progressive phases (A through J).
Each phase builds on the previous one — start with foundations, then layer complexity.

${userContext}

## PILLAR "${pillarId.toUpperCase()}" ASSESSMENT
${assessmentBlock}
${scopeBlock}
## RULES:
1. Goals MUST directly address assessment findings and weak subscores.
2. Reference user's actual projects/businesses BY NAME where relevant.
3. Use recent memory to understand current context and struggles.
4. Platform is "Mind OS" — never use old branding.
5. Hebrew must be natural, not translated.
6. Goals should follow progressive complexity: Goal 1 = foundational, Goal 2 = intermediate, Goal 3 = advanced.
7. CRITICAL: Every goal MUST fall within the pillar's IN SCOPE definition above. If a goal belongs to another pillar, DO NOT include it.

## OUTPUT (JSON only, NO markdown):
{
  "goals": [
    { "goal_en": "Strategic goal addressing specific finding", "goal_he": "מטרה אסטרטגית" },
    { "goal_en": "...", "goal_he": "..." },
    { "goal_en": "...", "goal_he": "..." }
  ]
}`;
}

// LAYER 2: Generate 5 milestones for each mission (main goal)
function buildLayer2Prompt(
  pillarId: string,
  goals: { goal_en: string; goal_he: string }[],
  assessmentBlock: string,
): string {
  const goalsStr = goals.map((g, i) => `  ${i+1}. "${g.goal_en}" / "${g.goal_he}"`).join('\n');
  const scope = PILLAR_SCOPES[pillarId];
  const scopeBlock = scope
    ? `\n## PILLAR SCOPE (STRICT):\nIN SCOPE: ${scope.scope_en}\n${scope.NOT_en}\n`
    : '';
  
  return `You are Aurora for "Mind OS". TASK: Break down each mission into exactly 5 MILESTONES.
This is part of a 100-DAY TRANSFORMATION PLAN. Each mission has 5 progressive milestones.

## PILLAR: ${pillarId.toUpperCase()}
${scopeBlock}
## MISSIONS:
${goalsStr}

## ASSESSMENT CONTEXT:
${assessmentBlock}

## RULES:
- Each mission gets exactly 5 milestones, progressively more challenging.
- Milestones must be specific and actionable.
- Each milestone should target a different aspect of the mission.
- CRITICAL: All milestones MUST stay within the pillar's scope. No cross-pillar tasks.
- Hebrew must be natural. Keep text concise.

## OUTPUT (JSON only, NO markdown):
{
  "missions": [
    {
      "mission_en": "${goals[0]?.goal_en || ''}",
      "mission_he": "${goals[0]?.goal_he || ''}",
      "milestones": [
        { "title_en": "Specific milestone 1", "title_he": "אבן דרך 1", "description_en": "What to achieve", "description_he": "מה להשיג" },
        { "title_en": "...", "title_he": "...", "description_en": "...", "description_he": "..." },
        { "title_en": "...", "title_he": "...", "description_en": "...", "description_he": "..." },
        { "title_en": "...", "title_he": "...", "description_en": "...", "description_he": "..." },
        { "title_en": "...", "title_he": "...", "description_en": "...", "description_he": "..." }
      ]
    },
    { "mission_en": "${goals[1]?.goal_en || ''}", "mission_he": "${goals[1]?.goal_he || ''}", "milestones": [...] },
    { "mission_en": "${goals[2]?.goal_en || ''}", "mission_he": "${goals[2]?.goal_he || ''}", "milestones": [...] }
  ]
}`;
}

// LAYER 3: Generate 5 mini-milestones for each milestone (daily actions)
function buildLayer3Prompt(
  pillarId: string,
  missions: any[],
): string {
  const structure = missions.map((m, mi) => {
    const mstones = (m.milestones || []).map((ms: any, si: number) => 
      `    ${mi+1}.${si+1} "${ms.title_en}"`
    ).join('\n');
    return `  Mission ${mi+1}: "${m.mission_en}"\n${mstones}`;
  }).join('\n');
  
  return `You are Aurora for "Mind OS". TASK: Generate exactly 5 MINI-MILESTONES for each milestone.
Each mini-milestone becomes a DAILY ACTION in the user's queue.
Total: 3 missions × 5 milestones × 5 mini-milestones = 75 daily actions spread across 100 days.

## PILLAR: ${pillarId.toUpperCase()}

## STRUCTURE:
${structure}

## RULES:
- Each milestone gets exactly 5 mini-milestones (daily actionable tasks).
- Mini-milestones must be completable in a single day/session.
- Be concrete and specific — no generic filler.
- Each mini-milestone under 15 words.
- Hebrew must be natural.
- Progressive difficulty within each milestone.

## OUTPUT (JSON only, NO markdown):
{
  "missions": [
    {
      "mission_en": "...",
      "milestones": [
        {
          "title_en": "...",
          "minis": [
            { "title_en": "Daily action 1", "title_he": "פעולה יומית 1" },
            { "title_en": "Daily action 2", "title_he": "פעולה יומית 2" },
            { "title_en": "Daily action 3", "title_he": "פעולה יומית 3" },
            { "title_en": "Daily action 4", "title_he": "פעולה יומית 4" },
            { "title_en": "Daily action 5", "title_he": "פעולה יומית 5" }
          ]
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
      
      let parsed: any;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        let fixed = jsonStr;
        const openBraces = (fixed.match(/{/g) || []).length;
        const closeBraces = (fixed.match(/}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;
        
        fixed = fixed.replace(/,\s*$/, '');
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

// ========== 2-LAYER ORCHESTRATION PER PILLAR (outline only) ==========
// Layer 3 (mini-milestones) is generated on-demand when user reaches a milestone
async function generatePillarStrategy(
  apiKey: string,
  pillarId: string,
  hub: 'core' | 'arena',
  assessment: PillarAssessment | undefined,
  userContext: string,
): Promise<{ missions: any[] } | null> {
  const assessmentBlock = resolveAssessmentBlock(assessment);
  const sysMsg = "Output ONLY valid JSON. No markdown. No explanation.";

  // LAYER 1: 3 Missions (strategic goals)
  console.log(`  [${pillarId}] Layer 1: generating 3 missions...`);
  const layer1 = await callAI(apiKey, buildLayer1Prompt(pillarId, hub, assessment, userContext), sysMsg, 1200);
  if (!layer1?.goals || layer1.goals.length < 3) {
    console.error(`  [${pillarId}] Layer 1 failed`);
    return null;
  }

  // LAYER 2: 5 milestones per mission (outline — no mini-milestones yet)
  console.log(`  [${pillarId}] Layer 2: generating 5 milestones per mission...`);
  const layer2 = await callAI(apiKey, buildLayer2Prompt(pillarId, layer1.goals, assessmentBlock), sysMsg, 3000);
  if (!layer2?.missions) {
    console.error(`  [${pillarId}] Layer 2 failed`);
    return null;
  }

  console.log(`  ✅ [${pillarId}] Outline complete (mini-milestones deferred to phase entry)`);
  return layer2;
}

// ========== FALLBACK ==========
function _g(id: string, e1: string, h1: string, e2: string, h2: string, e3: string, h3: string) {
  const ms = (label: string) => Array.from({length:10}, (_,i) => `${label} phase ${PHASE_LABELS[i]} step`);
  const msH = (label: string) => Array.from({length:10}, (_,i) => `${label} שלב ${PHASE_LABELS[i]}`);
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
    const { user_id, hub, force_regenerate, selected_pillars, single_pillar } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetHub = hub || 'both';

    // === GENERATION LOCK ===
    const { data: generatingPlans } = await supabase
      .from('life_plans').select('id, created_at')
      .eq('user_id', user_id).eq('status', 'generating');
    
    if (generatingPlans && generatingPlans.length > 0) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const stale = generatingPlans.filter((p: any) => p.created_at < fiveMinAgo);
      if (stale.length > 0) {
        await supabase.from('life_plans').delete().in('id', stale.map((p: any) => p.id));
        console.log(`Cleaned ${stale.length} stale generation locks`);
      } else {
        return new Response(JSON.stringify({ message: "Generation already in progress, please wait." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check existing plans — only generate missing hubs
    let hubsToGenerate: ('core' | 'arena')[] = targetHub === 'both' ? ['core', 'arena'] : [targetHub as 'core' | 'arena'];
    
    // Always fetch existing active plans
    const { data: existing } = await supabase
      .from('life_plans').select('id, plan_data')
      .eq('user_id', user_id).eq('status', 'active')
      .order('created_at', { ascending: false });

    if (force_regenerate) {
      // Archive ALL active plans (including old-format ones without hub)
      const allActiveIds = (existing || []).map((p: any) => p.id);
      if (allActiveIds.length > 0) {
        await supabase.from('plan_missions').delete().in('plan_id', allActiveIds);
        await supabase.from('action_items').delete().eq('user_id', user_id).in('plan_id', allActiveIds);
        await supabase.from('life_plan_milestones').delete().in('plan_id', allActiveIds);
        await supabase.from('life_plans').update({ status: 'archived' }).in('id', allActiveIds);
        console.log(`Force regenerate: archived ${allActiveIds.length} existing plans`);
      }
    } else {
      const existingHubs = (existing || []).map((p: any) => p.plan_data?.hub).filter(Boolean);
      
      // Auto-archive old-format plans (no hub key) — they're legacy and need replacement
      const legacyPlans = (existing || []).filter((p: any) => !p.plan_data?.hub);
      if (legacyPlans.length > 0) {
        const legacyIds = legacyPlans.map((p: any) => p.id);
        await supabase.from('plan_missions').delete().in('plan_id', legacyIds);
        await supabase.from('action_items').delete().eq('user_id', user_id).in('plan_id', legacyIds);
        await supabase.from('life_plan_milestones').delete().in('plan_id', legacyIds);
        await supabase.from('life_plans').update({ status: 'archived' }).in('id', legacyIds);
        console.log(`Auto-archived ${legacyIds.length} legacy (no-hub) plans`);
      }
      
      // Filter out hubs that already have proper hub-tagged plans
      hubsToGenerate = hubsToGenerate.filter(h => !existingHubs.includes(h));
      
      if (hubsToGenerate.length === 0) {
        return new Response(JSON.stringify({ message: "Plans already exist", plans: existing }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      console.log(`Generating missing hubs: ${hubsToGenerate.join(', ')} (existing: ${existingHubs.join(', ')})`);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const results: any[] = [];

    // === FETCH USER DATA FOR AI CONTEXT ===
    const allPillarIds = [...CORE_PILLAR_IDS, ...ARENA_PILLAR_IDS];

    const [profileRes, domainsRes, projectsRes, businessRes, memoryRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user_id).single(),
      supabase.from('life_domains').select('domain_id, domain_config, status').eq('user_id', user_id).in('domain_id', allPillarIds),
      supabase.from('user_projects').select('name, status, description, life_pillar, goals').eq('user_id', user_id).limit(10),
      supabase.from('business_journeys').select('business_name, current_step, journey_complete, step_1_vision, step_2_business_model, step_8_marketing').eq('user_id', user_id).limit(5),
      supabase.from('aurora_conversation_memory').select('summary, emotional_state, created_at').eq('user_id', user_id).order('created_at', { ascending: false }).limit(25),
    ]);

    const allDomains: PillarAssessment[] = (domainsRes.data || []) as PillarAssessment[];
    const userContext = buildUserContext(
      profileRes.data,
      projectsRes.data || [],
      businessRes.data || [],
      memoryRes.data || [],
    );

    for (const h of hubsToGenerate) {
      const allHubPillarIds = h === 'core' ? CORE_PILLAR_IDS : ARENA_PILLAR_IDS;
      
      // Filter to selected pillars only (if provided)
      let pillarIds: string[];
      if (single_pillar) {
        // Modular mode: only generate for one pillar and merge into existing plan
        pillarIds = allHubPillarIds.includes(single_pillar) ? [single_pillar] : [];
      } else if (selected_pillars) {
        const hubSelected = h === 'core' ? (selected_pillars.core || []) : (selected_pillars.arena || []);
        pillarIds = allHubPillarIds.filter((id: string) => hubSelected.includes(id));
      } else {
        pillarIds = allHubPillarIds;
      }
      
      if (pillarIds.length === 0) {
        console.log(`No pillars selected for ${h} hub, skipping`);
        continue;
      }
      
      const hubAssessments = allDomains.filter(d => pillarIds.includes(d.domain_id));
      
      const pillarResults: Record<string, any> = {};
      let allAiSuccess = true;

      if (LOVABLE_API_KEY) {
        console.log(`\n🚀 Generating ${h} hub — 100-day / 10-phase plan...`);
        
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

      // === MODULAR MODE: merge into existing plan ===
      if (single_pillar) {
        // Find existing active plan for this hub
        const { data: existingPlan } = await supabase
          .from('life_plans').select('id, plan_data')
          .eq('user_id', user_id).eq('status', 'active')
          .order('created_at', { ascending: false });
        
        const hubPlan = (existingPlan || []).find((p: any) => p.plan_data?.hub === h);
        
        if (hubPlan) {
          // Merge new pillar into existing plan_data
          const existingStrategy = hubPlan.plan_data?.strategy || hubPlan.plan_data || {};
          const updatedPillars = { ...(existingStrategy.pillars || {}), ...pillarResults };
          const updatedStrategy = { ...existingStrategy, pillars: updatedPillars };
          
          await supabase.from('life_plans')
            .update({ plan_data: { hub: h, strategy: updatedStrategy } })
            .eq('id', hubPlan.id);
          
          // Generate missions/milestones for the new pillar only
          const planId = hubPlan.id;
          let totalMissions = 0, totalMilestones = 0;
          
          for (const [pillarId, pillarObj] of Object.entries(pillarResults)) {
            // Delete existing missions for this pillar (if re-adding)
            const { data: oldMissions } = await supabase
              .from('plan_missions').select('id')
              .eq('plan_id', planId).eq('pillar', pillarId);
            if (oldMissions && oldMissions.length > 0) {
              const oldIds = oldMissions.map((m: any) => m.id);
              await supabase.from('life_plan_milestones').delete().in('mission_id', oldIds);
              await supabase.from('plan_missions').delete().in('id', oldIds);
            }
            
            const missions = (pillarObj as any)?.missions || (pillarObj as any)?.goals || [];
            for (let mi = 0; mi < Math.min(missions.length, 3); mi++) {
              const mission = missions[mi];
              const { data: missionRow, error: missionError } = await supabase
                .from('plan_missions').insert({
                  plan_id: planId, pillar: pillarId, mission_number: mi + 1,
                  title: mission.mission_he || mission.goal_he || mission.mission_en || mission.goal_en,
                  title_en: mission.mission_en || mission.goal_en,
                  description: mission.mission_he || mission.goal_he,
                  description_en: mission.mission_en || mission.goal_en,
                  xp_reward: 50,
                }).select('id').single();
              if (missionError) continue;
              totalMissions++;
              
              const milestones = mission.milestones || mission.sub_goals || [];
              for (let si = 0; si < Math.min(milestones.length, 5); si++) {
                const ms = milestones[si];
                const phaseNumber = mi * 3 + Math.min(si, 3) + 1;
                await supabase.from('life_plan_milestones').insert({
                  plan_id: planId, mission_id: missionRow.id, milestone_number: si + 1,
                  week_number: Math.min(phaseNumber, TOTAL_PHASES),
                  month_number: Math.ceil(phaseNumber / 3),
                  title: ms.title_he || ms.sub_goal_he || ms.title_en,
                  title_en: ms.title_en || ms.sub_goal_en,
                  description: ms.description_he || ms.title_he,
                  description_en: ms.description_en || ms.title_en,
                  goal: ms.title_he || ms.sub_goal_he,
                  goal_en: ms.title_en || ms.sub_goal_en,
                  focus_area: pillarId, focus_area_en: pillarId,
                  is_completed: false, xp_reward: 20, tokens_reward: 5,
                });
                totalMilestones++;
              }
            }
          }
          
          console.log(`✅ Modular add: ${single_pillar} → ${totalMissions} missions, ${totalMilestones} milestones`);
          results.push({ hub: h, plan_id: planId, missions: totalMissions, milestones: totalMilestones, modular: true });
          continue; // Skip normal plan creation
        }
      }

      const strategyData = {
        hub: h,
        total_phases: TOTAL_PHASES,
        total_days: TOTAL_DAYS,
        days_per_phase: DAYS_PER_PHASE,
        phase_labels: PHASE_LABELS,
        title_en: h === 'core' ? '100-Day Core Transformation' : '100-Day Arena Execution',
        title_he: h === 'core' ? 'טרנספורמציה פנימית — 100 יום' : 'ביצוע בזירה — 100 יום',
        vision_en: h === 'core' ? 'Build unshakable internal systems for consciousness, energy, and identity.' : 'Create unstoppable momentum in wealth, influence, and impact.',
        vision_he: h === 'core' ? 'בנה מערכות פנימיות בלתי ניתנות לערעור.' : 'צור מומנטום בלתי ניתן לעצירה בעושר, השפעה ואימפקט.',
        pillars: pillarResults,
        ai_generated: allAiSuccess,
      };

      // Store plan — 100 days
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + TOTAL_DAYS);

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

      // Generate missions, milestones, and mini-milestones
      // Structure: 3 missions × 5 milestones × 5 mini-milestones per pillar
      let totalMissions = 0;
      let totalMilestones = 0;
      let totalMinis = 0;

      for (const [pillarId, pillarObj] of Object.entries(pillarResults)) {
        const missions = (pillarObj as any)?.missions || (pillarObj as any)?.goals || [];
        
        for (let mi = 0; mi < Math.min(missions.length, 3); mi++) {
          const mission = missions[mi];
          
          // Insert mission
          const { data: missionRow, error: missionError } = await supabase
            .from('plan_missions')
            .insert({
              plan_id: plan.id,
              pillar: pillarId,
              mission_number: mi + 1,
              title: mission.mission_he || mission.goal_he || mission.mission_en || mission.goal_en,
              title_en: mission.mission_en || mission.goal_en,
              description: mission.mission_he || mission.goal_he,
              description_en: mission.mission_en || mission.goal_en,
              xp_reward: 50,
            })
            .select('id')
            .single();
          
          if (missionError) {
            console.error(`Mission insert error for ${pillarId}:`, missionError);
            continue;
          }
          totalMissions++;

          const milestones = mission.milestones || mission.sub_goals || [];
          for (let si = 0; si < Math.min(milestones.length, 5); si++) {
            const ms = milestones[si];
            const phaseNumber = mi * 3 + Math.min(si, 3) + 1; // Spread across phases

            const { data: msRow, error: msError } = await supabase
              .from('life_plan_milestones')
              .insert({
                plan_id: plan.id,
                mission_id: missionRow.id,
                milestone_number: si + 1,
                week_number: Math.min(phaseNumber, TOTAL_PHASES),
                month_number: Math.ceil(phaseNumber / 3),
                title: ms.title_he || ms.sub_goal_he || ms.title_en || ms.sub_goal_en,
                title_en: ms.title_en || ms.sub_goal_en,
                description: ms.description_he || ms.title_he,
                description_en: ms.description_en || ms.title_en,
                goal: ms.title_he || ms.sub_goal_he,
                goal_en: ms.title_en || ms.sub_goal_en,
                focus_area: pillarId,
                focus_area_en: pillarId,
                is_completed: false,
                xp_reward: 20,
                tokens_reward: 5,
              })
              .select('id')
              .single();

            if (msError) {
              console.error(`Milestone insert error:`, msError);
              continue;
            }
            totalMilestones++;

            // Mini-milestones are generated on-demand when user enters this milestone phase
            // This keeps initial generation fast and allows analytics-aware action creation
          }
        }
      }

      // === ATOMIC FLIP ===
      const { data: oldPlansForHub } = await supabase
        .from('life_plans').select('id, plan_data')
        .eq('user_id', user_id).eq('status', 'active');
      
      const hubPlanIds = (oldPlansForHub || [])
        .filter((p: any) => p.plan_data?.hub === h)
        .map((p: any) => p.id);
      
      if (hubPlanIds.length > 0) {
        // Clean up old plan data (mini_milestones cascade via milestone FK)
        await supabase.from('plan_missions').delete().in('plan_id', hubPlanIds);
        await supabase.from('action_items').delete().eq('user_id', user_id).in('plan_id', hubPlanIds);
        await supabase.from('life_plan_milestones').delete().in('plan_id', hubPlanIds);
        await supabase.from('life_plans').update({ status: 'archived' }).in('id', hubPlanIds);
        console.log(`Archived ${hubPlanIds.length} old ${h} plans`);
      }

      await supabase.from('life_plans').update({ status: 'active' }).eq('id', plan.id);

      console.log(`✅ ${h} hub: ${totalMissions} missions, ${totalMilestones} milestones, ${totalMinis} mini-milestones (AI: ${allAiSuccess})`);
      results.push({ hub: h, plan_id: plan.id, missions: totalMissions, milestones: totalMilestones, minis: totalMinis, ai_generated: allAiSuccess });
    }

    return new Response(
      JSON.stringify({ success: true, plans: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-100day-strategy error:", e);
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
