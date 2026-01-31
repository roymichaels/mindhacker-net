import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LaunchpadSummary {
  consciousness_analysis?: {
    current_state?: string;
    patterns?: string[];
    strengths?: string[];
    blind_spots?: string[];
  };
  identity_profile?: {
    identity_title?: string;
    core_values?: string[];
  };
  behavioral_insights?: {
    dominant_patterns?: string[];
    growth_areas?: string[];
  };
  life_direction?: {
    central_aspiration?: string;
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
  currentMilestone: LifePlanMilestone | null;
  launchpadSummary: LaunchpadSummary | null;
  suggestedGoal: string;
  isLoading: boolean;
}

export function useDailyHypnosis(): DailyHypnosisContext {
  const { user } = useAuth();
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
        // Fetch launchpad summary for personalization context
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

        const summaryData = summary?.summary_data as LaunchpadSummary | null;
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

  // Generate suggested goal based on context (profile-based, not ego state)
  const generateSuggestedGoal = (): string => {
    // Priority 1: Current milestone from 90-day plan
    if (currentMilestone?.title) {
      return currentMilestone.title;
    }

    // Priority 2: Central aspiration from life direction
    if (launchpadSummary?.life_direction?.central_aspiration) {
      return launchpadSummary.life_direction.central_aspiration;
    }

    // Priority 3: First growth area
    if (launchpadSummary?.behavioral_insights?.growth_areas?.[0]) {
      return launchpadSummary.behavioral_insights.growth_areas[0];
    }

    // Priority 4: Current consciousness state
    if (launchpadSummary?.consciousness_analysis?.current_state) {
      return launchpadSummary.consciousness_analysis.current_state;
    }

    // Fallback
    return 'התפתחות אישית והתעלות';
  };

  return {
    currentMilestone,
    launchpadSummary,
    suggestedGoal: generateSuggestedGoal(),
    isLoading,
  };
}
