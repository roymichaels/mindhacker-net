/**
 * Journey Shared Components
 * Centralized exports for all shared journey infrastructure
 */

// Components
export { JourneyHeader } from './JourneyHeader';
export { JourneyResetDialog } from './JourneyResetDialog';
export { JourneyLoadingState } from './JourneyLoadingState';

// Types
export type {
  JourneyTheme,
  Phase,
  Step,
  StepRewards,
  JourneyThemeConfig,
  BaseStepProps,
  JourneyNavigationState,
  JourneyHeaderProps,
  JourneyResetDialogProps,
  JourneyLoadingStateProps,
} from './types';

// Themes
export { JOURNEY_THEMES, PHASE_COLORS, getThemeConfig } from './themes';
