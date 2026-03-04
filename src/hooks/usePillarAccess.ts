/**
 * usePillarAccess — Manages pillar selection and access based on subscription tier.
 * Free: 2 pillars (user picks)
 * Plus: 6 pillars (user picks)
 * Apex: all 14 pillars
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionGate } from './useSubscriptionGate';
import { TIER_PILLAR_LIMITS, type SubscriptionTier } from '@/lib/subscriptionTiers';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useCallback } from 'react';

export interface SelectedPillars {
  core: string[];
  arena: string[];
}

const ALL_IDS = CORE_DOMAINS.map(d => d.id);

export function usePillarAccess() {
  const { user } = useAuth();
  const { tier, isApex } = useSubscriptionGate();
  const queryClient = useQueryClient();
  const limits = TIER_PILLAR_LIMITS[tier];
  // Total unified limit (core + arena fields combined)
  const totalLimit = limits.core + limits.arena;

  const { data: selectedPillars, isLoading } = useQuery({
    queryKey: ['selected-pillars', user?.id],
    queryFn: async (): Promise<SelectedPillars> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('selected_pillars')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      const sp = (data?.selected_pillars as any) || { core: [], arena: [] };
      
      // Apex gets all pillars automatically
      if (isApex) {
        return { core: ALL_IDS, arena: [] };
      }
      return { core: sp.core || [], arena: sp.arena || [] };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  /** All selected pillar IDs (unified from both arrays) */
  const allSelected = useCallback((): string[] => {
    if (isApex) return ALL_IDS;
    if (!selectedPillars) return [];
    return [...selectedPillars.core, ...selectedPillars.arena];
  }, [selectedPillars, isApex]);

  const updateSelection = useMutation({
    mutationFn: async (newSelection: SelectedPillars) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Enforce total limit
      const all = [...newSelection.core, ...newSelection.arena].slice(0, totalLimit);
      const payload = { core: all, arena: [] as string[] };
      
      const { error } = await supabase
        .from('profiles')
        .update({ selected_pillars: payload })
        .eq('id', user.id);
      if (error) throw error;
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selected-pillars', user?.id] });
    },
  });

  const isPillarSelected = useCallback((pillarId: string): boolean => {
    if (isApex) return true;
    if (!selectedPillars) return false;
    return [...selectedPillars.core, ...selectedPillars.arena].includes(pillarId);
  }, [selectedPillars, isApex]);

  const canSelectMore = useCallback((_hub?: 'core' | 'arena'): boolean => {
    if (isApex) return true;
    if (!selectedPillars) return true;
    const total = selectedPillars.core.length + selectedPillars.arena.length;
    return total < totalLimit;
  }, [selectedPillars, totalLimit, isApex]);

  const togglePillar = useCallback(async (pillarId: string, _hub?: 'core' | 'arena') => {
    if (isApex) return;
    
    const current = selectedPillars || { core: [], arena: [] };
    const all = [...current.core, ...current.arena];
    
    const idx = all.indexOf(pillarId);
    if (idx >= 0) {
      all.splice(idx, 1);
    } else {
      if (all.length >= totalLimit) return; // at limit
      all.push(pillarId);
    }
    
    await updateSelection.mutateAsync({ core: all, arena: [] });
  }, [selectedPillars, totalLimit, isApex, updateSelection]);

  // Add a single pillar (used by Apex auto-add on assessment)
  const addPillar = useCallback(async (pillarId: string, _hub?: 'core' | 'arena') => {
    const current = selectedPillars || { core: [], arena: [] };
    const all = [...current.core, ...current.arena];
    if (all.includes(pillarId)) return;
    all.push(pillarId);
    
    await updateSelection.mutateAsync({ core: all, arena: [] });
  }, [selectedPillars, updateSelection]);

  const selectedCount = (selectedPillars?.core?.length || 0) + (selectedPillars?.arena?.length || 0);
  const needsSelection = !isApex && selectedPillars && selectedCount === 0;

  return {
    selectedPillars: selectedPillars || { core: [], arena: [] },
    isLoading,
    isPillarSelected,
    canSelectMore,
    togglePillar,
    addPillar,
    updateSelection,
    limits,
    totalLimit,
    tier,
    isApex,
    needsSelection,
  };
}
