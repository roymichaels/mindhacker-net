/**
 * AION Context Builder — Phase F · Step 5.
 *
 * Assembles a compact ContextPacket BEFORE every routed turn. Strict token
 * budget — only counts, ids, and short strings. Never carries raw rows.
 *
 * Sources (RLS-scoped via the user's JWT):
 *   - aurora_memory_graph         → top relevant nodes + counts
 *   - pillar_confidence           → lowest-confidence pillars / sparsity
 *   - aurora_contradictions       → open contradictions (ids + pillar)
 *   - life_plans + action_items   → active plans / open actions
 *   - aurora_behavioral_patterns  → recurring blockers / strengths
 *   - aion_signals (kind=emotion) → recent emotional drift
 *   - last 5 assistant messages   → from caller
 *
 * Used by:
 *   - probeEngine
 *   - contradictionEngine
 *   - acceptance harness
 *   - trace marks (graph_context_loaded, sparsity_score, …)
 */
import { supabase } from '@/integrations/supabase/client';
import { computeGraphDepth, type GraphDepth, type PillarSnapshot } from '@/orchestration/graph/graphDepth';

export interface ContextPacket {
  builtAt: number;
  durationMs: number;
  ok: boolean;
  error?: string;
  topNodes: { id: string; pillar: string | null; content: string; strength: number; confidence: number }[];
  graphNodeCount: number;
  lowestPillars: { pillar_id: string; confidence: number; signal_count: number }[];
  contradictions: { id: string; pillar: string | null; explanation: string; statement_a: string | null; statement_b: string | null }[];
  activePlan: { id: string; status: string; progress: number } | null;
  openActions: number;
  recentArtifactKinds: string[];
  recentAssistantTexts: string[];
  emotionalDrift: { positive: number; negative: number; neutral: number; samples: number };
  patterns: { type: string; description: string }[];
  graphDepth: GraphDepth;
  decisionMode: 'reflective' | 'directive' | 'curious' | 'observational';
}

const EMPTY_DEPTH: GraphDepth = {
  totalPillars: 15, knownPillars: [], unknownPillars: [],
  topRooms: [], neglectedRooms: [], averageConfidence: 0, sparsityScore: 1,
};

function emptyPacket(error?: string): ContextPacket {
  return {
    builtAt: Date.now(),
    durationMs: 0,
    ok: false,
    error,
    topNodes: [],
    graphNodeCount: 0,
    lowestPillars: [],
    contradictions: [],
    activePlan: null,
    openActions: 0,
    recentArtifactKinds: [],
    recentAssistantTexts: [],
    emotionalDrift: { positive: 0, negative: 0, neutral: 0, samples: 0 },
    patterns: [],
    graphDepth: EMPTY_DEPTH,
    decisionMode: 'observational',
  };
}

function inferDecisionMode(text: string): ContextPacket['decisionMode'] {
  const t = text.toLowerCase();
  if (/\?|מה כדאי|מה לעשות|איך|why|how/.test(t)) return 'directive';
  if (/אני מרגיש|אני חושב|לא יודע|אבוד|תקוע|i feel|stuck|lost/.test(t)) return 'reflective';
  if (/מה אתה יודע|מי אני|who am i|what do you/.test(t)) return 'curious';
  return 'observational';
}

export async function buildContextPacket(params: {
  userId: string;
  message: string;
  recentAssistantTexts: string[];
  recentArtifactKinds: string[];
}): Promise<ContextPacket> {
  const t0 = Date.now();
  const { userId, message, recentAssistantTexts, recentArtifactKinds } = params;
  if (!userId) return emptyPacket('no-user');

  try {
    // Fire reads in parallel — small projections only.
    const [
      nodesQ,
      pillarsQ,
      contradictionsQ,
      planQ,
      openCountQ,
      patternsQ,
      emotionQ,
    ] = await Promise.all([
      supabase
        .from('aurora_memory_graph')
        .select('id, pillar, content, strength, confidence, last_referenced_at')
        .eq('user_id', userId).eq('is_active', true)
        .order('last_referenced_at', { ascending: false }).limit(8),
      supabase
        .from('pillar_confidence')
        .select('pillar_id, confidence, signal_count')
        .eq('user_id', userId).order('confidence', { ascending: true }).limit(15),
      supabase
        .from('aurora_contradictions')
        .select('id, pillar_id, explanation, statement_a, statement_b, status')
        .eq('user_id', userId).eq('status', 'open').limit(5),
      supabase
        .from('life_plans').select('id, status, progress_percentage')
        .eq('user_id', userId).order('updated_at', { ascending: false }).limit(1),
      supabase
        .from('action_items').select('id', { count: 'exact', head: true })
        .eq('user_id', userId).in('status', ['todo', 'in_progress']),
      supabase
        .from('aurora_behavioral_patterns')
        .select('pattern_type, description').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(6),
      supabase
        .from('aion_signals').select('kind, payload, created_at')
        .eq('user_id', userId).eq('kind', 'emotion.detected')
        .order('created_at', { ascending: false }).limit(20),
    ]);

    const nodes = nodesQ.data ?? [];
    const pillarsRaw = (pillarsQ.data ?? []) as Array<{ pillar_id: string; confidence: number; signal_count: number }>;
    const pillars: PillarSnapshot[] = pillarsRaw.map((p) => ({
      pillar_id: p.pillar_id,
      confidence: Number(p.confidence ?? 0),
      signal_count: Number(p.signal_count ?? 0),
    }));
    const lowestPillars = [...pillars].sort((a, b) => a.confidence - b.confidence).slice(0, 3);

    // Emotional drift over last ~20 emotion signals.
    const drift = { positive: 0, negative: 0, neutral: 0, samples: 0 };
    for (const s of (emotionQ.data ?? [])) {
      const v = ((s as { payload?: { valence?: string } }).payload?.valence ?? 'neutral').toLowerCase();
      drift.samples += 1;
      if (v === 'positive') drift.positive += 1;
      else if (v === 'negative') drift.negative += 1;
      else drift.neutral += 1;
    }

    const graphDepth = computeGraphDepth(pillars, nodes.length);

    const packet: ContextPacket = {
      builtAt: Date.now(),
      durationMs: Date.now() - t0,
      ok: true,
      topNodes: nodes.slice(0, 5).map((n) => ({
        id: n.id,
        pillar: n.pillar ?? null,
        content: (n.content ?? '').slice(0, 80),
        strength: Number(n.strength ?? 1),
        confidence: Number(n.confidence ?? 50),
      })),
      graphNodeCount: nodes.length,
      lowestPillars,
      contradictions: (contradictionsQ.data ?? []).map((c) => ({
        id: c.id,
        pillar: (c as { pillar_id?: string }).pillar_id ?? null,
        explanation: ((c as { explanation?: string }).explanation ?? '').slice(0, 140),
        statement_a: (c as { statement_a?: string }).statement_a ?? null,
        statement_b: (c as { statement_b?: string }).statement_b ?? null,
      })),
      activePlan: planQ.data?.[0]
        ? { id: planQ.data[0].id, status: planQ.data[0].status, progress: Number(planQ.data[0].progress_percentage ?? 0) }
        : null,
      openActions: openCountQ.count ?? 0,
      recentArtifactKinds: recentArtifactKinds.slice(0, 5),
      recentAssistantTexts: recentAssistantTexts.slice(-5).map((t) => t.slice(0, 200)),
      emotionalDrift: drift,
      patterns: (patternsQ.data ?? []).map((p) => ({
        type: p.pattern_type, description: (p.description ?? '').slice(0, 120),
      })),
      graphDepth,
      decisionMode: inferDecisionMode(message),
    };
    return packet;
  } catch (e) {
    return emptyPacket((e as Error)?.message ?? 'context-build-error');
  }
}

/** Compact serializable summary — used for trace + outgoing X-Aion-Context header. */
export function summarizeContext(p: ContextPacket): Record<string, unknown> {
  return {
    ok: p.ok,
    duration_ms: p.durationMs,
    graph_nodes: p.graphNodeCount,
    sparsity: p.graphDepth.sparsityScore,
    avg_confidence: p.graphDepth.averageConfidence,
    top_rooms: p.graphDepth.topRooms,
    neglected_rooms: p.graphDepth.neglectedRooms,
    lowest_pillars: p.lowestPillars.map((x) => `${x.pillar_id}:${Math.round(x.confidence)}`),
    open_contradictions: p.contradictions.length,
    open_actions: p.openActions,
    plan_status: p.activePlan?.status ?? null,
    drift: p.emotionalDrift,
    decision_mode: p.decisionMode,
    pattern_count: p.patterns.length,
  };
}