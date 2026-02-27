/**
 * SSOT: All XP must flow through award_unified_xp RPC.
 * profiles.experience is a derived cache — xp_events is the ledger of truth.
 * profiles.tokens is a derived cache — energy_events is the ledger of truth.
 * Tier system: Subscription tiers (free/plus/apex) gate features via useSubscriptionGate.
 *              Progression tiers (clarity/structure/consistency/mastery) are gamification via get_user_tier RPC.
 */
import { useGameState as useGameStateContext } from '@/contexts/GameStateContext';
import { calculateXpProgress } from '@/lib/achievements';

/**
 * Hook that provides game state with computed values
 */
export function useGameState() {
  return useGameStateContext();
}

/**
 * Hook for XP progress calculations
 */
export function useXpProgress() {
  const { gameState } = useGameStateContext();
  
  if (!gameState) {
    return {
      level: 1,
      experience: 0,
      current: 0,
      required: 100,
      percentage: 0,
    };
  }

  const progress = calculateXpProgress(gameState.experience);
  
  return {
    level: gameState.level,
    experience: gameState.experience,
    ...progress,
  };
}

/**
 * Hook for streak information
 */
export function useStreak() {
  const { gameState } = useGameStateContext();
  
  if (!gameState) {
    return {
      streak: 0,
      lastSessionDate: null,
      isActiveToday: false,
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const isActiveToday = gameState.lastSessionDate === today;

  return {
    streak: gameState.sessionStreak,
    lastSessionDate: gameState.lastSessionDate,
    isActiveToday,
  };
}

/**
 * Hook for energy balance (formerly tokens)
 */
export function useEnergy() {
  const { gameState, spendEnergy, addEnergy } = useGameStateContext();
  
  return {
    balance: gameState?.tokens ?? 0,
    spend: spendEnergy,
    add: addEnergy,
    canAfford: (amount: number) => (gameState?.tokens ?? 0) >= amount,
  };
}


/**
 * Hook for ego state management
 */
export function useEgoState() {
  const { gameState, setActiveEgoState } = useGameStateContext();
  
  return {
    activeEgoState: gameState?.activeEgoState ?? 'guardian',
    usage: gameState?.egoStateUsage ?? {},
    setActive: setActiveEgoState,
    getMostUsed: () => {
      const usage = gameState?.egoStateUsage ?? {};
      const entries = Object.entries(usage);
      if (entries.length === 0) return null;
      return entries.sort((a, b) => b[1] - a[1])[0][0];
    },
  };
}
