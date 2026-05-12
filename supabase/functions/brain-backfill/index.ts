// Brain backfill: pull existing user data into aurora_memory_graph via brain_upsert_node.
// Idempotent. Auth: caller's JWT; RLS enforces ownership.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Counts = { inserted: number; updated: number; skipped: number };
const newCounts = (): Counts => ({ inserted: 0, updated: 0, skipped: 0 });

type SourceErrors = Record<string, string[]>;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'unauthorized' }, 401);
    }

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

    // 1) Profile core identity
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, bio, active_ego_state, selected_pillars, aion_name')
      .eq('id', userId)
      .maybeSingle();
    if (profile) {
      if (profile.full_name) {
        await upsert('profile', 'identity', `My name is ${profile.full_name}`, {
          layer: 'deep', deltaConf: 40, deltaStrength: 5,
          sourceRef: { field: 'full_name' },
        });
      }
      if (profile.bio) {
        await upsert('profile', 'identity', profile.bio, {
          layer: 'deep', deltaConf: 25, deltaStrength: 3,
          sourceRef: { field: 'bio' },
        });
      }
      if (profile.active_ego_state) {
        await upsert('profile', 'pattern',
          `Active ego state: ${profile.active_ego_state}`,
          { layer: 'pattern', deltaConf: 20, sourceRef: { field: 'active_ego_state' } });
      }
      if (Array.isArray(profile.selected_pillars)) {
        for (const p of profile.selected_pillars) {
          await upsert('profile', 'goal', `Focus pillar: ${p}`, {
            layer: 'pattern', pillar: String(p), deltaConf: 25, deltaStrength: 3,
            sourceRef: { field: 'selected_pillars' },
          });
        }
      }
    }

    // 2) aurora_identity_elements
    const { data: identity } = await supabase
      .from('aurora_identity_elements')
      .select('id, element_type, content, metadata')
      .eq('user_id', userId)
      .limit(1000);
    for (const row of identity ?? []) {
      const t = String(row.element_type || 'identity').toLowerCase();
      const nodeType =
        t.includes('goal') ? 'goal' :
        t.includes('value') ? 'value' :
        t.includes('belief') ? 'belief' :
        t.includes('habit') ? 'habit' :
        'identity';
      const layer = nodeType === 'goal' || nodeType === 'habit' ? 'pattern' : 'deep';
      const pillar = (row.metadata as any)?.pillar ?? null;
      await upsert('identity_element', nodeType, String(row.content ?? ''), {
        layer, pillar, deltaConf: 30, deltaStrength: 3,
        sourceRef: { id: row.id, element_type: row.element_type },
      });
    }

    // 3) action_items → habits
    const { data: actions } = await supabase
      .from('action_items')
      .select('id, title, description, pillar, status, recurrence_rule')
      .eq('user_id', userId)
      .limit(500);
    for (const a of actions ?? []) {
      const recurring = !!a.recurrence_rule;
      const completed = a.status === 'completed';
      const conf = recurring ? 30 : completed ? 20 : 10;
      await upsert('action_item', recurring ? 'habit' : 'goal', String(a.title ?? ''), {
        layer: recurring ? 'pattern' : 'surface',
        pillar: a.pillar ?? null,
        deltaConf: conf, deltaStrength: recurring ? 3 : 1,
        sourceRef: { id: a.id, status: a.status, recurring },
        summary: a.description ?? null,
      });
    }

    // 4) behavioral patterns
    const { data: patterns } = await supabase
      .from('aurora_behavioral_patterns')
      .select('id, pattern_type, description')
      .eq('user_id', userId)
      .limit(500);
    for (const p of patterns ?? []) {
      await upsert('behavioral_pattern', 'pattern', String(p.description ?? p.pattern_type ?? ''), {
        layer: 'pattern', deltaConf: 25, deltaStrength: 3,
        sourceRef: { id: p.id, pattern_type: p.pattern_type },
      });
    }

    // 5) pillar_confidence → pillar markers
    const { data: pillars } = await supabase
      .from('pillar_confidence')
      .select('pillar_id, confidence, signal_count')
      .eq('user_id', userId);
    for (const pc of pillars ?? []) {
      await upsert('pillar_confidence', 'pillar_marker',
        `Pillar confidence: ${pc.pillar_id} (${pc.confidence}%)`,
        {
          layer: 'pattern',
          pillar: pc.pillar_id,
          deltaConf: Math.max(5, Math.min(40, Math.round((pc.confidence ?? 0) / 3))),
          deltaStrength: Math.min(5, Math.max(1, Math.round((pc.signal_count ?? 0) / 3))),
          sourceRef: { pillar_id: pc.pillar_id },
        });
    }

    // 6) journal entries
    const { data: journals } = await supabase
      .from('journal_entries')
      .select('id, content, journal_type, mood, tags, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200);
    for (const j of journals ?? []) {
      const text = String(j.content ?? '').slice(0, 280);
      if (!text) continue;
      await upsert('journal_entry', 'memory', text, {
        layer: 'surface',
        deltaConf: 10, deltaStrength: 1,
        sourceRef: { id: j.id, type: j.journal_type, mood: j.mood },
      });
    }

    // 7) onboarding progress
    const { data: onboarding } = await supabase
      .from('aurora_onboarding_progress')
      .select('direction_clarity, identity_understanding, energy_patterns_status, energy_level, onboarding_complete')
      .eq('user_id', userId)
      .maybeSingle();
    if (onboarding) {
      if (onboarding.energy_level) {
        await upsert('onboarding', 'pattern', `Baseline energy level: ${onboarding.energy_level}`, {
          layer: 'pattern', deltaConf: 20, sourceRef: { field: 'energy_level' },
        });
      }
      if (onboarding.identity_understanding) {
        await upsert('onboarding', 'identity', `Identity understanding: ${onboarding.identity_understanding}`, {
          layer: 'deep', deltaConf: 15, sourceRef: { field: 'identity_understanding' },
        });
      }
      if (onboarding.direction_clarity) {
        await upsert('onboarding', 'pattern', `Direction clarity: ${onboarding.direction_clarity}`, {
          layer: 'pattern', deltaConf: 15, sourceRef: { field: 'direction_clarity' },
        });
      }
    }

    // 8) life plans + milestones
    const { data: plans } = await supabase
      .from('life_plans')
      .select('id, plan_data, status, start_date, progress_percentage')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    for (const p of plans ?? []) {
      const pd: any = p.plan_data ?? {};
      const vision = String(pd.vision ?? pd.summary ?? '').slice(0, 280);
      if (vision) {
        await upsert('life_plan', 'goal', vision, {
          layer: 'pattern', deltaConf: 25, deltaStrength: 3,
          sourceRef: { id: p.id, status: p.status },
        });
      }
      const focusPillars: string[] = Array.isArray(pd.focus_pillars) ? pd.focus_pillars : [];
      for (const fp of focusPillars) {
        await upsert('life_plan', 'goal', `Plan focus: ${fp}`, {
          layer: 'pattern', pillar: String(fp), deltaConf: 20,
          sourceRef: { id: p.id, field: 'focus_pillars' },
        });
      }
    }

    const planIds = (plans ?? []).map((p) => p.id);
    if (planIds.length > 0) {
      const { data: milestones } = await supabase
        .from('life_plan_milestones')
        .select('id, plan_id, title, goal, focus_area, is_completed, week_number')
        .in('plan_id', planIds)
        .limit(200);
      for (const m of milestones ?? []) {
        const title = String(m.title ?? '').trim();
        if (!title) continue;
        await upsert('milestone', m.is_completed ? 'breakthrough' : 'goal', title, {
          layer: m.is_completed ? 'pattern' : 'surface',
          pillar: m.focus_area ?? null,
          deltaConf: m.is_completed ? 20 : 10,
          deltaStrength: m.is_completed ? 2 : 1,
          sourceRef: { id: m.id, week: m.week_number, completed: m.is_completed },
          summary: m.goal ?? null,
        });
      }
    }

    // 9) presence scans
    const { data: scans } = await supabase
      .from('presence_scans')
      .select('id, derived_metrics, scores, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    for (const s of scans ?? []) {
      const scores: any = s.scores ?? {};
      const top = Object.entries(scores)
        .filter(([, v]) => typeof v === 'number')
        .sort((a, b) => (b[1] as number) - (a[1] as number))[0];
      if (top) {
        await upsert('presence', 'pattern', `Presence signal: ${top[0]} (${Math.round(Number(top[1]))})`, {
          layer: 'pattern', pillar: 'presence', deltaConf: 15,
          sourceRef: { id: s.id, key: top[0] },
        });
      }
    }

    console.log('[brain-backfill] done', { userId, totals, bySource, errors });
    return json({ ok: true, totals, by_source: bySource, errors });
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