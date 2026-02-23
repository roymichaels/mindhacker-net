/**
 * usePillarAccess — Manages pillar selection and access based on subscription tier.
 * Free: 1 core + 1 arena (user picks)
 * Plus: 3 core + 3 arena (user picks)
 * Apex: all pillars, auto-adds on assessment
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionGate } from './useSubscriptionGate';
import { TIER_PILLAR_LIMITS, type SubscriptionTier } from '@/lib/subscriptionTiers';
import { CORE_DOMAINS, ARENA_DOMAINS } from '@/navigation/lifeDomains';
import { useCallback } from 'react';

export interface SelectedPillars {
  core: string[];
  arena: string[];
}

const ALL_CORE_IDS = CORE_DOMAINS.map(d => d.id);
const ALL_ARENA_IDS = ARENA_DOMAINS.map(d => d.id);

export function usePillarAccess() {
  const { user } = useAuth();
  const { tier, isApex } = useSubscriptionGate();
  const queryClient = useQueryClient();
  const limits = TIER_PILLAR_LIMITS[tier];

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
        return { core: ALL_CORE_IDS, arena: ALL_ARENA_IDS };
      }
      return { core: sp.core || [], arena: sp.arena || [] };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const updateSelection = useMutation({
    mutationFn: async (newSelection: SelectedPillars) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Enforce limits
      const coreSlice = newSelection.core.slice(0, limits.core);
      const arenaSlice = newSelection.arena.slice(0, limits.arena);
      
      const { error } = await supabase
        .from('profiles')
        .update({ selected_pillars: { core: coreSlice, arena: arenaSlice } })
        .eq('id', user.id);
      if (error) throw error;
      return { core: coreSlice, arena: arenaSlice };
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

  const canSelectMore = useCallback((hub: 'core' | 'arena'): boolean => {
    if (isApex) return true;
    if (!selectedPillars) return true;
    const current = hub === 'core' ? selectedPillars.core : selectedPillars.arena;
    return current.length < limits[hub];
  }, [selectedPillars, limits, isApex]);

  const togglePillar = useCallback(async (pillarId: string, hub: 'core' | 'arena') => {
    if (isApex) return; // Apex has all pillars
    
    const current = selectedPillars || { core: [], arena: [] };
    const hubPillars = hub === 'core' ? [...current.core] : [...current.arena];
    
    const idx = hubPillars.indexOf(pillarId);
    if (idx >= 0) {
      hubPillars.splice(idx, 1);
    } else {
      if (hubPillars.length >= limits[hub]) return; // at limit
      hubPillars.push(pillarId);
    }
    
    const newSelection = hub === 'core'
      ? { core: hubPillars, arena: current.arena }
      : { core: current.core, arena: hubPillars };
    
    await updateSelection.mutateAsync(newSelection);
  }, [selectedPillars, limits, isApex, updateSelection]);

  // Add a single pillar (used by Apex auto-add on assessment)
  const addPillar = useCallback(async (pillarId: string, hub: 'core' | 'arena') => {
    const current = selectedPillars || { core: [], arena: [] };
    const hubPillars = hub === 'core' ? [...current.core] : [...current.arena];
    if (hubPillars.includes(pillarId)) return;
    hubPillars.push(pillarId);
    
    const newSelection = hub === 'core'
      ? { core: hubPillars, arena: current.arena }
      : { core: current.core, arena: hubPillars };
    
    await updateSelection.mutateAsync(newSelection);
  }, [selectedPillars, updateSelection]);

  const needsSelection = !isApex && selectedPillars && 
    (selectedPillars.core.length === 0 && selectedPillars.arena.length === 0);

  return {
    selectedPillars: selectedPillars || { core: [], arena: [] },
    isLoading,
    isPillarSelected,
    canSelectMore,
    togglePillar,
    addPillar,
    updateSelection,
    limits,
    tier,
    isApex,
    needsSelection,
  };
}
