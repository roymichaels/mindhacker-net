import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TransformationPlan {
  habits_to_quit: string[];
  habits_to_build: string[];
  career_status: string;
  career_goal: string;
  career_steps: string[];
  challenge_mission: string;
}

interface ChecklistCreationResult {
  success: boolean;
  checklistsCreated: number;
  totalItems: number;
  xpAwarded: number;
}

/**
 * Hook to create checklists from Launchpad Step 9 (First Week / Transformation Plan)
 */
export function useLaunchpadChecklists() {
  const { user } = useAuth();

  /**
   * Creates checklists from the Transformation Plan data
   */
  const createChecklistsFromPlan = useCallback(async (
    plan: TransformationPlan
  ): Promise<ChecklistCreationResult> => {
    if (!user?.id) {
      return { success: false, checklistsCreated: 0, totalItems: 0, xpAwarded: 0 };
    }

    let checklistsCreated = 0;
    let totalItems = 0;

    try {
      // 1. Create "Habits to Stop" checklist
      if (plan.habits_to_quit.length > 0) {
        const { data: checklist1 } = await supabase
          .from('aurora_checklists')
          .insert({
            user_id: user.id,
            title: '🚫 הרגלים להפסיק',
            origin: 'aurora',
            context: 'launchpad_transformation',
            status: 'active',
          })
          .select()
          .single();

        if (checklist1) {
          const items = plan.habits_to_quit.map((habit, index) => ({
            checklist_id: checklist1.id,
            content: habit,
            is_completed: false,
            order_index: index + 1,
          }));

          await supabase.from('aurora_checklist_items').insert(items);
          checklistsCreated++;
          totalItems += items.length;
        }
      }

      // 2. Create "Habits to Build" checklist
      if (plan.habits_to_build.length > 0) {
        const { data: checklist2 } = await supabase
          .from('aurora_checklists')
          .insert({
            user_id: user.id,
            title: '🏗️ הרגלים לבנות',
            origin: 'aurora',
            context: 'launchpad_transformation',
            status: 'active',
          })
          .select()
          .single();

        if (checklist2) {
          const items = plan.habits_to_build.map((habit, index) => ({
            checklist_id: checklist2.id,
            content: habit,
            is_completed: false,
            order_index: index + 1,
          }));

          await supabase.from('aurora_checklist_items').insert(items);
          checklistsCreated++;
          totalItems += items.length;
        }
      }

      // 3. Create "Career Steps" checklist
      if (plan.career_steps.length > 0) {
        const { data: checklist3 } = await supabase
          .from('aurora_checklists')
          .insert({
            user_id: user.id,
            title: '💼 צעדים לקריירה',
            origin: 'aurora',
            context: 'launchpad_transformation',
            status: 'active',
          })
          .select()
          .single();

        if (checklist3) {
          const items = plan.career_steps.map((step, index) => ({
            checklist_id: checklist3.id,
            content: step,
            is_completed: false,
            order_index: index + 1,
          }));

          await supabase.from('aurora_checklist_items').insert(items);
          checklistsCreated++;
          totalItems += items.length;
        }
      }

      // 4. Create "Weekly Challenge" checklist
      if (plan.challenge_mission) {
        const { data: checklist4 } = await supabase
          .from('aurora_checklists')
          .insert({
            user_id: user.id,
            title: '⚡ אתגרי השבוע',
            origin: 'aurora',
            context: 'launchpad_transformation',
            status: 'active',
          })
          .select()
          .single();

        if (checklist4) {
          await supabase.from('aurora_checklist_items').insert({
            checklist_id: checklist4.id,
            content: plan.challenge_mission,
            is_completed: false,
            order_index: 1,
          });

          checklistsCreated++;
          totalItems++;
        }
      }

      // Award bonus XP for completing transformation plan
      const xpAwarded = 25; // Bonus XP for setting up transformation plan
      if (checklistsCreated > 0) {
        await supabase.rpc('aurora_award_xp', {
          p_user_id: user.id,
          p_amount: xpAwarded,
          p_reason: 'Transformation plan checklists created',
        });
      }

      return { 
        success: true, 
        checklistsCreated, 
        totalItems,
        xpAwarded 
      };
    } catch (error) {
      console.error('Failed to create checklists from plan:', error);
      return { success: false, checklistsCreated: 0, totalItems: 0, xpAwarded: 0 };
    }
  }, [user?.id]);

  return {
    createChecklistsFromPlan,
  };
}
