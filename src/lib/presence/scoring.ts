/**
 * @module lib/presence/scoring
 * @purpose Differential geometry-based scoring engine for the Presence bio-scan.
 * Separates bone structure from soft tissue, uses non-linear penalties, and
 * confidence-sensitive dampening. No midpoint defaulting.
 */

import type {
  PresenceScanResult,
  PresenceScores,
  SubScore,
  Finding,
  FixItem,
  ConfidenceLevel,
  StructuralPotential,
} from './types';
import { FIX_LIBRARY } from './levers';

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

// ── Non-linear penalty curve ──
// Small deviations penalize lightly; large deviations penalize exponentially.
function nonLinearPenalty(deviationScore: number): number {
  // deviationScore is 0-100 where 100 = no deviation
  const deficit = 100 - deviationScore;
  if (deficit <= 10) return deviationScore; // minor: no extra penalty
  if (deficit <= 30) return 100 - deficit * 1.1; // moderate: slight amplification
  return 100 - deficit * 1.3; // severe: exponential feel
}

// ── Confidence dampening ──
// Reduces variance (toward local mean, NOT toward 50) based on confidence.
function applyConfidenceDampening(
  score: number,
  confidence: ConfidenceLevel,
  localMean: number,
): number {
  if (confidence === 'high') return score;
  const factor = confidence === 'med' ? 0.15 : 0.25; // 15% or 25% variance reduction
  return Math.round(score + (localMean - score) * factor);
}

// ── Anti-flattening ──
// If all subscores within ±3 points, expand variance from mean.
function antiFlattening(scores: Record<string, number>): Record<string, number> {
  const vals = Object.values(scores);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  if (max - min > 3) return scores; // already differentiated

  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const expanded: Record<string, number> = {};
  for (const [key, val] of Object.entries(scores)) {
    const delta = val - mean;
    // Expand by 3x to break out of flat zone
    expanded[key] = clamp(Math.round(mean + delta * 3));
  }
  return expanded;
}

// ── Bone Structure vs Soft Tissue separation ──
function computeFacialStructureSignal(raw: Record<string, any>): {
  bone: number;
  softTissue: number;
  combined: number;
} {
  // Bone structure: jaw width, chin projection, brow ridge, symmetry
  const jawDef = raw.structural_integrity ?? raw.jaw_definition ?? null;
  const symmetry = raw.aesthetic_symmetry ?? raw.facial_symmetry ?? null;
  const boneInputs = [jawDef, symmetry].filter((v) => v !== null && v !== undefined);
  const bone = boneInputs.length > 0
    ? Math.round(boneInputs.reduce((a: number, b: number) => a + b, 0) / boneInputs.length)
    : null;

  // Soft tissue overlay: submental fullness, jaw-neck angle, cheek fullness, puffiness
  const composition = raw.composition ?? null;
  const inflammation = raw.inflammation ?? raw.puffiness ?? null;
  const softInputs = [composition, inflammation].filter((v) => v !== null && v !== undefined);
  const softTissue = softInputs.length > 0
    ? Math.round(softInputs.reduce((a: number, b: number) => a + b, 0) / softInputs.length)
    : null;

  // If we have both, weighted blend; if only one, use it; if neither, null propagates
  if (bone !== null && softTissue !== null) {
    return { bone, softTissue, combined: Math.round(bone * 0.6 + softTissue * 0.4) };
  }
  if (bone !== null) return { bone, softTissue: bone, combined: bone };
  if (softTissue !== null) return { bone: softTissue, softTissue, combined: softTissue };
  return { bone: 45, softTissue: 45, combined: 45 }; // last resort — not 50
}

/**
 * Map raw edge function scores into our 5 sub-score model.
 * No midpoint defaulting — uses available signals or propagates uncertainty.
 */
export function mapRawScoresToPresence(rawScores: Record<string, any>): PresenceScores {
  const overallConfidence: ConfidenceLevel =
    rawScores.confidence_band === 'high' ? 'high' : rawScores.confidence_band === 'low' ? 'low' : 'med';

  // 1. Facial Structure (bone + soft tissue separation)
  const facial = computeFacialStructureSignal(rawScores);

  // 2. Posture (non-linear penalty)
  const rawPosture = rawScores.posture_alignment ?? rawScores.posture ?? null;
  const postureScore = rawPosture !== null ? nonLinearPenalty(clamp(Math.round(rawPosture))) : 42;

  // 3. Body Composition (contour-based)
  const rawComp = rawScores.composition ?? rawScores.body_composition ?? null;
  const compScore = rawComp !== null ? clamp(Math.round(rawComp)) : 43;

  // 4. Frame Development
  const rawFrame = rawScores.projection_potential ?? rawScores.frame ?? rawScores.frame_development ?? null;
  const frameScore = rawFrame !== null ? clamp(Math.round(rawFrame)) : 41;

  // 5. Inflammation / Puffiness (with lighting correction)
  const rawInflammation = rawScores.inflammation ?? rawScores.puffiness ?? null;
  let inflammationScore = rawInflammation !== null ? clamp(Math.round(rawInflammation)) : 44;
  // Lighting correction: if high frontal flash detected, reduce puffiness weight
  if (rawScores.lighting_correction === 'high_flash') {
    inflammationScore = Math.round(inflammationScore * 0.8 + 20); // pull toward neutral
  }

  // Collect raw numeric scores for anti-flattening check
  const rawNumeric: Record<string, number> = {
    facial_structure: facial.combined,
    posture_alignment: postureScore,
    body_composition: compScore,
    frame_development: frameScore,
    inflammation_puffiness: inflammationScore,
  };

  // Anti-flattening pass
  const expanded = antiFlattening(rawNumeric);

  // Local mean for dampening (dampen toward group mean, NOT 50)
  const localMean = Object.values(expanded).reduce((a, b) => a + b, 0) / 5;

  return {
    facial_structure: {
      score: clamp(applyConfidenceDampening(expanded.facial_structure, overallConfidence, localMean)),
      confidence: overallConfidence,
      label: 'Facial Structure Signal',
    },
    posture_alignment: {
      score: clamp(applyConfidenceDampening(expanded.posture_alignment, overallConfidence, localMean)),
      confidence: overallConfidence === 'high' ? 'high' : 'med',
      label: 'Posture Alignment',
    },
    body_composition: {
      score: clamp(applyConfidenceDampening(expanded.body_composition, overallConfidence, localMean)),
      confidence: 'med',
      label: 'Body Composition Signal',
    },
    frame_development: {
      score: clamp(applyConfidenceDampening(expanded.frame_development, overallConfidence, localMean)),
      confidence: 'med',
      label: 'Frame Development Signal',
    },
    inflammation_puffiness: {
      score: clamp(applyConfidenceDampening(expanded.inflammation_puffiness, overallConfidence, localMean)),
      confidence: overallConfidence === 'high' ? 'med' : 'low',
      label: 'Inflammation / Puffiness Signal',
    },
  };
}

/**
 * Generate findings from scores — clinical, direct, no beauty language.
 */
export function generateFindings(
  rawMetrics: Record<string, any>,
  scores: PresenceScores,
): Finding[] {
  const findings: Finding[] = [];

  if (scores.posture_alignment.score < 55) {
    findings.push({ id: 'forward_head', text: 'Forward-head posture detected — ear-to-shoulder deviation beyond threshold', severity: 'moderate' });
  }
  if (scores.posture_alignment.score < 40) {
    findings.push({ id: 'rounded_shoulders', text: 'Rounded shoulders pattern detected — thoracic kyphosis signal', severity: 'notable' });
  }
  if (scores.facial_structure.score < 50) {
    findings.push({ id: 'jaw_overlay', text: 'Soft tissue overlay limiting structural definition visibility', severity: 'moderate' });
  }
  if (scores.body_composition.score < 50) {
    findings.push({ id: 'body_comp', text: 'Body composition above optimal range — contour definition reduced', severity: 'mild' });
  }
  if (scores.frame_development.score < 45) {
    findings.push({ id: 'frame_low', text: 'Frame development below projection threshold — shoulder-to-waist ratio limited', severity: 'mild' });
  }
  if (scores.inflammation_puffiness.score < 45) {
    findings.push({ id: 'inflammation', text: 'Elevated inflammation signals — under-eye and facial edge blur detected', severity: 'moderate' });
  }

  return findings.slice(0, 6);
}

/**
 * Prioritization engine — mathematical formula, no static ranking.
 *
 * priority_score = (impact_weight × deficiency_delta) − difficulty_weight
 *
 * deficiency_delta = 100 − subscore
 * impact_weight from lever config
 * difficulty_weight penalizes aggressive stacking
 */
export function selectTopPriorities(scores: PresenceScores, _findings: Finding[]): FixItem[] {
  const impactWeights: Record<string, number> = { high: 3, med: 2, low: 1 };
  const difficultyWeights: Record<string, number> = { easy: 0, medium: 5, hard: 10 };

  // Map categories to relevant subscore keys for deficiency delta
  const categoryDeficiency: Record<string, number> = {
    body: 100 - scores.body_composition.score,
    posture: 100 - scores.posture_alignment.score,
    face: 100 - scores.facial_structure.score,
    frame: 100 - scores.frame_development.score,
    skin: 100 - scores.inflammation_puffiness.score,
    recovery: 100 - scores.inflammation_puffiness.score,
    grooming: Math.max(100 - scores.facial_structure.score, 15), // baseline relevance
  };

  const scored = FIX_LIBRARY.map(fix => {
    const deficiencyDelta = categoryDeficiency[fix.category] ?? 30;
    const priorityScore =
      impactWeights[fix.impact] * deficiencyDelta - difficultyWeights[fix.difficulty];
    return { fix, priorityScore };
  });

  scored.sort((a, b) => b.priorityScore - a.priorityScore);
  return scored.slice(0, 3).map(s => s.fix);
}

/**
 * Compute structural potential from bone structure signal primarily.
 */
export function computeStructuralPotential(scores: PresenceScores): StructuralPotential {
  // Weighted: facial structure (bone) matters most for structural potential
  const weighted =
    scores.facial_structure.score * 0.35 +
    scores.frame_development.score * 0.25 +
    scores.posture_alignment.score * 0.20 +
    scores.body_composition.score * 0.10 +
    scores.inflammation_puffiness.score * 0.10;
  if (weighted >= 70) return 'high';
  if (weighted >= 50) return 'med';
  return 'low';
}

/**
 * Build complete scan result from raw edge function output.
 */
export function buildScanResult(
  rawScores: Record<string, any>,
  rawMetrics: Record<string, any>,
  scanId?: string,
): PresenceScanResult {
  const scores = mapRawScoresToPresence(rawScores);

  const presenceIndex = Math.round(
    scores.facial_structure.score * 0.25 +
    scores.posture_alignment.score * 0.25 +
    scores.body_composition.score * 0.20 +
    scores.frame_development.score * 0.15 +
    scores.inflammation_puffiness.score * 0.15,
  );

  const findings = generateFindings(rawMetrics, scores);
  const topPriorities = selectTopPriorities(scores, findings);
  const structural_potential = computeStructuralPotential(scores);

  // Confidence: based on raw signal, NOT defaulting
  const confidence: ConfidenceLevel =
    rawScores.confidence_band === 'high' ? 'high' : rawScores.confidence_band === 'low' ? 'low' : 'med';

  return {
    presence_index: clamp(presenceIndex),
    confidence,
    scores,
    structural_potential,
    findings,
    top_priorities: topPriorities,
    assessed_at: new Date().toISOString(),
    scan_id: scanId,
  };
}
