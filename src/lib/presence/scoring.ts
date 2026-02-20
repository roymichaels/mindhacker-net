/**
 * @module lib/presence/scoring
 * @purpose Maps raw scan metrics from analyze-presence edge function into the bio-scan result model.
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

/**
 * Map raw edge function scores into our 5 sub-score model.
 */
export function mapRawScoresToPresence(rawScores: Record<string, any>): PresenceScores {
  return {
    facial_structure: {
      score: clamp(Math.round(rawScores.structural_integrity ?? rawScores.aesthetic_symmetry ?? 50)),
      confidence: rawScores.confidence_band === 'high' ? 'high' : 'med',
      label: 'Facial Structure Signal',
    },
    posture_alignment: {
      score: clamp(Math.round(rawScores.posture_alignment ?? 50)),
      confidence: 'med',
      label: 'Posture Alignment',
    },
    body_composition: {
      score: clamp(Math.round(rawScores.composition ?? 50)),
      confidence: 'med',
      label: 'Body Composition Signal',
    },
    frame_development: {
      score: clamp(Math.round(rawScores.projection_potential ?? rawScores.frame ?? 50)),
      confidence: 'med',
      label: 'Frame Development Signal',
    },
    inflammation_puffiness: {
      score: clamp(Math.round(rawScores.inflammation ?? rawScores.puffiness ?? 50)),
      confidence: 'low',
      label: 'Inflammation / Puffiness Signal',
    },
  };
}

/**
 * Generate findings from raw metrics.
 */
export function generateFindings(
  rawMetrics: Record<string, any>,
  scores: PresenceScores,
): Finding[] {
  const findings: Finding[] = [];

  if (scores.posture_alignment.score < 55) {
    findings.push({ id: 'forward_head', text: 'Forward-head posture detected (moderate)', severity: 'moderate' });
  }
  if (scores.posture_alignment.score < 40) {
    findings.push({ id: 'rounded_shoulders', text: 'Rounded shoulders pattern detected', severity: 'notable' });
  }
  if (scores.facial_structure.score < 50) {
    findings.push({ id: 'jaw_bf', text: 'Jawline definition limited by body composition signal', severity: 'moderate' });
  }
  if (scores.body_composition.score < 50) {
    findings.push({ id: 'body_comp', text: 'Body composition above optimal range for definition', severity: 'mild' });
  }
  if (scores.frame_development.score < 45) {
    findings.push({ id: 'frame_low', text: 'Frame development below threshold', severity: 'mild' });
  }
  if (scores.inflammation_puffiness.score < 45) {
    findings.push({ id: 'inflammation', text: 'Elevated inflammation or puffiness signals detected', severity: 'moderate' });
  }

  return findings.slice(0, 6);
}

/**
 * Select top 3 priority fixes based on scores.
 */
export function selectTopPriorities(scores: PresenceScores, findings: Finding[]): FixItem[] {
  const scored: { fix: FixItem; relevance: number }[] = FIX_LIBRARY.map(fix => {
    let relevance = fix.impact === 'high' ? 3 : fix.impact === 'med' ? 2 : 1;

    // Boost relevance based on weak scores
    if (fix.category === 'posture' && scores.posture_alignment.score < 60) relevance += 3;
    if (fix.category === 'face' && scores.facial_structure.score < 60) relevance += 3;
    if (fix.category === 'body' && scores.body_composition.score < 60) relevance += 2;
    if (fix.category === 'frame' && scores.frame_development.score < 55) relevance += 2;
    if (fix.category === 'skin' && scores.inflammation_puffiness.score < 45) relevance += 2;
    if (fix.category === 'recovery' && scores.inflammation_puffiness.score < 50) relevance += 2;

    // Prefer easy/high-impact and tier 1
    if (fix.difficulty === 'easy' && fix.impact === 'high') relevance += 2;
    if (fix.tier === 1) relevance += 1;

    return { fix, relevance };
  });

  scored.sort((a, b) => b.relevance - a.relevance);
  return scored.slice(0, 3).map(s => s.fix);
}

/**
 * Compute structural potential from scores.
 */
export function computeStructuralPotential(scores: PresenceScores): StructuralPotential {
  const avg = Object.values(scores).reduce((sum, s) => sum + s.score, 0) / Object.values(scores).length;
  if (avg >= 70) return 'high';
  if (avg >= 50) return 'med';
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
    scores.inflammation_puffiness.score * 0.15
  );

  const findings = generateFindings(rawMetrics, scores);
  const topPriorities = selectTopPriorities(scores, findings);
  const structural_potential = computeStructuralPotential(scores);

  const confidence: ConfidenceLevel = rawScores.confidence_band === 'high' ? 'high' : 'med';

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
