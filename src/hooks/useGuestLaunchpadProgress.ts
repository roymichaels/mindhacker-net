import { useState, useEffect, useCallback } from 'react';
import { STEPS, PHASES, STEP_REWARDS, Phase, getPhaseForStep, isLastStepInPhase, isFirstStepInPhase } from './useLaunchpadProgress';

const STORAGE_PREFIX = 'guest_launchpad_';

export interface GuestLaunchpadProgress {
  current_step: number;
  step_1_intention: string | null;
  step_2_profile_data: Record<string, unknown> | null;
  step_3_lifestyle_data: Record<string, unknown> | null;
  step_4_growth_data: Record<string, unknown> | null;
  step_5_chat_summary: string | null;
  step_6_introspection_data: Record<string, unknown> | null;
  step_7_life_plan_data: Record<string, unknown> | null;
  step_8_focus_areas: string[];
  step_9_first_week_actions: Record<string, unknown> | null;
  step_10_final_notes: string | null;
  launchpad_complete: boolean;
  completed_at: string | null;
}

export interface GuestStepCompletionData {
  intention?: string;
  profile_data?: Record<string, unknown>;
  lifestyle_data?: Record<string, unknown>;
  growth_data?: Record<string, unknown>;
  summary?: string;
  form_data?: Record<string, unknown>;
  focus_areas?: string[];
  actions?: Record<string, unknown>;
  final_notes?: string;
}

const TOTAL_STEPS = 11;

const getDefaultProgress = (): GuestLaunchpadProgress => ({
  current_step: 1,
  step_1_intention: null,
  step_2_profile_data: null,
  step_3_lifestyle_data: null,
  step_4_growth_data: null,
  step_5_chat_summary: null,
  step_6_introspection_data: null,
  step_7_life_plan_data: null,
  step_8_focus_areas: [],
  step_9_first_week_actions: null,
  step_10_final_notes: null,
  launchpad_complete: false,
  completed_at: null,
});

export function useGuestLaunchpadProgress() {
  const [progress, setProgress] = useState<GuestLaunchpadProgress>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}progress`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migration: if old 9-step progress, convert to 11-step
        if (parsed.current_step && !parsed.step_3_lifestyle_data && parsed.step_3_form_submission_id !== undefined) {
          // Old format detected - reset to default
          return getDefaultProgress();
        }
        return { ...getDefaultProgress(), ...parsed };
      }
      return getDefaultProgress();
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
      
      // Update step-specific data - same structure as LaunchpadFlow
      // Phase 1 (Who you are): 1-Welcome, 2-Profile, 3-LifestyleRoutine
      // Phase 2 (What's not working): 4-GrowthDeepDive, 5-FirstChat, 6-Introspection, 7-LifePlan
      // Phase 3 (Who you want to be): 8-FocusAreas, 9-FirstWeek, 10-FinalNotes, 11-Dashboard
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
        case 3:
          if (data?.lifestyle_data) {
            updated.step_3_lifestyle_data = data.lifestyle_data;
          }
          break;
        case 4:
          if (data?.growth_data) {
            updated.step_4_growth_data = data.growth_data;
          }
          break;
        case 5:
          if (data?.summary) {
            updated.step_5_chat_summary = data.summary;
          }
          break;
        case 6:
          if (data?.form_data) {
            updated.step_6_introspection_data = data.form_data;
            try {
              localStorage.setItem(`${STORAGE_PREFIX}introspection`, JSON.stringify(data.form_data));
            } catch {}
          }
          break;
        case 7:
          if (data?.form_data) {
            updated.step_7_life_plan_data = data.form_data;
            try {
              localStorage.setItem(`${STORAGE_PREFIX}life_plan`, JSON.stringify(data.form_data));
            } catch {}
          }
          break;
        case 8:
          if (data?.focus_areas) {
            updated.step_8_focus_areas = data.focus_areas;
          }
          break;
        case 9:
          if (data?.actions) {
            updated.step_9_first_week_actions = data.actions;
          }
          break;
        case 10:
          if (data?.final_notes) {
            updated.step_10_final_notes = data.final_notes;
          }
          break;
        case 11:
          updated.launchpad_complete = true;
          updated.completed_at = new Date().toISOString();
          break;
      }
      
      // Advance to next step if completing current step
      if (step === updated.current_step && step < TOTAL_STEPS) {
        updated.current_step = step + 1;
      } else if (step === TOTAL_STEPS) {
        updated.current_step = TOTAL_STEPS;
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
        `${STORAGE_PREFIX}step_10`,
        `${STORAGE_PREFIX}step_11`,
        `${STORAGE_PREFIX}personal_profile`,
        `${STORAGE_PREFIX}lifestyle_routine`,
        `${STORAGE_PREFIX}first_week`,
        `${STORAGE_PREFIX}final_notes`,
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
      lifestyleRoutine: {},
      growthDeepDive: {},
      firstChatTranscript: {},
      introspection: {},
      lifePlan: {},
      focusAreas: [],
      firstWeekActions: {},
      finalNotes: '',
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

      // Lifestyle routine (step 3)
      if (progress.step_3_lifestyle_data) {
        result.lifestyleRoutine = progress.step_3_lifestyle_data;
      }

      // Growth deep dive (step 4)
      if (progress.step_4_growth_data) {
        result.growthDeepDive = progress.step_4_growth_data;
      }

      // First chat transcript (step 5)
      if (progress.step_5_chat_summary) {
        try {
          result.firstChatTranscript = typeof progress.step_5_chat_summary === 'string'
            ? JSON.parse(progress.step_5_chat_summary)
            : progress.step_5_chat_summary;
        } catch {
          result.firstChatTranscript = { summary: progress.step_5_chat_summary };
        }
      }

      // Introspection (step 6)
      if (progress.step_6_introspection_data) {
        result.introspection = progress.step_6_introspection_data;
      } else {
        const introspection = localStorage.getItem(`${STORAGE_PREFIX}introspection`);
        if (introspection) {
          result.introspection = JSON.parse(introspection);
        }
      }

      // Life plan (step 7)
      if (progress.step_7_life_plan_data) {
        result.lifePlan = progress.step_7_life_plan_data;
      } else {
        const lifePlan = localStorage.getItem(`${STORAGE_PREFIX}life_plan`);
        if (lifePlan) {
          result.lifePlan = JSON.parse(lifePlan);
        }
      }

      // Focus areas (step 8)
      result.selectedFocusAreas = progress.step_8_focus_areas || [];

      // First week (step 9)
      if (progress.step_9_first_week_actions) {
        result.firstWeekActions = progress.step_9_first_week_actions;
      }

      // Final notes (step 10)
      if (progress.step_10_final_notes) {
        result.finalNotes = progress.step_10_final_notes;
      }
    } catch (e) {
      console.error('Error getting guest data:', e);
    }

    return result;
  }, [progress]);

  const actualCurrentStep = progress.current_step || 1;
  const currentPhase = getPhaseForStep(actualCurrentStep);
  const completionPercentage = Math.round(((actualCurrentStep - 1) / TOTAL_STEPS) * 100);
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
    totalSteps: TOTAL_STEPS,
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
