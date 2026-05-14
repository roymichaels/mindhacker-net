/**
 * AION Safe Read Executor — Phase F · Step 3.
 *
 * Performs READ-only queries against existing tables for capabilities whose
 * `effectiveMode === 'read' | 'suggest'`. Never writes user data. Each
 * branch returns a structured `ReadResult` with:
 *   - `summary`  : short HE string for the artifact body
 *   - `rows`     : raw row count (per source) — never the rows themselves
 *   - `sources`  : list of `table:column` queried
 *   - `data`     : a small typed payload the bridge may reference
 *
 * RLS is enforced by Supabase — the user's own JWT scopes everything.
 *
 * NOTE: this module does NOT import the artifact bus or tracer. The caller
 * (chat hook) wires the result into the bridge + trace marks.
 */
import { supabase } from '@/integrations/supabase/client';
import type { CapabilityId } from '@/orchestration/capabilities/registry';

export interface ReadResult {
  ok: boolean;
  capability: CapabilityId;
  durationMs: number;
  sources: string[];
  rowCounts: Record<string, number>;
  summary: string;
  data?: Record<string, unknown>;
  error?: string;
}

function nowMs() { return Date.now(); }

function fail(capability: CapabilityId, t0: number, error: string): ReadResult {
  return { ok: false, capability, durationMs: nowMs() - t0, sources: [], rowCounts: {}, summary: '', error };
}

/* ───────────────────────────── individual reads ───────────────────────────── */

async function readBrain(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const sources: string[] = [];
  const rowCounts: Record<string, number> = {};

  const { data: nodes } = await supabase
    .from('aurora_memory_graph')
    .select('id, node_type, content, pillar, confidence, layer, last_referenced_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_referenced_at', { ascending: false })
    .limit(8);
  sources.push('aurora_memory_graph:active');
  rowCounts['aurora_memory_graph'] = nodes?.length ?? 0;

  const { data: pillars } = await supabase
    .from('pillar_confidence')
    .select('pillar_id, confidence, signal_count')
    .eq('user_id', userId)
    .order('confidence', { ascending: false })
    .limit(3);
  sources.push('pillar_confidence:top3');
  rowCounts['pillar_confidence'] = pillars?.length ?? 0;

  const topPillars = (pillars ?? []).map((p) => `${p.pillar_id} (${Math.round(Number(p.confidence))}%)`);
  const topNodes = (nodes ?? []).slice(0, 3).map((n) => n.content?.slice(0, 60)).filter(Boolean);

  const summary = nodes?.length || pillars?.length
    ? `${rowCounts.aurora_memory_graph} צמתים פעילים · עמודים מובילים: ${topPillars.join(', ') || '—'}`
    : 'המוח שלך עוד ריק. נתחיל לאסוף.';

  return { sources, rowCounts, summary, data: { topPillars, topNodes } };
}

async function readJourneyNext(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const today = new Date();
  const ymd = today.toISOString().slice(0, 10);
  const { data: items } = await supabase
    .from('action_items')
    .select('id, title, pillar, status, scheduled_date, due_at, order_index')
    .eq('user_id', userId)
    .in('status', ['todo', 'in_progress'])
    .order('order_index', { ascending: true })
    .limit(5);

  // Prefer items scheduled for today.
  const todayItems = (items ?? []).filter((i) => i.scheduled_date === ymd);
  const pick = todayItems[0] ?? items?.[0] ?? null;

  return {
    sources: ['action_items:open'],
    rowCounts: { action_items: items?.length ?? 0 },
    summary: pick
      ? `הצעד הבא: ${pick.title}`
      : 'אין משימות פתוחות כרגע.',
    data: { pick, total: items?.length ?? 0, todayCount: todayItems.length },
  };
}

async function readJourneySummary(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const { data: plans } = await supabase
    .from('life_plans')
    .select('id, status, progress_percentage, start_date, end_date, duration_months')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1);
  const active = plans?.[0] ?? null;

  const { count: openCount } = await supabase
    .from('action_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['todo', 'in_progress']);

  const { count: doneCount } = await supabase
    .from('action_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');

  return {
    sources: ['life_plans:latest', 'action_items:counts'],
    rowCounts: { life_plans: plans?.length ?? 0, open: openCount ?? 0, completed: doneCount ?? 0 },
    summary: active
      ? `מסע ${active.status} · ${active.progress_percentage ?? 0}% · ${openCount ?? 0} פתוח / ${doneCount ?? 0} הושלם`
      : `אין מסע פעיל · ${openCount ?? 0} פעולות פתוחות`,
    data: { plan: active, openCount: openCount ?? 0, doneCount: doneCount ?? 0 },
  };
}

async function readProfile(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, level, experience, active_ego_state, subscription_tier, session_streak')
    .eq('id', userId)
    .maybeSingle();

  const { data: identity } = await supabase
    .from('aurora_identity_elements')
    .select('element_type, content')
    .eq('user_id', userId)
    .limit(8);

  const titles = (identity ?? []).filter((i) => i.element_type === 'identity_title').map((i) => i.content);
  const archetypes = (identity ?? []).filter((i) => i.element_type === 'ai_archetype').map((i) => i.content);

  return {
    sources: ['profiles:self', 'aurora_identity_elements:self'],
    rowCounts: { profiles: profile ? 1 : 0, identity: identity?.length ?? 0 },
    summary: profile
      ? `${profile.full_name ?? 'אתה'} · רמה ${profile.level ?? 1} · ${profile.active_ego_state ?? 'guardian'}${titles[0] ? ' · ' + titles[0] : ''}`
      : 'אין עדיין פרופיל מלא.',
    data: { profile, titles, archetypes },
  };
}

async function readHypnosis(): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const { data: audios, count } = await supabase
    .from('hypnosis_audios')
    .select('id, title, duration_seconds', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(3);

  return {
    sources: ['hypnosis_audios:catalog'],
    rowCounts: { hypnosis_audios: count ?? audios?.length ?? 0 },
    summary: audios && audios.length
      ? `${count ?? audios.length} מפגשי היפנוזה זמינים. למשל: "${audios[0].title}".`
      : 'אין כרגע מפגשי היפנוזה זמינים.',
    data: { samples: audios ?? [] },
  };
}

async function readJournalPreview(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const { data: entries, count } = await supabase
    .from('journal_entries')
    .select('id, title, journal_type, created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);
  return {
    sources: ['journal_entries:recent'],
    rowCounts: { journal_entries: count ?? entries?.length ?? 0 },
    summary: entries && entries.length
      ? `${count ?? entries.length} רשומות יומן. אחרונה: "${entries[0].title ?? entries[0].journal_type}".`
      : 'עוד אין רשומות יומן. אפשר להתחיל.',
    data: { recent: entries ?? [] },
  };
}

async function readOuterWorld(): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  // Lightweight availability probe — counts only, no PII.
  const [coachesQ, postsQ] = await Promise.all([
    supabase.from('coach_landing_pages').select('id', { count: 'exact', head: true }),
    supabase.from('community_posts').select('id', { count: 'exact', head: true }),
  ]);
  const coaches = coachesQ.count ?? 0;
  const posts = postsQ.count ?? 0;
  return {
    sources: ['coach_landing_pages:count', 'community_posts:count'],
    rowCounts: { coaches, posts },
    summary: `עולם חיצון · ${coaches} מאמנים · ${posts} פוסטים בקהילה`,
    data: { coaches, posts },
  };
}

/* ───────────────────────────── public dispatcher ───────────────────────────── */

export async function executeReadCapability(
  capability: CapabilityId,
  userId: string,
): Promise<ReadResult> {
  const t0 = nowMs();
  if (!userId) return fail(capability, t0, 'no-user');

  try {
    switch (capability) {
      case 'brain.query':
      case 'brain.openRoom':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readBrain(userId)) };
      case 'journey.nextAction':
      case 'task.suggest':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readJourneyNext(userId)) };
      case 'journey.summarize':
      case 'plan.suggest':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readJourneySummary(userId)) };
      case 'profile.summarize':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readProfile(userId)) };
      case 'hypnosis.recommend':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readHypnosis()) };
      case 'journal.capture':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readJournalPreview(userId)) };
      case 'outerWorld.open':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readOuterWorld()) };
      default:
        return fail(capability, t0, 'no-read-handler');
    }
  } catch (e) {
    return fail(capability, t0, (e as Error)?.message ?? 'unknown-error');
  }
}