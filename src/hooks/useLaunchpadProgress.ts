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

// XP and tokens for each step (now 10 steps)
export const STEP_REWARDS = {
  1: { xp: 25, tokens: 0, unlock: 'personal_profile' },
  2: { xp: 40, tokens: 5, unlock: 'identity_building' },
  3: { xp: 50, tokens: 5, unlock: 'growth_deep_dive' },
  4: { xp: 35, tokens: 0, unlock: 'aurora_chat_basic' },
  5: { xp: 50, tokens: 0, unlock: 'introspection_questionnaire' },
  6: { xp: 100, tokens: 10, unlock: 'life_plan_questionnaire' },
  7: { xp: 100, tokens: 15, unlock: 'focus_areas_selection' },
  8: { xp: 50, tokens: 0, unlock: 'first_week_planning' },
  9: { xp: 75, tokens: 0, unlock: 'dashboard_full' },
  10: { xp: 100, tokens: 25, unlock: 'life_os_complete' },
};

// Step metadata (now 10 steps)
export const STEPS = [
  {
    id: 1,
    key: 'welcome',
    title: 'ברוך הבא',
    titleEn: 'Welcome',
    description: 'ספר לנו מה אתה רוצה שיקרה בחיים שלך',
    descriptionEn: 'Tell us what you want to happen in your life',
    icon: '👋',
  },
  {
    id: 2,
    key: 'personal_profile',
    title: 'פרופיל אישי',
    titleEn: 'Personal Profile',
    description: 'ספר לנו על ההרגלים והאורח חיים שלך',
    descriptionEn: 'Tell us about your habits and lifestyle',
    icon: '👤',
  },
  {
    id: 3,
    key: 'identity_building',
    title: 'בניית זהות',
    titleEn: 'Build Your Identity',
    description: 'בחר את תכונות האופי שאתה רוצה לפתח',
    descriptionEn: 'Choose the character traits you want to develop',
    icon: '🎭',
  },
  {
    id: 4,
    key: 'growth_deep_dive',
    title: 'העמקה אישית',
    titleEn: 'Personal Deep Dive',
    description: 'נעמיק בתחומי הצמיחה שבחרת',
    descriptionEn: 'Dive deeper into your chosen growth areas',
    icon: '🔍',
  },
  {
    id: 5,
    key: 'first_chat',
    title: 'שיחה ראשונה',
    titleEn: 'First Chat',
    description: 'שיחה קצרה עם Aurora להכרות ראשונית',
    descriptionEn: 'A short chat with Aurora to get to know you',
    icon: '💬',
  },
  {
    id: 6,
    key: 'introspection',
    title: 'מסע התבוננות פנימית',
    titleEn: 'Introspection Journey',
    description: 'שאלון עומק להבנת עצמך',
    descriptionEn: 'Deep questionnaire for self-understanding',
    icon: '🧘',
  },
  {
    id: 7,
    key: 'life_plan',
    title: 'תוכנית חיים',
    titleEn: 'Life Plan',
    description: 'בניית חזון ומטרות ל-3 שנים, שנה, ו-90 ימים',
    descriptionEn: 'Build vision and goals for 3 years, 1 year, and 90 days',
    icon: '🎯',
  },
  {
    id: 8,
    key: 'focus_areas',
    title: 'תחומי פוקוס',
    titleEn: 'Focus Areas',
    description: 'בחר 3 תחומים שאתה רוצה להתמקד בהם',
    descriptionEn: 'Choose 3 areas you want to focus on',
    icon: '🎪',
  },
  {
    id: 9,
    key: 'first_week',
    title: 'שבוע ראשון',
    titleEn: 'First Week',
    description: 'הגדר 3 פעולות והרגל עוגן לשבוע הראשון',
    descriptionEn: 'Set 3 actions and an anchor habit for your first week',
    icon: '📅',
  },
  {
    id: 10,
    key: 'dashboard_activation',
    title: 'הפעלת הדשבורד',
    titleEn: 'Dashboard Activation',
    description: 'Aurora מוכנה לבנות את מודל החיים שלך',
    descriptionEn: 'Aurora is ready to build your life model',
    icon: '🚀',
  },
];

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

  // Complete step mutation
  const completeStepMutation = useMutation({
    mutationFn: async ({ step, data }: { step: number; data?: StepCompletionData }): Promise<StepCompletionResult> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .rpc('complete_launchpad_step', {
          p_user_id: user.id,
          p_step: step,
          p_data: JSON.parse(JSON.stringify(data || {})) as Json,
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

  // Calculate completion percentage (now 10 steps)
  const completionPercentage = progress ? 
    Math.round(((actualCurrentStep - 1) / 10) * 100) : 0;

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
    totalSteps: 10,
    isStepAccessible,
    isStepCompleted,
    isLaunchpadComplete: isActuallyComplete,
    currentStep: actualCurrentStep,
    currentStepMeta,
    steps: STEPS,
    getStepRewards,
  };
}
