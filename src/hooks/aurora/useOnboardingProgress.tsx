import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { QUERY_KEYS } from '@/lib/queryKeys';
import { debug } from '@/lib/debug';

interface OnboardingProgress {
  id: string;
  user_id: string;
  direction_clarity: 'incomplete' | 'emerging' | 'stable';
  identity_understanding: 'shallow' | 'partial' | 'clear';
  energy_patterns_status: 'unknown' | 'partial' | 'mapped';
  onboarding_complete: boolean;
  updated_at: string;
}

export const useOnboardingProgress = () => {
  const { user } = useAuth();

  const { data: onboarding, refetch } = useQuery({
    queryKey: QUERY_KEYS.aurora.onboardingProgress(user?.id ?? ''),
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('aurora_onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        debug.warn('[useOnboardingProgress] Fetch error:', error);
        throw error;
      }
      
      // If no record exists, create one
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('aurora_onboarding_progress')
          .insert({
            user_id: user.id,
            direction_clarity: 'incomplete',
            identity_understanding: 'shallow',
            energy_patterns_status: 'unknown',
            onboarding_complete: false,
          })
          .select()
          .single();
        
        if (insertError) {
          debug.warn('[useOnboardingProgress] Insert error:', insertError);
          throw insertError;
        }
        return newData as OnboardingProgress;
      }
      
      return data as OnboardingProgress;
    },
    enabled: !!user?.id,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('aurora-onboarding-progress-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aurora_onboarding_progress',
          filter: `user_id=eq.${user.id}`,
        },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  // Computed helpers
  const hasDirection = onboarding?.direction_clarity !== 'incomplete';
  const hasIdentity = onboarding?.identity_understanding !== 'shallow';
  const hasEnergy = onboarding?.energy_patterns_status !== 'unknown';
  
  const isLifeModelComplete = 
    onboarding?.direction_clarity === 'stable' &&
    onboarding?.identity_understanding === 'clear' &&
    onboarding?.energy_patterns_status === 'mapped';

  const progressPercentage = (() => {
    if (!onboarding) return 0;
    
    let score = 0;
    
    // Direction: incomplete=0, emerging=15, stable=30
    if (onboarding.direction_clarity === 'emerging') score += 15;
    if (onboarding.direction_clarity === 'stable') score += 30;
    
    // Identity: shallow=0, partial=20, clear=40
    if (onboarding.identity_understanding === 'partial') score += 20;
    if (onboarding.identity_understanding === 'clear') score += 40;
    
    // Energy: unknown=0, partial=15, mapped=30
    if (onboarding.energy_patterns_status === 'partial') score += 15;
    if (onboarding.energy_patterns_status === 'mapped') score += 30;
    
    return score;
  })();

  return {
    onboarding,
    hasDirection,
    hasIdentity,
    hasEnergy,
    isLifeModelComplete,
    progressPercentage,
  };
};
