import { supabase } from "@/integrations/supabase/client";

// ===== Types =====

export interface UnifiedUserContext {
  // Identity
  profile: {
    id: string;
    fullName: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };

  // Life Model (from Aurora)
  lifeModel: {
    direction: {
      content: string;
      clarityScore: number | null;
    } | null;
    values: string[];
    principles: string[];
    selfConcepts: string[];
    visionStatements: string[];
    visions: Array<{
      id: string;
      title: string;
      timeframe: string;
      description: string | null;
    }>;
    commitments: Array<{
      id: string;
      title: string;
      status: string;
    }>;
    energyPatterns: Array<{
      patternType: string;
      description: string;
    }>;
    dailyMinimums: Array<{
      id: string;
      title: string;
      category: string | null;
    }>;
    focusPlan: {
      title: string;
      durationDays: number;
    } | null;
  };

  // Gamification (from profiles)
  gamification: {
    level: number;
    experience: number;
    tokens: number;
    sessionStreak: number;
    lastSessionDate: string | null;
    activeEgoState: string;
    egoStateUsage: Record<string, number>;
  };

  // Hypnosis Sessions
  hypnosis: {
    totalSessions: number;
    favoriteEgoState: string | null;
    recentGoals: string[];
    averageDurationMinutes: number | null;
    lastSessionDate: string | null;
  };

  // Preferences
  preferences: {
    tone: 'warm' | 'direct' | 'playful';
    intensity: 'gentle' | 'balanced' | 'challenging';
    language: 'he' | 'en';
  };

  // Weekly Progress
  weeklyProgress: {
    hypnosisSessions: number;
    auroraChats: number;
    insightsGained: number;
    totalXp: number;
  };

  // Onboarding Status
  onboarding: {
    directionClarity: string;
    identityUnderstanding: string;
    energyPatternsStatus: string;
    onboardingComplete: boolean;
  };
}

// ===== Loader Function =====

export async function loadUnifiedContext(userId: string): Promise<UnifiedUserContext> {
  // Parallel fetch all data
  const [
    profileRes,
    directionRes,
    identityRes,
    visionsRes,
    commitmentsRes,
    energyRes,
    minimumsRes,
    focusRes,
    onboardingRes,
    sessionsRes,
    weeklyStatsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("aurora_life_direction").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
    supabase.from("aurora_identity_elements").select("*").eq("user_id", userId),
    supabase.from("aurora_life_visions").select("*").eq("user_id", userId),
    supabase.from("aurora_commitments").select("*").eq("user_id", userId).eq("status", "active"),
    supabase.from("aurora_energy_patterns").select("*").eq("user_id", userId),
    supabase.from("aurora_daily_minimums").select("*").eq("user_id", userId).eq("is_active", true),
    supabase.from("aurora_focus_plans").select("*").eq("user_id", userId).eq("status", "active").limit(1),
    supabase.from("aurora_onboarding_progress").select("*").eq("user_id", userId).single(),
    supabase.from("hypnosis_sessions").select("id, ego_state, action, duration_seconds, completed_at").eq("user_id", userId).order("completed_at", { ascending: false }).limit(20),
    supabase.from("weekly_user_stats").select("*").eq("user_id", userId).single(),
  ]);

  const profile = profileRes.data;
  const direction = directionRes.data?.[0];
  const identity = identityRes.data || [];
  const visions = visionsRes.data || [];
  const commitments = commitmentsRes.data || [];
  const energy = energyRes.data || [];
  const minimums = minimumsRes.data || [];
  const focus = focusRes.data?.[0];
  const onboarding = onboardingRes.data;
  const sessions = sessionsRes.data || [];
  const weeklyStats = weeklyStatsRes.data;

  // Parse identity elements
  const values = identity.filter(i => i.element_type === 'value').map(i => i.content);
  const principles = identity.filter(i => i.element_type === 'principle').map(i => i.content);
  const selfConcepts = identity.filter(i => i.element_type === 'self_concept').map(i => i.content);
  const visionStatements = identity.filter(i => i.element_type === 'vision_statement').map(i => i.content);

  // Calculate hypnosis stats
  const egoStateCounts: Record<string, number> = {};
  const goals: string[] = [];
  let totalDuration = 0;

  sessions.forEach((s) => {
    egoStateCounts[s.ego_state] = (egoStateCounts[s.ego_state] || 0) + 1;
    if (s.action && !goals.includes(s.action)) {
      goals.push(s.action);
    }
    totalDuration += s.duration_seconds || 0;
  });

  const favoriteEgoState = Object.entries(egoStateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const averageDurationMinutes = sessions.length > 0 ? Math.round(totalDuration / sessions.length / 60) : null;

  // Parse aurora preferences
  const auroraPrefs = profile?.aurora_preferences as Record<string, unknown> | null;

  return {
    profile: {
      id: userId,
      fullName: profile?.full_name || null,
      bio: profile?.bio || null,
      avatarUrl: null, // avatar_url not in profiles table
    },
    lifeModel: {
      direction: direction ? {
        content: direction.content,
        clarityScore: direction.clarity_score,
      } : null,
      values,
      principles,
      selfConcepts,
      visionStatements,
      visions: visions.map(v => ({
        id: v.id,
        title: v.title,
        timeframe: v.timeframe,
        description: v.description,
      })),
      commitments: commitments.map(c => ({
        id: c.id,
        title: c.title,
        status: c.status,
      })),
      energyPatterns: energy.map(e => ({
        patternType: e.pattern_type,
        description: e.description,
      })),
      dailyMinimums: minimums.map(m => ({
        id: m.id,
        title: m.title,
        category: m.category,
      })),
      focusPlan: focus ? {
        title: focus.title,
        durationDays: focus.duration_days,
      } : null,
    },
    gamification: {
      level: profile?.level || 1,
      experience: profile?.experience || 0,
      tokens: profile?.tokens || 10,
      sessionStreak: profile?.session_streak || 0,
      lastSessionDate: profile?.last_session_date || null,
      activeEgoState: profile?.active_ego_state || 'guardian',
      egoStateUsage: (profile?.ego_state_usage as Record<string, number>) || {},
    },
    hypnosis: {
      totalSessions: sessions.length,
      favoriteEgoState,
      recentGoals: goals.slice(0, 5),
      averageDurationMinutes,
      lastSessionDate: sessions[0]?.completed_at || null,
    },
    preferences: {
      tone: (auroraPrefs?.tone as 'warm' | 'direct' | 'playful') || 'warm',
      intensity: (auroraPrefs?.intensity as 'gentle' | 'balanced' | 'challenging') || 'balanced',
      language: 'he', // Default, can be expanded
    },
    weeklyProgress: {
      hypnosisSessions: weeklyStats?.hypnosis_sessions || 0,
      auroraChats: weeklyStats?.aurora_chats || 0,
      insightsGained: weeklyStats?.insights_gained || 0,
      totalXp: weeklyStats?.total_xp || 0,
    },
    onboarding: {
      directionClarity: onboarding?.direction_clarity || 'incomplete',
      identityUnderstanding: onboarding?.identity_understanding || 'shallow',
      energyPatternsStatus: onboarding?.energy_patterns_status || 'unknown',
      onboardingComplete: onboarding?.onboarding_complete || false,
    },
  };
}

// ===== Context String for AI =====

export function getAIContextString(context: UnifiedUserContext, language: 'he' | 'en' = 'he'): string {
  const { profile, lifeModel, gamification, hypnosis, preferences, weeklyProgress, onboarding } = context;

  if (language === 'he') {
    return `
## פרופיל משתמש
- שם: ${profile.fullName || 'לא ידוע'}
- ביו: ${profile.bio || 'לא הוגדר'}
- רמה: ${gamification.level} | XP: ${gamification.experience}
- רצף סשנים: ${gamification.sessionStreak} ימים
- טוקנים: ${gamification.tokens}

## כיוון חיים
${lifeModel.direction?.content || 'טרם הוגדר'}
${lifeModel.direction?.clarityScore ? `(רמת בהירות: ${lifeModel.direction.clarityScore}%)` : ''}

## זהות
- ערכים: ${lifeModel.values.length > 0 ? lifeModel.values.join(', ') : 'טרם זוהו'}
- עקרונות: ${lifeModel.principles.length > 0 ? lifeModel.principles.join(', ') : 'טרם זוהו'}
- תפיסות עצמיות: ${lifeModel.selfConcepts.length > 0 ? lifeModel.selfConcepts.join(', ') : 'טרם זוהו'}

## פוקוס נוכחי
${lifeModel.focusPlan ? `${lifeModel.focusPlan.title} (${lifeModel.focusPlan.durationDays} ימים)` : 'לא מוגדר'}

## מינימום יומי
${lifeModel.dailyMinimums.map(m => `- ${m.title}`).join('\n') || 'לא הוגדרו'}

## סשני היפנוזה
- סה"כ סשנים: ${hypnosis.totalSessions}
- מצב אגו מועדף: ${hypnosis.favoriteEgoState || 'לא נבחר'}
- מטרות אחרונות: ${hypnosis.recentGoals.join(', ') || 'אין'}
- משך ממוצע: ${hypnosis.averageDurationMinutes ? `${hypnosis.averageDurationMinutes} דקות` : 'לא ידוע'}

## התקדמות שבועית
- סשני היפנוזה: ${weeklyProgress.hypnosisSessions}
- שיחות עם אורורה: ${weeklyProgress.auroraChats}
- תובנות: ${weeklyProgress.insightsGained}
- XP שנצבר: ${weeklyProgress.totalXp}

## העדפות
- סגנון תקשורת: ${preferences.tone}
- עוצמת אתגר: ${preferences.intensity}

## סטטוס התקדמות
- בהירות כיוון: ${onboarding.directionClarity}
- הבנת זהות: ${onboarding.identityUnderstanding}
- מיפוי אנרגיה: ${onboarding.energyPatternsStatus}
`;
  }

  // English version
  return `
## User Profile
- Name: ${profile.fullName || 'Unknown'}
- Bio: ${profile.bio || 'Not set'}
- Level: ${gamification.level} | XP: ${gamification.experience}
- Session streak: ${gamification.sessionStreak} days
- Tokens: ${gamification.tokens}

## Life Direction
${lifeModel.direction?.content || 'Not yet defined'}
${lifeModel.direction?.clarityScore ? `(Clarity: ${lifeModel.direction.clarityScore}%)` : ''}

## Identity
- Values: ${lifeModel.values.length > 0 ? lifeModel.values.join(', ') : 'Not identified'}
- Principles: ${lifeModel.principles.length > 0 ? lifeModel.principles.join(', ') : 'Not identified'}
- Self-concepts: ${lifeModel.selfConcepts.length > 0 ? lifeModel.selfConcepts.join(', ') : 'Not identified'}

## Current Focus
${lifeModel.focusPlan ? `${lifeModel.focusPlan.title} (${lifeModel.focusPlan.durationDays} days)` : 'Not defined'}

## Daily Minimums
${lifeModel.dailyMinimums.map(m => `- ${m.title}`).join('\n') || 'Not defined'}

## Hypnosis Sessions
- Total sessions: ${hypnosis.totalSessions}
- Favorite ego state: ${hypnosis.favoriteEgoState || 'None'}
- Recent goals: ${hypnosis.recentGoals.join(', ') || 'None'}
- Average duration: ${hypnosis.averageDurationMinutes ? `${hypnosis.averageDurationMinutes} min` : 'Unknown'}

## Weekly Progress
- Hypnosis sessions: ${weeklyProgress.hypnosisSessions}
- Aurora chats: ${weeklyProgress.auroraChats}
- Insights: ${weeklyProgress.insightsGained}
- XP gained: ${weeklyProgress.totalXp}

## Preferences
- Communication style: ${preferences.tone}
- Challenge intensity: ${preferences.intensity}

## Progress Status
- Direction clarity: ${onboarding.directionClarity}
- Identity understanding: ${onboarding.identityUnderstanding}
- Energy mapping: ${onboarding.energyPatternsStatus}
`;
}

// ===== XP Award Helper =====

export async function awardXp(
  userId: string,
  amount: number,
  source: 'hypnosis' | 'aurora' | 'aurora_insight' | 'community' | 'course',
  reason?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('award_unified_xp', {
      p_user_id: userId,
      p_amount: amount,
      p_source: source,
      p_reason: reason || null,
    });

    if (error) {
      console.error('Error awarding XP:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error awarding XP:', error);
    return false;
  }
}

// ===== Insight XP Amounts =====

export const INSIGHT_XP_AMOUNTS: Record<string, number> = {
  life_direction: 25,
  value: 15,
  principle: 15,
  commitment: 20,
  daily_minimum: 10,
  vision: 30,
  energy_pattern: 15,
  focus_plan: 20,
};
