/**
 * Journey Hooks - Shared Logic for All Journey Flows
 */

// Hooks
export { useAutoSave, useDebouncedSave } from './useAutoSave';
export type { UseAutoSaveOptions } from './useAutoSave';

// Utilities
export {
  getPhaseForStep,
  isLastStepInPhase,
  isFirstStepInPhase,
  calculateProgressPercent,
  getStepMeta,
  getStepDataKey,
  safeSerialize,
  createNavigationHandlers,
} from './utils';
export type { NavigationHandlers } from './utils';
