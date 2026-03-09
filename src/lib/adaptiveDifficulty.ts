/**
 * Adaptive Difficulty Engine
 * 
 * Analyzes user's completion rates, pulse data, and streaks to suggest
 * difficulty adjustments via Aurora. User approves before changes apply.
 */

export interface DifficultySignals {
  // Completion metrics (from action_items)
  completionRate7d: number;       // 0-1: tasks completed / total scheduled (7 days)
  streakDays: number;             // Current consecutive days with ≥80% completion
  skipRate7d: number;             // 0-1: tasks skipped in last 7 days
  
  // Pulse metrics (from daily_pulse_logs)
  avgEnergy7d: number;            // 1-5 scale
  avgConfidence7d: number;        // 1-5 scale
  dominantMood: string;           // 'flow' | 'focused' | 'neutral' | 'drained' | 'wired'
  sleepComplianceRate: number;    // 0-1
  
  // Current difficulty state
  currentIntensity: 'low' | 'medium' | 'high';
}

export type DifficultyRecommendation = 
  | 'increase' 
  | 'decrease' 
  | 'maintain'
  | 'recovery_mode';

export interface DifficultyAnalysis {
  recommendation: DifficultyRecommendation;
  confidence: number;             // 0-1 how confident we are
  reason_en: string;
  reason_he: string;
  suggestedChanges: string[];     // Specific changes to propose
}

export function analyzeDifficulty(signals: DifficultySignals): DifficultyAnalysis {
  const {
    completionRate7d,
    streakDays,
    skipRate7d,
    avgEnergy7d,
    avgConfidence7d,
    dominantMood,
    sleepComplianceRate,
  } = signals;

  // ── Recovery Mode Check ──────────────────────────────
  if (avgEnergy7d < 2.0 || (dominantMood === 'drained' && sleepComplianceRate < 0.4)) {
    return {
      recommendation: 'recovery_mode',
      confidence: 0.9,
      reason_en: 'Your energy and sleep patterns suggest you need a recovery period. Let\'s ease up.',
      reason_he: 'דפוסי האנרגיה והשינה שלך מראים שאתה צריך תקופת התאוששות. בוא נקל.',
      suggestedChanges: [
        'Reduce daily tasks by 40%',
        'Replace high-intensity with gentle alternatives',
        'Add recovery activities (stretching, meditation)',
      ],
    };
  }

  // ── Increase Difficulty ──────────────────────────────
  if (
    completionRate7d >= 0.85 &&
    streakDays >= 5 &&
    avgEnergy7d >= 3.5 &&
    avgConfidence7d >= 3.5 &&
    (dominantMood === 'flow' || dominantMood === 'focused')
  ) {
    return {
      recommendation: 'increase',
      confidence: Math.min(0.95, 0.6 + (completionRate7d - 0.85) * 3 + (streakDays - 5) * 0.05),
      reason_en: `You've been crushing it — ${Math.round(completionRate7d * 100)}% completion rate with a ${streakDays}-day streak. Ready for the next level?`,
      reason_he: `אתה מוחץ את זה — ${Math.round(completionRate7d * 100)}% השלמה עם רצף של ${streakDays} ימים. מוכן לרמה הבאה?`,
      suggestedChanges: [
        'Add 1-2 more challenging tasks per day',
        'Extend session durations by 15%',
        'Introduce new skill-building exercises',
      ],
    };
  }

  // ── Decrease Difficulty ──────────────────────────────
  if (
    completionRate7d < 0.5 ||
    skipRate7d > 0.4 ||
    (avgEnergy7d < 2.5 && avgConfidence7d < 2.5)
  ) {
    return {
      recommendation: 'decrease',
      confidence: Math.min(0.9, 0.5 + (0.5 - completionRate7d) * 2),
      reason_en: `Your completion rate has dropped to ${Math.round(completionRate7d * 100)}%. Let's adjust to keep momentum going.`,
      reason_he: `שיעור ההשלמה שלך ירד ל-${Math.round(completionRate7d * 100)}%. בוא נתאים כדי לשמור על המומנטום.`,
      suggestedChanges: [
        'Reduce daily tasks by 20-30%',
        'Focus on 2-3 high-impact items only',
        'Shorten session durations',
      ],
    };
  }

  // ── Maintain ─────────────────────────────────────────
  return {
    recommendation: 'maintain',
    confidence: 0.7,
    reason_en: 'Your current pace seems right. Keep it up!',
    reason_he: 'הקצב הנוכחי שלך נראה נכון. המשך כך!',
    suggestedChanges: [],
  };
}

/**
 * Format the analysis into a message Aurora can present to the user
 */
export function formatDifficultyMessage(analysis: DifficultyAnalysis, language: string): string {
  const isHe = language === 'he';
  const reason = isHe ? analysis.reason_he : analysis.reason_en;
  
  if (analysis.recommendation === 'maintain') {
    return reason;
  }

  const emoji = {
    increase: '🚀',
    decrease: '🎯',
    recovery_mode: '🧘',
    maintain: '👍',
  }[analysis.recommendation];

  const header = {
    increase: isHe ? 'הצעה להגברת העוצמה' : 'Suggestion: Increase Intensity',
    decrease: isHe ? 'הצעה להקלה' : 'Suggestion: Ease Up',
    recovery_mode: isHe ? 'מצב התאוששות מומלץ' : 'Recovery Mode Recommended',
    maintain: '',
  }[analysis.recommendation];

  return `${emoji} **${header}**\n\n${reason}`;
}
