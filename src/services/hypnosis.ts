import { supabase } from "@/integrations/supabase/client";

export interface HypnosisScript {
  title: string;
  egoState: string;
  language: 'he' | 'en';
  fullScript: string; // Single continuous script text
  metadata: {
    durationMinutes: number;
    totalWords: number;
    wordsPerMinute: number;
    generatedAt: string;
    userLevel: number;
  };
}

export interface CachedScript {
  id: string;
  user_id: string;
  cache_key: string;
  ego_state: string;
  goal: string;
  duration_minutes: number;
  language: string;
  script_data: HypnosisScript;
  audio_url: string | null; // Single audio URL instead of array
  created_at: string;
  last_used_at: string;
  use_count: number;
}

export interface GoalSuggestion {
  title: string;
  description: string;
}

export interface ProgressAnalysis {
  insights: string[];
  suggestions: string[];
  celebration: string;
}

/**
 * Generate a personalized hypnosis script
 */
export async function generateHypnosisScript(options: {
  egoState: string;
  goal: string;
  durationMinutes: number;
  userLevel?: number;
  sessionStreak?: number;
  previousSessions?: number;
  language?: 'he' | 'en';
  autoGenerateGoal?: boolean;
  isDailySession?: boolean;
}): Promise<HypnosisScript> {
  const { data, error } = await supabase.functions.invoke('generate-hypnosis-script', {
    body: options,
  });

  if (error) {
    console.error('Failed to generate script:', error);
    throw new Error(error.message || 'Failed to generate hypnosis script');
  }

  return data as HypnosisScript;
}

/**
 * Get daily session context for AI-generated goal
 */
export async function getDailySessionContext(userId: string): Promise<{
  suggestedGoal: string;
  currentMilestone?: string;
  consciousnessState?: string;
}> {
  const { data, error } = await supabase.functions.invoke('generate-hypnosis-script', {
    body: {
      action: 'get_daily_context',
      userId,
    },
  });

  if (error) {
    console.error('Failed to get daily context:', error);
    return { suggestedGoal: 'התפתחות אישית והתעלות' };
  }

  return data;
}

/**
 * Get AI-suggested goals based on user context
 */
export async function suggestGoals(options: {
  egoState: string;
  userHistory?: {
    sessions: number;
    streak: number;
    level: number;
    favoriteEgoState?: string;
  };
}): Promise<GoalSuggestion[]> {
  const { data, error } = await supabase.functions.invoke('ai-hypnosis', {
    body: {
      action: 'suggest_goals',
      egoState: options.egoState,
      userHistory: options.userHistory,
    },
  });

  if (error) {
    console.error('Failed to suggest goals:', error);
    throw new Error(error.message || 'Failed to get goal suggestions');
  }

  return data?.goals || [];
}

/**
 * Analyze user's hypnosis progress
 */
export async function analyzeProgress(options: {
  userHistory: {
    sessions: number;
    streak: number;
    level: number;
    favoriteEgoState?: string;
  };
  context?: Record<string, unknown>;
}): Promise<ProgressAnalysis> {
  const { data, error } = await supabase.functions.invoke('ai-hypnosis', {
    body: {
      action: 'analyze_progress',
      userHistory: options.userHistory,
      context: options.context,
    },
  });

  if (error) {
    console.error('Failed to analyze progress:', error);
    throw new Error(error.message || 'Failed to analyze progress');
  }

  return {
    insights: data?.insights || [],
    suggestions: data?.suggestions || [],
    celebration: data?.celebration || '',
  };
}

/**
 * Generate a cache key for script caching
 */
export function generateCacheKey(options: {
  egoState: string;
  goal: string;
  durationMinutes: number;
  language: 'he' | 'en';
}): string {
  // Get current date (Israel timezone) for daily uniqueness
  const now = new Date();
  const israelDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
  
  // Get time-of-day bucket (morning/afternoon/evening/night)
  const israelHour = parseInt(
    now.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Jerusalem', 
      hour: 'numeric', 
      hour12: false 
    })
  );
  
  let timeBucket: string;
  if (israelHour >= 5 && israelHour < 12) timeBucket = 'morning';
  else if (israelHour >= 12 && israelHour < 17) timeBucket = 'afternoon';
  else if (israelHour >= 17 && israelHour < 21) timeBucket = 'evening';
  else timeBucket = 'night';
  
  // Create a simple hash of the goal for the cache key
  const goalHash = options.goal
    .toLowerCase()
    .replace(/\s+/g, '_')
    .substring(0, 30);
  
  // Include date and time bucket for daily/time-appropriate freshness
  return `${options.egoState}_${goalHash}_${options.durationMinutes}_${options.language}_${israelDate}_${timeBucket}`;
}

/**
 * Check if there's a cached script for the given parameters
 */
export async function checkScriptCache(
  userId: string,
  cacheKey: string
): Promise<CachedScript | null> {
  // Use type assertion since the types.ts file hasn't been regenerated yet
  const { data, error } = await supabase
    .from('hypnosis_script_cache' as any)
    .select('*')
    .eq('user_id', userId)
    .eq('cache_key', cacheKey)
    .single();

  if (error || !data) {
    return null;
  }

  // Update last_used_at and use_count
  await supabase
    .from('hypnosis_script_cache' as any)
    .update({ 
      last_used_at: new Date().toISOString(),
      use_count: ((data as any).use_count || 0) + 1,
    })
    .eq('id', (data as any).id);

  return data as unknown as CachedScript;
}

/**
 * Save a script to the cache
 */
export async function saveScriptToCache(
  userId: string,
  cacheKey: string,
  script: HypnosisScript,
  options: {
    egoState: string;
    goal: string;
    durationMinutes: number;
    language: 'he' | 'en';
  }
): Promise<void> {
  // Use type assertion since the types.ts file hasn't been regenerated yet
  const { error } = await supabase
    .from('hypnosis_script_cache' as any)
    .upsert({
      user_id: userId,
      cache_key: cacheKey,
      ego_state: options.egoState,
      goal: options.goal,
      duration_minutes: options.durationMinutes,
      language: options.language,
      script_data: script,
      last_used_at: new Date().toISOString(),
    } as any, {
      onConflict: 'user_id,cache_key',
    });

  if (error) {
    console.error('Failed to save script to cache:', error);
  }
}

/**
 * Get signed URL for cached audio
 */
export async function getCachedAudioUrl(
  audioPath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  if (!audioPath) return null;

  const { data, error } = await supabase.storage
    .from('hypnosis-cache')
    .createSignedUrl(audioPath, expiresIn);

  if (error) {
    console.error('Failed to get signed URL for cached audio:', error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Trigger background audio caching for the full script
 */
export async function cacheScriptAudio(
  userId: string,
  cacheKey: string,
  fullScript: string,
  language: 'he' | 'en' = 'he'
): Promise<void> {
  if (!fullScript?.trim()) {
    console.warn('No script provided for audio caching');
    return;
  }
  
  try {
    console.log('Triggering audio caching:', { userId, cacheKey, scriptLength: fullScript.length });
    
    // Fire and forget - don't wait for completion
    supabase.functions.invoke('cache-hypnosis-audio', {
      body: {
        userId,
        cacheKey,
        fullScript,
        language,
      },
    }).then(({ error }) => {
      if (error) {
        console.error('Background audio caching failed:', error);
      } else {
        console.log('Audio caching completed in background');
      }
    });
  } catch (error) {
    console.error('Failed to trigger audio caching:', error);
  }
}
