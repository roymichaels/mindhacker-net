import { CORE_DOMAINS, ARENA_DOMAINS, LIFE_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';

export function getCombatRank(level: number): { en: string; he: string } {
  if (level >= 80) return { en: 'Elite', he: 'עילית' };
  if (level >= 51) return { en: 'Advanced', he: 'מתקדם' };
  if (level >= 26) return { en: 'Fighter', he: 'לוחם' };
  if (level >= 11) return { en: 'Operator', he: 'מפעיל' };
  return { en: 'Initiate', he: 'חניך' };
}

export function getPillarRank(level: number): { en: string; he: string } {
  if (level >= 80) return { en: 'Master', he: 'מאסטר' };
  if (level >= 51) return { en: 'Expert', he: 'מומחה' };
  if (level >= 26) return { en: 'Practitioner', he: 'מתרגל' };
  if (level >= 11) return { en: 'Explorer', he: 'חוקר' };
  return { en: 'Newcomer', he: 'חדש' };
}

export function getRankForPillar(pillar: string, level: number) {
  if (pillar === 'combat') return getCombatRank(level);
  return getPillarRank(level);
}

/** Sub-categories per pillar for thread filtering */
export const PILLAR_SUBCATEGORIES: Record<string, { id: string; en: string; he: string; icon: string }[]> = {
  combat: [
    { id: 'striking', en: 'Striking', he: 'הכאה', icon: '🥊' },
    { id: 'grappling', en: 'Grappling', he: 'היאבקות', icon: '🤼' },
    { id: 'tactical', en: 'Tactical', he: 'טקטיקה', icon: '🧠' },
    { id: 'weapons', en: 'Weapons', he: 'נשק', icon: '🗡️' },
    { id: 'conditioning', en: 'Conditioning', he: 'כושר לחימה', icon: '💪' },
    { id: 'solo-training', en: 'Solo Training', he: 'אימון עצמאי', icon: '🎯' },
    { id: 'mistake-analysis', en: 'Mistake Analysis', he: 'ניתוח טעויות', icon: '⚠️' },
    { id: 'sparring-iq', en: 'Sparring IQ', he: 'IQ קרב', icon: '♟️' },
    { id: 'biomechanics', en: 'Biomechanics', he: 'ביומכניקה', icon: '⚙️' },
  ],
};

/** Aurora deterministic auto-reply */
export function generateAuroraReply(pillar: string, category: string | null, title: string, snippet: string, isHe: boolean): string {
  const summaryTemplates: Record<string, { en: string; he: string }> = {
    'combat': { en: 'Combat thread.', he: 'שרשור לחימה.' },
    'consciousness': { en: 'Consciousness exploration.', he: 'חקירת תודעה.' },
    'presence': { en: 'Image & presence thread.', he: 'שרשור תדמית ונוכחות.' },
    'power': { en: 'Strength discussion.', he: 'דיון כוח.' },
    'vitality': { en: 'Vitality focus.', he: 'מיקוד חיוניות.' },
    'focus': { en: 'Focus & discipline.', he: 'מיקוד ומשמעת.' },
    'expansion': { en: 'Growth & learning.', he: 'צמיחה ולמידה.' },
    'wealth': { en: 'Wealth strategy.', he: 'אסטרטגיית עושר.' },
    'influence': { en: 'Influence thread.', he: 'שרשור השפעה.' },
    'relationships': { en: 'Relationships discussion.', he: 'דיון קשרים.' },
    'business': { en: 'Business thread.', he: 'שרשור עסקים.' },
    'projects': { en: 'Projects discussion.', he: 'דיון פרויקטים.' },
    'play': { en: 'Play & regeneration.', he: 'משחק והתחדשות.' },
  };

  const summary = summaryTemplates[pillar] || { en: 'Discussion thread.', he: 'שרשור דיון.' };

  if (isHe) {
    return `🤖 **Aurora**

🧠 **סיכום:** ${summary.he} "${title}"

🔎 **מנוף מרכזי:** הנקודה המכרעת כאן היא לא מה שנראה על פני השטח — אלא מה קורה ברגע שלפני.

🎯 **שאלה:** מה הדבר הראשון שאתה מרגיש ששובר לך את הביצוע — עייפות, חוסר ביטחון, או תזמון?`;
  }

  return `🤖 **Aurora**

🧠 **Summary:** ${summary.en} "${title}"

🔎 **Core Lever:** The decisive factor here isn't what's on the surface — it's what happens in the moment before.

🎯 **Question:** What's the first thing you feel breaks your execution — fatigue, lack of confidence, or timing?`;
}
