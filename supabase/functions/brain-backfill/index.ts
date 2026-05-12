import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Counts = { inserted: number; updated: number; skipped: number };
const newCounts = (): Counts => ({ inserted: 0, updated: 0, skipped: 0 });

type SourceErrors = Record<string, string[]>;
type GroupCounts = {
  onboarding: number;
  assessments: number;
  journals: number;
  actions: number;
  profile: number;
  plans: number;
};

const newGroupCounts = (): GroupCounts => ({
  onboarding: 0,
  assessments: 0,
  journals: 0,
  actions: 0,
  profile: 0,
  plans: 0,
});

function safeObject(value: unknown): Record<string, any> {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, any>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return {};
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') return [value.trim()].filter(Boolean);
  return [];
}

function classifyAssessmentNode(text: string, id = ''): 'strength' | 'blocker' {
  const source = `${id} ${text}`.toLowerCase();
  const positive = /(high_|strong|clarity|clear|discipline|creative|flow|integrated|stable|support|authentic|resilience|good|healthy|awareness|value creation|leadership|connection depth)/.test(source);
  const negative = /(lack|low|no |not |clutter|chaos|bottleneck|block|debt|conflict|isolation|avoid|fear|risk|problem|delayed|burn|stagn|scarcity|difficulty|limited|undermine|extreme|prone)/.test(source);
  return positive && !negative ? 'strength' : 'blocker';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'unauthorized' }, 401);
    const userId = userData.user.id;

    const bySource: Record<string, Counts> = {};
    const errors: SourceErrors = {};
    const detailed_source_counts: Record<string, number> = {};
    const source_counts = newGroupCounts();
    const totals = newCounts();

    const upsert = async (
      source: string,
      type: string,
      content: string,
      opts: {
        layer?: string;
        pillar?: string | null;
        sourceRef?: Record<string, unknown>;
        deltaConf?: number;
        deltaStrength?: number;
        emotionalCharge?: number | null;
        summary?: string | null;
      } = {},
    ) => {
      const c = (bySource[source] ??= newCounts());
      const text = (content ?? '').trim();
      if (!text || text.length < 2) {
        c.skipped++; totals.skipped++; return;
      }
      const { data, error } = await supabase.rpc('brain_upsert_node', {
        p_user_id: userId,
        p_type: type,
        p_content: text.slice(0, 500),
        p_layer: opts.layer ?? null,
        p_pillar: opts.pillar ?? null,
        p_source_kind: source,
        p_source_ref: opts.sourceRef ?? {},
        p_delta_conf: opts.deltaConf ?? 5,
        p_delta_strength: opts.deltaStrength ?? 1,
        p_emotional_charge: opts.emotionalCharge ?? null,
        p_summary: opts.summary ?? null,
      });
      if (error) {
        c.skipped++; totals.skipped++;
        const list = (errors[source] ??= []);
        if (list.length < 5) list.push(error.message ?? String(error));
        console.warn(`[brain-backfill] upsert failed source=${source} type=${type}:`, error.message ?? error);
        return;
      }
      const created = (data as any)?.created;
      if (created) { c.inserted++; totals.inserted++; }
      else { c.updated++; totals.updated++; }
    };

    const [
      profileRes,
      identityRes,
      actionsRes,
      patternsRes,
      pillarsRes,
      journalsRes,
      onboardingRes,
      launchpadRes,
      summaryRes,
      plansRes,
      scansRes,
      scanEventsRes,
      domainsRes,
      questionnaireRes,
      orbRes,
      avatarRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id, full_name, bio, active_ego_state, selected_pillars, aion_name').eq('id', userId).maybeSingle(),
      supabase.from('aurora_identity_elements').select('id, element_type, content, metadata').eq('user_id', userId).limit(1000),
      supabase.from('action_items').select('id, title, description, pillar, status, recurrence_rule').eq('user_id', userId).limit(500),
      supabase.from('aurora_behavioral_patterns').select('id, pattern_type, description').eq('user_id', userId).limit(500),
      supabase.from('pillar_confidence').select('pillar_id, confidence, signal_count').eq('user_id', userId),
      supabase.from('journal_entries').select('id, content, journal_type, mood, tags, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(200),
      supabase.from('aurora_onboarding_progress').select('direction_clarity, identity_understanding, energy_patterns_status, energy_level, onboarding_complete').eq('user_id', userId).maybeSingle(),
      supabase.from('launchpad_progress').select('id, step_1_intention, step_2_profile_data, step_3_lifestyle_data, step_5_focus_areas_selected, step_6_actions, step_6_anchor_habit, step_10_final_notes, launchpad_complete').eq('user_id', userId).maybeSingle(),
      supabase.from('launchpad_summaries').select('id, summary_data, clarity_score, consciousness_score, transformation_readiness').eq('user_id', userId).order('generated_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('life_plans').select('id, plan_data, status, start_date, progress_percentage').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('presence_scans').select('id, derived_metrics, scores, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabase.from('presence_scan_events').select('id, scan_id, event_type, energy_cost, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
      supabase.from('life_domains').select('id, domain_id, domain_config, status').eq('user_id', userId).limit(1000),
      supabase.from('questionnaire_completions').select('id, questionnaire_type, summary, key_insights, blindspots, goals_suggested, habits_suggested, next_actions, analysis').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
      supabase.from('orb_profiles').select('id, primary_color, accent_color, computed_from').eq('user_id', userId).maybeSingle(),
      supabase.from('avatar_customizations').select('id, customization_data').eq('user_id', userId).maybeSingle(),
    ]);

    const plans = plansRes.data ?? [];
    const planIds = plans.map((p) => p.id);
    const milestonesRes = planIds.length > 0
      ? await supabase.from('life_plan_milestones').select('id, plan_id, title, goal, focus_area, is_completed, week_number').in('plan_id', planIds).limit(300)
      : { data: [], error: null };

    detailed_source_counts.profiles = profileRes.data ? 1 : 0;
    detailed_source_counts.aurora_identity_elements = identityRes.data?.length ?? 0;
    detailed_source_counts.action_items = actionsRes.data?.length ?? 0;
    detailed_source_counts.aurora_behavioral_patterns = patternsRes.data?.length ?? 0;
    detailed_source_counts.pillar_confidence = pillarsRes.data?.length ?? 0;
    detailed_source_counts.journal_entries = journalsRes.data?.length ?? 0;
    detailed_source_counts.aurora_onboarding_progress = onboardingRes.data ? 1 : 0;
    detailed_source_counts.launchpad_progress = launchpadRes.data ? 1 : 0;
    detailed_source_counts.launchpad_summaries = summaryRes.data ? 1 : 0;
    detailed_source_counts.life_plans = plans.length;
    detailed_source_counts.life_plan_milestones = milestonesRes.data?.length ?? 0;
    detailed_source_counts.presence_scans = scansRes.data?.length ?? 0;
    detailed_source_counts.presence_scan_events = scanEventsRes.data?.length ?? 0;
    detailed_source_counts.life_domains = domainsRes.data?.length ?? 0;
    detailed_source_counts.questionnaire_completions = questionnaireRes.data?.length ?? 0;
    detailed_source_counts.orb_profiles = orbRes.data ? 1 : 0;
    detailed_source_counts.avatar_customizations = avatarRes.data ? 1 : 0;

    source_counts.profile = detailed_source_counts.profiles + detailed_source_counts.aurora_identity_elements + detailed_source_counts.aurora_behavioral_patterns + detailed_source_counts.orb_profiles + detailed_source_counts.avatar_customizations;
    source_counts.actions = detailed_source_counts.action_items;
    source_counts.journals = detailed_source_counts.journal_entries;
    source_counts.plans = detailed_source_counts.life_plans + detailed_source_counts.life_plan_milestones;
    source_counts.onboarding = detailed_source_counts.aurora_onboarding_progress + detailed_source_counts.launchpad_progress + detailed_source_counts.launchpad_summaries;
    source_counts.assessments = detailed_source_counts.life_domains + detailed_source_counts.presence_scans + detailed_source_counts.presence_scan_events + detailed_source_counts.questionnaire_completions + detailed_source_counts.pillar_confidence;

    const profile = profileRes.data;
    if (profile) {
      if (profile.full_name) await upsert('profile', 'identity', `My name is ${profile.full_name}`, { layer: 'deep', deltaConf: 40, deltaStrength: 5, sourceRef: { field: 'full_name' } });
      if (profile.bio) await upsert('profile', 'identity', profile.bio, { layer: 'deep', deltaConf: 25, deltaStrength: 3, sourceRef: { field: 'bio' } });
      if (profile.aion_name) await upsert('profile', 'identity', `AION name: ${profile.aion_name}`, { layer: 'deep', deltaConf: 20, sourceRef: { field: 'aion_name' } });
      if (profile.active_ego_state) await upsert('profile', 'identity', `Active ego state: ${profile.active_ego_state}`, { layer: 'pattern', deltaConf: 20, sourceRef: { field: 'active_ego_state' } });
      for (const p of Array.isArray(profile.selected_pillars) ? profile.selected_pillars : []) {
        await upsert('profile', 'goal', `Focus pillar: ${p}`, { layer: 'pattern', pillar: String(p), deltaConf: 25, deltaStrength: 3, sourceRef: { field: 'selected_pillars' } });
      }
    }

    for (const row of identityRes.data ?? []) {
      const t = String(row.element_type || 'identity').toLowerCase();
      const nodeType = t.includes('goal') ? 'goal' : t.includes('value') ? 'value' : t.includes('belief') ? 'belief' : t.includes('habit') ? 'habit' : 'identity';
      await upsert('identity_element', nodeType, String(row.content ?? ''), {
        layer: nodeType === 'goal' || nodeType === 'habit' ? 'pattern' : 'deep',
        pillar: safeObject(row.metadata).pillar ?? null,
        deltaConf: 30,
        deltaStrength: 3,
        sourceRef: { id: row.id, element_type: row.element_type },
      });
    }

    for (const a of actionsRes.data ?? []) {
      const recurring = !!a.recurrence_rule;
      const completed = a.status === 'completed' || a.status === 'done';
      await upsert('action_item', recurring ? 'habit' : 'goal', String(a.title ?? ''), {
        layer: recurring ? 'pattern' : 'surface',
        pillar: a.pillar ?? null,
        deltaConf: recurring ? 30 : completed ? 20 : 10,
        deltaStrength: recurring ? 3 : 1,
        sourceRef: { id: a.id, status: a.status, recurring },
        summary: a.description ?? null,
      });
    }

    for (const p of patternsRes.data ?? []) {
      await upsert('behavioral_pattern', 'pattern', String(p.description ?? p.pattern_type ?? ''), {
        layer: 'pattern', deltaConf: 25, deltaStrength: 3, sourceRef: { id: p.id, pattern_type: p.pattern_type },
      });
    }

    for (const pc of pillarsRes.data ?? []) {
      await upsert('pillar_confidence', 'pillar_marker', `Pillar confidence: ${pc.pillar_id} (${pc.confidence}%)`, {
        layer: 'pattern', pillar: pc.pillar_id, deltaConf: Math.max(5, Math.min(40, Math.round((pc.confidence ?? 0) / 3))), deltaStrength: Math.min(5, Math.max(1, Math.round((pc.signal_count ?? 0) / 3))), sourceRef: { pillar_id: pc.pillar_id },
      });
    }

    for (const j of journalsRes.data ?? []) {
      const text = String(j.content ?? '').slice(0, 280);
      if (!text) continue;
      await upsert('journal_entry', 'memory', text, { layer: 'surface', deltaConf: 10, deltaStrength: 1, sourceRef: { id: j.id, type: j.journal_type, mood: j.mood } });
    }

    const onboarding = onboardingRes.data;
    if (onboarding) {
      if (onboarding.energy_level) await upsert('onboarding', 'pattern', `Baseline energy level: ${onboarding.energy_level}`, { layer: 'pattern', deltaConf: 20, sourceRef: { table: 'aurora_onboarding_progress', field: 'energy_level' } });
      if (onboarding.identity_understanding) await upsert('onboarding', 'identity', `Identity understanding: ${onboarding.identity_understanding}`, { layer: 'deep', deltaConf: 15, sourceRef: { table: 'aurora_onboarding_progress', field: 'identity_understanding' } });
      if (onboarding.direction_clarity) await upsert('onboarding', 'goal', `Direction clarity: ${onboarding.direction_clarity}`, { layer: 'pattern', deltaConf: 15, sourceRef: { table: 'aurora_onboarding_progress', field: 'direction_clarity' } });
      if (onboarding.energy_patterns_status) await upsert('onboarding', 'pattern', `Energy patterns status: ${onboarding.energy_patterns_status}`, { layer: 'pattern', deltaConf: 12, sourceRef: { table: 'aurora_onboarding_progress', field: 'energy_patterns_status' } });
    }

    const launchpad = launchpadRes.data;
    if (launchpad) {
      const intention = safeObject(launchpad.step_1_intention);
      for (const target of stringList(intention.target_90_days)) {
        await upsert('onboarding', 'goal', `90-day target: ${target}`, { layer: 'surface', sourceRef: { table: 'launchpad_progress', field: 'step_1_intention' } });
      }
      for (const constraint of stringList(intention.non_negotiable_constraint)) {
        await upsert('onboarding', 'belief', `Constraint: ${constraint}`, { layer: 'deep', sourceRef: { table: 'launchpad_progress', field: 'step_1_intention' } });
      }
      if (intention.selected_pillar) {
        await upsert('onboarding', 'goal', `Chosen pillar: ${intention.selected_pillar}`, { layer: 'pattern', pillar: String(intention.selected_pillar), sourceRef: { table: 'launchpad_progress', field: 'step_1_intention' } });
      }

      const profileData = safeObject(launchpad.step_2_profile_data);
      for (const trait of [...stringList(profileData.traits), ...stringList(profileData.selectedTraits)].slice(0, 8)) {
        await upsert('onboarding', 'identity', `Trait: ${trait}`, { layer: 'deep', sourceRef: { table: 'launchpad_progress', field: 'step_2_profile_data' } });
      }
      for (const workType of stringList(profileData.work_type).slice(0, 4)) {
        await upsert('onboarding', 'identity', `Work identity: ${workType}`, { layer: 'deep', sourceRef: { table: 'launchpad_progress', field: 'step_2_profile_data' } });
      }
      if (profileData.energy_peak_time) await upsert('onboarding', 'pattern', `Energy peak time: ${profileData.energy_peak_time}`, { layer: 'pattern', sourceRef: { table: 'launchpad_progress', field: 'step_2_profile_data' } });
      if (profileData.sleep_time && profileData.wake_time) await upsert('onboarding', 'pattern', `Sleep window: ${profileData.sleep_time} → ${profileData.wake_time}`, { layer: 'pattern', sourceRef: { table: 'launchpad_progress', field: 'step_2_profile_data' } });

      const lifestyleData = safeObject(launchpad.step_3_lifestyle_data);
      for (const [key, value] of Object.entries(lifestyleData).slice(0, 5)) {
        const label = Array.isArray(value) ? stringList(value).join(', ') : String(value ?? '').trim();
        if (label) await upsert('onboarding', 'pattern', `${key.replace(/_/g, ' ')}: ${label}`, { layer: 'pattern', sourceRef: { table: 'launchpad_progress', field: 'step_3_lifestyle_data', key } });
      }

      for (const area of stringList(launchpad.step_5_focus_areas_selected)) {
        await upsert('onboarding', 'goal', `Focus area: ${area}`, { layer: 'surface', sourceRef: { table: 'launchpad_progress', field: 'step_5_focus_areas_selected' } });
      }

      const actionPayload = safeObject(launchpad.step_6_actions);
      for (const habit of stringList(actionPayload.habits_to_build)) {
        await upsert('onboarding', 'habit', `Build habit: ${habit}`, { layer: 'surface', sourceRef: { table: 'launchpad_progress', field: 'step_6_actions' } });
      }
      for (const blocker of stringList(actionPayload.habits_to_quit)) {
        await upsert('onboarding', 'blocker', `Quit pattern: ${blocker}`, { layer: 'pattern', sourceRef: { table: 'launchpad_progress', field: 'step_6_actions' } });
      }
      if (actionPayload.career_goal) await upsert('onboarding', 'goal', `Career goal: ${actionPayload.career_goal}`, { layer: 'surface', sourceRef: { table: 'launchpad_progress', field: 'step_6_actions' } });
      if (launchpad.step_6_anchor_habit) await upsert('onboarding', 'habit', `Anchor habit: ${launchpad.step_6_anchor_habit}`, { layer: 'pattern', deltaStrength: 2, sourceRef: { table: 'launchpad_progress', field: 'step_6_anchor_habit' } });
      if (launchpad.step_10_final_notes) await upsert('onboarding', 'insight', String(launchpad.step_10_final_notes), { layer: 'deep', sourceRef: { table: 'launchpad_progress', field: 'step_10_final_notes' } });
      if (launchpad.launchpad_complete) await upsert('onboarding', 'identity', 'Completed launchpad onboarding', { layer: 'deep', deltaConf: 20, sourceRef: { table: 'launchpad_progress', field: 'launchpad_complete' } });
    }

    const summary = summaryRes.data;
    if (summary) {
      const summaryData = safeObject(summary.summary_data);
      const identityProfile = safeObject(summaryData.identity_profile);
      const identityTitle = safeObject(identityProfile.identity_title);
      if (identityTitle.title) await upsert('onboarding', 'identity', `Identity title: ${identityTitle.title}`, { layer: 'deep', deltaConf: 25, sourceRef: { table: 'launchpad_summaries', field: 'summary_data.identity_profile.identity_title' } });
      for (const trait of stringList(identityProfile.dominant_traits).slice(0, 8)) {
        await upsert('onboarding', 'identity', `Dominant trait: ${trait}`, { layer: 'deep', sourceRef: { table: 'launchpad_summaries', field: 'summary_data.identity_profile.dominant_traits' } });
      }
      for (const value of stringList(identityProfile.values_hierarchy).slice(0, 5)) {
        await upsert('onboarding', 'value', value, { layer: 'deep', sourceRef: { table: 'launchpad_summaries', field: 'summary_data.identity_profile.values_hierarchy' } });
      }
      const lifeDirection = safeObject(summaryData.life_direction);
      if (lifeDirection.core_aspiration) await upsert('onboarding', 'goal', String(lifeDirection.core_aspiration), { layer: 'deep', deltaStrength: 2, sourceRef: { table: 'launchpad_summaries', field: 'summary_data.life_direction.core_aspiration' } });
      if (lifeDirection.vision_summary) await upsert('onboarding', 'belief', String(lifeDirection.vision_summary), { layer: 'deep', sourceRef: { table: 'launchpad_summaries', field: 'summary_data.life_direction.vision_summary' } });
      const behavioral = safeObject(summaryData.behavioral_insights);
      for (const habit of stringList(behavioral.habits_to_cultivate).slice(0, 6)) {
        await upsert('onboarding', 'habit', `Cultivate: ${habit}`, { layer: 'pattern', sourceRef: { table: 'launchpad_summaries', field: 'summary_data.behavioral_insights.habits_to_cultivate' } });
      }
      for (const blocker of [...stringList(behavioral.habits_to_transform), ...stringList(behavioral.resistance_patterns)].slice(0, 8)) {
        await upsert('onboarding', 'blocker', blocker, { layer: 'pattern', sourceRef: { table: 'launchpad_summaries', field: 'summary_data.behavioral_insights' } });
      }
      if (summary.clarity_score != null) await upsert('onboarding', 'insight', `Clarity score: ${summary.clarity_score}`, { layer: 'pattern', sourceRef: { table: 'launchpad_summaries', field: 'clarity_score' } });
      if (summary.consciousness_score != null) await upsert('onboarding', 'insight', `Consciousness score: ${summary.consciousness_score}`, { layer: 'pattern', sourceRef: { table: 'launchpad_summaries', field: 'consciousness_score' } });
      if (summary.transformation_readiness != null) await upsert('onboarding', 'insight', `Transformation readiness: ${summary.transformation_readiness}`, { layer: 'pattern', sourceRef: { table: 'launchpad_summaries', field: 'transformation_readiness' } });
    }

    for (const row of domainsRes.data ?? []) {
      const cfg = safeObject(row.domain_config);
      const assessment = safeObject(cfg.latest_assessment ?? cfg.latest);
      const findings = Array.isArray(assessment.findings) ? assessment.findings : [];
      for (const finding of findings.slice(0, 8)) {
        const text = String(finding?.text_en ?? finding?.text_he ?? '').trim();
        if (!text) continue;
        await upsert('assessment', classifyAssessmentNode(text, String(finding?.id ?? '')), text, {
          layer: 'pattern', pillar: row.domain_id, deltaConf: 18, deltaStrength: 2,
          sourceRef: { table: 'life_domains', domain_id: row.domain_id, finding_id: finding?.id ?? null },
        });
      }
      const subscores = safeObject(assessment.subscores);
      for (const [key, value] of Object.entries(subscores)) {
        const score = Number(value);
        if (!Number.isFinite(score)) continue;
        const type = score >= 70 ? 'strength' : score <= 45 ? 'blocker' : 'pattern';
        await upsert('assessment', type, `${row.domain_id} ${key.replace(/_/g, ' ')}: ${score}`, {
          layer: 'pattern', pillar: row.domain_id, deltaConf: 10, sourceRef: { table: 'life_domains', domain_id: row.domain_id, score_key: key },
        });
      }
      const mirror = safeObject(assessment.mirror_statement);
      const mirrorText = String(mirror.en ?? mirror.he ?? '').trim();
      if (mirrorText) await upsert('assessment', 'belief', mirrorText, { layer: 'deep', pillar: row.domain_id, deltaConf: 15, sourceRef: { table: 'life_domains', domain_id: row.domain_id, field: 'mirror_statement' } });
      const nextStep = safeObject(assessment.one_next_step);
      const nextStepText = String(nextStep.en ?? nextStep.he ?? '').trim();
      if (nextStepText) await upsert('assessment', 'goal', nextStepText, { layer: 'surface', pillar: row.domain_id, sourceRef: { table: 'life_domains', domain_id: row.domain_id, field: 'one_next_step' } });
    }

    for (const q of questionnaireRes.data ?? []) {
      if (q.summary) await upsert('assessment', 'insight', String(q.summary), { layer: 'deep', sourceRef: { table: 'questionnaire_completions', id: q.id, questionnaire_type: q.questionnaire_type } });
      for (const item of stringList(q.key_insights).slice(0, 6)) await upsert('assessment', 'insight', item, { layer: 'deep', sourceRef: { table: 'questionnaire_completions', id: q.id, field: 'key_insights' } });
      for (const item of stringList(q.blindspots).slice(0, 6)) await upsert('assessment', 'blocker', item, { layer: 'pattern', sourceRef: { table: 'questionnaire_completions', id: q.id, field: 'blindspots' } });
      for (const item of [...stringList(q.goals_suggested), ...stringList(q.next_actions)].slice(0, 6)) await upsert('assessment', 'goal', item, { layer: 'surface', sourceRef: { table: 'questionnaire_completions', id: q.id, field: 'actions' } });
      for (const item of stringList(q.habits_suggested).slice(0, 6)) await upsert('assessment', 'habit', item, { layer: 'pattern', sourceRef: { table: 'questionnaire_completions', id: q.id, field: 'habits_suggested' } });
    }

    for (const p of plans) {
      const pd = safeObject(p.plan_data);
      const vision = String(pd.vision ?? pd.summary ?? '').slice(0, 280);
      if (vision) await upsert('life_plan', 'goal', vision, { layer: 'pattern', deltaConf: 25, deltaStrength: 3, sourceRef: { id: p.id, status: p.status } });
      for (const fp of stringList(pd.focus_pillars)) {
        await upsert('life_plan', 'goal', `Plan focus: ${fp}`, { layer: 'pattern', pillar: fp, deltaConf: 20, sourceRef: { id: p.id, field: 'focus_pillars' } });
      }
    }

    for (const m of milestonesRes.data ?? []) {
      const title = String(m.title ?? '').trim();
      if (!title) continue;
      await upsert('milestone', m.is_completed ? 'breakthrough' : 'goal', title, {
        layer: m.is_completed ? 'pattern' : 'surface', pillar: m.focus_area ?? null, deltaConf: m.is_completed ? 20 : 10, deltaStrength: m.is_completed ? 2 : 1, sourceRef: { id: m.id, week: m.week_number, completed: m.is_completed }, summary: m.goal ?? null,
      });
    }

    for (const s of scansRes.data ?? []) {
      const scores = safeObject(s.scores);
      const ordered = Object.entries(scores).filter(([, v]) => typeof v === 'number').sort((a, b) => Number(b[1]) - Number(a[1]));
      const top = ordered[0];
      const weak = ordered[ordered.length - 1];
      if (top) await upsert('presence', 'strength', `Presence strength: ${top[0]} (${Math.round(Number(top[1]))})`, { layer: 'pattern', pillar: 'presence', deltaConf: 15, sourceRef: { id: s.id, key: top[0] } });
      if (weak) await upsert('presence', 'blocker', `Presence blocker: ${weak[0]} (${Math.round(Number(weak[1]))})`, { layer: 'pattern', pillar: 'presence', deltaConf: 12, sourceRef: { id: s.id, key: weak[0], weak: true } });
    }

    for (const event of scanEventsRes.data ?? []) {
      await upsert('presence', 'pattern', `Presence event: ${event.event_type}`, { layer: 'surface', pillar: 'presence', sourceRef: { table: 'presence_scan_events', id: event.id, scan_id: event.scan_id } });
    }

    if (orbRes.data) {
      const computed = safeObject(orbRes.data.computed_from);
      if (computed.egoState) await upsert('profile', 'identity', `Orb ego state: ${computed.egoState}`, { layer: 'deep', sourceRef: { table: 'orb_profiles', id: orbRes.data.id, field: 'computed_from.egoState' } });
      const visualDNA = safeObject(computed.visualDNA);
      if (visualDNA.patternType) await upsert('profile', 'identity', `Visual pattern: ${visualDNA.patternType}`, { layer: 'deep', sourceRef: { table: 'orb_profiles', id: orbRes.data.id, field: 'computed_from.visualDNA.patternType' } });
      if (visualDNA.materialType) await upsert('profile', 'identity', `Visual material: ${visualDNA.materialType}`, { layer: 'deep', sourceRef: { table: 'orb_profiles', id: orbRes.data.id, field: 'computed_from.visualDNA.materialType' } });
    }

    if (avatarRes.data) {
      const customization = safeObject(avatarRes.data.customization_data);
      const customizedParts = Object.values(customization).filter((part: any) => part && typeof part === 'object' && (part.assetId || part.color)).length;
      if (customizedParts > 0) {
        await upsert('profile', 'identity', `Avatar customized across ${customizedParts} parts`, { layer: 'deep', sourceRef: { table: 'avatar_customizations', id: avatarRes.data.id } });
      }
    }

    const totalFound = Object.values(source_counts).reduce((sum, count) => sum + count, 0);
    const message = totalFound === 0
      ? 'No onboarding or assessment data found for this user.'
      : `Found old data: ${source_counts.onboarding} onboarding, ${source_counts.assessments} assessments, ${source_counts.journals} journals, ${source_counts.actions} actions`;

    console.log('[brain-backfill] audit', { userId, source_counts, detailed_source_counts, totals, bySource, errors, message });
    return json({ ok: true, totals, by_source: bySource, errors, source_counts, detailed_source_counts, message });
  } catch (e) {
    console.error('brain-backfill error', e);
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
