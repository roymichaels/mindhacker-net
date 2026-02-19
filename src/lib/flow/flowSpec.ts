/**
 * FlowSpec Registry & Helpers
 */
import type { FlowSpec, FlowStep, MiniStep, FlowAnswers } from './types';

// ─── Registry ───
const registry = new Map<string, FlowSpec>();

export function registerFlow(spec: FlowSpec): void {
  registry.set(spec.id, spec);
}

export function getFlowSpec(id: string): FlowSpec | undefined {
  return registry.get(id);
}

export function getAllFlowSpecs(): FlowSpec[] {
  return Array.from(registry.values());
}

// ─── Helpers ───

/** Get all visible mini-steps for a given step, filtering by branching rules */
export function getVisibleMiniSteps(step: FlowStep, answers: FlowAnswers): MiniStep[] {
  return step.miniSteps.filter(ms => {
    if (!ms.branching) return true;
    return ms.branching.showIf(answers);
  });
}

/** Count total visible mini-steps across all steps */
export function getTotalVisibleMiniSteps(spec: FlowSpec, answers: FlowAnswers): number {
  return spec.steps.reduce((total, step) => {
    if (step.renderer === 'custom') return total + 1;
    return total + getVisibleMiniSteps(step, answers).length;
  }, 0);
}

/** Check if a mini-step answer is valid */
export function isMiniStepValid(miniStep: MiniStep, answer: string | string[] | number | undefined): boolean {
  if (!miniStep.validation.required && (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0))) {
    return true; // optional and empty is OK
  }
  
  if (miniStep.validation.required && (answer === undefined || answer === '')) {
    return false;
  }

  // priority_rank: valid if the array has all options
  if (miniStep.inputType === 'priority_rank') {
    if (!Array.isArray(answer)) return false;
    return answer.length === (miniStep.options?.length ?? 0);
  }

  if (Array.isArray(answer)) {
    const { minSelected, maxSelected } = miniStep.validation;
    if (minSelected && answer.length < minSelected) return false;
    if (maxSelected && answer.length > maxSelected) return false;
    return answer.length > 0;
  }

  if (typeof answer === 'string' && miniStep.validation.minChars) {
    return answer.length >= miniStep.validation.minChars;
  }

  return answer !== undefined && answer !== '';
}

/** Collect answers for a specific step's mini-steps into a flat object */
export function collectStepAnswers(step: FlowStep, answers: FlowAnswers): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const ms of step.miniSteps) {
    if (answers[ms.id] !== undefined) {
      result[ms.id] = answers[ms.id];
    }
  }
  return result;
}
