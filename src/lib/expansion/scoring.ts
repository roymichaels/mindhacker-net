/**
 * @module lib/expansion/scoring
 * Deterministic scoring engine for Expansion (התרחבות) Cognitive Expansion.
 * Rule-based only. Equal weighting across 4 subsystems.
 */
import type {
  ExpansionIntakeAnswers, ExpansionSubscores, ExpansionFinding,
  ExpansionAssessmentResult, Confidence, SubsystemId,
  LearningAnswers, CreativeAnswers, LanguageAnswers, PhilosophicalAnswers,
} from './types';

function clamp(v: number, min = 0, max = 100) { return Math.max(min, Math.min(max, v)); }

/* ─── Learning Depth & Velocity ─── */
function scoreLearning(a?: LearningAnswers): number {
  if (!a) return 0;
  let s = 0;

  // Hours per week (depth > volume)
  const h = a.hours_per_week ?? 0;
  if (h >= 10) s += 20;
  else if (h >= 5) s += 15;
  else if (h >= 2) s += 10;
  else if (h >= 1) s += 5;

  // Learning type depth
  const deepTypes = ['deep_books', 'structured_courses', 'academic_papers'];
  const shallowTypes = ['short_form_content'];
  const types = a.learning_types ?? [];
  const deepCount = types.filter(t => deepTypes.includes(t)).length;
  const hasShallow = types.some(t => shallowTypes.includes(t));
  s += Math.min(deepCount * 8, 20);
  if (hasShallow && deepCount === 0) s -= 5;

  // Retention (weighted heavily)
  if (a.retention === 'easily') s += 25;
  else if (a.retention === 'partially') s += 12;
  else if (a.retention === 'rarely') s += 0;

  // Implementation (weighted heavily)
  if (a.implementation === 'consistently') s += 20;
  else if (a.implementation === 'sometimes') s += 10;
  else if (a.implementation === 'rarely') s += 0;

  // Synthesis
  if (a.synthesis === 'weekly') s += 15;
  else if (a.synthesis === 'monthly') s += 7;

  return clamp(Math.round(s));
}

/* ─── Creative Output & Iteration ─── */
function scoreCreative(a?: CreativeAnswers): number {
  if (!a) return 0;
  let s = 0;

  const types = a.output_types ?? [];
  if (types.includes('none') || types.length === 0) return 0;

  // Variety
  s += Math.min(types.length * 5, 15);

  // Volume
  const ppw = a.pieces_per_week ?? 0;
  if (ppw >= 5) s += 20;
  else if (ppw >= 3) s += 15;
  else if (ppw >= 1) s += 10;

  // Public exposure
  if (a.public_exposure === 'publish_publicly') s += 20;
  else if (a.public_exposure === 'private_only') s += 8;

  // Iteration (consistency + refinement > bursts)
  if (a.iteration_cycle === 'structured_iterations') s += 25;
  else if (a.iteration_cycle === 'occasional_edits') s += 12;

  // Idea generation
  if (a.idea_generation === 'abundant_ideas_daily') s += 20;
  else if (a.idea_generation === 'moderate') s += 10;

  return clamp(Math.round(s));
}

/* ─── Language Complexity ─── */
function scoreLanguage(a?: LanguageAnswers): number {
  if (!a) return 0;
  let s = 0;

  const langs = a.active_languages ?? [];
  if (langs.length >= 3) s += 20;
  else if (langs.length === 2) s += 12;
  else if (langs.length === 1) s += 5;

  // Non-native fluency
  if (a.non_native_fluency === 'near_native') s += 25;
  else if (a.non_native_fluency === 'fluent') s += 18;
  else if (a.non_native_fluency === 'conversational') s += 8;
  else if (a.non_native_fluency === 'basic') s += 2;

  // Complex content in non-native
  if (a.complex_content_non_native === 'regularly') s += 20;
  else if (a.complex_content_non_native === 'sometimes') s += 10;

  // Think in second language
  if (a.think_in_second_language === 'often') s += 20;
  else if (a.think_in_second_language === 'occasionally') s += 10;

  // Switch languages mid-thought
  if (a.switch_languages === 'comfortably') s += 15;
  else if (a.switch_languages === 'sometimes') s += 7;

  return clamp(Math.round(s));
}

/* ─── Philosophical & Systems Thinking ─── */
function scorePhilosophical(a?: PhilosophicalAnswers): number {
  if (!a) return 0;
  let s = 0;

  // Question beliefs
  if (a.question_beliefs === 'frequently') s += 25;
  else if (a.question_beliefs === 'sometimes') s += 12;

  // Read philosophy
  if (a.read_philosophy === 'weekly') s += 20;
  else if (a.read_philosophy === 'monthly') s += 10;

  // Hold opposing views
  if (a.hold_opposing_views === 'yes') s += 20;
  else if (a.hold_opposing_views === 'partially') s += 10;

  // Journaling
  if (a.journaling_frequency === 'daily') s += 15;
  else if (a.journaling_frequency === 'weekly') s += 8;

  // Systems thinking
  if (a.systems_thinking === 'often') s += 20;
  else if (a.systems_thinking === 'occasionally') s += 10;

  return clamp(Math.round(s));
}

/* ─── Contradiction detection ─── */
function detectContradictions(answers: ExpansionIntakeAnswers): string[] {
  const flags: string[] = [];

  // High hours learning + no retention + no implementation
  if (answers.learning) {
    const h = answers.learning.hours_per_week ?? 0;
    if (h >= 5 && answers.learning.retention === 'rarely' && answers.learning.implementation === 'rarely') {
      flags.push('high_intake_no_output');
    }
  }

  // Claims abundant ideas but no output types
  if (answers.creative?.idea_generation === 'abundant_ideas_daily' &&
    (answers.creative.output_types?.includes('none') || (answers.creative.pieces_per_week ?? 0) === 0)) {
    flags.push('ideas_no_output');
  }

  return flags;
}

/* ─── Findings generation (max 6) ─── */
function generateFindings(
  answers: ExpansionIntakeAnswers,
  subscores: ExpansionSubscores,
  contradictions: string[]
): ExpansionFinding[] {
  const findings: ExpansionFinding[] = [];

  if (contradictions.includes('high_intake_no_output')) {
    findings.push({ id: 'shallow_expansion', text_key: 'expansion.finding_shallow_expansion', severity: 'high', subsystem: 'learning_depth' });
  }
  if (contradictions.includes('ideas_no_output')) {
    findings.push({ id: 'ideas_no_execution', text_key: 'expansion.finding_ideas_no_execution', severity: 'med', subsystem: 'creative_output' });
  }

  if (subscores.learning_depth < 25 && (answers.learning?.hours_per_week ?? 0) > 0) {
    findings.push({ id: 'passive_intake', text_key: 'expansion.finding_passive_intake', severity: 'med', subsystem: 'learning_depth' });
  }

  if (subscores.creative_output > 40 && answers.creative?.iteration_cycle === 'rarely_refine') {
    findings.push({ id: 'growth_plateau', text_key: 'expansion.finding_growth_plateau', severity: 'med', subsystem: 'creative_output' });
  }

  if (subscores.language_complexity >= 50) {
    findings.push({ id: 'multilingual_boost', text_key: 'expansion.finding_multilingual_boost', severity: 'low', subsystem: 'language_complexity' });
  }

  if (subscores.philosophical_depth < 20) {
    findings.push({ id: 'rigid_thinking', text_key: 'expansion.finding_rigid_thinking', severity: 'high', subsystem: 'philosophical_depth' });
  }

  if (answers.learning?.synthesis === 'never') {
    findings.push({ id: 'no_synthesis', text_key: 'expansion.finding_no_synthesis', severity: 'med', subsystem: 'learning_depth' });
  }

  return findings.slice(0, 6);
}

/* ─── Main build function ─── */
export function buildExpansionAssessment(answers: ExpansionIntakeAnswers): ExpansionAssessmentResult {
  const subscores: ExpansionSubscores = {
    learning_depth: scoreLearning(answers.learning),
    creative_output: scoreCreative(answers.creative),
    language_complexity: scoreLanguage(answers.language),
    philosophical_depth: scorePhilosophical(answers.philosophical),
  };

  // Equal weighting
  const expansion_index = Math.round(
    (subscores.learning_depth + subscores.creative_output +
      subscores.language_complexity + subscores.philosophical_depth) / 4
  );

  // Completeness
  const totalFields = 20; // 4 subsystems × 5 questions
  let answered = 0;
  if (answers.learning) {
    if (answers.learning.hours_per_week != null) answered++;
    if (answers.learning.learning_types?.length) answered++;
    if (answers.learning.retention) answered++;
    if (answers.learning.implementation) answered++;
    if (answers.learning.synthesis) answered++;
  }
  if (answers.creative) {
    if (answers.creative.output_types?.length) answered++;
    if (answers.creative.pieces_per_week != null) answered++;
    if (answers.creative.public_exposure) answered++;
    if (answers.creative.iteration_cycle) answered++;
    if (answers.creative.idea_generation) answered++;
  }
  if (answers.language) {
    if (answers.language.active_languages?.length) answered++;
    if (answers.language.non_native_fluency) answered++;
    if (answers.language.complex_content_non_native) answered++;
    if (answers.language.think_in_second_language) answered++;
    if (answers.language.switch_languages) answered++;
  }
  if (answers.philosophical) {
    if (answers.philosophical.question_beliefs) answered++;
    if (answers.philosophical.read_philosophy) answered++;
    if (answers.philosophical.hold_opposing_views) answered++;
    if (answers.philosophical.journaling_frequency) answered++;
    if (answers.philosophical.systems_thinking) answered++;
  }

  const completeness_pct = Math.round((answered / totalFields) * 100);
  const contradictions = detectContradictions(answers);

  let confidence: Confidence = 'high';
  if (completeness_pct < 60 || contradictions.length > 0) confidence = 'low';
  else if (completeness_pct < 85) confidence = 'med';

  const findings = generateFindings(answers, subscores, contradictions);

  return {
    assessed_at: new Date().toISOString(),
    expansion_index,
    confidence,
    completeness_pct,
    subscores,
    findings,
    selected_focus_items: [],
  };
}
