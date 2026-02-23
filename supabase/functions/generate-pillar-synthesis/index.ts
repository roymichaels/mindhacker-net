import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { type SummaryData, type PlanData, getDefaultSummaryAndPlan } from '../_shared/launchpad-defaults.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYNTHESIS_SYSTEM_PROMPT = `You are MindOS — a cognitive operating system performing a COMPREHENSIVE LIFE SYNTHESIS.
Unlike the initial onboarding which used basic self-report, you now have DEEP DIAGNOSTIC DATA from all 11 life domains.
This data includes objective assessments, performance benchmarks, and clinical-grade diagnostics.

Your job: Synthesize ALL domain data into a NEW, vastly superior 90-day transformation plan that replaces the original onboarding analysis.

DOMAIN DATA YOU WILL RECEIVE:
- Core Hub (6 pillars): Presence (image/aesthetics), Power (strength benchmarks), Vitality (sleep/nutrition/recovery), Focus (neural regulation), Combat (martial capability), Expansion (learning/creativity)
- Arena Hub (5 pillars): Wealth (income/career), Influence (leadership/communication), Relationships (social capital), Business (ventures), Projects (goals)

RULES:
- ALL text output in Hebrew except English title/translation versions
- This is a REPLACEMENT analysis — it should be MORE PRECISE than the initial onboarding because you have real assessment data
- Cross-reference domains: e.g., poor sleep (vitality) limits strength gains (power) and focus capacity
- Identify the TOP 3 leverage points across all domains
- Generate identity elements that reflect the WHOLE person, not just one domain
- The 90-day plan should integrate insights from ALL domains into a cohesive strategy
- Be clinical, data-driven, and actionable

Respond with valid JSON:
{
  "summary": {
    "consciousness_analysis": {
      "current_state": "3-4 paragraphs in Hebrew — comprehensive state analysis based on ALL domain data",
      "dominant_patterns": ["pattern1", "pattern2", "pattern3"],
      "blind_spots": ["spot1", "spot2"],
      "strengths": ["s1", "s2", "s3", "s4"],
      "growth_edges": ["edge1", "edge2", "edge3"]
    },
    "life_direction": {
      "core_aspiration": "synthesized from all domain aspirations",
      "clarity_score": 85,
      "vision_summary": "3-4 sentences — holistic vision derived from domain data"
    },
    "identity_profile": {
      "dominant_traits": ["t1", "t2", "t3", "t4"],
      "suggested_ego_state": "warrior|guardian|creator|seeker|sage",
      "values_hierarchy": ["v1", "v2", "v3", "v4", "v5"],
      "identity_title": {"title": "Hebrew 2-4 words — reflecting whole-person identity", "title_en": "English 2-4 words", "icon": "emoji"}
    },
    "behavioral_insights": {
      "habits_to_transform": ["h1", "h2", "h3"],
      "habits_to_cultivate": ["h1", "h2", "h3", "h4"],
      "resistance_patterns": ["p1", "p2"],
      "execution_pattern_analysis": "3 sentences analyzing cross-domain execution patterns"
    },
    "cross_domain_insights": {
      "leverage_points": ["top leverage 1", "top leverage 2", "top leverage 3"],
      "bottlenecks": ["bottleneck 1", "bottleneck 2"],
      "synergies": ["synergy between domain X and Y", "synergy 2"]
    },
    "transformation_potential": {
      "readiness_score": 80,
      "primary_focus": "main area",
      "secondary_focus": "secondary area"
    }
  },
  "plan": {
    "title": "Hebrew plan title",
    "months": [
      {
        "number": 1,
        "title": "Month 1 title in Hebrew",
        "title_he": "Hebrew title",
        "focus": "Month 1 focus area in Hebrew",
        "focus_en": "Month 1 focus area in English",
        "milestone": "Key milestone",
        "weeks": [
          {
            "number": 1,
            "title": "Week title in Hebrew",
            "title_en": "Week title in English",
            "description": "Week description in Hebrew",
            "description_en": "Week description in English",
            "tasks": ["task1 in Hebrew", "task2 in Hebrew", "task3 in Hebrew", "task4 in Hebrew"],
            "tasks_en": ["task1 in English", "task2 in English", "task3 in English", "task4 in English"],
            "goal": "Weekly goal in Hebrew",
            "goal_en": "Weekly goal in English",
            "challenge": "Weekly challenge in Hebrew",
            "hypnosis_recommendation": "Specific hypnosis focus"
          }
        ]
      }
    ]
  },
  "scores": {
    "consciousness": 75,
    "readiness": 80,
    "clarity": 85
  }
}

CRITICAL LANGUAGE RULE:
- "title", "description", "tasks", "goal", "challenge", "focus" fields MUST be in HEBREW.
- "title_en", "description_en", "tasks_en", "goal_en", "focus_en" fields MUST be in ENGLISH.
- NEVER put English in Hebrew fields. NEVER put Hebrew in English fields.
- Both versions must convey the same meaning.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log(`[pillar-synthesis] Starting for user: ${userId}`);

    // 1. Gather ALL domain data
    const { data: domains } = await supabase
      .from('life_domains')
      .select('*')
      .eq('user_id', userId);

    if (!domains || domains.length < 9) {
      console.log(`[pillar-synthesis] Only ${domains?.length ?? 0} domains found`);
    }

    // 2. Gather existing launchpad data for context
    const { data: launchpad } = await supabase
      .from('launchpad_progress')
      .select('step_1_intention, step_2_profile_data, step_3_lifestyle_data')
      .eq('user_id', userId)
      .single();

    // 2b. Gather Aurora conversation memory for richer context
    const { data: conversationMemory } = await supabase
      .from('aurora_conversation_memory')
      .select('summary, key_topics, emotional_state, action_items')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // 2c. Gather recent messages for behavioral context
    const { data: recentConversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('participant_1', userId)
      .eq('type', 'ai')
      .order('last_message_at', { ascending: false })
      .limit(5);

    let recentMessages: any[] = [];
    if (recentConversations?.length) {
      const convIds = recentConversations.map(c => c.id);
      const { data: msgs } = await supabase
        .from('messages')
        .select('content, sender_type, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false })
        .limit(50);
      recentMessages = msgs || [];
    }

    // 3. Build comprehensive prompt
    const prompt = buildSynthesisPrompt(domains || [], launchpad, conversationMemory || [], recentMessages);

    // 4. Call AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[pillar-synthesis] LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let summary: SummaryData;
    let plan: PlanData;
    let scores: { consciousness: number; readiness: number; clarity: number };

    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          max_tokens: 8000,
          messages: [
            { role: 'system', content: SYNTHESIS_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('[pillar-synthesis] AI API error:', response.status);
        throw new Error(`AI API error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in AI response');

      const parsed = JSON.parse(jsonMatch[0]);
      summary = parsed.summary;
      plan = parsed.plan;
      scores = parsed.scores;
    } catch (aiError) {
      clearTimeout(timeoutId);
      console.error('[pillar-synthesis] AI error:', aiError);
      // Use defaults as fallback
      const defaults = getDefaultSummaryAndPlan({} as any);
      summary = defaults.summary;
      plan = defaults.plan;
      scores = defaults.scores;
    }

    console.log('[pillar-synthesis] AI analysis complete, saving to DB...');

    // 5. Save new summary
    const { data: summaryRecord, error: summaryError } = await supabase
      .from('launchpad_summaries')
      .upsert({
        user_id: userId,
        summary_data: summary,
        consciousness_score: scores.consciousness,
        transformation_readiness: scores.readiness,
        clarity_score: scores.clarity,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (summaryError) throw summaryError;

    // 6. Delete old plans, milestones, action items
    const { data: oldPlans } = await supabase.from('life_plans').select('id').eq('user_id', userId);
    const oldPlanIds = (oldPlans || []).map((p: any) => p.id);
    if (oldPlanIds.length > 0) {
      await supabase.from('life_plan_milestones').delete().in('plan_id', oldPlanIds);
      await supabase.from('action_items').delete().eq('user_id', userId).eq('source', 'plan');
      await supabase.from('action_items').delete().eq('user_id', userId).eq('source', 'aurora');
      await supabase.from('life_plans').delete().in('id', oldPlanIds);
    }

    // 7. Create new life plan
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);

    const { data: planRecord, error: planError } = await supabase
      .from('life_plans')
      .insert({
        user_id: userId,
        summary_id: summaryRecord.id,
        duration_months: 3,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        plan_data: plan,
        status: 'active',
      })
      .select()
      .single();

    if (planError) throw planError;

    // 8. Create milestones
    const milestones = [];
    for (const month of plan.months || []) {
      for (const week of month.weeks || []) {
        milestones.push({
          plan_id: planRecord.id,
          week_number: week.number,
          month_number: month.number,
          title: week.title,
          title_en: week.title_en || week.title,
          description: week.description,
          description_en: week.description_en || week.description,
          focus_area: month.focus,
          focus_area_en: month.focus_en || month.focus,
          tasks: week.tasks,
          tasks_en: week.tasks_en || week.tasks,
          goal: week.goal,
          goal_en: week.goal_en || week.goal,
          challenge: week.challenge,
          hypnosis_recommendation: week.hypnosis_recommendation,
          xp_reward: 50,
          tokens_reward: 5,
        });
      }
    }

    if (milestones.length > 0) {
      await supabase.from('life_plan_milestones').insert(milestones);
    }

    // 9. Replace identity elements
    await supabase.from('aurora_identity_elements').delete().eq('user_id', userId);

    const identityInserts: any[] = [];

    // Traits
    for (const trait of summary.identity_profile?.dominant_traits || []) {
      identityInserts.push({ user_id: userId, element_type: 'character_trait', content: trait, metadata: { source: 'pillar_synthesis' } });
    }
    // Values
    for (const value of summary.identity_profile?.values_hierarchy || []) {
      identityInserts.push({ user_id: userId, element_type: 'value', content: value, metadata: { source: 'pillar_synthesis' } });
    }
    // Identity title
    if (summary.identity_profile?.identity_title) {
      identityInserts.push({
        user_id: userId, element_type: 'identity_title',
        content: summary.identity_profile.identity_title.title,
        metadata: { source: 'pillar_synthesis', title_en: summary.identity_profile.identity_title.title_en, icon: summary.identity_profile.identity_title.icon || '🎯' },
      });
    }
    // Principles from habits
    for (const habit of summary.behavioral_insights?.habits_to_cultivate || []) {
      identityInserts.push({ user_id: userId, element_type: 'principle', content: habit, metadata: { source: 'pillar_synthesis' } });
    }
    // Self-concepts
    const selfConcepts = [
      ...(summary.consciousness_analysis?.strengths || []).slice(0, 2),
      ...(summary.consciousness_analysis?.growth_edges || []).slice(0, 1),
    ];
    for (const concept of selfConcepts) {
      identityInserts.push({ user_id: userId, element_type: 'self_concept', content: concept, metadata: { source: 'pillar_synthesis' } });
    }

    if (identityInserts.length > 0) {
      await supabase.from('aurora_identity_elements').insert(identityInserts);
    }

    // 10. Replace life direction
    await supabase.from('aurora_life_direction').upsert({
      user_id: userId,
      content: summary.life_direction?.core_aspiration || 'חזון חיים מעודכן',
      clarity_score: summary.life_direction?.clarity_score || scores.clarity,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // 11. Replace life visions
    await supabase.from('aurora_life_visions').delete().eq('user_id', userId);
    if (summary.life_direction?.vision_summary) {
      await supabase.from('aurora_life_visions').insert({
        user_id: userId,
        timeframe: '5_year',
        title: summary.transformation_potential?.primary_focus || 'חזון מעודכן',
        description: summary.life_direction.vision_summary,
        focus_areas: ['pillar_synthesis', summary.transformation_potential?.primary_focus, summary.transformation_potential?.secondary_focus].filter(Boolean),
      });
    }

    // 12. Replace commitments
    await supabase.from('aurora_commitments').delete().eq('user_id', userId).eq('status', 'active');
    const topHabits = summary.behavioral_insights?.habits_to_cultivate?.slice(0, 5) || [];
    for (const habit of topHabits) {
      await supabase.from('aurora_commitments').insert({
        user_id: userId, title: habit, description: 'מחויבות מסינתזת פילרים', status: 'active',
      });
    }

    // 13. Update onboarding progress
    await supabase.from('aurora_onboarding_progress').upsert({
      user_id: userId,
      onboarding_complete: true,
      direction_clarity: scores.clarity >= 70 ? 'stable' : 'emerging',
      identity_understanding: scores.consciousness >= 70 ? 'clear' : 'partial',
      energy_patterns_status: scores.readiness >= 70 ? 'mapped' : 'partial',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // 14. Award XP for completing all pillars
    await supabase.rpc('award_unified_xp', { p_user_id: userId, p_amount: 200, p_source: 'pillar_synthesis', p_reason: 'Completed all life domains' });
    await supabase.rpc('award_energy', { p_user_id: userId, p_amount: 50, p_source: 'pillar_synthesis', p_reason: 'Completed all life domains' });

    console.log('[pillar-synthesis] Complete!');

    return new Response(JSON.stringify({
      success: true,
      summary_id: summaryRecord.id,
      plan_id: planRecord.id,
      milestones_count: milestones.length,
      scores,
      cross_domain_insights: (summary as any).cross_domain_insights || null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[pillar-synthesis] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildSynthesisPrompt(domains: any[], launchpad: any, conversationMemory: any[], recentMessages: any[]): string {
  const sections: string[] = [];

  sections.push('# COMPREHENSIVE LIFE DOMAIN SYNTHESIS');
  sections.push('The user has completed assessments in ALL life domains. Below is the full data.\n');

  // Group domains
  const coreDomainIds = ['presence', 'power', 'vitality', 'focus', 'combat', 'expansion', 'consciousness'];
  const arenaDomainIds = ['wealth', 'influence', 'relationships', 'business', 'projects'];

  sections.push('## CORE HUB — Personal Transformation');
  for (const id of coreDomainIds) {
    const domain = domains.find(d => d.domain_id === id);
    if (domain?.domain_config) {
      sections.push(`\n### ${id.toUpperCase()}`);
      sections.push(`Status: ${domain.status}`);
      sections.push(JSON.stringify(domain.domain_config, null, 2));
    }
  }

  sections.push('\n## ARENA HUB — External Impact');
  for (const id of arenaDomainIds) {
    const domain = domains.find(d => d.domain_id === id);
    if (domain?.domain_config) {
      sections.push(`\n### ${id.toUpperCase()}`);
      sections.push(`Status: ${domain.status}`);
      sections.push(JSON.stringify(domain.domain_config, null, 2));
    }
  }

  // Include original onboarding context for continuity
  if (launchpad) {
    sections.push('\n## ORIGINAL ONBOARDING CONTEXT');
    if (launchpad.step_1_intention) {
      sections.push('### Entry Intention');
      sections.push(typeof launchpad.step_1_intention === 'string'
        ? launchpad.step_1_intention
        : JSON.stringify(launchpad.step_1_intention, null, 2));
    }
    if (launchpad.step_2_profile_data) {
      sections.push('### Personal Profile');
      const profile = launchpad.step_2_profile_data as Record<string, any>;
      const keys = ['age_bracket', 'gender', 'wake_time', 'sleep_time', 'activity_level', 'work_type', 'diet_type'];
      for (const k of keys) {
        if (profile[k]) sections.push(`${k}: ${profile[k]}`);
      }
    }
    if (launchpad.step_3_lifestyle_data) {
      sections.push('### Lifestyle Data');
      sections.push(typeof launchpad.step_3_lifestyle_data === 'string'
        ? launchpad.step_3_lifestyle_data
        : JSON.stringify(launchpad.step_3_lifestyle_data, null, 2));
    }
  }

  // Aurora conversation memory — what Aurora remembers about the user
  if (conversationMemory.length > 0) {
    sections.push('\n## AURORA MEMORY — What the AI coach has learned about this user');
    for (const mem of conversationMemory.slice(0, 15)) {
      sections.push(`- Summary: ${mem.summary}`);
      if (mem.emotional_state) sections.push(`  Emotional state: ${mem.emotional_state}`);
      if (mem.key_topics?.length) sections.push(`  Topics: ${mem.key_topics.join(', ')}`);
      if (mem.action_items?.length) sections.push(`  Actions: ${mem.action_items.join(', ')}`);
    }
  }

  // Recent conversation excerpts for behavioral patterns
  if (recentMessages.length > 0) {
    sections.push('\n## RECENT USER MESSAGES — Behavioral patterns');
    const userMsgs = recentMessages.filter(m => m.sender_type === 'user').slice(0, 20);
    for (const msg of userMsgs) {
      const content = msg.content?.substring(0, 200) || '';
      if (content) sections.push(`- ${content}`);
    }
  }

  return sections.join('\n');
}
