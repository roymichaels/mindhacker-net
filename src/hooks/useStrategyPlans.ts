/**
 * useStrategyPlans — hook for managing 90-day strategy plans.
 * Reads active Core + Arena strategies and provides generation trigger.
 * Includes self-healing: detects incomplete orchestration and auto-fixes.
 */
import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StrategyWeek {
  week: number;
  theme_en: string;
  theme_he: string;
  intensity: string;
  pillar_focus: string[];
  goals_en: string[];
  goals_he: string[];
  daily_actions: {
    pillar: string;
    action_en: string;
    action_he: string;
    duration_min: number;
    block_type: string;
  }[];
}

export interface StrategySubGoal {
  sub_goal_en: string;
  sub_goal_he: string;
  milestones_en: string[];
  milestones_he: string[];
}

export interface StrategyPillarGoal {
  goal_en: string;
  goal_he: string;
  sub_goals?: StrategySubGoal[];
  milestones_en?: string[];
  milestones_he?: string[];
}

export interface StrategyData {
  hub: 'core' | 'arena';
  title_en: string;
  title_he: string;
  vision_en: string;
  vision_he: string;
  weeks?: StrategyWeek[];
  pillars?: Record<string, { goals: StrategyPillarGoal[] }>;
}

export interface StrategyPlan {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  plan_data: { hub: string; strategy: StrategyData };
  status: string;
  progress_percentage: number;
  created_at: string;
}

export function useStrategyPlans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const healingRef = useRef(false);

  const query = useQuery({
    queryKey: ['strategy-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return { core: null, arena: null, _legacyFound: false, _needsHeal: false };

      const { data, error } = await supabase
        .from('life_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const plans = (data || []) as unknown as StrategyPlan[];
      
      // Detect legacy plans (no hub key)
      const legacyPlans = plans.filter(p => !p.plan_data?.hub);
      const hubPlans = plans.filter(p => !!p.plan_data?.hub);
      
      // Take the newest plan per hub; archive duplicates
      const corePlans = hubPlans.filter(p => p.plan_data?.hub === 'core');
      const arenaPlans = hubPlans.filter(p => p.plan_data?.hub === 'arena');
      const core = corePlans[0] || null; // already sorted by created_at DESC
      const arena = arenaPlans[0] || null;
      
      // Auto-archive duplicate plans (keep only newest per hub)
      const duplicateIds = [
        ...corePlans.slice(1).map(p => p.id),
        ...arenaPlans.slice(1).map(p => p.id),
      ];
      if (duplicateIds.length > 0) {
        supabase.from('life_plans').update({ status: 'archived' }).in('id', duplicateIds).then(() => {});
      }
      
      // Self-healing flags
      const hasLegacy = legacyPlans.length > 0;
      const missingHub = (core && !arena) || (!core && arena);
      const needsHeal = hasLegacy || (missingHub && hubPlans.length > 0);

      return { core, arena, _legacyFound: hasLegacy, _needsHeal: needsHeal };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Self-healing effect: auto-archive legacy plans and trigger regeneration
  useEffect(() => {
    if (!query.data || !user?.id || healingRef.current) return;
    const { _legacyFound, _needsHeal, core, arena } = query.data;
    
    if (!_needsHeal && !_legacyFound) return;
    
    // Prevent multiple heal attempts
    healingRef.current = true;
    
    const heal = async () => {
      try {
        // Archive legacy plans first
        if (_legacyFound) {
          const { data: legacies } = await supabase
            .from('life_plans')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .is('plan_data->hub', null);
          
          if (legacies?.length) {
            const ids = legacies.map(l => l.id);
            await supabase.from('life_plans').update({ status: 'archived' }).in('id', ids);
          }
        }
        
        // If missing one or both hubs, trigger generation for the missing hub(s)
        const missingHub = !core && !arena ? 'both' : !core ? 'core' : !arena ? 'arena' : null;
        if (missingHub) {
          await supabase.functions.invoke('generate-90day-strategy', {
            body: {
              user_id: user.id,
              hub: missingHub,
              force_regenerate: false,
            },
          });
          queryClient.invalidateQueries({ queryKey: ['strategy-plans'] });
          queryClient.invalidateQueries({ queryKey: ['milestones'] });
          queryClient.invalidateQueries({ queryKey: ['life-plan'] });
          queryClient.invalidateQueries({ queryKey: ['daily-missions'] });
          queryClient.invalidateQueries({ queryKey: ['daily-milestones'] });
        } else if (_legacyFound) {
          // Just refresh after archiving legacy
          queryClient.invalidateQueries({ queryKey: ['strategy-plans'] });
          queryClient.invalidateQueries({ queryKey: ['life-plan'] });
        }
      } catch (e) {
        console.error('[Self-Heal] Strategy orchestration fix failed:', e);
      }
    };
    
    heal();
  }, [query.data, user?.id]);

  const generateStrategy = useMutation({
    mutationFn: async ({ hub, forceRegenerate, selectedPillars, singlePillar }: { 
      hub?: 'core' | 'arena' | 'both'; 
      forceRegenerate?: boolean;
      selectedPillars?: { core: string[]; arena: string[] };
      singlePillar?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-90day-strategy', {
        body: {
          user_id: user!.id,
          hub: hub || 'both',
          force_regenerate: forceRegenerate || false,
          selected_pillars: selectedPillars,
          single_pillar: singlePillar,
        },
      });

      const buildMissingAssessmentError = (missing: any[] = []) => {
        const missingError = new Error('MISSING_ASSESSMENT_DATA') as any;
        missingError.code = 'MISSING_ASSESSMENT_DATA';
        missingError.missingPillars = missing;
        return missingError;
      };

      const parseMaybeJson = (value: unknown): any | null => {
        if (!value || typeof value !== 'string') return null;

        const trimmed = value.trim();
        try {
          return JSON.parse(trimmed);
        } catch {
          // Fallback: extract first JSON object from noisy strings like
          // "Edge function returned 400: Error, { ... }"
          const firstBrace = trimmed.indexOf('{');
          if (firstBrace < 0) return null;

          let depth = 0;
          let inString = false;
          let escape = false;

          for (let i = firstBrace; i < trimmed.length; i++) {
            const ch = trimmed[i];

            if (escape) {
              escape = false;
              continue;
            }

            if (ch === '\\') {
              escape = true;
              continue;
            }

            if (ch === '"') {
              inString = !inString;
              continue;
            }

            if (inString) continue;

            if (ch === '{') depth++;
            if (ch === '}') {
              depth--;
              if (depth === 0) {
                const candidate = trimmed.slice(firstBrace, i + 1);
                try {
                  return JSON.parse(candidate);
                } catch {
                  return null;
                }
              }
            }
          }

          return null;
        }
      };

      // Primary path: backend returns 200 with error payload for missing assessments
      if (data?.error === 'MISSING_ASSESSMENT_DATA') {
        throw buildMissingAssessmentError(data.missing_pillars || []);
      }

      if (error) {
        const errorAny = error as any;
        const message = typeof errorAny?.message === 'string' ? errorAny.message : String(error);

        // Defensive: handle legacy 400 responses that may still contain the marker
        if (message.includes('MISSING_ASSESSMENT_DATA')) {
          let payload: any = parseMaybeJson(message);
          if (!payload) payload = parseMaybeJson(errorAny?.context?.body);

          if (payload?.missing_pillars) {
            throw buildMissingAssessmentError(payload.missing_pillars);
          }

          // Last resort: regex extract pillar IDs
          const pillarIds = Array.from(message.matchAll(/"pillarId"\s*:\s*"([^"]+)"/g)).map((m) => m[1]);
          throw buildMissingAssessmentError(pillarIds.length > 0 ? pillarIds.map((id) => ({ pillarId: id })) : []);
        }

        throw error;
      }

      return data;
    },
    onSuccess: (data: any) => {
      // Guard: if the response is actually a MISSING_ASSESSMENT_DATA payload, don't celebrate
      if (data?.error === 'MISSING_ASSESSMENT_DATA') return;
      queryClient.invalidateQueries({ queryKey: ['strategy-plans'] });
      queryClient.invalidateQueries({ queryKey: ['now-engine'] });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['life-plan'] });
      queryClient.invalidateQueries({ queryKey: ['daily-missions'] });
      queryClient.invalidateQueries({ queryKey: ['daily-milestones'] });
      toast({
        title: '✅ Strategy generated',
        description: 'Your 90-day plan has been created based on your assessments.',
      });
    },
    onError: (error: any) => {
      // Don't show toast for MISSING_ASSESSMENT_DATA — handled by UI callers
      if (error?.message === 'MISSING_ASSESSMENT_DATA' || error?.code === 'MISSING_ASSESSMENT_DATA') return;
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate strategy',
        variant: 'destructive',
      });
    },
  });

  const getCurrentWeek = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(12, Math.max(1, Math.ceil((diffDays + 1) / 7)));
  };

  const corePlan = query.data?.core;
  const arenaPlan = query.data?.arena;

  return {
    corePlan,
    arenaPlan,
    coreStrategy: corePlan?.plan_data?.strategy as StrategyData | null,
    arenaStrategy: arenaPlan?.plan_data?.strategy as StrategyData | null,
    coreWeek: corePlan ? getCurrentWeek(corePlan.start_date) : null,
    arenaWeek: arenaPlan ? getCurrentWeek(arenaPlan.start_date) : null,
    hasAnyStrategy: !!(corePlan || arenaPlan),
    isLoading: query.isLoading,
    isHealing: query.data?._needsHeal || query.data?._legacyFound || false,
    generateStrategy,
    isGenerating: generateStrategy.isPending,
  };
}
