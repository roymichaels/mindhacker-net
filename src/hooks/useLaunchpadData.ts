import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Milestone {
  id: string;
  week_number: number;
  month_number: number;
  title: string;
  description: string;
  goal: string;
  tasks: string[];
  challenge: string;
  focus_area: string;
  is_completed: boolean;
  xp_reward: number;
  tokens_reward: number;
}

export interface FirstChatData {
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  questionIndex?: number;
  answers?: string[];
  isComplete?: boolean;
}

export interface LaunchpadData {
  welcomeQuiz: Record<string, string | string[]>;
  personalProfile: Record<string, unknown>;
  focusAreas: string[];
  firstWeek: {
    habits_to_quit: string[];
    habits_to_build: string[];
    career_status: string;
    career_goal: string;
  };
  milestones: Milestone[];
  lifePlanId: string | null;
  firstChat: FirstChatData | null;
  deepDive: Record<string, string[]> | null;
  // Form submission IDs for steps 5 & 6
  step_3_form_submission_id: string | null;
  step_4_form_submission_id: string | null;
}

export function useLaunchpadData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['launchpad-data', user?.id],
    queryFn: async (): Promise<LaunchpadData | null> => {
      if (!user?.id) return null;

      const { data: progress, error } = await supabase
        .from('launchpad_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !progress) {
        console.error('Error loading launchpad data:', error);
        return null;
      }

      // Parse the welcome quiz data - step_1_intention can be plain text or JSON
      let welcomeQuiz: Record<string, string | string[]> = {};
      try {
        if (progress.step_1_intention) {
          const intention = progress.step_1_intention;
          if (typeof intention === 'string') {
            // Try to parse as JSON first
            try {
              welcomeQuiz = JSON.parse(intention);
            } catch {
              // If not JSON, treat as plain text intention
              welcomeQuiz = { intention: intention };
            }
          } else if (typeof intention === 'object') {
            welcomeQuiz = intention as Record<string, string | string[]>;
          }
        }
      } catch (e) {
        console.error('Error parsing welcome quiz data:', e);
      }

      const personalProfile = (progress.step_2_profile_data as Record<string, unknown>) || {};
      
      let focusAreas: string[] = [];
      try {
        if (progress.step_5_focus_areas_selected) {
          focusAreas = Array.isArray(progress.step_5_focus_areas_selected)
            ? progress.step_5_focus_areas_selected as string[]
            : [];
        }
      } catch (e) {
        console.error('Error parsing focus areas:', e);
      }

      let firstWeek = {
        habits_to_quit: [] as string[],
        habits_to_build: [] as string[],
        career_status: '',
        career_goal: '',
      };
      try {
        if (progress.step_6_actions) {
          const actions = progress.step_6_actions as Record<string, unknown>;
          firstWeek = {
            habits_to_quit: (actions.habits_to_quit as string[]) || [],
            habits_to_build: (actions.habits_to_build as string[]) || [],
            career_status: (actions.career_status as string) || '',
            career_goal: (actions.career_goal as string) || '',
          };
        }
      } catch (e) {
        console.error('Error parsing first week data:', e);
      }

      // Parse the first chat data (step 4)
      let firstChat: FirstChatData | null = null;
      try {
        if (progress.step_2_summary) {
          const summary = progress.step_2_summary;
          if (typeof summary === 'string') {
            try {
              firstChat = JSON.parse(summary);
            } catch {
              // Old format - just a summary string, not JSON
              firstChat = null;
            }
          } else if (typeof summary === 'object') {
            firstChat = summary as FirstChatData;
          }
        }
      } catch (e) {
        console.error('Error parsing first chat data:', e);
      }

      // Parse deep dive data (step 3) - stored in profile_data.deep_dive
      let deepDive: Record<string, string[]> | null = null;
      try {
        const profileDeepDive = (personalProfile as Record<string, unknown>)?.deep_dive;
        if (profileDeepDive && typeof profileDeepDive === 'object') {
          const dd = profileDeepDive as Record<string, unknown>;
          if (dd.answers && typeof dd.answers === 'object') {
            deepDive = dd.answers as Record<string, string[]>;
          }
        }
      } catch (e) {
        console.error('Error parsing deep dive data:', e);
      }

      // Fetch the transformation plan (milestones)
      let milestones: Milestone[] = [];
      let lifePlanId: string | null = null;
      try {
        // First get the life plan
        const { data: lifePlan } = await supabase
          .from('life_plans')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (lifePlan) {
          lifePlanId = lifePlan.id;
          
          // Then get the milestones
          const { data: milestonesData } = await supabase
            .from('life_plan_milestones')
            .select('*')
            .eq('plan_id', lifePlan.id)
            .order('week_number', { ascending: true });

          if (milestonesData) {
            milestones = milestonesData.map(m => ({
              id: m.id,
              week_number: m.week_number,
              month_number: m.month_number,
              title: m.title,
              description: m.description || '',
              goal: m.goal || '',
              tasks: (m.tasks as string[]) || [],
              challenge: m.challenge || '',
              focus_area: m.focus_area || '',
              is_completed: m.is_completed || false,
              xp_reward: m.xp_reward || 0,
              tokens_reward: m.tokens_reward || 0,
            }));
          }
        }
      } catch (e) {
        console.error('Error fetching milestones:', e);
      }

      return {
        welcomeQuiz,
        personalProfile,
        focusAreas,
        firstWeek,
        milestones,
        lifePlanId,
        firstChat,
        deepDive,
        step_3_form_submission_id: progress.step_3_form_submission_id || null,
        step_4_form_submission_id: progress.step_4_form_submission_id || null,
      };
    },
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<{
      welcomeQuiz: Record<string, string | string[]>;
      personalProfile: Record<string, unknown>;
      focusAreas: string[];
      firstWeek: Record<string, unknown>;
    }>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (data.welcomeQuiz !== undefined) {
        updates.step_1_intention = JSON.stringify(data.welcomeQuiz);
      }
      if (data.personalProfile !== undefined) {
        updates.step_2_profile_data = data.personalProfile;
      }
      if (data.focusAreas !== undefined) {
        updates.step_5_focus_areas_selected = data.focusAreas;
      }
      if (data.firstWeek !== undefined) {
        updates.step_6_actions = data.firstWeek;
      }

      const { error } = await supabase
        .from('launchpad_progress')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launchpad-data', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating launchpad data:', error);
      toast.error('שגיאה בשמירת הנתונים');
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateData: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
