import { useState, useEffect, useCallback } from 'react';
import { STEPS, PHASES, STEP_REWARDS, Phase, getPhaseForStep, isLastStepInPhase, isFirstStepInPhase } from './useLaunchpadProgress';

const STORAGE_PREFIX = 'guest_launchpad_';

export interface GuestLaunchpadProgress {
  current_step: number;
  step_1_intention: string | null;
  step_2_profile_data: Record<string, unknown> | null;
  step_2_summary: string | null;
  step_3_form_submission_id: string | null;
  step_4_form_submission_id: string | null;
  step_5_focus_areas_selected: string[];
  step_6_actions: Record<string, unknown> | null;
  launchpad_complete: boolean;
  completed_at: string | null;
}

export interface GuestStepCompletionData {
  intention?: string;
  profile_data?: Record<string, unknown>;
  summary?: string;
  form_data?: Record<string, unknown>;
  focus_areas?: string[];
  actions?: Record<string, unknown>;
}

const getDefaultProgress = (): GuestLaunchpadProgress => ({
  current_step: 1,
  step_1_intention: null,
  step_2_profile_data: null,
  step_2_summary: null,
  step_3_form_submission_id: null,
  step_4_form_submission_id: null,
  step_5_focus_areas_selected: [],
  step_6_actions: null,
  launchpad_complete: false,
  completed_at: null,
});

export function useGuestLaunchpadProgress() {
  const [progress, setProgress] = useState<GuestLaunchpadProgress>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}progress`);
      return stored ? JSON.parse(stored) : getDefaultProgress();
    } catch {
      return getDefaultProgress();
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Persist progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}progress`, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save guest progress:', e);
    }
  }, [progress]);

  const completeStep = useCallback(({ step, data }: { step: number; data?: GuestStepCompletionData }) => {
    setIsCompleting(true);
    
    setProgress(prev => {
      const updated = { ...prev };
      
      // Update step-specific data
      switch (step) {
        case 1:
          if (data?.intention) {
            updated.step_1_intention = data.intention;
          }
          break;
        case 2:
          if (data?.profile_data) {
            updated.step_2_profile_data = data.profile_data;
          }
          break;
        case 4:
          if (data?.summary) {
            updated.step_2_summary = data.summary;
          }
          break;
        case 5:
          if (data?.form_data) {
            // Store introspection data
            try {
              localStorage.setItem(`${STORAGE_PREFIX}introspection`, JSON.stringify(data.form_data));
            } catch {}
          }
          break;
        case 6:
          if (data?.form_data) {
            // Store life plan data
            try {
              localStorage.setItem(`${STORAGE_PREFIX}life_plan`, JSON.stringify(data.form_data));
            } catch {}
          }
          break;
        case 7:
          if (data?.focus_areas) {
            updated.step_5_focus_areas_selected = data.focus_areas;
          }
          break;
        case 8:
          if (data?.actions) {
            updated.step_6_actions = data.actions;
          }
          break;
        case 9:
          updated.launchpad_complete = true;
          updated.completed_at = new Date().toISOString();
          break;
      }
      
      // Advance to next step if completing current step
      if (step === updated.current_step && step < 9) {
        updated.current_step = step + 1;
      } else if (step === 9) {
        updated.current_step = 9;
      }
      
      return updated;
    });
    
    setIsCompleting(false);
    
    // Return reward info
    const rewards = STEP_REWARDS[step as keyof typeof STEP_REWARDS] || { xp: 0, tokens: 0, unlock: null };
    return {
      success: true,
      step,
      xp_awarded: rewards.xp,
      tokens_awarded: rewards.tokens,
      feature_unlocked: 'unlock' in rewards ? rewards.unlock : null,
    };
  }, []);

  const resetJourney = useCallback(() => {
    setProgress(getDefaultProgress());
    
    // Clear all guest localStorage data
    try {
      const keysToRemove = [
        `${STORAGE_PREFIX}progress`,
        `${STORAGE_PREFIX}introspection`,
        `${STORAGE_PREFIX}life_plan`,
        `${STORAGE_PREFIX}step_1`,
        `${STORAGE_PREFIX}step_2`,
        `${STORAGE_PREFIX}step_3`,
        `${STORAGE_PREFIX}step_4`,
        `${STORAGE_PREFIX}step_5`,
        `${STORAGE_PREFIX}step_6`,
        `${STORAGE_PREFIX}step_7`,
        `${STORAGE_PREFIX}step_8`,
        `${STORAGE_PREFIX}step_9`,
        `${STORAGE_PREFIX}personal_profile`,
        `${STORAGE_PREFIX}first_week`,
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('Error clearing guest localStorage:', e);
    }
  }, []);

  // Get all guest data for AI analysis
  const getGuestData = useCallback(() => {
    const result: Record<string, unknown> = {
      welcomeQuiz: {},
      personalProfile: {},
      introspection: {},
      lifePlan: {},
      focusAreas: [],
      firstWeek: {},
    };

    try {
      // Welcome quiz (step 1)
      if (progress.step_1_intention) {
        try {
          result.welcomeQuiz = typeof progress.step_1_intention === 'string' 
            ? JSON.parse(progress.step_1_intention) 
            : progress.step_1_intention;
        } catch {
          result.welcomeQuiz = { intention: progress.step_1_intention };
        }
      }

      // Personal profile (step 2)
      if (progress.step_2_profile_data) {
        result.personalProfile = progress.step_2_profile_data;
      }

      // First chat transcript (step 4)
      if (progress.step_2_summary) {
        try {
          result.firstChatTranscript = typeof progress.step_2_summary === 'string'
            ? JSON.parse(progress.step_2_summary)
            : progress.step_2_summary;
        } catch {
          result.firstChatTranscript = { summary: progress.step_2_summary };
        }
      }

      // Introspection (step 5)
      const introspection = localStorage.getItem(`${STORAGE_PREFIX}introspection`);
      if (introspection) {
        result.introspection = JSON.parse(introspection);
      }

      // Life plan (step 6)
      const lifePlan = localStorage.getItem(`${STORAGE_PREFIX}life_plan`);
      if (lifePlan) {
        result.lifePlan = JSON.parse(lifePlan);
      }

      // Focus areas (step 7)
      result.selectedFocusAreas = progress.step_5_focus_areas_selected || [];

      // First week (step 8)
      if (progress.step_6_actions) {
        result.firstWeekActions = progress.step_6_actions;
      }
    } catch (e) {
      console.error('Error getting guest data:', e);
    }

    return result;
  }, [progress]);

  const actualCurrentStep = progress.current_step || 1;
  const currentPhase = getPhaseForStep(actualCurrentStep);
  const completionPercentage = Math.round(((actualCurrentStep - 1) / 9) * 100);
  const completedSteps = actualCurrentStep - 1;

  const isStepAccessible = (stepNumber: number): boolean => {
    return stepNumber <= actualCurrentStep;
  };

  const isStepCompleted = (stepNumber: number): boolean => {
    return (progress.current_step || 1) > stepNumber;
  };

  const currentStepMeta = STEPS.find(s => s.id === actualCurrentStep);

  const getStepRewards = (stepNumber: number) => {
    return STEP_REWARDS[stepNumber as keyof typeof STEP_REWARDS] || { xp: 0, tokens: 0, unlock: null };
  };

  return {
    progress,
    isLoading,
    error: null,
    completeStep,
    isCompleting,
    resetJourney,
    isResetting: false,
    completionPercentage,
    completedSteps,
    totalSteps: 9,
    isStepAccessible,
    isStepCompleted,
    isLaunchpadComplete: progress.launchpad_complete,
    currentStep: actualCurrentStep,
    currentPhase,
    currentStepMeta,
    steps: STEPS,
    phases: PHASES,
    getStepRewards,
    getPhaseForStep,
    isLastStepInPhase,
    isFirstStepInPhase,
    getGuestData,
  };
}
