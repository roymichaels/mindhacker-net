/**
 * usePhaseActions — Auto-triggers generate-phase-actions for current phase milestones
 * that don't yet have mini-milestones. This is the "lazy generation" engine
 * that creates weekly plans one phase at a time.
 */
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';

export function usePhaseActions() {
  const { user } = useAuth();
  const { milestones, currentWeek: currentPhase, plan } = useLifePlanWithMilestones();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const triggeredRef = useRef<Set<string>>(new Set());

  // Get milestones for the current phase
  const currentPhaseMilestones = milestones.filter(m => m.week_number === currentPhase);

  // Check which milestones already have mini-milestones
  const milestoneIds = currentPhaseMilestones.map(m => m.id);

  const { data: existingMinis } = useQuery({
    queryKey: ['phase-minis-check', milestoneIds],
    queryFn: async () => {
      if (milestoneIds.length === 0) return {};
      const { data, error } = await supabase
        .from('mini_milestones')
        .select('milestone_id')
        .in('milestone_id', milestoneIds);
      if (error) throw error;
      // Build a set of milestone IDs that already have minis
      const has: Record<string, boolean> = {};
      for (const row of data || []) {
        has[row.milestone_id] = true;
      }
      return has;
    },
    enabled: milestoneIds.length > 0 && !!user?.id,
    staleTime: 60_000,
  });

  // Auto-trigger generation for milestones without mini-milestones
  useEffect(() => {
    if (!user?.id || !existingMinis || generating) return;

    const needGeneration = currentPhaseMilestones.filter(
      m => !existingMinis[m.id] && !triggeredRef.current.has(m.id)
    );

    if (needGeneration.length === 0) return;

    const generateAll = async () => {
      setGenerating(true);
      try {
        // Generate in parallel (max 3 concurrent to avoid overload)
        const batches: typeof needGeneration[] = [];
        for (let i = 0; i < needGeneration.length; i += 3) {
          batches.push(needGeneration.slice(i, i + 3));
        }

        for (const batch of batches) {
          await Promise.allSettled(
            batch.map(async (milestone) => {
              triggeredRef.current.add(milestone.id);
              try {
                const { error } = await supabase.functions.invoke('generate-phase-actions', {
                  body: { milestone_id: milestone.id, user_id: user.id },
                });
                if (error) console.error(`Phase action generation failed for ${milestone.id}:`, error);
              } catch (err) {
                console.error(`Phase action generation error for ${milestone.id}:`, err);
              }
            })
          );
        }

        // Refresh queries after generation
        queryClient.invalidateQueries({ queryKey: ['phase-minis-check'] });
        queryClient.invalidateQueries({ queryKey: ['weekly-tactical-minis'] });
        queryClient.invalidateQueries({ queryKey: ['daily-queue'] });
        queryClient.invalidateQueries({ queryKey: ['action-items'] });
      } finally {
        setGenerating(false);
      }
    };

    generateAll();
  }, [user?.id, existingMinis, currentPhaseMilestones, generating, queryClient]);

  return {
    generating,
    currentPhase,
    totalMilestones: currentPhaseMilestones.length,
    generatedMilestones: currentPhaseMilestones.filter(m => existingMinis?.[m.id]).length,
  };
}
