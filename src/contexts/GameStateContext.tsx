import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  ACHIEVEMENTS, 
  type Achievement 
} from '@/lib/achievements';

export interface UserGameState {
  level: number;
  experience: number;
  tokens: number;
  sessionStreak: number;
  lastSessionDate: string | null;
  activeEgoState: string;
  egoStateUsage: Record<string, number>;
}

export interface SessionStats {
  totalSessions: number;
  totalDurationSeconds: number;
  favoriteEgoState: string | null;
}

interface GameStateContextValue {
  gameState: UserGameState | null;
  sessionStats: SessionStats | null;
  unlockedAchievements: string[];
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshGameState: () => Promise<void>;
  addExperience: (amount: number) => Promise<void>;
  spendTokens: (amount: number) => Promise<boolean>;
  addTokens: (amount: number) => Promise<void>;
  setActiveEgoState: (egoState: string) => Promise<void>;
  checkAndAwardAchievements: () => Promise<Achievement[]>;
  recordSession: (session: {
    egoState: string;
    action?: string;
    goalId?: string;
    durationSeconds: number;
    experienceGained?: number;
  }) => Promise<void>;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within GameStateProvider');
  }
  return context;
}

interface GameStateProviderProps {
  children: ReactNode;
}

export function GameStateProvider({ children }: GameStateProviderProps) {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<UserGameState | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load game state from database
  const loadGameState = useCallback(async () => {
    if (!user?.id) {
      setGameState(null);
      setSessionStats(null);
      setUnlockedAchievements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch profile with gamification fields
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level, experience, tokens, session_streak, last_session_date, active_ego_state, ego_state_usage')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Set game state from profile
      setGameState({
        level: profile?.level ?? 1,
        experience: profile?.experience ?? 0,
        tokens: profile?.tokens ?? 10,
        sessionStreak: profile?.session_streak ?? 0,
        lastSessionDate: profile?.last_session_date ?? null,
        activeEgoState: profile?.active_ego_state ?? 'guardian',
        egoStateUsage: (profile?.ego_state_usage as Record<string, number>) ?? {},
      });

      // Fetch session stats
      const { data: sessions, error: sessionsError } = await supabase
        .from('hypnosis_sessions')
        .select('ego_state, duration_seconds')
        .eq('user_id', user.id);

      if (!sessionsError && sessions) {
        const totalSessions = sessions.length;
        const totalDurationSeconds = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
        
        // Calculate favorite ego state
        const egoCounts: Record<string, number> = {};
        sessions.forEach((s) => {
          egoCounts[s.ego_state] = (egoCounts[s.ego_state] || 0) + 1;
        });
        const favoriteEgoState = Object.entries(egoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

        setSessionStats({ totalSessions, totalDurationSeconds, favoriteEgoState });
      }

      // Fetch unlocked achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (!achievementsError && achievements) {
        setUnlockedAchievements(achievements.map((a) => a.achievement_id));
      }

    } catch (err) {
      console.error('Error loading game state:', err);
      setError('Failed to load game state');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Refresh game state
  const refreshGameState = useCallback(async () => {
    await loadGameState();
  }, [loadGameState]);

  // Add experience points using unified XP system
  const addExperience = useCallback(async (amount: number, source: string = 'frontend', reason?: string) => {
    if (!user?.id || !gameState) return;

    try {
      const { data, error } = await supabase.rpc('award_unified_xp', {
        p_user_id: user.id,
        p_amount: amount,
        p_source: source,
        p_reason: reason || null
      });

      if (error) throw error;

      // Parse result from DB function
      const result = data as {
        xp_gained: number;
        new_experience: number;
        old_level: number;
        new_level: number;
        levels_gained: number;
        tokens_awarded: number;
      };

      // Update local state
      setGameState(prev => prev ? {
        ...prev,
        experience: result.new_experience,
        level: result.new_level,
        tokens: prev.tokens + result.tokens_awarded,
      } : null);

      // Show level up toast if applicable
      if (result.levels_gained > 0) {
        toast.success(`🎉 Level Up! You're now level ${result.new_level}`, {
          description: `You earned ${result.tokens_awarded} bonus tokens!`,
        });
      }
    } catch (err) {
      console.error('Error adding experience:', err);
    }
  }, [user?.id, gameState]);

  // Spend tokens
  const spendTokens = useCallback(async (amount: number): Promise<boolean> => {
    if (!user?.id || !gameState || gameState.tokens < amount) {
      toast.error('Not enough tokens!');
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tokens: gameState.tokens - amount })
        .eq('id', user.id);

      if (error) throw error;

      setGameState(prev => prev ? { ...prev, tokens: prev.tokens - amount } : null);
      return true;
    } catch (err) {
      console.error('Error spending tokens:', err);
      return false;
    }
  }, [user?.id, gameState]);

  // Add tokens
  const addTokens = useCallback(async (amount: number) => {
    if (!user?.id || !gameState) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tokens: gameState.tokens + amount })
        .eq('id', user.id);

      if (error) throw error;

      setGameState(prev => prev ? { ...prev, tokens: prev.tokens + amount } : null);
      toast.success(`+${amount} tokens!`, { icon: '🪙' });
    } catch (err) {
      console.error('Error adding tokens:', err);
    }
  }, [user?.id, gameState]);

  // Set active ego state
  const setActiveEgoState = useCallback(async (egoState: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active_ego_state: egoState })
        .eq('id', user.id);

      if (error) throw error;

      setGameState(prev => prev ? { ...prev, activeEgoState: egoState } : null);
    } catch (err) {
      console.error('Error setting ego state:', err);
    }
  }, [user?.id]);

  // Check and award achievements
  const checkAndAwardAchievements = useCallback(async (): Promise<Achievement[]> => {
    if (!user?.id || !gameState || !sessionStats) return [];

    const newAchievements: Achievement[] = [];
    const egoStatesUsed = Object.keys(gameState.egoStateUsage).length;

    for (const achievement of Object.values(ACHIEVEMENTS)) {
      // Skip if already unlocked
      if (unlockedAchievements.includes(achievement.id)) continue;

      let shouldUnlock = false;
      const condition = achievement.condition;

      if (condition) {
        switch (condition.type) {
          case 'sessions_count':
            shouldUnlock = sessionStats.totalSessions >= condition.value;
            break;
          case 'streak_days':
            shouldUnlock = gameState.sessionStreak >= condition.value;
            break;
          case 'ego_states_used':
            shouldUnlock = egoStatesUsed >= condition.value;
            break;
          case 'total_duration':
            shouldUnlock = sessionStats.totalDurationSeconds >= condition.value;
            break;
          case 'level':
            shouldUnlock = gameState.level >= condition.value;
            break;
        }
      }

      if (shouldUnlock) {
        try {
          const { error } = await supabase
            .from('user_achievements')
            .insert({ user_id: user.id, achievement_id: achievement.id });

          if (!error) {
            newAchievements.push(achievement);
            setUnlockedAchievements(prev => [...prev, achievement.id]);

            // Award XP via unified system and tokens separately
            if (achievement.xp) {
              await addExperience(achievement.xp, 'achievement', `Unlocked: ${achievement.name}`);
            }
            if (achievement.tokens) {
              await addTokens(achievement.tokens);
            }

            toast.success(`🏆 Achievement Unlocked!`, {
              description: achievement.name,
            });
          }
        } catch (err) {
          console.error('Error unlocking achievement:', err);
        }
      }
    }

    return newAchievements;
  }, [user?.id, gameState, sessionStats, unlockedAchievements, addExperience, addTokens]);

  // Record a completed session
  const recordSession = useCallback(async (session: {
    egoState: string;
    action?: string;
    goalId?: string;
    durationSeconds: number;
    experienceGained?: number;
  }) => {
    if (!user?.id) return;

    const xpGained = session.experienceGained ?? Math.max(5, Math.floor(session.durationSeconds / 60) * 2);

    try {
      const { error } = await supabase
        .from('hypnosis_sessions')
        .insert({
          user_id: user.id,
          ego_state: session.egoState,
          action: session.action,
          goal_id: session.goalId,
          duration_seconds: session.durationSeconds,
          experience_gained: xpGained,
        });

      if (error) throw error;

      // Refresh state to get updated streak and XP from trigger
      await refreshGameState();
      
      // Check for new achievements
      await checkAndAwardAchievements();

      toast.success(`Session Complete!`, {
        description: `+${xpGained} XP earned`,
        icon: '✨',
      });
    } catch (err) {
      console.error('Error recording session:', err);
    }
  }, [user?.id, refreshGameState, checkAndAwardAchievements]);

  // Load state on mount and user change
  useEffect(() => {
    loadGameState();
  }, [loadGameState]);

  const value: GameStateContextValue = {
    gameState,
    sessionStats,
    unlockedAchievements,
    loading,
    error,
    refreshGameState,
    addExperience,
    spendTokens,
    addTokens,
    setActiveEgoState,
    checkAndAwardAchievements,
    recordSession,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}
