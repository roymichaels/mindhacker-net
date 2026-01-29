import { supabase } from "@/integrations/supabase/client";

export interface UserPreferences {
  level: number;
  experience: number;
  tokens: number;
  activeEgoState: string;
  egoStateUsage: Record<string, number>;
  sessionStreak: number;
  lastSessionDate: string | null;
}

export interface SessionSummary {
  id: string;
  egoState: string;
  action: string | null;
  duration: number;
  experienceGained: number;
  completedAt: string;
}

export interface UserMemory {
  preferences: UserPreferences | null;
  recentSessions: SessionSummary[];
  outcomeSummary: {
    totalSessions: number;
    totalExperience: number;
    favoriteEgoState: string | null;
    averageDurationMinutes: number | null;
  };
}

/**
 * Load complete user memory for personalization
 */
export async function loadUserMemory(userId: string): Promise<UserMemory> {
  try {
    // Load user preferences from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('level, experience, tokens, active_ego_state, ego_state_usage, session_streak, last_session_date')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error loading profile:', profileError);
    }

    // Load recent sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('hypnosis_sessions')
      .select('id, ego_state, action, duration_seconds, experience_gained, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(20);

    if (sessionsError) {
      console.error('Error loading sessions:', sessionsError);
    }

    const recentSessions: SessionSummary[] = (sessions || []).map(s => ({
      id: s.id,
      egoState: s.ego_state,
      action: s.action,
      duration: s.duration_seconds,
      experienceGained: s.experience_gained || 0,
      completedAt: s.completed_at || '',
    }));

    // Calculate summary statistics
    const totalSessions = recentSessions.length;
    const totalExperience = recentSessions.reduce((sum, s) => sum + s.experienceGained, 0);
    
    // Find favorite ego state
    const egoStateCounts: Record<string, number> = {};
    recentSessions.forEach(s => {
      egoStateCounts[s.egoState] = (egoStateCounts[s.egoState] || 0) + 1;
    });
    const favoriteEgoState = Object.entries(egoStateCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Calculate average duration
    const totalDuration = recentSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageDurationMinutes = totalSessions > 0 
      ? Math.round(totalDuration / totalSessions / 60) 
      : null;

    const preferences: UserPreferences | null = profile ? {
      level: profile.level || 1,
      experience: profile.experience || 0,
      tokens: profile.tokens || 10,
      activeEgoState: profile.active_ego_state || 'guardian',
      egoStateUsage: (profile.ego_state_usage as Record<string, number>) || {},
      sessionStreak: profile.session_streak || 0,
      lastSessionDate: profile.last_session_date || null,
    } : null;

    return {
      preferences,
      recentSessions,
      outcomeSummary: {
        totalSessions,
        totalExperience,
        favoriteEgoState,
        averageDurationMinutes,
      },
    };

  } catch (error) {
    console.error('Error loading user memory:', error);
    return {
      preferences: null,
      recentSessions: [],
      outcomeSummary: {
        totalSessions: 0,
        totalExperience: 0,
        favoriteEgoState: null,
        averageDurationMinutes: null,
      },
    };
  }
}

/**
 * Save a completed session
 */
export async function saveSession(
  userId: string,
  session: {
    egoState: string;
    action?: string;
    durationSeconds: number;
    experienceGained: number;
    scriptData?: Record<string, unknown>;
  }
): Promise<string | null> {
  try {
    const insertData = {
      user_id: userId,
      ego_state: session.egoState,
      action: session.action,
      duration_seconds: session.durationSeconds,
      experience_gained: session.experienceGained,
      script_data: session.scriptData as import('@/integrations/supabase/types').Json,
      completed_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('hypnosis_sessions')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('Error saving session:', error);
      return null;
    }

    return data?.id || null;

  } catch (error) {
    console.error('Error saving session:', error);
    return null;
  }
}

/**
 * Update user's active ego state
 */
export async function updateActiveEgoState(
  userId: string,
  egoState: string
): Promise<boolean> {
  try {
    // Get current usage
    const { data: profile } = await supabase
      .from('profiles')
      .select('ego_state_usage')
      .eq('id', userId)
      .single();

    const currentUsage = (profile?.ego_state_usage as Record<string, number>) || {};
    const newUsage = {
      ...currentUsage,
      [egoState]: (currentUsage[egoState] || 0) + 1,
    };

    const { error } = await supabase
      .from('profiles')
      .update({
        active_ego_state: egoState,
        ego_state_usage: newUsage,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating ego state:', error);
      return false;
    }

    return true;

  } catch (error) {
    console.error('Error updating ego state:', error);
    return false;
  }
}

/**
 * Get personalization context for AI
 */
export function getPersonalizationContext(memory: UserMemory): Record<string, unknown> {
  const { preferences, recentSessions, outcomeSummary } = memory;

  // Get recent goals/actions
  const recentGoals = [...new Set(
    recentSessions
      .slice(0, 5)
      .map(s => s.action)
      .filter(Boolean)
  )];

  // Detect patterns
  const mostUsedEgoStates = Object.entries(preferences?.egoStateUsage || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([state]) => state);

  return {
    userLevel: preferences?.level || 1,
    experiencePoints: preferences?.experience || 0,
    currentStreak: preferences?.sessionStreak || 0,
    totalSessions: outcomeSummary.totalSessions,
    averageSessionMinutes: outcomeSummary.averageDurationMinutes,
    preferredEgoStates: mostUsedEgoStates,
    recentGoals,
    isNewUser: outcomeSummary.totalSessions === 0,
    isExperienced: (preferences?.level || 1) >= 5,
    hasStreak: (preferences?.sessionStreak || 0) >= 3,
  };
}
