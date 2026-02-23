import { CORE_DOMAINS, ARENA_DOMAINS, LIFE_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';

/* ── Rank system ── */

export function getCombatRank(level: number): { en: string; he: string } {
  if (level >= 80) return { en: 'Elite', he: 'עילית' };
  if (level >= 51) return { en: 'Advanced', he: 'מתקדם' };
  if (level >= 26) return { en: 'Fighter', he: 'לוחם' };
  if (level >= 11) return { en: 'Operator', he: 'מפעיל' };
  return { en: 'Initiate', he: 'חניך' };
}

export function getPillarRank(level: number): { en: string; he: string } {
  if (level >= 80) return { en: 'Elite', he: 'עילית' };
  if (level >= 51) return { en: 'Advanced', he: 'מתקדם' };
  if (level >= 26) return { en: 'Builder', he: 'בונה' };
  if (level >= 11) return { en: 'Operator', he: 'מפעיל' };
  return { en: 'Initiate', he: 'חניך' };
}

export function getRankForPillar(pillar: string, level: number) {
  if (pillar === 'combat') return getCombatRank(level);
  return getPillarRank(level);
}

/* ── Reputation ranks ── */
export type ReputationTier = 'bronze' | 'silver' | 'gold' | 'apex';

export function getReputationTier(score: number): { tier: ReputationTier; en: string; he: string; color: string } {
  if (score >= 200) return { tier: 'apex', en: 'Apex', he: 'אפקס', color: 'text-amber-400' };
  if (score >= 100) return { tier: 'gold', en: 'Gold', he: 'זהב', color: 'text-yellow-500' };
  if (score >= 40)  return { tier: 'silver', en: 'Silver', he: 'כסף', color: 'text-slate-400' };
  return { tier: 'bronze', en: 'Bronze', he: 'ברונזה', color: 'text-orange-600' };
}

export function calculateReputation(approvedThreads: number, replies: number, upvotesReceived: number): number {
  return (approvedThreads * 3) + (replies * 1) + (upvotesReceived * 2);
}

export function calculateTrendingScore(upvotes: number, replies: number, hoursAgo: number): number {
  const freshness = Math.max(0, 1 - (hoursAgo / 72)); // 72h decay
  return (upvotes * 2) + replies + (freshness * 10);
}

/* ── Sub-categories per pillar ── */
export interface PillarSubcategory {
  id: string;
  en: string;
  he: string;
  icon: string;
}

export const PILLAR_SUBCATEGORIES: Record<string, PillarSubcategory[]> = {
  consciousness: [
    { id: 'identity', en: 'Identity', he: 'זהות', icon: '🪞' },
    { id: 'shadow-work', en: 'Shadow Work', he: 'עבודת צל', icon: '🌑' },
    { id: 'awareness', en: 'Awareness', he: 'מודעות', icon: '👁️' },
    { id: 'ego-patterns', en: 'Ego Patterns', he: 'דפוסי אגו', icon: '🧩' },
    { id: 'value-systems', en: 'Value Systems', he: 'מערכות ערכים', icon: '⚖️' },
  ],
  presence: [
    { id: 'face-aesthetics', en: 'Face Aesthetics', he: 'אסתטיקת פנים', icon: '✨' },
    { id: 'body-signal', en: 'Body Signal', he: 'שפת גוף', icon: '🧍' },
    { id: 'style', en: 'Style', he: 'סגנון', icon: '👔' },
    { id: 'grooming', en: 'Grooming', he: 'טיפוח', icon: '💈' },
    { id: 'social-perception', en: 'Social Perception', he: 'תפיסה חברתית', icon: '🎭' },
  ],
  power: [
    { id: 'strength', en: 'Strength', he: 'כוח', icon: '🏋️' },
    { id: 'calisthenics', en: 'Calisthenics', he: 'קליסטניקס', icon: '🤸' },
    { id: 'skill-progressions', en: 'Skill Progressions', he: 'התקדמות מיומנויות', icon: '📊' },
    { id: 'mobility', en: 'Mobility', he: 'ניידות', icon: '🔄' },
    { id: 'tendon-work', en: 'Tendon Work', he: 'עבודת גידים', icon: '🦴' },
  ],
  vitality: [
    { id: 'sleep', en: 'Sleep', he: 'שינה', icon: '😴' },
    { id: 'nutrition', en: 'Nutrition', he: 'תזונה', icon: '🥗' },
    { id: 'hormonal-balance', en: 'Hormonal Balance', he: 'איזון הורמונלי', icon: '⚗️' },
    { id: 'stress-load', en: 'Stress Load', he: 'עומס לחץ', icon: '🌡️' },
    { id: 'recovery', en: 'Recovery', he: 'התאוששות', icon: '🧊' },
  ],
  focus: [
    { id: 'deep-work', en: 'Deep Work', he: 'עבודה עמוקה', icon: '🔬' },
    { id: 'dopamine-control', en: 'Dopamine Control', he: 'שליטה בדופמין', icon: '🧪' },
    { id: 'meditation', en: 'Meditation', he: 'מדיטציה', icon: '🧘' },
    { id: 'breathwork', en: 'Breathwork', he: 'עבודת נשימה', icon: '🌬️' },
    { id: 'habit-systems', en: 'Habit Systems', he: 'מערכות הרגלים', icon: '⚙️' },
  ],
  combat: [
    { id: 'martial-arts-styles', en: 'Martial Arts Styles', he: 'סגנונות לחימה', icon: '🥋' },
    { id: 'striking', en: 'Striking', he: 'הכאה (Striking)', icon: '🥊' },
    { id: 'grappling', en: 'Grappling', he: 'היאבקות (Grappling)', icon: '🤼' },
    { id: 'self-defense', en: 'Self Defense', he: 'הגנה עצמית', icon: '🛡️' },
    { id: 'weapons-defense', en: 'Weapons Defense', he: 'הגנה מנשק', icon: '🔪' },
    { id: 'conditioning', en: 'Conditioning', he: 'כושר לחימה', icon: '💪' },
    { id: 'sparring-drills', en: 'Sparring & Drills', he: 'ספארינג ותרגול', icon: '⚔️' },
    { id: 'mindset-fear', en: 'Mindset & Fear Control', he: 'מנטליות ופחד', icon: '🧠' },
    { id: 'training-plans', en: 'Training Plans', he: 'תוכניות אימון', icon: '📅' },
    { id: 'technique-analysis', en: 'Technique Analysis', he: 'ניתוח טכניקה', icon: '📹' },
    { id: 'injury-prevention', en: 'Injury Prevention', he: 'מניעת פציעות', icon: '🩹' },
    { id: 'philosophy-ethics', en: 'Philosophy & Ethics', he: 'פילוסופיה ואתיקה', icon: '📜' },
  ],
  expansion: [
    { id: 'learning-systems', en: 'Learning Systems', he: 'מערכות למידה', icon: '📚' },
    { id: 'philosophy', en: 'Philosophy', he: 'פילוסופיה', icon: '🏛️' },
    { id: 'languages', en: 'Languages', he: 'שפות', icon: '🗣️' },
    { id: 'creativity', en: 'Creativity', he: 'יצירתיות', icon: '🎨' },
    { id: 'systems-thinking', en: 'Systems Thinking', he: 'חשיבה מערכתית', icon: '🔗' },
  ],
  wealth: [
    { id: 'income-models', en: 'Income Models', he: 'מודלי הכנסה', icon: '💰' },
    { id: 'investing', en: 'Investing', he: 'השקעות', icon: '📈' },
    { id: 'risk-management', en: 'Risk Management', he: 'ניהול סיכונים', icon: '🛡️' },
    { id: 'assets', en: 'Assets', he: 'נכסים', icon: '🏠' },
  ],
  influence: [
    { id: 'branding', en: 'Branding', he: 'מיתוג', icon: '🏷️' },
    { id: 'content-strategy', en: 'Content Strategy', he: 'אסטרטגיית תוכן', icon: '📝' },
    { id: 'speech', en: 'Speech', he: 'נאום', icon: '🎤' },
    { id: 'narrative', en: 'Narrative', he: 'נרטיב', icon: '📖' },
  ],
  relationships: [
    { id: 'dating', en: 'Dating', he: 'היכרויות', icon: '💕' },
    { id: 'social-skills', en: 'Social Skills', he: 'מיומנויות חברתיות', icon: '🤝' },
    { id: 'boundaries', en: 'Boundaries', he: 'גבולות', icon: '🚧' },
    { id: 'tribe', en: 'Tribe', he: 'שבט', icon: '👥' },
  ],
  business: [
    { id: 'offer-design', en: 'Offer Design', he: 'עיצוב הצעה', icon: '🎁' },
    { id: 'sales', en: 'Sales', he: 'מכירות', icon: '🤑' },
    { id: 'funnels', en: 'Funnels', he: 'משפכים', icon: '🔻' },
    { id: 'operations', en: 'Operations', he: 'תפעול', icon: '⚙️' },
  ],
  projects: [
    { id: 'build-logs', en: 'Build Logs', he: 'יומני בנייה', icon: '📋' },
    { id: 'execution', en: 'Execution', he: 'ביצוע', icon: '🚀' },
    { id: 'sprint-planning', en: 'Sprint Planning', he: 'תכנון ספרינט', icon: '📅' },
    { id: 'retrospective', en: 'Retrospective', he: 'רטרוספקטיבה', icon: '🔍' },
  ],
  play: [
    { id: 'adventure', en: 'Adventure', he: 'הרפתקאות', icon: '🏔️' },
    { id: 'travel', en: 'Travel', he: 'טיולים', icon: '✈️' },
    { id: 'flow-sports', en: 'Flow Sports', he: 'ספורט זרימה', icon: '🏄' },
    { id: 'regeneration', en: 'Regeneration', he: 'התחדשות', icon: '🌿' },
    { id: 'tactical-games', en: 'Tactical Games', he: 'משחקי טקטיקה', icon: '♟️' },
  ],
};

/* ── Aurora deterministic auto-reply ── */
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
