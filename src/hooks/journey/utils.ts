/**
 * Shared Utility Functions for Journey Progress Hooks
 * Replaces duplicate logic across useLaunchpadProgress, useBusinessJourneyProgress, useHealthJourney
 */
import type { Phase, Step } from '@/components/journey-shared/types';

/**
 * Get the phase that contains a given step number
 * 
 * @param phases - Array of phases with step numbers
 * @param stepNumber - The step number to find
 * @returns The phase containing the step, or undefined
 */
export function getPhaseForStep<T extends { steps: number[] }>(
  phases: T[],
  stepNumber: number
): T | undefined {
  return phases.find(phase => phase.steps.includes(stepNumber));
}

/**
 * Check if a step is the last step in its phase
 * Used to determine when to show phase transition screens
 * 
 * @param phases - Array of phases with step numbers
 * @param stepNumber - The step number to check
 * @returns True if this is the last step in the phase
 */
export function isLastStepInPhase<T extends { steps: number[] }>(
  phases: T[],
  stepNumber: number
): boolean {
  const phase = getPhaseForStep(phases, stepNumber);
  if (!phase) return false;
  return phase.steps[phase.steps.length - 1] === stepNumber;
}

/**
 * Check if a step is the first step in its phase
 * Used to determine when to show phase intro screens
 * 
 * @param phases - Array of phases with step numbers
 * @param stepNumber - The step number to check
 * @returns True if this is the first step in the phase
 */
export function isFirstStepInPhase<T extends { steps: number[] }>(
  phases: T[],
  stepNumber: number
): boolean {
  const phase = getPhaseForStep(phases, stepNumber);
  if (!phase) return false;
  return phase.steps[0] === stepNumber;
}

/**
 * Calculate progress percentage
 * 
 * @param currentStep - Current step number
 * @param totalSteps - Total number of steps
 * @returns Progress percentage (0-100)
 */
export function calculateProgressPercent(currentStep: number, totalSteps: number): number {
  return Math.round((currentStep / totalSteps) * 100);
}

/**
 * Get step metadata by step number
 * 
 * @param steps - Array of step metadata
 * @param stepNumber - The step number to find
 * @returns The step metadata or undefined
 */
export function getStepMeta<T extends { id: number }>(
  steps: T[],
  stepNumber: number
): T | undefined {
  return steps.find(s => s.id === stepNumber);
}

/**
 * Create a step data key from step number
 * Used for storing step data in database
 * 
 * @param step - Step number
 * @param keyMap - Map of step numbers to key names
 * @returns The data key string
 */
export function getStepDataKey(
  step: number,
  keyMap: Record<number, string>
): string {
  return keyMap[step] || 'unknown';
}

/**
 * Safe serialization for journey data
 * Removes circular references, DOM nodes, React internals
 * 
 * @param obj - Object to serialize
 * @returns Safely serialized object
 */
export function safeSerialize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') return obj;
  if (Array.isArray(obj)) return obj.map(safeSerialize);
  
  if (typeof obj === 'object') {
    // Skip DOM nodes
    if (typeof Element !== 'undefined' && obj instanceof Element) return undefined;
    if (typeof Node !== 'undefined' && obj instanceof Node) return undefined;
    
    // Skip React internal properties
    if ('$$typeof' in obj) return undefined;
    if ('__reactFiber' in obj) return undefined;
    
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      // Skip internal React/DOM properties
      if (key.startsWith('__react') || key.startsWith('_react')) continue;
      const value = (obj as Record<string, unknown>)[key];
      const serialized = safeSerialize(value);
      if (serialized !== undefined) {
        result[key] = serialized;
      }
    }
    return result;
  }
  
  return undefined;
}

/**
 * Create standard navigation handlers for journey flows
 */
export interface NavigationHandlers {
  handleNavigatePrev: () => void;
  handleNavigateNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export function createNavigationHandlers(
  displayedStep: number,
  currentStep: number,
  totalSteps: number,
  isComplete: boolean,
  viewingStep: number | null,
  setViewingStep: (step: number | null) => void
): NavigationHandlers {
  const handleNavigatePrev = () => {
    if (displayedStep > 1) {
      setViewingStep(displayedStep - 1);
    }
  };

  const handleNavigateNext = () => {
    if (displayedStep < currentStep) {
      if (displayedStep + 1 === currentStep) {
        setViewingStep(null);
      } else {
        setViewingStep(displayedStep + 1);
      }
    }
  };

  const canGoPrev = displayedStep > 1;
  const canGoNext = isComplete 
    ? displayedStep < totalSteps 
    : (viewingStep !== null && displayedStep < currentStep);

  return {
    handleNavigatePrev,
    handleNavigateNext,
    canGoPrev,
    canGoNext,
  };
}
