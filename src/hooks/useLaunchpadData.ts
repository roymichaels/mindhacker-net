import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

      // Parse the stored data - step_1_intention can be plain text or JSON
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

      return {
        welcomeQuiz,
        personalProfile,
        focusAreas,
        firstWeek,
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
