/**
 * Character Traits System for Identity Building
 * Each trait has colors, categories, and descriptions
 */

export type TraitCategory = 
  | 'inner_strength'    // כוח פנימי - כתום
  | 'thinking'          // חשיבה - סגול
  | 'heart'             // לב ורגש - ורוד
  | 'leadership'        // מנהיגות - זהב
  | 'social'            // חברתי - ירוק
  | 'spiritual';        // רוחני - אינדיגו

export interface CharacterTrait {
  id: string;
  name: string;
  nameHe: string;
  category: TraitCategory;
  icon: string;
  color: string;        // HEX color
  gradient: string;     // Tailwind gradient classes
  description: string;
  descriptionHe: string;
}

export interface TraitCategoryInfo {
  name: string;
  nameHe: string;
  icon: string;
  color: string;
  gradient: string;
  bgClass: string;
  textClass: string;
}

export const TRAIT_CATEGORIES: Record<TraitCategory, TraitCategoryInfo> = {
  inner_strength: {
    name: 'Inner Strength',
    nameHe: 'כוח פנימי',
    icon: '💪',
    color: '#f97316',
    gradient: 'from-orange-500 to-red-500',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    textClass: 'text-orange-700 dark:text-orange-300',
  },
  thinking: {
    name: 'Thinking',
    nameHe: 'חשיבה',
    icon: '🧠',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    bgClass: 'bg-violet-100 dark:bg-violet-900/30',
    textClass: 'text-violet-700 dark:text-violet-300',
  },
  heart: {
    name: 'Heart & Emotion',
    nameHe: 'לב ורגש',
    icon: '❤️',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-500',
    bgClass: 'bg-pink-100 dark:bg-pink-900/30',
    textClass: 'text-pink-700 dark:text-pink-300',
  },
  leadership: {
    name: 'Leadership',
    nameHe: 'מנהיגות',
    icon: '🌟',
    color: '#eab308',
    gradient: 'from-yellow-500 to-amber-500',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-700 dark:text-yellow-300',
  },
  social: {
    name: 'Social',
    nameHe: 'חברתי',
    icon: '🤝',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  spiritual: {
    name: 'Spiritual',
    nameHe: 'רוחני',
    icon: '🔮',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-purple-600',
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
    textClass: 'text-indigo-700 dark:text-indigo-300',
  },
};

export const CHARACTER_TRAITS: CharacterTrait[] = [
  // === INNER STRENGTH (כוח פנימי) ===
  {
    id: 'courage',
    name: 'Courage',
    nameHe: 'אומץ',
    category: 'inner_strength',
    icon: '🦁',
    color: '#f97316',
    gradient: 'from-orange-400 to-orange-600',
    description: 'Face fears and take bold action',
    descriptionHe: 'להתמודד עם פחדים ולפעול באומץ',
  },
  {
    id: 'resilience',
    name: 'Resilience',
    nameHe: 'עמידות',
    category: 'inner_strength',
    icon: '🏔️',
    color: '#ea580c',
    gradient: 'from-orange-500 to-red-500',
    description: 'Bounce back from challenges stronger',
    descriptionHe: 'להתאושש מאתגרים ולחזור חזק יותר',
  },
  {
    id: 'self_discipline',
    name: 'Self-Discipline',
    nameHe: 'משמעת עצמית',
    category: 'inner_strength',
    icon: '🎯',
    color: '#dc2626',
    gradient: 'from-red-500 to-orange-500',
    description: 'Stay committed to your goals',
    descriptionHe: 'להישאר מחויב למטרות שלך',
  },
  {
    id: 'determination',
    name: 'Determination',
    nameHe: 'נחישות',
    category: 'inner_strength',
    icon: '⚡',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
    description: 'Pursue goals with unwavering focus',
    descriptionHe: 'לרדוף אחרי מטרות במיקוד בלתי מתפשר',
  },
  {
    id: 'persistence',
    name: 'Persistence',
    nameHe: 'התמדה',
    category: 'inner_strength',
    icon: '🔥',
    color: '#ef4444',
    gradient: 'from-red-400 to-orange-500',
    description: 'Keep going despite obstacles',
    descriptionHe: 'להמשיך למרות מכשולים',
  },

  // === THINKING (חשיבה) ===
  {
    id: 'wisdom',
    name: 'Wisdom',
    nameHe: 'חכמה',
    category: 'thinking',
    icon: '🦉',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    description: 'Make thoughtful, informed decisions',
    descriptionHe: 'לקבל החלטות מושכלות ומחושבות',
  },
  {
    id: 'curiosity',
    name: 'Curiosity',
    nameHe: 'סקרנות',
    category: 'thinking',
    icon: '🔍',
    color: '#a855f7',
    gradient: 'from-purple-500 to-violet-600',
    description: 'Explore and learn continuously',
    descriptionHe: 'לחקור וללמוד ללא הפסקה',
  },
  {
    id: 'open_mindedness',
    name: 'Open-mindedness',
    nameHe: 'פתיחות מחשבתית',
    category: 'thinking',
    icon: '🌈',
    color: '#7c3aed',
    gradient: 'from-violet-600 to-purple-500',
    description: 'Welcome new ideas and perspectives',
    descriptionHe: 'לקבל רעיונות ונקודות מבט חדשות',
  },
  {
    id: 'critical_thinking',
    name: 'Critical Thinking',
    nameHe: 'חשיבה ביקורתית',
    category: 'thinking',
    icon: '⚖️',
    color: '#9333ea',
    gradient: 'from-purple-600 to-violet-500',
    description: 'Analyze and evaluate objectively',
    descriptionHe: 'לנתח ולהעריך באופן אובייקטיבי',
  },
  {
    id: 'creativity',
    name: 'Creativity',
    nameHe: 'יצירתיות',
    category: 'thinking',
    icon: '🎨',
    color: '#c026d3',
    gradient: 'from-fuchsia-500 to-purple-500',
    description: 'Think outside the box',
    descriptionHe: 'לחשוב מחוץ לקופסה',
  },

  // === HEART & EMOTION (לב ורגש) ===
  {
    id: 'empathy',
    name: 'Empathy',
    nameHe: 'אמפתיה',
    category: 'heart',
    icon: '💗',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-500',
    description: 'Understand and share feelings of others',
    descriptionHe: 'להבין ולחלוק את רגשותיהם של אחרים',
  },
  {
    id: 'compassion',
    name: 'Compassion',
    nameHe: 'חמלה',
    category: 'heart',
    icon: '🤗',
    color: '#f43f5e',
    gradient: 'from-rose-500 to-pink-500',
    description: 'Show kindness and care for others',
    descriptionHe: 'להראות טוב לב ודאגה לאחרים',
  },
  {
    id: 'patience',
    name: 'Patience',
    nameHe: 'סבלנות',
    category: 'heart',
    icon: '🌸',
    color: '#db2777',
    gradient: 'from-pink-600 to-rose-500',
    description: 'Accept delays with calm',
    descriptionHe: 'לקבל עיכובים בשלווה',
  },
  {
    id: 'self_love',
    name: 'Self-Love',
    nameHe: 'אהבה עצמית',
    category: 'heart',
    icon: '🌹',
    color: '#e11d48',
    gradient: 'from-rose-600 to-pink-500',
    description: 'Value and care for yourself',
    descriptionHe: 'להעריך ולטפל בעצמך',
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    nameHe: 'הכרת תודה',
    category: 'heart',
    icon: '🙏',
    color: '#be185d',
    gradient: 'from-pink-700 to-rose-500',
    description: 'Appreciate what you have',
    descriptionHe: 'להעריך את מה שיש לך',
  },

  // === LEADERSHIP (מנהיגות) ===
  {
    id: 'accountability',
    name: 'Accountability',
    nameHe: 'אחריותיות',
    category: 'leadership',
    icon: '🎖️',
    color: '#eab308',
    gradient: 'from-yellow-500 to-amber-500',
    description: 'Own your actions and results',
    descriptionHe: 'לקחת בעלות על פעולותיך ותוצאותיך',
  },
  {
    id: 'influence',
    name: 'Influence',
    nameHe: 'השפעה',
    category: 'leadership',
    icon: '✨',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-yellow-500',
    description: 'Inspire and guide others positively',
    descriptionHe: 'לעורר השראה ולהנחות אחרים לחיוב',
  },
  {
    id: 'vision',
    name: 'Vision',
    nameHe: 'חזון',
    category: 'leadership',
    icon: '🔭',
    color: '#d97706',
    gradient: 'from-amber-600 to-yellow-500',
    description: 'See the bigger picture clearly',
    descriptionHe: 'לראות את התמונה הגדולה בבהירות',
  },
  {
    id: 'decision_making',
    name: 'Decision Making',
    nameHe: 'קבלת החלטות',
    category: 'leadership',
    icon: '🎯',
    color: '#ca8a04',
    gradient: 'from-yellow-600 to-amber-500',
    description: 'Choose wisely and confidently',
    descriptionHe: 'לבחור בחוכמה ובביטחון',
  },
  {
    id: 'initiative',
    name: 'Initiative',
    nameHe: 'יוזמה',
    category: 'leadership',
    icon: '🚀',
    color: '#fbbf24',
    gradient: 'from-yellow-400 to-amber-500',
    description: 'Take action without being told',
    descriptionHe: 'לפעול בלי לחכות לאחרים',
  },

  // === SOCIAL (חברתי) ===
  {
    id: 'communication',
    name: 'Communication',
    nameHe: 'תקשורת',
    category: 'social',
    icon: '💬',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Express yourself clearly',
    descriptionHe: 'לבטא את עצמך בבהירות',
  },
  {
    id: 'active_listening',
    name: 'Active Listening',
    nameHe: 'הקשבה פעילה',
    category: 'social',
    icon: '👂',
    color: '#14b8a6',
    gradient: 'from-teal-500 to-emerald-500',
    description: 'Truly hear and understand others',
    descriptionHe: 'לשמוע ולהבין אחרים באמת',
  },
  {
    id: 'assertiveness',
    name: 'Assertiveness',
    nameHe: 'אסרטיביות',
    category: 'social',
    icon: '🗣️',
    color: '#059669',
    gradient: 'from-emerald-600 to-teal-500',
    description: 'Express needs respectfully',
    descriptionHe: 'לבטא צרכים בכבוד',
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    nameHe: 'שיתוף פעולה',
    category: 'social',
    icon: '🤝',
    color: '#0d9488',
    gradient: 'from-teal-600 to-emerald-500',
    description: 'Work effectively with others',
    descriptionHe: 'לעבוד ביעילות עם אחרים',
  },
  {
    id: 'generosity',
    name: 'Generosity',
    nameHe: 'נדיבות',
    category: 'social',
    icon: '🎁',
    color: '#34d399',
    gradient: 'from-emerald-400 to-teal-500',
    description: 'Give freely without expecting return',
    descriptionHe: 'לתת בחופשיות בלי לצפות לתמורה',
  },

  // === SPIRITUAL (רוחני) ===
  {
    id: 'presence',
    name: 'Presence',
    nameHe: 'נוכחות',
    category: 'spiritual',
    icon: '🧘',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-purple-600',
    description: 'Be fully in the moment',
    descriptionHe: 'להיות נוכח לחלוטין ברגע',
  },
  {
    id: 'inner_peace',
    name: 'Inner Peace',
    nameHe: 'שלווה פנימית',
    category: 'spiritual',
    icon: '☮️',
    color: '#818cf8',
    gradient: 'from-indigo-400 to-purple-500',
    description: 'Find calm within yourself',
    descriptionHe: 'למצוא שקט פנימי',
  },
  {
    id: 'faith',
    name: 'Faith',
    nameHe: 'אמונה',
    category: 'spiritual',
    icon: '🕯️',
    color: '#4f46e5',
    gradient: 'from-indigo-600 to-purple-600',
    description: 'Trust in something greater',
    descriptionHe: 'לבטוח במשהו גדול יותר',
  },
  {
    id: 'authenticity',
    name: 'Authenticity',
    nameHe: 'אותנטיות',
    category: 'spiritual',
    icon: '💎',
    color: '#7c3aed',
    gradient: 'from-violet-600 to-indigo-500',
    description: 'Be true to yourself',
    descriptionHe: 'להיות נאמן לעצמך',
  },
  {
    id: 'humility',
    name: 'Humility',
    nameHe: 'ענווה',
    category: 'spiritual',
    icon: '🌿',
    color: '#5b21b6',
    gradient: 'from-purple-700 to-indigo-600',
    description: 'Stay grounded and open to growth',
    descriptionHe: 'להישאר מקורקע ופתוח לצמיחה',
  },
];

export function getTraitsByCategory(category: TraitCategory): CharacterTrait[] {
  return CHARACTER_TRAITS.filter((t) => t.category === category);
}

export function getTrait(id: string): CharacterTrait | undefined {
  return CHARACTER_TRAITS.find((t) => t.id === id);
}

export function getCategoryInfo(category: TraitCategory): TraitCategoryInfo {
  return TRAIT_CATEGORIES[category];
}

export function getAllCategories(): TraitCategory[] {
  return Object.keys(TRAIT_CATEGORIES) as TraitCategory[];
}

/**
 * Suggest an Ego State based on selected traits
 */
export function suggestEgoState(selectedTraitIds: string[]): string {
  const categoryCount: Record<TraitCategory, number> = {
    inner_strength: 0,
    thinking: 0,
    heart: 0,
    leadership: 0,
    social: 0,
    spiritual: 0,
  };

  selectedTraitIds.forEach((id) => {
    const trait = getTrait(id);
    if (trait) {
      categoryCount[trait.category]++;
    }
  });

  const topCategory = (Object.entries(categoryCount) as [TraitCategory, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  // Map categories to ego states
  const categoryToEgoState: Record<TraitCategory, string> = {
    inner_strength: 'warrior',
    thinking: 'sage',
    heart: 'healer',
    leadership: 'king',
    social: 'lover',
    spiritual: 'mystic',
  };

  return categoryToEgoState[topCategory] || 'guardian';
}
