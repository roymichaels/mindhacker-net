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
  ManualInputs,
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
    facial_definition: {
      score: clamp(Math.round(rawScores.structural_integrity ?? rawScores.aesthetic_symmetry ?? 50)),
      confidence: rawScores.confidence_band === 'high' ? 'high' : rawScores.confidence_band === 'med' ? 'med' : 'med',
      label: 'Facial Definition',
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
    grooming_baseline: {
      score: clamp(Math.round(rawScores.projection_potential ?? 50)),
      confidence: 'low',
      label: 'Grooming Baseline',
    },
    style_signal: {
      score: 50, // lightweight — no photo data for style
      confidence: 'low',
      label: 'Style Signal',
    },
  };
}

/**
 * Enrich grooming/skin scores with manual inputs.
 */
export function enrichWithManualInputs(
  scores: PresenceScores,
  manual?: ManualInputs,
): PresenceScores {
  if (!manual) return scores;
  const enriched = { ...scores };

  // Skincare enrichment
  const skinBonus = manual.skincare_routine === 'full' ? 15 : manual.skincare_routine === 'basic' ? 5 : -10;
  enriched.grooming_baseline = {
    ...enriched.grooming_baseline,
    score: clamp(enriched.grooming_baseline.score + skinBonus),
  };

  return enriched;
}

/**
 * Generate findings from raw metrics.
 */
export function generateFindings(
  rawMetrics: Record<string, any>,
  scores: PresenceScores,
  manual?: ManualInputs,
): Finding[] {
  const findings: Finding[] = [];

  if (scores.posture_alignment.score < 55) {
    findings.push({ id: 'forward_head', text: 'Forward-head posture detected (moderate)', severity: 'moderate' });
  }
  if (scores.posture_alignment.score < 40) {
    findings.push({ id: 'rounded_shoulders', text: 'Rounded shoulders pattern detected', severity: 'notable' });
  }
  if (scores.facial_definition.score < 50) {
    findings.push({ id: 'jaw_bf', text: 'Jawline definition limited by body composition signal', severity: 'moderate' });
  }
  if (scores.body_composition.score < 50) {
    findings.push({ id: 'body_comp', text: 'Body composition above optimal range for definition', severity: 'mild' });
  }
  if (manual?.skincare_routine === 'none') {
    findings.push({ id: 'no_skincare', text: 'No skincare routine reported (from manual input)', severity: 'mild' });
  }
  if (scores.grooming_baseline.score < 45) {
    findings.push({ id: 'grooming_low', text: 'Grooming baseline below threshold', severity: 'mild' });
  }

  return findings.slice(0, 6);
}

/**
 * Select top 3 priority fixes based on scores.
 */
export function selectTopPriorities(scores: PresenceScores, findings: Finding[]): FixItem[] {
  // Score each fix by relevance
  const scored: { fix: FixItem; relevance: number }[] = FIX_LIBRARY.map(fix => {
    let relevance = fix.impact === 'high' ? 3 : fix.impact === 'med' ? 2 : 1;

    // Boost relevance based on weak scores
    if (fix.category === 'posture' && scores.posture_alignment.score < 60) relevance += 3;
    if (fix.category === 'face' && scores.facial_definition.score < 60) relevance += 3;
    if (fix.category === 'body' && scores.body_composition.score < 60) relevance += 2;
    if (fix.category === 'skin' && scores.grooming_baseline.score < 55) relevance += 2;
    if (fix.category === 'grooming' && scores.grooming_baseline.score < 55) relevance += 2;

    // Prefer easy/high-impact
    if (fix.difficulty === 'easy' && fix.impact === 'high') relevance += 2;

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
  manual?: ManualInputs,
  scanId?: string,
): PresenceScanResult {
  let scores = mapRawScoresToPresence(rawScores);
  scores = enrichWithManualInputs(scores, manual);

  const presenceIndex = Math.round(
    scores.facial_definition.score * 0.25 +
    scores.posture_alignment.score * 0.25 +
    scores.body_composition.score * 0.20 +
    scores.grooming_baseline.score * 0.15 +
    scores.style_signal.score * 0.15
  );

  const findings = generateFindings(rawMetrics, scores, manual);
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
