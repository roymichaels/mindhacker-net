/**
 * Hook to generate MultiThreadOrbProfile from user's launchpad summary
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { supabase } from '@/integrations/supabase/client';
import {
  generateOrbThreads,
  DEFAULT_MULTI_THREAD_PROFILE,
  type MultiThreadOrbProfile,
} from '@/lib/orbDNAThreads';

interface LaunchpadSummaryData {
  identity_profile?: {
    dominant_traits?: string[];
    suggested_ego_state?: string;
    identity_title?: string;
  };
  consciousness_analysis?: {
    dominant_patterns?: string[];
    growth_edges?: string[];
    strengths?: string[];
  };
  behavioral_insights?: {
    habits_to_cultivate?: string[];
    resistance_patterns?: string[];
  };
}

export function useMultiThreadOrbProfile() {
  const { user } = useAuth();
  const { progress } = useLaunchpadProgress();

  // Fetch launchpad summary - use maybeSingle() to avoid 406 when no rows exist
  const { data: launchpadSummary, isLoading } = useQuery({
    queryKey: ['launchpad-summary-threads', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('launchpad_summaries')
        .select('summary_data, consciousness_score, transformation_readiness')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching launchpad summary:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Extract hobbies from profile data
  const hobbies = useMemo(() => {
    const profileData = progress?.step_2_profile_data as Record<string, unknown> | null;
    return (profileData?.hobbies as string[]) || [];
  }, [progress?.step_2_profile_data]);

  // Generate multi-thread profile - always return DEFAULT during loading or when no user
  const multiThreadProfile = useMemo((): MultiThreadOrbProfile => {
    // Always return default if no user or still loading
    if (!user?.id || isLoading) return DEFAULT_MULTI_THREAD_PROFILE;

    const summaryData = launchpadSummary?.summary_data as LaunchpadSummaryData | null;
    const consciousnessScore = (launchpadSummary?.consciousness_score as number) || 50;

    // If no personalized data, return default
    if (!summaryData && hobbies.length === 0) {
      return DEFAULT_MULTI_THREAD_PROFILE;
    }

    return generateOrbThreads(summaryData, hobbies, consciousnessScore);
  }, [user?.id, launchpadSummary, hobbies, isLoading]);

  // Check if user has personalized data
  const isPersonalized = useMemo(() => {
    return !!user?.id && (
      hobbies.length > 0 ||
      !!launchpadSummary?.summary_data
    );
  }, [user?.id, hobbies.length, launchpadSummary?.summary_data]);

  return {
    profile: multiThreadProfile,
    isLoading,
    isPersonalized,
    consciousnessScore: (launchpadSummary?.consciousness_score as number) || 50,
    threadCount: multiThreadProfile.threads.length,
  };
}
