import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface LaunchpadProgress {
  id: string;
  user_id: string;
  step_1_welcome: boolean;
  step_1_intention: string | null;
  step_1_completed_at: string | null;
  // Step 2: Personal Profile (NEW!)
  step_2_profile: boolean;
  step_2_profile_data: Record<string, unknown> | null;
  step_2_profile_completed_at: string | null;
  // Step 3: First Chat (was step 2)
  step_2_first_chat: boolean; // DB column name unchanged
  step_2_summary: string | null;
  step_2_completed_at: string | null;
  // Step 4: Introspection (was step 3)
  step_3_introspection: boolean;
  step_3_form_submission_id: string | null;
  step_3_completed_at: string | null;
  // Step 5: Life Plan (was step 4)
  step_4_life_plan: boolean;
  step_4_form_submission_id: string | null;
  step_4_completed_at: string | null;
  // Step 6: Focus Areas (was step 5)
  step_5_focus_areas: boolean;
  step_5_focus_areas_selected: string[];
  step_5_completed_at: string | null;
  // Step 7: First Week (was step 6)
  step_6_first_week: boolean;
  step_6_actions: string[];
  step_6_anchor_habit: string | null;
  step_6_completed_at: string | null;
  // Step 8: Dashboard Activation (was step 7)
  step_7_dashboard_activated: boolean;
  step_7_completed_at: string | null;
  current_step: number;
  launchpad_complete: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StepCompletionData {
  intention?: string;
  profile_data?: Record<string, unknown>;
  summary?: string;
  form_submission_id?: string;
  focus_areas?: string[];
  actions?: string[];
  anchor_habit?: string;
}

export interface StepCompletionResult {
  success: boolean;
  step: number;
  xp_awarded: number;
  tokens_awarded: number;
  feature_unlocked: string | null;
}

// Phase definitions
export interface Phase {
  id: 1 | 2 | 3;
  key: 'who_you_are' | 'whats_not_working' | 'who_you_want_to_be';
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  color: string;
  steps: number[];
}

export const PHASES: Phase[] = [
  {
    id: 1,
    key: 'who_you_are',
    title: 'מי אתה עכשיו?',
    titleEn: 'Who Are You Now?',
    description: 'נלמד על המצב הנוכחי שלך',
    descriptionEn: 'Let\'s learn about your current state',
    icon: '🔍',
    color: 'blue',
    steps: [1, 2],
  },
  {
    id: 2,
    key: 'whats_not_working',
    title: 'מה לא עובד?',
    titleEn: 'What\'s Not Working?',
    description: 'נזהה את החסמים והדפוסים שמעכבים אותך',
    descriptionEn: 'Identify blockers and patterns holding you back',
    icon: '⚠️',
    color: 'amber',
    steps: [3, 4, 5, 6],
  },
  {
    id: 3,
    key: 'who_you_want_to_be',
    title: 'מי אתה רוצה להיות?',
    titleEn: 'Who Do You Want to Be?',
    description: 'בונים את החזון והזהות החדשה שלך',
    descriptionEn: 'Build your vision and new identity',
    icon: '🚀',
    color: 'emerald',
    steps: [7, 8, 9],
  },
];

// XP and tokens for each step (now 9 steps)
export const STEP_REWARDS = {
  1: { xp: 25, tokens: 0, unlock: 'personal_profile' },
  2: { xp: 40, tokens: 5, unlock: 'growth_deep_dive' },
  3: { xp: 35, tokens: 0, unlock: 'aurora_chat_basic' },
  4: { xp: 50, tokens: 0, unlock: 'introspection_questionnaire' },
  5: { xp: 50, tokens: 5, unlock: 'introspection_complete' },
  6: { xp: 100, tokens: 10, unlock: 'life_plan_complete' },
  7: { xp: 50, tokens: 0, unlock: 'focus_areas_selection' },
  8: { xp: 75, tokens: 0, unlock: 'first_week_planning' },
  9: { xp: 100, tokens: 25, unlock: 'life_os_complete' },
};

// Step metadata (now 9 steps with phase info)
// PHASE 1: Who Are You Now? (Steps 1-2)
// PHASE 2: What's Not Working? (Steps 3-6)
// PHASE 3: Who Do You Want to Be? (Steps 7-9)
export const STEPS = [
  // === PHASE 1: מי אתה עכשיו? ===
  {
    id: 1,
    key: 'welcome',
    phase: 1 as const,
    title: 'ברוך הבא',
    titleEn: 'Welcome',
    subtitle: 'מה מטריד אותך?',
    subtitleEn: 'What\'s on your mind?',
    description: 'ספר לנו מה אתה רוצה שיקרה בחיים שלך',
    descriptionEn: 'Tell us what you want to happen in your life',
    icon: '👋',
  },
  {
    id: 2,
    key: 'personal_profile',
    phase: 1 as const,
    title: 'פרופיל אישי',
    titleEn: 'Personal Profile',
    subtitle: 'מי אתה היום?',
    subtitleEn: 'Who are you today?',
    description: 'ספר לנו על ההרגלים והאורח חיים שלך כיום',
    descriptionEn: 'Tell us about your current habits and lifestyle',
    icon: '👤',
  },
  // === PHASE 2: מה לא עובד? ===
  {
    id: 3,
    key: 'growth_deep_dive',
    phase: 2 as const,
    title: 'העמקה אישית',
    titleEn: 'Personal Deep Dive',
    subtitle: 'מה לא עובד?',
    subtitleEn: 'What\'s not working?',
    description: 'נעמיק בתחומים שאתה רוצה לשפר',
    descriptionEn: 'Dive deeper into areas you want to improve',
    icon: '🔍',
  },
  {
    id: 4,
    key: 'first_chat',
    phase: 2 as const,
    title: 'שיחה ראשונה',
    titleEn: 'First Chat',
    subtitle: 'מה מפריע לך?',
    subtitleEn: 'What bothers you?',
    description: 'שיחה עם Aurora על התסכולים והאתגרים',
    descriptionEn: 'Chat with Aurora about your frustrations and challenges',
    icon: '💬',
  },
  {
    id: 5,
    key: 'introspection',
    phase: 2 as const,
    title: 'התבוננות פנימית',
    titleEn: 'Introspection',
    subtitle: 'דפוסים שליליים',
    subtitleEn: 'Negative patterns',
    description: 'זיהוי דפוסים שחוזרים על עצמם ומגבילים אותך',
    descriptionEn: 'Identify recurring patterns that limit you',
    icon: '🧘',
  },
  {
    id: 6,
    key: 'life_plan',
    phase: 2 as const,
    title: 'חזון וכיוון',
    titleEn: 'Vision & Direction',
    subtitle: 'לאן אתה הולך?',
    subtitleEn: 'Where are you going?',
    description: 'בניית חזון ומטרות ל-3 שנים, שנה, ו-90 ימים',
    descriptionEn: 'Build vision and goals for 3 years, 1 year, and 90 days',
    icon: '🎯',
  },
  // === PHASE 3: מי אתה רוצה להיות? ===
  {
    id: 7,
    key: 'focus_areas',
    phase: 3 as const,
    title: 'תחומי פוקוס',
    titleEn: 'Focus Areas',
    subtitle: 'על מה להתמקד?',
    subtitleEn: 'What to focus on?',
    description: 'בחר 3 תחומים שאתה רוצה להתמקד בהם',
    descriptionEn: 'Choose 3 areas you want to focus on',
    icon: '🎪',
  },
  {
    id: 8,
    key: 'first_week',
    phase: 3 as const,
    title: 'שבוע ראשון',
    titleEn: 'First Week',
    subtitle: 'תוכנית פעולה',
    subtitleEn: 'Action plan',
    description: 'הגדר 3 פעולות והרגל עוגן לשבוע הראשון',
    descriptionEn: 'Set 3 actions and an anchor habit for your first week',
    icon: '📅',
  },
  {
    id: 9,
    key: 'dashboard_activation',
    phase: 3 as const,
    title: 'הפעלת הדשבורד',
    titleEn: 'Dashboard Activation',
    subtitle: 'התחלת המסע',
    subtitleEn: 'Start your journey',
    description: 'Aurora מוכנה לבנות את מודל החיים שלך',
    descriptionEn: 'Aurora is ready to build your life model',
    icon: '🚀',
  },
];

// Get phase by step number
export function getPhaseForStep(stepNumber: number): Phase | undefined {
  return PHASES.find(phase => phase.steps.includes(stepNumber));
}

// Check if step is last in its phase (for showing transition screen)
export function isLastStepInPhase(stepNumber: number): boolean {
  const phase = getPhaseForStep(stepNumber);
  if (!phase) return false;
  return phase.steps[phase.steps.length - 1] === stepNumber;
}

// Check if step is first in its phase (for showing phase intro)
export function isFirstStepInPhase(stepNumber: number): boolean {
  const phase = getPhaseForStep(stepNumber);
  if (!phase) return false;
  return phase.steps[0] === stepNumber;
}

export function useLaunchpadProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch launchpad progress
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['launchpad-progress', user?.id],
    queryFn: async (): Promise<LaunchpadProgress | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('launchpad_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no progress exists, create it
      if (!data) {
        const { data: newProgress, error: insertError } = await supabase
          .from('launchpad_progress')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newProgress as LaunchpadProgress;
      }
      
      return data as LaunchpadProgress;
    },
    enabled: !!user?.id,
  });

  // Calculate the ACTUAL current step based on what's completed
  // This handles legacy users who completed old steps before new steps were added
  const calculateActualCurrentStep = (): number => {
    if (!progress) return 1;
    
    // The current_step field in DB accurately tracks where user is
    // It's updated by the complete_launchpad_step function
    return progress.current_step || 1;
  };

  const actualCurrentStep = calculateActualCurrentStep();
  const currentPhase = getPhaseForStep(actualCurrentStep);

  // Helper to safely serialize data for JSON (removes circular refs, DOM nodes, etc.)
  const safeSerialize = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') return obj;
    if (Array.isArray(obj)) return obj.map(safeSerialize);
    if (typeof obj === 'object') {
      // Skip DOM nodes, React Fiber nodes, etc.
      if (obj instanceof Element || obj instanceof Node) return undefined;
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
  };

  // Complete step mutation
  const completeStepMutation = useMutation({
    mutationFn: async ({ step, data }: { step: number; data?: StepCompletionData }): Promise<StepCompletionResult> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Safely serialize data to avoid circular reference errors
      const safeData = safeSerialize(data || {}) as Record<string, unknown>;

      const { data: result, error } = await supabase
        .rpc('complete_launchpad_step', {
          p_user_id: user.id,
          p_step: step,
          p_data: safeData as Json,
        });

      if (error) throw error;
      return result as unknown as StepCompletionResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['launchpad-progress'] });
      queryClient.invalidateQueries({ queryKey: ['game-state'] });
      queryClient.invalidateQueries({ queryKey: ['feature-unlocks'] });
      
      if (result.xp_awarded > 0) {
        toast.success(`+${result.xp_awarded} XP`, {
          description: result.tokens_awarded > 0 
            ? `+${result.tokens_awarded} טוקנים` 
            : undefined,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to complete step:', error);
      toast.error('שגיאה בהשלמת השלב');
    },
  });

  // Calculate completion percentage (now 9 steps)
  const completionPercentage = progress ? 
    Math.round(((actualCurrentStep - 1) / 9) * 100) : 0;

  // Get completed steps count
  const completedSteps = progress ? actualCurrentStep - 1 : 0;

  // Check if a step is accessible
  const isStepAccessible = (stepNumber: number): boolean => {
    if (!progress) return stepNumber === 1;
    return stepNumber <= actualCurrentStep;
  };

  // Check if a specific step is completed based on current_step progression
  const isStepCompleted = (stepNumber: number): boolean => {
    if (!progress) return false;
    // A step is completed if current_step is greater than it
    return (progress.current_step || 1) > stepNumber;
  };

  // Check if launchpad is truly complete (all 9 steps done)
  const isActuallyComplete = progress?.launchpad_complete || false;

  // Get current step metadata
  const currentStepMeta = STEPS.find(s => s.id === actualCurrentStep);

  // Get step rewards
  const getStepRewards = (stepNumber: number) => {
    return STEP_REWARDS[stepNumber as keyof typeof STEP_REWARDS] || { xp: 0, tokens: 0, unlock: null };
  };

  return {
    progress,
    isLoading,
    error,
    completeStep: completeStepMutation.mutate,
    isCompleting: completeStepMutation.isPending,
    completionPercentage,
    completedSteps,
    totalSteps: 9,
    isStepAccessible,
    isStepCompleted,
    isLaunchpadComplete: isActuallyComplete,
    currentStep: actualCurrentStep,
    currentPhase,
    currentStepMeta,
    steps: STEPS,
    phases: PHASES,
    getStepRewards,
    getPhaseForStep,
    isLastStepInPhase,
    isFirstStepInPhase,
  };
}
