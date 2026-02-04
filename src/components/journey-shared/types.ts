/**
 * Shared Types for All Journey Flows
 * Used by Launchpad, Business, Health, and future journeys
 */
import type { LucideIcon } from 'lucide-react';

export type JourneyTheme = 'launchpad' | 'business' | 'health' | 'relationships' | 'finances' | 'learning';

export interface Phase {
  id: number;
  key?: string;
  title: string;
  titleEn: string;
  description?: string;
  descriptionEn?: string;
  icon: string;
  color?: string;
  steps: number[];
}

export interface Step {
  id: number;
  key?: string;
  phase?: number;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  description?: string;
  descriptionEn?: string;
  icon: string;
}

export interface StepRewards {
  xp: number;
  tokens: number;
  unlock?: string;
}

export interface JourneyThemeConfig {
  id: JourneyTheme;
  colors: {
    primary: string;      // e.g., 'blue-500'
    secondary: string;    // e.g., 'cyan-400'
    background: string;   // e.g., 'from-blue-950 to-gray-900'
    border: string;       // e.g., 'blue-800/50'
    text: string;         // e.g., 'blue-400'
    glow: string;         // e.g., 'shadow-blue-500/30'
    progressBg: string;   // e.g., 'blue-500/10'
  };
  icon: LucideIcon;
  title: { he: string; en: string };
}

// Standard step component props - use this interface for all step components
export interface BaseStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting: boolean;
  rewards?: StepRewards;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

// Navigation state used by all journey flows
export interface JourneyNavigationState {
  viewingStep: number | null;
  displayedStep: number;
  canGoPrev: boolean;
  canGoNext: boolean;
}

// Props for the shared JourneyHeader component
export interface JourneyHeaderProps {
  theme: JourneyTheme;
  currentStep: number;
  totalSteps: number;
  displayedStep: number;
  isViewing: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onReset?: () => void;
  showReset?: boolean;
  phases: Phase[];
  steps: Step[];
  className?: string;
  // Optional: for journeys with live orb
  showOrb?: boolean;
  xpEarned?: number;
}

// Props for the shared reset dialog
export interface JourneyResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isResetting: boolean;
  journeyType?: 'launchpad' | 'business' | 'health' | 'relationships' | 'finances' | 'learning';
}

// Props for shared loading state
export interface JourneyLoadingStateProps {
  theme?: JourneyTheme;
  message?: string;
}
