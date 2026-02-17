import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LaunchpadSummary {
  consciousness_analysis?: {
    current_state?: string;
    patterns?: string[];
    strengths?: string[];
    blind_spots?: string[];
    awareness_level?: string;
  };
  identity_profile?: {
    identity_title?: string;
    core_values?: string[];
    character_archetype?: string;
  };
  behavioral_insights?: {
    dominant_patterns?: string[];
    growth_areas?: string[];
    triggers?: string[];
  };
  life_direction?: {
    central_aspiration?: string;
    life_mission?: string;
  };
  recommended_focus?: {
    immediate?: string;
    short_term?: string;
  };
}

interface LifePlanMilestone {
  id: string;
  title: string;
  description?: string | null;
  week_number: number;
  is_completed: boolean;
}

interface IdentityData {
  jobTitle?: string;
  jobIcon?: string;
  values?: string[];
}

interface DailyHypnosisContext {
  currentMilestone: LifePlanMilestone | null;
  launchpadSummary: LaunchpadSummary | null;
  identityData: IdentityData | null;
  suggestedGoal: string;
  userName: string | null;
  isLoading: boolean;
}

export function useDailyHypnosis(): DailyHypnosisContext {
  const { user } = useAuth();
  const [currentMilestone, setCurrentMilestone] = useState<LifePlanMilestone | null>(null);
  const [launchpadSummary, setLaunchpadSummary] = useState<LaunchpadSummary | null>(null);
  const [identityData, setIdentityData] = useState<IdentityData | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all context data in parallel
        const [summaryRes, lifePlanRes, identityRes, profileRes] = await Promise.all([
          // Launchpad summary
          supabase
            .from('launchpad_summaries')
            .select('summary_data')
            .eq('user_id', user.id)
            .order('generated_at', { ascending: false })
            .limit(1)
            .single(),
          // Life plan
          supabase
            .from('life_plans')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          // Identity elements
          supabase
            .from('aurora_identity_elements')
            .select('element_type, content, metadata')
            .eq('user_id', user.id),
          // Profile for name
          supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single(),
        ]);

        // Extract identity data
        const elements = identityRes.data || [];
        const jobElement = elements.find(e => e.element_type === 'identity_title');
        const values = elements
          .filter(e => e.element_type === 'value')
          .map(e => e.content);
        
        setIdentityData({
          jobTitle: jobElement?.content || undefined,
          jobIcon: (jobElement?.metadata as { icon?: string })?.icon || undefined,
          values: values.length > 0 ? values : undefined,
        });

        // Set user name (extract first name from full_name)
        const fullName = profileRes.data?.full_name;
        setUserName(fullName ? fullName.split(' ')[0] : null);

        // Get milestone
        let milestone: LifePlanMilestone | null = null;
        if (lifePlanRes.data?.id) {
          const { data: milestones } = await supabase
            .from('life_plan_milestones')
            .select('id, title, description, week_number, is_completed')
            .eq('plan_id', lifePlanRes.data.id)
            .eq('is_completed', false)
            .order('week_number', { ascending: true })
            .limit(1);

          if (milestones && milestones.length > 0) {
            milestone = milestones[0] as unknown as LifePlanMilestone;
          }
        }

        const summaryData = summaryRes.data?.summary_data as LaunchpadSummary | null;
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

  // Generate suggested goal based on comprehensive context
  const generateSuggestedGoal = (): string => {
    // Priority 1: Current milestone from 90-day plan
    if (currentMilestone?.title) {
      return currentMilestone.title;
    }

    // Priority 2: Immediate focus from AI analysis
    if (launchpadSummary?.recommended_focus?.immediate) {
      return launchpadSummary.recommended_focus.immediate;
    }

    // Priority 3: Central aspiration from life direction
    if (launchpadSummary?.life_direction?.central_aspiration) {
      return launchpadSummary.life_direction.central_aspiration;
    }

    // Priority 4: First growth area
    if (launchpadSummary?.behavioral_insights?.growth_areas?.[0]) {
      return launchpadSummary.behavioral_insights.growth_areas[0];
    }

    // Priority 5: Current consciousness state
    if (launchpadSummary?.consciousness_analysis?.current_state) {
      return launchpadSummary.consciousness_analysis.current_state;
    }

    // Fallback
    return 'התפתחות אישית והתעלות';
  };

  return {
    currentMilestone,
    launchpadSummary,
    identityData,
    userName,
    suggestedGoal: generateSuggestedGoal(),
    isLoading,
  };
}
