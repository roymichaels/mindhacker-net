import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

/**
 * generate-90day-strategy
 * 
 * Reads all pillar assessments, user projects, businesses, Aurora conversation
 * memory, and onboarding data to generate a hyper-specific 90-day strategic plan.
 * Uses Lovable AI gateway. Stores result in life_plans + life_plan_milestones.
 */

const CORE_PILLAR_IDS = ['consciousness', 'presence', 'power', 'vitality', 'focus', 'combat', 'expansion'];
const ARENA_PILLAR_IDS = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play'];

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
Findings: ${JSON.stringify(latest?.findings?.slice(0, 5) || [], null, 1)}
Next Step: ${latest?.nextStep || 'N/A'}
Key Form Data: ${JSON.stringify(formData, null, 1).slice(0, 1500)}`;
    })
    .join('\n\n');

  // Projects detail
  const projectsSection = userProjects.length > 0
    ? userProjects.map(p => `- "${p.name}" (${p.status}) — ${p.description || 'no description'}. Pillar: ${p.life_pillar || 'general'}. Goals: ${JSON.stringify(p.goals || [])}`).join('\n')
    : 'No active projects.';

  // Business detail
  const businessSection = userBusinesses.length > 0
    ? userBusinesses.map(b => {
        const vision = b.step_1_vision;
        return `- "${b.business_name || 'Unnamed Business'}" (step ${b.current_step}/10, ${b.journey_complete ? 'complete' : 'in progress'})
  Vision: ${JSON.stringify(vision || {}).slice(0, 500)}
  Model: ${JSON.stringify(b.step_2_business_model || {}).slice(0, 300)}
  Marketing: ${JSON.stringify(b.step_8_marketing || {}).slice(0, 300)}`;
      }).join('\n')
    : 'No businesses configured.';

  // Aurora memory (recent insights)
  const memorySection = auroraMemory.length > 0
    ? auroraMemory.map(m => `- [${m.emotional_state || 'neutral'}] ${m.summary}. Topics: ${(m.key_topics || []).join(', ')}. Actions: ${(m.action_items || []).join(', ')}`).join('\n')
    : 'No conversation memory.';

  const hubLabel = hub === 'core' ? 'Core (Internal Development)' : 'Arena (External Execution)';
  const pillars = hub === 'core' 
    ? 'Consciousness, Presence/Image, Power, Vitality, Focus, Combat, Expansion'
    : 'Wealth, Influence, Relationships, Business, Projects, Play';

  return `You are Aurora, an elite life transformation AI architect. You know EVERYTHING about this user — their projects, businesses, habits, struggles, and goals. Generate a hyper-specific, personalized 90-day strategic plan for their ${hubLabel} hub.

## USER IDENTITY
Name: ${profileData?.name || 'Unknown'}
Level: ${profileData?.level || 1}
Intention: ${JSON.stringify(profileData?.intention || 'Not set')}
Lifestyle Data: ${JSON.stringify(profileData?.lifestyle || {}).slice(0, 800)}
Profile Data: ${JSON.stringify(profileData?.profile || {}).slice(0, 800)}

## PILLAR ASSESSMENTS (DETAILED)
${pillarSummaries || 'No assessments completed yet.'}

## USER'S ACTIVE PROJECTS
${projectsSection}

## USER'S BUSINESSES
${businessSection}

## AURORA'S MEMORY (Recent Conversations & Insights)
${memorySection}

## PILLARS IN THIS HUB: ${pillars}

## CRITICAL RULES — READ CAREFULLY:
1. Create exactly 12 weekly milestones (4 weeks × 3 months).
2. Each week must have 5-9 daily_actions that are ULTRA-SPECIFIC.
3. NEVER write generic actions like "Deep Work Block", "Work on project", "Business Strategy Step", "Revenue Action".
4. Instead, reference the user's ACTUAL projects and businesses BY NAME.
   - BAD: "ביצוע פרויקט — משימה הבאה" 
   - GOOD: "MindOS — לבנות את דף הנחיתה למודול ההיפנוזה"
   - BAD: "בלוק עבודה עמוקה — 45 דקות"
   - GOOD: "כתיבת 3 מאמרי SEO לבלוג של [שם העסק]"
   - BAD: "פעולת הכנסה — חשבונית / פנייה"
   - GOOD: "שליחת 5 הצעות מחיר ללקוחות פוטנציאליים ב-[ענף]"
5. Use progressive intensity: weeks 1-4 foundation, 5-8 building, 9-12 integration.
6. Every pillar must appear at least once per 3 weeks.
7. Reference specific assessment findings — if sleep is poor, include specific sleep protocols; if combat training exists, reference the actual martial art.
8. If user has specific fitness goals from assessments, reference actual exercises, weights, routines.
9. Be a SPECIFIC STRATEGIST, not a template generator.

## OUTPUT FORMAT (JSON only, no markdown fences):
{
  "hub": "${hub}",
  "title_en": "...",
  "title_he": "...",
  "vision_en": "One concrete, measurable 90-day vision",
  "vision_he": "...",
  "weeks": [
    {
      "week": 1,
      "theme_en": "Foundation — [specific theme based on user's situation]",
      "theme_he": "...",
      "intensity": "medium",
      "pillar_focus": ["vitality", "focus", "consciousness"],
      "goals_en": ["Specific measurable goal 1", "Specific measurable goal 2"],
      "goals_he": ["..."],
      "daily_actions": [
        { "pillar": "vitality", "action_en": "Morning Sunlight Walk — 10 min before 8am", "action_he": "הליכת אור בוקר — 10 דקות לפני 8 בבוקר", "duration_min": 10, "block_type": "body" },
        { "pillar": "projects", "action_en": "[Actual project name] — [Specific deliverable]", "action_he": "[שם פרויקט אמיתי] — [תוצר ספציפי]", "duration_min": 30, "block_type": "arena" }
      ]
    }
  ]
}

Generate all 12 weeks. Each week should have 5-9 daily_actions.
block_type must be one of: body, mind, arena.
For Core hub: body=Power/Vitality/Combat, mind=Focus/Consciousness/Expansion, arena=Presence
For Arena hub: arena=all Arena pillars

Language: Provide BOTH English and Hebrew for all text fields. Hebrew must be natural and specific, not a literal translation.`;
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

    // Fetch ALL user data in parallel for maximum context
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

    // Always archive old active plans and clean up their action items
    const { data: oldActivePlans } = await supabase
      .from('life_plans')
      .select('id')
      .eq('user_id', user_id)
      .eq('status', 'active');
    
    const oldPlanIds = (oldActivePlans || []).map((p: any) => p.id);
    if (oldPlanIds.length > 0) {
      await supabase.from('action_items').delete().eq('user_id', user_id).in('plan_id', oldPlanIds);
      await supabase.from('life_plans').update({ status: 'archived' }).in('id', oldPlanIds);
    }

    // Also clean up orphaned plan-generated action items
    await supabase
      .from('action_items')
      .delete()
      .eq('user_id', user_id)
      .is('plan_id', null)
      .in('source', ['plan', 'aurora', 'user'])
      .in('type', ['habit', 'task'])
      .neq('status', 'done');

    const hubsToGenerate = targetHub === 'both' ? ['core', 'arena'] as const : [targetHub as 'core' | 'arena'];
    const results: any[] = [];

    // Use Lovable AI gateway
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
              { role: "system", content: "You are Aurora, an elite transformation AI. Output ONLY valid JSON, no markdown fences. Be HYPER-SPECIFIC — reference user's actual projects, businesses, and assessment data by name." },
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

      // Generate milestones from the weeks data
      const weeks = strategyData?.weeks || [];
      const milestones = weeks.map((w: any) => ({
        plan_id: plan.id,
        week_number: w.week,
        month_number: Math.ceil(w.week / 4),
        title: w.theme_he || `שבוע ${w.week}`,
        title_en: w.theme_en || `Week ${w.week}`,
        description: (w.goals_he || []).join(' | '),
        description_en: (w.goals_en || []).join(' | '),
        goal: (w.goals_he || [])[0] || null,
        goal_en: (w.goals_en || [])[0] || null,
        focus_area: (w.pillar_focus || []).join(', '),
        tasks: (w.daily_actions || []).map((a: any) => a.action_he || a.action_en),
        tasks_en: (w.daily_actions || []).map((a: any) => a.action_en || a.action_he),
        is_completed: false,
        xp_reward: 50,
        tokens_reward: 10,
        start_date: null,
        end_date: null,
      }));

      if (milestones.length > 0) {
        const { error: milestoneError } = await supabase
          .from('life_plan_milestones')
          .insert(milestones);
        if (milestoneError) console.error("Milestone insert error:", milestoneError);
      }

      // Create action_items for the current week's daily actions
      const currentWeekData = weeks.find((w: any) => w.week === 1);
      if (currentWeekData?.daily_actions) {
        const today = new Date().toISOString().split('T')[0];
        const actionItems = currentWeekData.daily_actions.map((action: any, idx: number) => ({
          user_id,
          plan_id: plan.id,
          title: action.action_he || action.action_en,
          description: action.action_en,
          type: 'task',
          source: 'plan',
          status: 'pending',
          pillar: action.pillar,
          time_block: action.block_type,
          scheduled_date: today,
          order_index: idx,
          xp_reward: 10,
          token_reward: 2,
          metadata: { duration_min: action.duration_min, strategy_week: 1 },
        }));

        const { error: actionError } = await supabase
          .from('action_items')
          .insert(actionItems);
        if (actionError) console.error("Action items insert error:", actionError);
      }

      results.push({ hub: h, plan_id: plan.id, strategy: strategyData });
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

// Fallback strategy — still tries to be specific using real user data
function buildFallbackStrategy(hub: 'core' | 'arena', projects: any[] = [], businesses: any[] = []) {
  const projectNames = projects.map(p => p.name).filter(Boolean);
  const businessNames = businesses.map(b => b.business_name).filter(Boolean);

  const coreActions = [
    { pillar: 'vitality', action_en: 'Morning Sunlight Walk — 10 min before 8am', action_he: 'הליכת אור בוקר — 10 דקות לפני 8 בבוקר', duration_min: 10, block_type: 'body' },
    { pillar: 'power', action_en: 'Strength Training — Upper Body Compound Movements', action_he: 'אימון כוח — תרגילים מורכבים פלג גוף עליון', duration_min: 40, block_type: 'body' },
    { pillar: 'combat', action_en: 'Combat Training — 3 Rounds Shadowboxing + Footwork', action_he: 'אימון לחימה — 3 סיבובי צללים + עבודת רגליים', duration_min: 20, block_type: 'body' },
    { pillar: 'focus', action_en: projectNames[0] ? `Deep Work on ${projectNames[0]} — Core feature build` : 'Focused Deep Work — Single priority task', action_he: projectNames[0] ? `עבודה ממוקדת על ${projectNames[0]} — בניית פיצ'ר מרכזי` : 'עבודה ממוקדת — משימת עדיפות בודדת', duration_min: 45, block_type: 'mind' },
    { pillar: 'consciousness', action_en: 'Meditation & Self-Awareness — 15 min', action_he: 'מדיטציה ומודעות עצמית — 15 דקות', duration_min: 15, block_type: 'mind' },
    { pillar: 'expansion', action_en: 'Learning Block — Read 20 pages or study skill', action_he: 'בלוק למידה — קריאת 20 עמודים או לימוד מיומנות', duration_min: 30, block_type: 'mind' },
    { pillar: 'presence', action_en: 'Grooming & Style — Daily appearance check', action_he: 'טיפוח וסגנון — בדיקת מראה יומית', duration_min: 10, block_type: 'mind' },
    { pillar: 'vitality', action_en: 'Evening Shutdown Protocol — No screens after 21:00', action_he: 'פרוטוקול כיבוי ערב — ללא מסכים אחרי 21:00', duration_min: 15, block_type: 'body' },
  ];

  const arenaActions = [
    { pillar: 'wealth', action_en: businessNames[0] ? `${businessNames[0]} — Send 5 outreach messages` : 'Revenue Action — Send 5 client outreach messages', action_he: businessNames[0] ? `${businessNames[0]} — שליחת 5 הודעות פנייה` : 'פעולת הכנסה — שליחת 5 הודעות ללקוחות', duration_min: 25, block_type: 'arena' },
    { pillar: 'business', action_en: businessNames[0] ? `${businessNames[0]} — Execute next business milestone` : 'Business Strategy — Complete next milestone', action_he: businessNames[0] ? `${businessNames[0]} — ביצוע אבן דרך עסקית` : 'אסטרטגיה עסקית — השלמת אבן דרך', duration_min: 30, block_type: 'arena' },
    { pillar: 'projects', action_en: projectNames[0] ? `${projectNames[0]} — Build next deliverable` : 'Project Execution — Complete next deliverable', action_he: projectNames[0] ? `${projectNames[0]} — בניית התוצר הבא` : 'ביצוע פרויקט — השלמת התוצר הבא', duration_min: 25, block_type: 'arena' },
    { pillar: 'influence', action_en: 'Content Creation — Write & publish 1 post', action_he: 'יצירת תוכן — כתיבה ופרסום פוסט אחד', duration_min: 20, block_type: 'arena' },
    { pillar: 'relationships', action_en: 'Meaningful Connection — Call or meet 1 person', action_he: 'קשר משמעותי — שיחה או פגישה עם אדם אחד', duration_min: 15, block_type: 'arena' },
    { pillar: 'play', action_en: 'Play Session — Physical activity or creative hobby', action_he: 'זמן משחק — פעילות גופנית או תחביב יצירתי', duration_min: 30, block_type: 'arena' },
  ];

  const actions = hub === 'core' ? coreActions : arenaActions;
  const phases = ['foundation', 'building', 'integration'];
  const intensities = ['medium', 'medium', 'high', 'medium', 'high', 'medium', 'light', 'medium', 'high', 'high', 'medium', 'light'];

  return {
    hub,
    title_en: hub === 'core' ? '90-Day Core Transformation' : '90-Day Arena Execution',
    title_he: hub === 'core' ? 'טרנספורמציה פנימית — 90 יום' : 'ביצוע בזירה — 90 יום',
    vision_en: hub === 'core' ? 'Build unshakable daily systems for body, mind, and identity.' : 'Create momentum in wealth, influence, and external impact.',
    vision_he: hub === 'core' ? 'בנה מערכות יומיות בלתי ניתנות לערעור לגוף, נפש וזהות.' : 'צור מומנטום בעושר, השפעה והשפעה חיצונית.',
    weeks: Array.from({ length: 12 }, (_, i) => ({
      week: i + 1,
      theme_en: `${phases[Math.floor(i / 4)].charAt(0).toUpperCase() + phases[Math.floor(i / 4)].slice(1)} Phase — Week ${i + 1}`,
      theme_he: `שלב ${phases[Math.floor(i / 4)] === 'foundation' ? 'יסודות' : phases[Math.floor(i / 4)] === 'building' ? 'בנייה' : 'אינטגרציה'} — שבוע ${i + 1}`,
      intensity: intensities[i],
      pillar_focus: actions.slice(0, 3 + (i % 3)).map(a => a.pillar),
      goals_en: [`Week ${i + 1} milestone — progressive overload`],
      goals_he: [`אבן דרך שבוע ${i + 1} — עומס מתקדם`],
      daily_actions: actions.slice(0, 5 + Math.min(4, Math.floor(i / 3))),
    })),
  };
}
