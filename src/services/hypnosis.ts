import { supabase } from "@/integrations/supabase/client";

export interface HypnosisScript {
  title: string;
  egoState: string;
  language: 'he' | 'en';
  segments: ScriptSegment[];
  metadata: {
    durationMinutes: number;
    totalWords: number;
    wordsPerMinute: number;
    generatedAt: string;
    userLevel: number;
  };
}

export interface ScriptSegment {
  id: string;
  text: string;
  mood: string;
  durationPercent: number;
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
