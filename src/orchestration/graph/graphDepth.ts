/**
 * Graph Depth Awareness — Phase F · Step 5.
 *
 * Read-only summarization of how filled-in the user's brain graph is.
 * Pure function over an injected `pillarConfidence` snapshot — no DB calls
 * (the context builder fetches data once and forwards it here).
 *
 * Sparsity score in [0..1]:  0 = rich, 1 = empty.
 * Used internally for routing/probing only — never shown to the user.
 */

export interface PillarSnapshot {
  pillar_id: string;
  confidence: number; // 0..100
  signal_count: number;
}

export interface GraphDepth {
  totalPillars: number;
  knownPillars: string[];      // confidence > 30 OR signal_count > 0
  unknownPillars: string[];    // never signaled
  topRooms: string[];          // top 3 by confidence
  neglectedRooms: string[];    // bottom 3 with any signal but low confidence
  averageConfidence: number;
  sparsityScore: number;       // 0..1
}

const TOTAL_PILLARS = 15;

export function computeGraphDepth(
  pillars: PillarSnapshot[],
  graphNodeCount: number,
): GraphDepth {
  const known = pillars.filter((p) => p.confidence > 30 || p.signal_count > 0);
  const knownIds = known.map((p) => p.pillar_id);

  const sortedDesc = [...pillars].sort((a, b) => b.confidence - a.confidence);
  const sortedAsc = [...pillars].sort((a, b) => a.confidence - b.confidence);

  const topRooms = sortedDesc.slice(0, 3).map((p) => p.pillar_id);
  const neglectedRooms = sortedAsc
    .filter((p) => p.signal_count > 0 && p.confidence < 35)
    .slice(0, 3)
    .map((p) => p.pillar_id);

  const averageConfidence = pillars.length
    ? pillars.reduce((acc, p) => acc + Number(p.confidence ?? 0), 0) / pillars.length
    : 0;

  // Sparsity: weighted blend of pillar coverage (60%) and node count (40%).
  const pillarCoverage = Math.min(1, known.length / TOTAL_PILLARS);
  const nodeFill = Math.min(1, graphNodeCount / 30); // 30 active nodes ≈ rich
  const richness = 0.6 * pillarCoverage + 0.4 * nodeFill;
  const sparsityScore = Math.max(0, Math.min(1, 1 - richness));

  return {
    totalPillars: TOTAL_PILLARS,
    knownPillars: knownIds,
    unknownPillars: [], // populated by caller using its pillar list
    topRooms,
    neglectedRooms,
    averageConfidence: Math.round(averageConfidence),
    sparsityScore: Number(sparsityScore.toFixed(2)),
  };
}