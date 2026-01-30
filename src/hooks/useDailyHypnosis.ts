import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getEgoState, type EgoState } from '@/lib/egoStates';

interface LaunchpadSummary {
  consciousness_analysis?: {
    current_state?: string;
    patterns?: string[];
    strengths?: string[];
    blind_spots?: string[];
  };
  identity_profile?: {
    suggested_ego_state?: string;
    core_values?: string[];
  };
  behavioral_insights?: {
    dominant_patterns?: string[];
    growth_areas?: string[];
  };
}

interface LifePlanMilestone {
  id: string;
  title: string;
  description?: string | null;
  week_number: number;
  is_completed: boolean;
}

interface DailyHypnosisContext {
  egoState: EgoState | null;
  egoStateId: string;
  currentMilestone: LifePlanMilestone | null;
  launchpadSummary: LaunchpadSummary | null;
  suggestedGoal: string;
  isLoading: boolean;
}

export function useDailyHypnosis(): DailyHypnosisContext {
  const { user } = useAuth();
  const [egoStateId, setEgoStateId] = useState<string>('guardian');
  const [currentMilestone, setCurrentMilestone] = useState<LifePlanMilestone | null>(null);
  const [launchpadSummary, setLaunchpadSummary] = useState<LaunchpadSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch profile for active_ego_state
        const { data: profile } = await supabase
          .from('profiles')
          .select('active_ego_state')
          .eq('id', user.id)
          .single();

        // Fetch launchpad summary
        const { data: summary } = await supabase
          .from('launchpad_summaries')
          .select('summary_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Fetch current life plan and milestone
        const { data: lifePlan } = await supabase
          .from('life_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        let milestone: LifePlanMilestone | null = null;
        if (lifePlan?.id) {
          // Get the first incomplete milestone (ordered by week)
          const { data: milestones } = await supabase
            .from('life_plan_milestones')
            .select('id, title, description, week_number, is_completed')
            .eq('plan_id', lifePlan.id)
            .eq('is_completed', false)
            .order('week_number', { ascending: true })
            .limit(1);

          if (milestones && milestones.length > 0) {
            milestone = milestones[0] as unknown as LifePlanMilestone;
          }
        }

        // Determine ego state
        const summaryData = summary?.summary_data as LaunchpadSummary | null;
        const suggestedEgoState = summaryData?.identity_profile?.suggested_ego_state;
        const activeEgoState = profile?.active_ego_state || suggestedEgoState || 'guardian';

        setEgoStateId(activeEgoState);
        setCurrentMilestone(milestone);
        setLaunchpadSummary(summaryData);
      } catch (error) {
        console.error('Error fetching daily hypnosis context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Generate suggested goal based on context
  const generateSuggestedGoal = (): string => {
    if (currentMilestone?.title) {
      return currentMilestone.title;
    }

    if (launchpadSummary?.consciousness_analysis?.current_state) {
      return launchpadSummary.consciousness_analysis.current_state;
    }

    // Fallback based on ego state
    const egoGoals: Record<string, string> = {
      guardian: 'חיזוק תחושת הביטחון הפנימי',
      healer: 'טיפוח אהבה עצמית וריפוי רגשי',
      mystic: 'חיבור לחוכמה פנימית עמוקה',
      visionary: 'בהירות חזון והגשמת מטרות',
      warrior: 'אומץ ונחישות לפעולה',
      rebel: 'שחרור מוגבלות והתעוררות אותנטית',
      creator: 'פתיחת הפוטנציאל היצירתי',
      sage: 'בהירות מחשבתית ותובנות',
      lover: 'פתיחת הלב וחיבור עמוק',
      innocent: 'שמחה ורעננות פנימית',
      explorer: 'גילוי אופקים חדשים',
      jester: 'קלילות ושחרור',
      ruler: 'שליטה עצמית ומנהיגות',
    };

    return egoGoals[egoStateId] || 'התפתחות אישית והתעלות';
  };

  const egoState = getEgoState(egoStateId);

  return {
    egoState,
    egoStateId,
    currentMilestone,
    launchpadSummary,
    suggestedGoal: generateSuggestedGoal(),
    isLoading,
  };
}
