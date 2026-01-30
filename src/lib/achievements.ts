/**
 * Achievement Definitions for Gamification System
 * Each achievement has XP rewards and optional token rewards
 */

export interface Achievement {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  icon: string;
  xp: number;
  tokens?: number;
  category: 'session' | 'streak' | 'exploration' | 'mastery' | 'social';
  condition?: {
    type: 'sessions_count' | 'streak_days' | 'ego_states_used' | 'total_duration' | 'level';
    value: number;
  };
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  // Session Achievements
  first_session: {
    id: 'first_session',
    name: 'First Journey',
    nameHe: 'מסע ראשון',
    description: 'Complete your first hypnosis session',
    descriptionHe: 'השלם את סשן ההיפנוזה הראשון שלך',
    icon: '🌟',
    xp: 50,
    tokens: 5,
    category: 'session',
    condition: { type: 'sessions_count', value: 1 },
  },
  ten_sessions: {
    id: 'ten_sessions',
    name: 'Dedicated Seeker',
    nameHe: 'מחפש מסור',
    description: 'Complete 10 hypnosis sessions',
    descriptionHe: 'השלם 10 סשנים של היפנוזה',
    icon: '🔮',
    xp: 150,
    tokens: 15,
    category: 'session',
    condition: { type: 'sessions_count', value: 10 },
  },
  fifty_sessions: {
    id: 'fifty_sessions',
    name: 'Mind Traveler',
    nameHe: 'מטייל בתודעה',
    description: 'Complete 50 hypnosis sessions',
    descriptionHe: 'השלם 50 סשנים של היפנוזה',
    icon: '🚀',
    xp: 500,
    tokens: 50,
    category: 'session',
    condition: { type: 'sessions_count', value: 50 },
  },
  hundred_sessions: {
    id: 'hundred_sessions',
    name: 'Consciousness Master',
    nameHe: 'אדון התודעה',
    description: 'Complete 100 hypnosis sessions',
    descriptionHe: 'השלם 100 סשנים של היפנוזה',
    icon: '👑',
    xp: 1000,
    tokens: 100,
    category: 'mastery',
    condition: { type: 'sessions_count', value: 100 },
  },

  // Streak Achievements
  streak_3: {
    id: 'streak_3',
    name: 'Getting Started',
    nameHe: 'רק מתחילים',
    description: '3 day streak',
    descriptionHe: 'רצף של 3 ימים',
    icon: '🔥',
    xp: 30,
    category: 'streak',
    condition: { type: 'streak_days', value: 3 },
  },
  streak_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    nameHe: 'לוחם השבוע',
    description: '7 day streak',
    descriptionHe: 'רצף של 7 ימים',
    icon: '🔥',
    xp: 100,
    tokens: 10,
    category: 'streak',
    condition: { type: 'streak_days', value: 7 },
  },
  streak_14: {
    id: 'streak_14',
    name: 'Fortnight Focus',
    nameHe: 'מיקוד דו-שבועי',
    description: '14 day streak',
    descriptionHe: 'רצף של 14 ימים',
    icon: '💪',
    xp: 200,
    tokens: 20,
    category: 'streak',
    condition: { type: 'streak_days', value: 14 },
  },
  streak_30: {
    id: 'streak_30',
    name: 'Monthly Devotion',
    nameHe: 'מסירות חודשית',
    description: '30 day streak',
    descriptionHe: 'רצף של 30 ימים',
    icon: '🏆',
    xp: 500,
    tokens: 50,
    category: 'streak',
    condition: { type: 'streak_days', value: 30 },
  },
  streak_100: {
    id: 'streak_100',
    name: 'Century Champion',
    nameHe: 'אלוף המאה',
    description: '100 day streak',
    descriptionHe: 'רצף של 100 ימים',
    icon: '💎',
    xp: 2000,
    tokens: 200,
    category: 'streak',
    condition: { type: 'streak_days', value: 100 },
  },

  // Exploration Achievements
  three_ego_states: {
    id: 'three_ego_states',
    name: 'Explorer',
    nameHe: 'חוקר',
    description: 'Use 3 different ego states',
    descriptionHe: 'השתמש ב-3 מצבי אגו שונים',
    icon: '🧭',
    xp: 75,
    category: 'exploration',
    condition: { type: 'ego_states_used', value: 3 },
  },
  six_ego_states: {
    id: 'six_ego_states',
    name: 'Versatile Mind',
    nameHe: 'תודעה גמישה',
    description: 'Use 6 different ego states',
    descriptionHe: 'השתמש ב-6 מצבי אגו שונים',
    icon: '🌈',
    xp: 150,
    tokens: 15,
    category: 'exploration',
    condition: { type: 'ego_states_used', value: 6 },
  },
  all_ego_states: {
    id: 'all_ego_states',
    name: 'Complete Integration',
    nameHe: 'אינטגרציה מלאה',
    description: 'Use all 12 ego states',
    descriptionHe: 'השתמש בכל 12 מצבי האגו',
    icon: '✨',
    xp: 500,
    tokens: 50,
    category: 'exploration',
    condition: { type: 'ego_states_used', value: 12 },
  },
  // Identity Building Achievements
  trait_selector: {
    id: 'trait_selector',
    name: 'Identity Builder',
    nameHe: 'בונה זהות',
    description: 'Selected your core character traits',
    descriptionHe: 'בחרת את תכונות האופי המרכזיות שלך',
    icon: '🎭',
    xp: 30,
    tokens: 5,
    category: 'exploration',
  },
  balanced_person: {
    id: 'balanced_person',
    name: 'Renaissance Soul',
    nameHe: 'נשמה רנסנסית',
    description: 'Selected traits from all 6 categories',
    descriptionHe: 'בחרת תכונות מכל 6 הקטגוריות',
    icon: '⚖️',
    xp: 50,
    tokens: 10,
    category: 'exploration',
  },


  // Duration Achievements
  hour_total: {
    id: 'hour_total',
    name: 'First Hour',
    nameHe: 'שעה ראשונה',
    description: 'Spend 1 hour in total sessions',
    descriptionHe: 'בלה שעה בסה"כ בסשנים',
    icon: '⏰',
    xp: 50,
    category: 'session',
    condition: { type: 'total_duration', value: 3600 },
  },
  ten_hours_total: {
    id: 'ten_hours_total',
    name: 'Deep Diver',
    nameHe: 'צולל לעומק',
    description: 'Spend 10 hours in total sessions',
    descriptionHe: 'בלה 10 שעות בסה"כ בסשנים',
    icon: '🌊',
    xp: 300,
    tokens: 30,
    category: 'mastery',
    condition: { type: 'total_duration', value: 36000 },
  },

  // Level Achievements
  level_5: {
    id: 'level_5',
    name: 'Rising Star',
    nameHe: 'כוכב עולה',
    description: 'Reach level 5',
    descriptionHe: 'הגע לרמה 5',
    icon: '⭐',
    xp: 100,
    category: 'mastery',
    condition: { type: 'level', value: 5 },
  },
  level_10: {
    id: 'level_10',
    name: 'Adept',
    nameHe: 'מומחה',
    description: 'Reach level 10',
    descriptionHe: 'הגע לרמה 10',
    icon: '🌟',
    xp: 250,
    tokens: 25,
    category: 'mastery',
    condition: { type: 'level', value: 10 },
  },
  level_25: {
    id: 'level_25',
    name: 'Master',
    nameHe: 'אדון',
    description: 'Reach level 25',
    descriptionHe: 'הגע לרמה 25',
    icon: '💫',
    xp: 750,
    tokens: 75,
    category: 'mastery',
    condition: { type: 'level', value: 25 },
  },
  level_50: {
    id: 'level_50',
    name: 'Grandmaster',
    nameHe: 'גרנדמאסטר',
    description: 'Reach level 50',
    descriptionHe: 'הגע לרמה 50',
    icon: '👑',
    xp: 2000,
    tokens: 200,
    category: 'mastery',
    condition: { type: 'level', value: 50 },
  },
};

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS[id];
}

export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS);
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return getAllAchievements().filter((a) => a.category === category);
}

export function calculateXpForLevel(level: number): number {
  return (level - 1) * 100;
}

export function calculateLevelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function calculateXpProgress(xp: number): { current: number; required: number; percentage: number } {
  const level = calculateLevelFromXp(xp);
  const xpForCurrentLevel = calculateXpForLevel(level);
  const xpForNextLevel = calculateXpForLevel(level + 1);
  const current = xp - xpForCurrentLevel;
  const required = xpForNextLevel - xpForCurrentLevel;
  const percentage = (current / required) * 100;

  return { current, required, percentage };
}
