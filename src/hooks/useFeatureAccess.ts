import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGameState } from '@/hooks/useGameState';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';

export type UserTier = 'clarity' | 'structure' | 'consistency' | 'mastery';

export interface FeatureUnlock {
  id: string;
  feature_key: string;
  unlocked_at: string;
  unlock_reason: string | null;
  unlock_source: string | null;
}

// Feature definitions with their unlock requirements
export const FEATURE_DEFINITIONS = {
  // Launchpad unlocks
  aurora_chat_basic: { tier: 'clarity', launchpadStep: 1 },
  introspection_questionnaire: { tier: 'clarity', launchpadStep: 2 },
  life_plan_questionnaire: { tier: 'clarity', launchpadStep: 3 },
  focus_areas_selection: { tier: 'clarity', launchpadStep: 4 },
  first_week_planning: { tier: 'structure', launchpadStep: 5 },
  dashboard_full: { tier: 'structure', launchpadStep: 6 },
  life_os_complete: { tier: 'structure', launchpadStep: 7 },
  
  // Tier-based features
  daily_checkin: { tier: 'clarity', level: 1 },
  initial_life_model: { tier: 'clarity', level: 2 },
  weekly_planning: { tier: 'structure', level: 4 },
  focus_plans: { tier: 'structure', level: 4 },
  daily_anchors: { tier: 'structure', level: 5 },
  basic_hypnosis: { tier: 'structure', level: 4 },
  advanced_hypnosis: { tier: 'consistency', level: 7 },
  metrics_analytics: { tier: 'consistency', level: 7 },
  pattern_analysis: { tier: 'consistency', level: 8 },
  community_access: { tier: 'consistency', level: 7 },
  life_review: { tier: 'mastery', level: 10 },
  advanced_coaching: { tier: 'mastery', level: 10 },
  export_reports: { tier: 'mastery', level: 12 },
  premium_content: { tier: 'mastery', level: 15 },
} as const;

export type FeatureKey = keyof typeof FEATURE_DEFINITIONS;

const TIER_ORDER: UserTier[] = ['clarity', 'structure', 'consistency', 'mastery'];

export function useFeatureAccess() {
  const { user } = useAuth();
  const { gameState } = useGameState();
  const { progress: launchpadProgress, isLaunchpadComplete } = useLaunchpadProgress();

  // Fetch explicit feature unlocks
  const { data: unlocks = [], isLoading } = useQuery({
    queryKey: ['feature-unlocks', user?.id],
    queryFn: async (): Promise<FeatureUnlock[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_feature_unlocks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as FeatureUnlock[];
    },
    enabled: !!user?.id,
  });

  // Calculate user tier
  const calculateTier = (): UserTier => {
    const level = gameState?.level || 1;
    const streak = gameState?.sessionStreak || 0;
    
    // Tier 4: Mastery (Level 10+)
    if (level >= 10) return 'mastery';
    // Tier 3: Consistency (Level 7-9 + 7+ day streak)
    if (level >= 7 && streak >= 7) return 'consistency';
    // Tier 2: Structure (Level 4-6 + Launchpad Complete)
    if (level >= 4 && isLaunchpadComplete) return 'structure';
    // Tier 1: Clarity (Default)
    return 'clarity';
  };

  const tier = calculateTier();
  const level = gameState?.level || 1;

  // Check if user has explicit unlock for a feature
  const hasExplicitUnlock = (featureKey: string): boolean => {
    return unlocks.some(u => u.feature_key === featureKey);
  };

  // Check if user meets tier requirement
  const meetsTierRequirement = (requiredTier: UserTier): boolean => {
    const currentIndex = TIER_ORDER.indexOf(tier);
    const requiredIndex = TIER_ORDER.indexOf(requiredTier);
    return currentIndex >= requiredIndex;
  };

  // Check if user can access a feature
  const canAccess = (featureKey: FeatureKey): boolean => {
    // Check explicit unlock first
    if (hasExplicitUnlock(featureKey)) return true;

    const definition = FEATURE_DEFINITIONS[featureKey];
    if (!definition) return false;

    // Check launchpad step requirement
    if ('launchpadStep' in definition && definition.launchpadStep) {
      const currentStep = launchpadProgress?.current_step || 1;
      if (currentStep <= definition.launchpadStep) return false;
    }

    // Check level requirement
    if ('level' in definition && definition.level) {
      if (level < definition.level) return false;
    }

    // Check tier requirement
    if (!meetsTierRequirement(definition.tier as UserTier)) return false;

    return true;
  };

  // Get unlock status with reason
  const getUnlockStatus = (featureKey: FeatureKey): { 
    unlocked: boolean; 
    reason?: string;
    requirement?: string;
  } => {
    if (canAccess(featureKey)) {
      return { unlocked: true };
    }

    const definition = FEATURE_DEFINITIONS[featureKey];
    if (!definition) return { unlocked: false, reason: 'Unknown feature' };

    // Check what's blocking
    if ('launchpadStep' in definition && definition.launchpadStep) {
      const currentStep = launchpadProgress?.current_step || 1;
      if (currentStep <= definition.launchpadStep) {
        return {
          unlocked: false,
          reason: 'launchpad',
          requirement: `השלם שלב ${definition.launchpadStep} ב-Launchpad`,
        };
      }
    }

    if ('level' in definition && definition.level && level < definition.level) {
      return {
        unlocked: false,
        reason: 'level',
        requirement: `הגע לרמה ${definition.level}`,
      };
    }

    if (!meetsTierRequirement(definition.tier as UserTier)) {
      return {
        unlocked: false,
        reason: 'tier',
        requirement: `הגע לדרגת ${definition.tier}`,
      };
    }

    return { unlocked: false };
  };

  // Get list of unlocked features
  const getUnlockedFeatures = (): FeatureKey[] => {
    return (Object.keys(FEATURE_DEFINITIONS) as FeatureKey[]).filter(canAccess);
  };

  // Get list of locked features
  const getLockedFeatures = (): FeatureKey[] => {
    return (Object.keys(FEATURE_DEFINITIONS) as FeatureKey[]).filter(f => !canAccess(f));
  };

  // Get next unlock preview
  const getNextUnlock = (): { feature: FeatureKey; requirement: string } | null => {
    const locked = getLockedFeatures();
    if (locked.length === 0) return null;

    // Find the closest unlock
    for (const featureKey of locked) {
      const status = getUnlockStatus(featureKey);
      if (status.requirement) {
        return { feature: featureKey, requirement: status.requirement };
      }
    }
    return null;
  };

  return {
    tier,
    level,
    isLoading,
    canAccess,
    getUnlockStatus,
    getUnlockedFeatures,
    getLockedFeatures,
    getNextUnlock,
    hasExplicitUnlock,
    unlocks,
    isLaunchpadComplete,
  };
}
