/**
 * useSmartOnboardingRedirect — Prevents completed users from being sent back to /onboarding.
 * Instead detects missing pillar quest answers and pops them inline via MissingQuestModal.
 */
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PILLAR_QUESTS, type PillarQuestMeta } from '@/flows/pillarSpecs';

export interface MissingQuest {
  pillarId: string;
  meta: PillarQuestMeta;
}

export function useSmartOnboardingRedirect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [missingQuestModal, setMissingQuestModal] = useState<MissingQuest | null>(null);
  const [missingQuestQueue, setMissingQuestQueue] = useState<MissingQuest[]>([]);

  // Check if user has active plan (= completed onboarding)
  const { data: hasActivePlan } = useQuery({
    queryKey: ['smart-redirect-plan-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('life_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
  });

  // Load pillar quest completion status
  const { data: questStatus } = useQuery({
    queryKey: ['quest-completion-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('launchpad_progress')
        .select('step_2_profile_data, step_3_lifestyle_data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!data) return null;

      const profileData = data.step_2_profile_data as Record<string, unknown> | null;
      const quests = (profileData?.pillar_quests as Record<string, { completed?: boolean; answers?: Record<string, unknown> }>) ?? {};

      // Get selected pillars from lifestyle data
      const lifestyleData = data.step_3_lifestyle_data as Record<string, unknown> | null;
      const selectedPillars = (lifestyleData as any)?.selected_pillars as string[] | undefined;

      const missing: MissingQuest[] = [];
      const pillarList = selectedPillars ?? PILLAR_QUESTS.map(p => p.id);

      for (const pid of pillarList) {
        const meta = PILLAR_QUESTS.find(p => p.id === pid);
        if (!meta) continue;
        const quest = quests[pid];
        if (!quest?.completed) {
          missing.push({ pillarId: pid, meta });
        }
      }

      return { missing };
    },
    enabled: !!user?.id && !!hasActivePlan,
    staleTime: 5 * 60_000,
  });

  /**
   * Smart redirect: if user already completed onboarding (has active plan),
   * go to /now and pop missing quests. Otherwise, go to /onboarding normally.
   */
  const smartNavigate = useCallback(() => {
    if (!hasActivePlan) {
      // User hasn't completed onboarding — send them there
      navigate('/onboarding');
      return;
    }

    // User completed onboarding — go to /now
    const missing = questStatus?.missing ?? [];
    if (missing.length > 0) {
      // Pop the first missing quest, queue the rest
      setMissingQuestQueue(missing.slice(1));
      setMissingQuestModal(missing[0]);
      navigate('/now');
    } else {
      navigate('/now');
    }
  }, [hasActivePlan, questStatus, navigate]);

  const handleQuestModalClose = useCallback(() => {
    if (missingQuestQueue.length > 0) {
      // Pop next quest from queue
      setMissingQuestModal(missingQuestQueue[0]);
      setMissingQuestQueue(prev => prev.slice(1));
    } else {
      setMissingQuestModal(null);
    }
  }, [missingQuestQueue]);

  const dismissAllQuests = useCallback(() => {
    setMissingQuestModal(null);
    setMissingQuestQueue([]);
  }, []);

  return {
    smartNavigate,
    hasActivePlan: !!hasActivePlan,
    missingQuestModal,
    missingQuestQueue,
    handleQuestModalClose,
    dismissAllQuests,
  };
}
