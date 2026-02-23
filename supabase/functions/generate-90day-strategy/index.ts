import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

/**
 * generate-90day-strategy
 * 
 * Reads all pillar assessments from life_domains and generates
 * a 90-day strategic plan (Core + Arena) with weekly themes
 * and pillar-specific goals. Uses AI to create personalized plans.
 * 
 * Stores result in life_plans table (one for Core, one for Arena).
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
  language: string,
): string {
  const pillarSummaries = assessments
    .filter(a => a.status === 'configured')
    .map(a => {
      const latest = a.domain_config?.latest_assessment;
      return `- ${a.domain_id}: score=${latest?.overallScore ?? '?'}/100, findings=${JSON.stringify(latest?.findings?.slice(0, 3) ?? [])}, nextStep=${latest?.nextStep ?? '?'}`;
    })
    .join('\n');

  const hubLabel = hub === 'core' ? 'Core (Internal Development)' : 'Arena (External Execution)';
  const pillars = hub === 'core' 
    ? 'Consciousness, Presence/Image, Power, Vitality, Focus, Combat, Expansion'
    : 'Wealth, Influence, Relationships, Business, Projects, Play';

  return `You are Aurora, an elite life transformation AI. Generate a 90-day strategic plan for the ${hubLabel} hub.

PILLAR ASSESSMENTS:
${pillarSummaries || 'No assessments completed yet — use balanced defaults.'}

USER PROFILE:
${JSON.stringify(profileData || {}, null, 2)}

PILLARS IN THIS HUB: ${pillars}

RULES:
1. Create 12 weekly themes (covering 84 days / ~12 weeks).
2. Each week theme must specify which pillars are emphasized and what concrete outcomes to achieve.
3. Use progressive intensity: weeks 1-4 foundation, 5-8 building, 9-12 integration.
4. Every pillar must appear at least once per 3 weeks.
5. Be specific. Not "improve fitness" but "Build 3x/week strength habit, add 10kg squat".
6. Reference assessment findings to personalize recommendations.

OUTPUT FORMAT (JSON only, no markdown):
{
  "hub": "${hub}",
  "title_en": "...",
  "title_he": "...",
  "vision_en": "One sentence vision for 90 days",
  "vision_he": "...",
  "weeks": [
    {
      "week": 1,
      "theme_en": "Foundation — Build daily anchors",
      "theme_he": "...",
      "intensity": "medium",
      "pillar_focus": ["vitality", "focus", "consciousness"],
      "goals_en": ["Establish morning routine", "30-min deep work daily"],
      "goals_he": ["..."],
      "daily_actions": [
        { "pillar": "vitality", "action_en": "Morning Sunlight Walk — 10 min", "action_he": "הליכת אור בוקר — 10 דקות", "duration_min": 10, "block_type": "body" },
        { "pillar": "focus", "action_en": "Deep Work Block", "action_he": "בלוק עבודה עמוקה", "duration_min": 45, "block_type": "mind" },
        { "pillar": "combat", "action_en": "Combat Workout — Shadowboxing 3 Rounds", "action_he": "אימון לחימה — 3 סיבובי צללים", "duration_min": 20, "block_type": "body" },
        { "pillar": "consciousness", "action_en": "Evening Reflection — 5 min", "action_he": "רפלקציה ערבית — 5 דקות", "duration_min": 5, "block_type": "mind" }
      ]
    }
  ]
}

Generate all 12 weeks. Each week should have 5-9 daily_actions that rotate across the hub's pillars.
block_type must be one of: body, mind, arena.
For Core hub: body=Power/Vitality/Combat, mind=Focus/Consciousness/Expansion, arena=Presence
For Arena hub: arena=all Arena pillars

Language: Provide both English and Hebrew for all text fields.`;
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

    const targetHub = hub || 'both'; // 'core', 'arena', or 'both'

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

    // Fetch assessments + profile
    const [domainsRes, profileRes, launchpadRes] = await Promise.all([
      supabase.from('life_domains').select('domain_id, domain_config, status').eq('user_id', user_id),
      supabase.from('profiles').select('full_name, display_name, level, experience').eq('id', user_id).single(),
      supabase.from('launchpad_progress').select('step_1_intention, step_2_profile_data, step_3_lifestyle_data').eq('user_id', user_id).single(),
    ]);

    const allDomains = (domainsRes.data || []) as PillarAssessment[];
    const profile = profileRes.data || {};
    const launchpad = launchpadRes.data || {};

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

    const hubsToGenerate = targetHub === 'both' ? ['core', 'arena'] as const : [targetHub as 'core' | 'arena'];
    const results: any[] = [];

    for (const h of hubsToGenerate) {
      const pillarIds = h === 'core' ? CORE_PILLAR_IDS : ARENA_PILLAR_IDS;
      const hubAssessments = allDomains.filter(d => pillarIds.includes(d.domain_id));

      const prompt = buildStrategyPrompt(h, hubAssessments, profileContext, 'en');

      // Call OpenAI API
      const openaiKey = Deno.env.get("OPENAI_API_KEY");
      if (!openaiKey) {
        console.error("OPENAI_API_KEY not configured");
        strategyData = buildFallbackStrategy(h);
        // Skip AI call, use fallback
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
        if (!planError && plan) results.push({ hub: h, plan_id: plan.id, strategy: strategyData });
        continue;
      }

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are Aurora, an elite transformation AI. Output ONLY valid JSON, no markdown fences." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 8000,
        }),
      });

      let strategyData: any;
      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        const raw = aiResult.choices?.[0]?.message?.content || '';
        // Parse JSON from response (strip markdown fences if present)
        const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        try {
          strategyData = JSON.parse(jsonStr);
        } catch {
          console.error("Failed to parse AI response:", jsonStr.slice(0, 500));
          strategyData = buildFallbackStrategy(h);
        }
      } else {
        console.error("AI call failed:", aiResponse.status);
        strategyData = buildFallbackStrategy(h);
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

// Fallback strategy when AI fails
function buildFallbackStrategy(hub: 'core' | 'arena') {
  const coreActions = [
    { pillar: 'vitality', action_en: 'Morning Sunlight Walk — 10 min', action_he: 'הליכת אור בוקר — 10 דקות', duration_min: 10, block_type: 'body' },
    { pillar: 'power', action_en: 'Strength Training — Upper Body', action_he: 'אימון כוח — פלג גוף עליון', duration_min: 40, block_type: 'body' },
    { pillar: 'combat', action_en: 'Combat Workout — Shadowboxing 3 Rounds', action_he: 'אימון לחימה — 3 סיבובי צללים', duration_min: 20, block_type: 'body' },
    { pillar: 'focus', action_en: 'Deep Work Block — 45 min', action_he: 'בלוק עבודה עמוקה — 45 דקות', duration_min: 45, block_type: 'mind' },
    { pillar: 'consciousness', action_en: 'Meditation & Self-Awareness', action_he: 'מדיטציה ומודעות עצמית', duration_min: 15, block_type: 'mind' },
    { pillar: 'expansion', action_en: 'Learning Block — Read / Study', action_he: 'בלוק למידה — קריאה / לימוד', duration_min: 30, block_type: 'mind' },
    { pillar: 'presence', action_en: 'Posture & Style Check', action_he: 'בדיקת יציבה וסגנון', duration_min: 10, block_type: 'mind' },
    { pillar: 'vitality', action_en: 'Evening Shutdown Protocol', action_he: 'פרוטוקול כיבוי ערב', duration_min: 15, block_type: 'body' },
  ];

  const arenaActions = [
    { pillar: 'wealth', action_en: 'Revenue Action — Invoice / Outreach', action_he: 'פעולת הכנסה — חשבונית / פנייה', duration_min: 25, block_type: 'arena' },
    { pillar: 'business', action_en: 'Business Strategy Step', action_he: 'צעד אסטרטגיה עסקית', duration_min: 30, block_type: 'arena' },
    { pillar: 'projects', action_en: 'Project Execution — Next Task', action_he: 'ביצוע פרויקט — משימה הבאה', duration_min: 25, block_type: 'arena' },
    { pillar: 'influence', action_en: 'Content Creation / Outreach', action_he: 'יצירת תוכן / הפצה', duration_min: 20, block_type: 'arena' },
    { pillar: 'relationships', action_en: 'Meaningful Connection — Reach Out', action_he: 'קשר משמעותי — יצירת קשר', duration_min: 15, block_type: 'arena' },
    { pillar: 'play', action_en: 'Play Session — Movement / Adventure', action_he: 'זמן משחק — תנועה / הרפתקה', duration_min: 30, block_type: 'arena' },
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
