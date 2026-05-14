/**
 * Brain Query service — Phase 2 Batch 1.
 *
 * Read-only access to the consciousness map (`aurora_memory_graph` +
 * `pillar_confidence`). Backs `brain.query` and `brain.openRoom`
 * capabilities. No writes; backfill stays in `brain-backfill` edge fn.
 */
import { supabase } from '@/integrations/supabase/client';

export interface BrainNodeLite {
  id: string;
  node_type: string | null;
  content: string | null;
  pillar: string | null;
  confidence: number | null;
  layer: string | null;
  last_referenced_at: string | null;
}

export interface PillarConfidenceLite {
  pillar_id: string;
  confidence: number;
  signal_count: number;
}

export async function getActiveBrainNodes(userId: string, limit = 8): Promise<BrainNodeLite[]> {
  const { data, error } = await supabase
    .from('aurora_memory_graph')
    .select('id, node_type, content, pillar, confidence, layer, last_referenced_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_referenced_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as BrainNodeLite[];
}

export async function getTopPillars(userId: string, limit = 3): Promise<PillarConfidenceLite[]> {
  const { data, error } = await supabase
    .from('pillar_confidence')
    .select('pillar_id, confidence, signal_count')
    .eq('user_id', userId)
    .order('confidence', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as PillarConfidenceLite[];
}

export interface BrainSummary {
  nodes: BrainNodeLite[];
  pillars: PillarConfidenceLite[];
  topPillars: string[];
  topNodes: string[];
  text: string;
}

export async function summarizeBrain(userId: string): Promise<BrainSummary> {
  const [nodes, pillars] = await Promise.all([getActiveBrainNodes(userId, 8), getTopPillars(userId, 3)]);
  const topPillars = pillars.map((p) => `${p.pillar_id} (${Math.round(Number(p.confidence))}%)`);
  const topNodes = nodes.slice(0, 3).map((n) => n.content?.slice(0, 60) ?? '').filter(Boolean);
  const text = nodes.length || pillars.length
    ? `${nodes.length} צמתים פעילים · עמודים מובילים: ${topPillars.join(', ') || '—'}`
    : 'המוח שלך עוד ריק. נתחיל לאסוף.';
  return { nodes, pillars, topPillars, topNodes, text };
}