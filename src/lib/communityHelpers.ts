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

export interface TopicGroup {
  id: string;
  en: string;
  he: string;
  topicIds: string[];
}

export const PILLAR_SUBCATEGORIES: Record<string, PillarSubcategory[]> = {
  consciousness: [
    { id: 'identity', en: 'Identity', he: 'זהות', icon: '🪞' },
    { id: 'shadow-work', en: 'Shadow Work', he: 'עבודת צל', icon: '🌑' },
    { id: 'awareness', en: 'Awareness', he: 'מודעות', icon: '👁️' },
    { id: 'ego-patterns', en: 'Ego Patterns', he: 'דפוסי אגו', icon: '🧩' },
    { id: 'value-systems', en: 'Value Systems', he: 'מערכות ערכים', icon: '⚖️' },
    { id: 'inner-dialogue', en: 'Inner Dialogue', he: 'דיאלוג פנימי', icon: '💬' },
    { id: 'belief-systems', en: 'Belief Systems', he: 'מערכות אמונה', icon: '🔮' },
    { id: 'emotional-mastery', en: 'Emotional Mastery', he: 'שליטה רגשית', icon: '🎭' },
    { id: 'purpose', en: 'Purpose & Mission', he: 'ייעוד ומשימה', icon: '🧭' },
    { id: 'journaling', en: 'Journaling & Reflection', he: 'כתיבה ורפלקציה', icon: '📓' },
    { id: 'self-inquiry', en: 'Self-Inquiry', he: 'חקירה עצמית', icon: '🔍' },
    { id: 'introspection', en: 'Introspection', he: 'הסתכלות פנימה', icon: '🫧' },
    { id: 'cognitive-biases', en: 'Cognitive Biases', he: 'הטיות קוגניטיביות', icon: '⚡' },
    { id: 'emotional-triggers', en: 'Emotional Triggers', he: 'טריגרים רגשיים', icon: '🎯' },
    { id: 'vulnerability', en: 'Vulnerability', he: 'פגיעות', icon: '💎' },
    { id: 'contemplation', en: 'Contemplation', he: 'התבוננות', icon: '🌙' },
    { id: 'mindfulness', en: 'Mindfulness', he: 'קשיבות', icon: '🧘' },
    { id: 'meaning-making', en: 'Meaning Making', he: 'יצירת משמעות', icon: '✨' },
    { id: 'life-philosophy', en: 'Life Philosophy', he: 'פילוסופיית חיים', icon: '📜' },
  ],
  presence: [
    { id: 'face-aesthetics', en: 'Face Aesthetics', he: 'אסתטיקת פנים', icon: '✨' },
    { id: 'body-signal', en: 'Body Signal', he: 'שפת גוף', icon: '🧍' },
    { id: 'style', en: 'Style', he: 'סגנון', icon: '👔' },
    { id: 'grooming', en: 'Grooming', he: 'טיפוח', icon: '💈' },
    { id: 'social-perception', en: 'Social Perception', he: 'תפיסה חברתית', icon: '🎭' },
    { id: 'fragrance', en: 'Fragrance', he: 'בשמים וריח', icon: '🌸' },
    { id: 'posture', en: 'Posture & Presence', he: 'יציבה ונוכחות', icon: '🏛️' },
    { id: 'voice-tonality', en: 'Voice & Tonality', he: 'קול וטונליות', icon: '🎙️' },
    { id: 'photography', en: 'Photography & Image', he: 'צילום ותדמית', icon: '📸' },
    { id: 'wardrobe', en: 'Wardrobe Building', he: 'בניית מלתחה', icon: '👕' },
    { id: 'skincare', en: 'Skincare', he: 'טיפוח עור', icon: '🧴' },
    { id: 'hair', en: 'Hair & Beard', he: 'שיער וזקן', icon: '💇' },
    { id: 'accessories', en: 'Accessories', he: 'אביזרים', icon: '⌚' },
    { id: 'color-theory', en: 'Color Theory', he: 'תורת צבעים', icon: '🎨' },
    { id: 'first-impressions', en: 'First Impressions', he: 'רושם ראשוני', icon: '🤝' },
  ],
  power: [
    { id: 'strength', en: 'Strength', he: 'כוח', icon: '🏋️' },
    { id: 'calisthenics', en: 'Calisthenics', he: 'קליסטניקס', icon: '🤸' },
    { id: 'skill-progressions', en: 'Skill Progressions', he: 'התקדמות מיומנויות', icon: '📊' },
    { id: 'mobility', en: 'Mobility', he: 'ניידות', icon: '🔄' },
    { id: 'tendon-work', en: 'Tendon Work', he: 'עבודת גידים', icon: '🦴' },
    { id: 'hypertrophy', en: 'Hypertrophy & Mass', he: 'היפרטרופיה ומסה', icon: '💪' },
    { id: 'bodyweight-skills', en: 'Bodyweight Skills', he: 'מיומנויות משקל גוף', icon: '🤾' },
    { id: 'grip-strength', en: 'Grip Strength', he: 'כוח אחיזה', icon: '✊' },
    { id: 'programming', en: 'Training Programming', he: 'תכנות אימונים', icon: '📋' },
    { id: 'pr-tracking', en: 'PR Tracking & Records', he: 'שיאים אישיים', icon: '🏆' },
    { id: 'olympic-lifts', en: 'Olympic Lifts', he: 'הרמות אולימפיות', icon: '🥇' },
    { id: 'powerlifting', en: 'Powerlifting', he: 'פאוורליפטינג', icon: '🔩' },
    { id: 'movement-flow', en: 'Movement Flow', he: 'זרימת תנועה', icon: '🌊' },
    { id: 'injury-rehab', en: 'Injury & Rehab', he: 'פציעות ושיקום', icon: '🩹' },
    { id: 'flexibility', en: 'Flexibility', he: 'גמישות', icon: '🧘' },
  ],
  vitality: [
    { id: 'sleep', en: 'Sleep', he: 'שינה', icon: '😴' },
    { id: 'nutrition', en: 'Nutrition', he: 'תזונה', icon: '🥗' },
    { id: 'hormonal-balance', en: 'Hormonal Balance', he: 'איזון הורמונלי', icon: '⚗️' },
    { id: 'stress-load', en: 'Stress Load', he: 'עומס לחץ', icon: '🌡️' },
    { id: 'recovery', en: 'Recovery', he: 'התאוששות', icon: '🧊' },
    { id: 'supplements', en: 'Supplements & Nootropics', he: 'תוספים ונוטרופיקס', icon: '💊' },
    { id: 'hydration', en: 'Hydration', he: 'הידרציה', icon: '💧' },
    { id: 'fasting', en: 'Fasting Protocols', he: 'פרוטוקולי צום', icon: '⏱️' },
    { id: 'cold-heat', en: 'Cold & Heat Therapy', he: 'טיפול קור וחום', icon: '🥶' },
    { id: 'bloodwork', en: 'Blood Work & Labs', he: 'בדיקות דם ומעבדה', icon: '🩸' },
    { id: 'gut-health', en: 'Gut Health', he: 'בריאות המעי', icon: '🦠' },
    { id: 'biohacking', en: 'Biohacking', he: 'ביוהאקינג', icon: '🔬' },
    { id: 'longevity', en: 'Longevity', he: 'אריכות ימים', icon: '🧬' },
    { id: 'meal-prep', en: 'Meal Prep', he: 'הכנת ארוחות', icon: '🍱' },
    { id: 'circadian', en: 'Circadian Rhythm', he: 'קצב צירקדי', icon: '🌅' },
  ],
  focus: [
    { id: 'deep-work', en: 'Deep Work', he: 'עבודה עמוקה', icon: '🔬' },
    { id: 'dopamine-control', en: 'Dopamine Control', he: 'שליטה בדופמין', icon: '🧪' },
    { id: 'meditation', en: 'Meditation', he: 'מדיטציה', icon: '🧘' },
    { id: 'breathwork', en: 'Breathwork', he: 'עבודת נשימה', icon: '🌬️' },
    { id: 'habit-systems', en: 'Habit Systems', he: 'מערכות הרגלים', icon: '⚙️' },
    { id: 'time-management', en: 'Time Management', he: 'ניהול זמן', icon: '⏰' },
    { id: 'distraction-control', en: 'Distraction Control', he: 'שליטה בהסחות', icon: '🚫' },
    { id: 'flow-state', en: 'Flow State', he: 'מצב זרימה', icon: '🌊' },
    { id: 'morning-routine', en: 'Morning Routine', he: 'שגרת בוקר', icon: '🌅' },
    { id: 'journaling-review', en: 'Journaling & Review', he: 'יומן וסקירה', icon: '📝' },
    { id: 'evening-routine', en: 'Evening Routine', he: 'שגרת ערב', icon: '🌙' },
    { id: 'weekly-review', en: 'Weekly Review', he: 'סקירה שבועית', icon: '📊' },
    { id: 'digital-detox', en: 'Digital Detox', he: 'ניקוי דיגיטלי', icon: '📵' },
    { id: 'attention-training', en: 'Attention Training', he: 'אימון קשב', icon: '🎯' },
    { id: 'energy-management', en: 'Energy Management', he: 'ניהול אנרגיה', icon: '⚡' },
  ],
  combat: [
    { id: 'martial-arts-styles', en: 'Martial Arts Styles', he: 'סגנונות לחימה', icon: '🥋' },
    { id: 'striking', en: 'Striking', he: 'הכאה (Striking)', icon: '🥊' },
    { id: 'grappling', en: 'Grappling', he: 'היאבקות (Grappling)', icon: '🤼' },
    { id: 'shadowboxing', en: 'Shadowboxing', he: 'שאדובוקסינג', icon: '👤' },
    { id: 'gear-equipment', en: 'Gear & Equipment', he: 'ציוד ואביזרים', icon: '🎒' },
    { id: 'self-defense', en: 'Self Defense', he: 'הגנה עצמית', icon: '🛡️' },
    { id: 'weapons-defense', en: 'Weapons Defense', he: 'הגנה מנשק', icon: '🔪' },
    { id: 'conditioning', en: 'Conditioning', he: 'כושר לחימה', icon: '💪' },
    { id: 'sparring-drills', en: 'Sparring & Drills', he: 'ספארינג ותרגול', icon: '⚔️' },
    { id: 'fight-iq', en: 'Fight IQ & Strategy', he: 'IQ קרב ואסטרטגיה', icon: '♟️' },
    { id: 'mindset-fear', en: 'Mindset & Fear Control', he: 'מנטליות ופחד', icon: '🧠' },
    { id: 'training-plans', en: 'Training Plans', he: 'תוכניות אימון', icon: '📅' },
    { id: 'technique-analysis', en: 'Technique Analysis', he: 'ניתוח טכניקה', icon: '📹' },
    { id: 'fight-breakdowns', en: 'Fight Breakdowns', he: 'ניתוח קרבות', icon: '🎬' },
    { id: 'nutrition-weight', en: 'Fight Nutrition & Weight', he: 'תזונה ומשקל ללחימה', icon: '⚖️' },
    { id: 'injury-prevention', en: 'Injury Prevention', he: 'מניעת פציעות', icon: '🩹' },
    { id: 'home-training', en: 'Home & Solo Training', he: 'אימון ביתי ועצמאי', icon: '🏠' },
    { id: 'philosophy-ethics', en: 'Philosophy & Ethics', he: 'פילוסופיה ואתיקה', icon: '📜' },
  ],
  expansion: [
    { id: 'learning-systems', en: 'Learning Systems', he: 'מערכות למידה', icon: '📚' },
    { id: 'philosophy', en: 'Philosophy', he: 'פילוסופיה', icon: '🏛️' },
    { id: 'languages', en: 'Languages', he: 'שפות', icon: '🗣️' },
    { id: 'creativity', en: 'Creativity', he: 'יצירתיות', icon: '🎨' },
    { id: 'systems-thinking', en: 'Systems Thinking', he: 'חשיבה מערכתית', icon: '🔗' },
    { id: 'reading', en: 'Reading & Books', he: 'קריאה וספרים', icon: '📖' },
    { id: 'memory-techniques', en: 'Memory Techniques', he: 'טכניקות זיכרון', icon: '🧠' },
    { id: 'critical-thinking', en: 'Critical Thinking', he: 'חשיבה ביקורתית', icon: '🔍' },
    { id: 'writing', en: 'Writing & Expression', he: 'כתיבה וביטוי', icon: '✍️' },
    { id: 'mental-models', en: 'Mental Models', he: 'מודלים מנטליים', icon: '🗺️' },
    { id: 'skill-acquisition', en: 'Skill Acquisition', he: 'רכישת מיומנויות', icon: '🎯' },
    { id: 'research-methods', en: 'Research Methods', he: 'שיטות מחקר', icon: '🔬' },
    { id: 'note-taking', en: 'Note-Taking Systems', he: 'מערכות רישום', icon: '📝' },
    { id: 'debates', en: 'Debates & Discourse', he: 'דיונים ושיח', icon: '💬' },
    { id: 'teaching', en: 'Teaching & Mentoring', he: 'הוראה וחניכה', icon: '👨‍🏫' },
  ],
  wealth: [
    { id: 'income-models', en: 'Income Models', he: 'מודלי הכנסה', icon: '💰' },
    { id: 'investing', en: 'Investing', he: 'השקעות', icon: '📈' },
    { id: 'risk-management', en: 'Risk Management', he: 'ניהול סיכונים', icon: '🛡️' },
    { id: 'assets', en: 'Assets', he: 'נכסים', icon: '🏠' },
    { id: 'crypto', en: 'Crypto & Web3', he: 'קריפטו ווב3', icon: '₿' },
    { id: 'real-estate', en: 'Real Estate', he: 'נדל"ן', icon: '🏗️' },
    { id: 'budgeting', en: 'Budgeting & Saving', he: 'תקציב וחיסכון', icon: '🏦' },
    { id: 'passive-income', en: 'Passive Income', he: 'הכנסה פסיבית', icon: '🔄' },
    { id: 'tax-strategy', en: 'Tax Strategy', he: 'אסטרטגיית מס', icon: '📊' },
    { id: 'side-hustles', en: 'Side Hustles', he: 'עבודות צד', icon: '🚀' },
    { id: 'wealth-mindset', en: 'Wealth Mindset', he: 'חשיבת עושר', icon: '🧠' },
    { id: 'financial-planning', en: 'Financial Planning', he: 'תכנון פיננסי', icon: '📋' },
    { id: 'stocks', en: 'Stocks & ETFs', he: 'מניות וקרנות', icon: '📉' },
    { id: 'portfolio', en: 'Portfolio Building', he: 'בניית תיק', icon: '💼' },
    { id: 'debt-management', en: 'Debt Management', he: 'ניהול חובות', icon: '🔓' },
  ],
  influence: [
    { id: 'branding', en: 'Branding', he: 'מיתוג', icon: '🏷️' },
    { id: 'content-strategy', en: 'Content Strategy', he: 'אסטרטגיית תוכן', icon: '📝' },
    { id: 'speech', en: 'Speech', he: 'נאום', icon: '🎤' },
    { id: 'narrative', en: 'Narrative', he: 'נרטיב', icon: '📖' },
    { id: 'social-media', en: 'Social Media Growth', he: 'צמיחה ברשתות', icon: '📱' },
    { id: 'copywriting', en: 'Copywriting', he: 'קופירייטינג', icon: '✍️' },
    { id: 'video-content', en: 'Video Content', he: 'תוכן וידאו', icon: '🎬' },
    { id: 'networking', en: 'Networking', he: 'נטוורקינג', icon: '🌐' },
    { id: 'authority', en: 'Authority Building', he: 'בניית סמכות', icon: '👑' },
    { id: 'persuasion', en: 'Persuasion & Rhetoric', he: 'שכנוע ורטוריקה', icon: '🎯' },
    { id: 'leadership', en: 'Leadership', he: 'מנהיגות', icon: '🦅' },
    { id: 'public-speaking', en: 'Public Speaking', he: 'דיבור בציבור', icon: '🎙️' },
    { id: 'storytelling', en: 'Storytelling', he: 'סיפור סיפורים', icon: '📚' },
    { id: 'podcasting', en: 'Podcasting', he: 'פודקאסטים', icon: '🎧' },
    { id: 'community-building', en: 'Community Building', he: 'בניית קהילה', icon: '🏘️' },
  ],
  relationships: [
    { id: 'dating', en: 'Dating', he: 'היכרויות', icon: '💕' },
    { id: 'social-skills', en: 'Social Skills', he: 'מיומנויות חברתיות', icon: '🤝' },
    { id: 'boundaries', en: 'Boundaries', he: 'גבולות', icon: '🚧' },
    { id: 'tribe', en: 'Tribe', he: 'שבט', icon: '👥' },
    { id: 'communication', en: 'Communication', he: 'תקשורת', icon: '💬' },
    { id: 'conflict-resolution', en: 'Conflict Resolution', he: 'פתרון קונפליקטים', icon: '🕊️' },
    { id: 'attraction', en: 'Attraction & Polarity', he: 'משיכה וקוטביות', icon: '🧲' },
    { id: 'long-term', en: 'Long-Term Relationships', he: 'מערכות יחסים ארוכות', icon: '💍' },
    { id: 'masculinity', en: 'Masculinity', he: 'גבריות', icon: '🦁' },
    { id: 'family', en: 'Family Dynamics', he: 'דינמיקה משפחתית', icon: '🏡' },
    { id: 'self-worth', en: 'Self-Worth', he: 'ערך עצמי', icon: '💎' },
    { id: 'emotional-intelligence', en: 'Emotional Intelligence', he: 'אינטליגנציה רגשית', icon: '❤️' },
    { id: 'charisma', en: 'Charisma', he: 'כריזמה', icon: '✨' },
    { id: 'trust-building', en: 'Trust Building', he: 'בניית אמון', icon: '🤲' },
    { id: 'mentorship', en: 'Mentorship', he: 'מנטורינג', icon: '🧑‍🏫' },
  ],
  business: [
    { id: 'offer-design', en: 'Offer Design', he: 'עיצוב הצעה', icon: '🎁' },
    { id: 'sales', en: 'Sales', he: 'מכירות', icon: '🤑' },
    { id: 'funnels', en: 'Funnels', he: 'משפכים', icon: '🔻' },
    { id: 'operations', en: 'Operations', he: 'תפעול', icon: '⚙️' },
    { id: 'freelancing', en: 'Freelancing', he: 'פרילנסינג', icon: '💻' },
    { id: 'ecommerce', en: 'E-Commerce', he: 'מסחר אלקטרוני', icon: '🛒' },
    { id: 'automation', en: 'Automation & AI Tools', he: 'אוטומציה וכלי AI', icon: '🤖' },
    { id: 'hiring', en: 'Hiring & Team', he: 'גיוס וצוות', icon: '🧑‍🤝‍🧑' },
    { id: 'pricing', en: 'Pricing Strategy', he: 'אסטרטגיית תמחור', icon: '💲' },
    { id: 'legal', en: 'Legal & Contracts', he: 'משפטי וחוזים', icon: '📜' },
    { id: 'business-strategy', en: 'Business Strategy', he: 'אסטרטגיית עסקים', icon: '🗺️' },
    { id: 'client-management', en: 'Client Management', he: 'ניהול לקוחות', icon: '👥' },
    { id: 'growth-hacking', en: 'Growth Hacking', he: 'גרות׳ האקינג', icon: '📈' },
    { id: 'partnerships', en: 'Partnerships', he: 'שותפויות', icon: '🤝' },
    { id: 'scaling', en: 'Scaling', he: 'סקיילינג', icon: '🚀' },
  ],
  projects: [
    { id: 'build-logs', en: 'Build Logs', he: 'יומני בנייה', icon: '📋' },
    { id: 'execution', en: 'Execution', he: 'ביצוע', icon: '🚀' },
    { id: 'sprint-planning', en: 'Sprint Planning', he: 'תכנון ספרינט', icon: '📅' },
    { id: 'retrospective', en: 'Retrospective', he: 'רטרוספקטיבה', icon: '🔍' },
    { id: 'mvp', en: 'MVP & Launch', he: 'MVP והשקה', icon: '🎯' },
    { id: 'tools-stack', en: 'Tools & Tech Stack', he: 'כלים וטכנולוגיה', icon: '🛠️' },
    { id: 'accountability', en: 'Accountability', he: 'אחריותיות', icon: '🤝' },
    { id: 'showcase', en: 'Showcase & Feedback', he: 'תצוגה ופידבק', icon: '🖼️' },
    { id: 'failure-lessons', en: 'Failure & Lessons', he: 'כישלונות ולקחים', icon: '💡' },
    { id: 'project-management', en: 'Project Management', he: 'ניהול פרויקט', icon: '📊' },
    { id: 'ideation', en: 'Ideation', he: 'רעיונות', icon: '💭' },
    { id: 'collaboration', en: 'Collaboration', he: 'שיתופי פעולה', icon: '👥' },
    { id: 'shipping', en: 'Shipping & Delivery', he: 'שיגור ומסירה', icon: '📦' },
    { id: 'documentation', en: 'Documentation', he: 'תיעוד', icon: '📝' },
    { id: 'open-source', en: 'Open Source', he: 'קוד פתוח', icon: '🌍' },
  ],
  play: [
    { id: 'adventure', en: 'Adventure', he: 'הרפתקאות', icon: '🏔️' },
    { id: 'travel', en: 'Travel', he: 'טיולים', icon: '✈️' },
    { id: 'flow-sports', en: 'Flow Sports', he: 'ספורט זרימה', icon: '🏄' },
    { id: 'regeneration', en: 'Regeneration', he: 'התחדשות', icon: '🌿' },
    { id: 'tactical-games', en: 'Tactical Games', he: 'משחקי טקטיקה', icon: '♟️' },
    { id: 'outdoor', en: 'Outdoor & Nature', he: 'שטח וטבע', icon: '🏕️' },
    { id: 'music', en: 'Music & Instruments', he: 'מוזיקה וכלי נגינה', icon: '🎸' },
    { id: 'cooking', en: 'Cooking & Craft', he: 'בישול ואומנות', icon: '👨‍🍳' },
    { id: 'extreme-sports', en: 'Extreme Sports', he: 'ספורט אקסטרים', icon: '🪂' },
    { id: 'social-events', en: 'Social Events', he: 'אירועים חברתיים', icon: '🎉' },
    { id: 'photography-play', en: 'Photography', he: 'צילום', icon: '📷' },
    { id: 'gaming', en: 'Gaming', he: 'גיימינג', icon: '🎮' },
    { id: 'dance', en: 'Dance', he: 'ריקוד', icon: '💃' },
    { id: 'diy', en: 'DIY & Building', he: 'בנייה יצירתית', icon: '🔨' },
    { id: 'humor', en: 'Humor & Comedy', he: 'הומור וקומדיה', icon: '😄' },
  ],
  order: [
    { id: 'space-design', en: 'Space Design', he: 'עיצוב מרחב', icon: '🏠' },
    { id: 'digital-order', en: 'Digital Order', he: 'סדר דיגיטלי', icon: '📱' },
    { id: 'routine-consistency', en: 'Routine Consistency', he: 'עקביות שגרה', icon: '🔁' },
    { id: 'minimalism', en: 'Minimalism', he: 'מינימליזם', icon: '✨' },
    { id: 'productivity-systems', en: 'Productivity Systems', he: 'מערכות פרודוקטיביות', icon: '📊' },
    { id: 'declutter', en: 'Declutter & Reset', he: 'סידור ואיפוס', icon: '🧹' },
    { id: 'finance-tracking', en: 'Finance Tracking', he: 'מעקב כספים', icon: '💳' },
    { id: 'life-admin', en: 'Life Admin', he: 'ניהול חיים', icon: '📂' },
    { id: 'automation-tools', en: 'Automation Tools', he: 'כלי אוטומציה', icon: '🤖' },
    { id: 'goal-tracking', en: 'Goal Tracking', he: 'מעקב יעדים', icon: '🎯' },
    { id: 'time-blocking', en: 'Time Blocking', he: 'חסימת זמן', icon: '📅' },
    { id: 'inventory', en: 'Inventory & Assets', he: 'מלאי ונכסים', icon: '📦' },
    { id: 'filing-systems', en: 'Filing Systems', he: 'מערכות תיוק', icon: '🗄️' },
    { id: 'habits-tracking', en: 'Habits Tracking', he: 'מעקב הרגלים', icon: '✅' },
    { id: 'environment-design', en: 'Environment Design', he: 'עיצוב סביבה', icon: '🪴' },
  ],
};

/* ── Topic Groups per pillar (categories) ── */
export const PILLAR_TOPIC_GROUPS: Record<string, TopicGroup[]> = {
  consciousness: [
    { id: 'self-discovery', en: 'Self-Discovery', he: 'גילוי עצמי', topicIds: ['identity', 'awareness', 'shadow-work', 'self-inquiry', 'introspection'] },
    { id: 'mind-patterns', en: 'Mind Patterns', he: 'דפוסי חשיבה', topicIds: ['ego-patterns', 'belief-systems', 'inner-dialogue', 'cognitive-biases'] },
    { id: 'emotional', en: 'Emotional Mastery', he: 'שליטה רגשית', topicIds: ['emotional-mastery', 'emotional-triggers', 'vulnerability'] },
    { id: 'purpose-values', en: 'Purpose & Values', he: 'ייעוד וערכים', topicIds: ['purpose', 'value-systems', 'meaning-making', 'life-philosophy'] },
    { id: 'practices', en: 'Practices', he: 'תרגולים', topicIds: ['journaling', 'contemplation', 'mindfulness'] },
  ],
  presence: [
    { id: 'face-skin', en: 'Face & Skin', he: 'פנים ועור', topicIds: ['face-aesthetics', 'skincare', 'grooming'] },
    { id: 'style-wardrobe', en: 'Style & Wardrobe', he: 'סגנון ומלתחה', topicIds: ['style', 'wardrobe', 'accessories', 'color-theory'] },
    { id: 'body-presence', en: 'Body & Presence', he: 'גוף ונוכחות', topicIds: ['body-signal', 'posture', 'hair'] },
    { id: 'communication-voice', en: 'Voice & Perception', he: 'קול ותפיסה', topicIds: ['voice-tonality', 'social-perception', 'first-impressions'] },
    { id: 'image-building', en: 'Image Building', he: 'בניית תדמית', topicIds: ['photography', 'fragrance'] },
  ],
  power: [
    { id: 'strength-training', en: 'Strength Training', he: 'אימוני כוח', topicIds: ['strength', 'hypertrophy', 'powerlifting', 'olympic-lifts'] },
    { id: 'bodyweight', en: 'Bodyweight & Skills', he: 'משקל גוף ומיומנויות', topicIds: ['calisthenics', 'bodyweight-skills', 'skill-progressions'] },
    { id: 'mobility-health', en: 'Mobility & Health', he: 'ניידות ובריאות', topicIds: ['mobility', 'tendon-work', 'flexibility', 'injury-rehab'] },
    { id: 'grip-movement', en: 'Grip & Movement', he: 'אחיזה ותנועה', topicIds: ['grip-strength', 'movement-flow'] },
    { id: 'programming-records', en: 'Programming & Records', he: 'תכנות ושיאים', topicIds: ['programming', 'pr-tracking'] },
  ],
  vitality: [
    { id: 'sleep-recovery', en: 'Sleep & Recovery', he: 'שינה והתאוששות', topicIds: ['sleep', 'recovery', 'cold-heat', 'circadian'] },
    { id: 'nutrition-food', en: 'Nutrition & Food', he: 'תזונה ואוכל', topicIds: ['nutrition', 'hydration', 'fasting', 'meal-prep'] },
    { id: 'supplements-bio', en: 'Supplements & Bio', he: 'תוספים וביוהאקינג', topicIds: ['supplements', 'biohacking', 'longevity'] },
    { id: 'hormones-labs', en: 'Hormones & Labs', he: 'הורמונים ובדיקות', topicIds: ['hormonal-balance', 'bloodwork'] },
    { id: 'stress-gut', en: 'Stress & Gut', he: 'לחץ ומעי', topicIds: ['stress-load', 'gut-health'] },
  ],
  focus: [
    { id: 'deep-work-flow', en: 'Deep Work & Flow', he: 'עבודה עמוקה וזרימה', topicIds: ['deep-work', 'flow-state', 'distraction-control', 'attention-training'] },
    { id: 'mind-body', en: 'Mind-Body', he: 'גוף-נפש', topicIds: ['meditation', 'breathwork', 'dopamine-control'] },
    { id: 'systems-habits', en: 'Systems & Habits', he: 'מערכות והרגלים', topicIds: ['habit-systems', 'time-management', 'energy-management'] },
    { id: 'routines', en: 'Routines', he: 'שגרות', topicIds: ['morning-routine', 'evening-routine', 'digital-detox'] },
    { id: 'review-reflect', en: 'Review & Reflect', he: 'סקירה ורפלקציה', topicIds: ['journaling-review', 'weekly-review'] },
  ],
  combat: [
    { id: 'striking-grappling', en: 'Striking & Grappling', he: 'הכאה והיאבקות', topicIds: ['striking', 'grappling', 'martial-arts-styles', 'shadowboxing'] },
    { id: 'training-drills', en: 'Training & Drills', he: 'אימונים ותרגולים', topicIds: ['sparring-drills', 'conditioning', 'training-plans', 'home-training'] },
    { id: 'strategy-analysis', en: 'Strategy & Analysis', he: 'אסטרטגיה וניתוח', topicIds: ['fight-iq', 'technique-analysis', 'fight-breakdowns'] },
    { id: 'defense-gear', en: 'Defense & Gear', he: 'הגנה וציוד', topicIds: ['self-defense', 'weapons-defense', 'gear-equipment'] },
    { id: 'mindset-lifestyle', en: 'Mindset & Lifestyle', he: 'מנטליות ואורח חיים', topicIds: ['mindset-fear', 'nutrition-weight', 'injury-prevention', 'philosophy-ethics'] },
  ],
  expansion: [
    { id: 'learning', en: 'Learning & Reading', he: 'למידה וקריאה', topicIds: ['learning-systems', 'reading', 'skill-acquisition'] },
    { id: 'thinking', en: 'Thinking & Models', he: 'חשיבה ומודלים', topicIds: ['philosophy', 'critical-thinking', 'systems-thinking', 'mental-models'] },
    { id: 'expression', en: 'Expression', he: 'ביטוי', topicIds: ['creativity', 'writing', 'languages'] },
    { id: 'knowledge', en: 'Knowledge Management', he: 'ניהול ידע', topicIds: ['memory-techniques', 'note-taking', 'research-methods'] },
    { id: 'teaching-discourse', en: 'Teaching & Discourse', he: 'הוראה ושיח', topicIds: ['teaching', 'debates'] },
  ],
  wealth: [
    { id: 'income', en: 'Income & Hustles', he: 'הכנסה ועבודות צד', topicIds: ['income-models', 'side-hustles', 'passive-income'] },
    { id: 'investing-markets', en: 'Investing & Markets', he: 'השקעות ושווקים', topicIds: ['investing', 'crypto', 'stocks', 'real-estate'] },
    { id: 'management', en: 'Money Management', he: 'ניהול כספים', topicIds: ['budgeting', 'tax-strategy', 'debt-management'] },
    { id: 'assets-portfolio', en: 'Assets & Portfolio', he: 'נכסים ותיק', topicIds: ['assets', 'portfolio', 'risk-management'] },
    { id: 'strategy-mindset', en: 'Strategy & Mindset', he: 'אסטרטגיה וחשיבה', topicIds: ['wealth-mindset', 'financial-planning'] },
  ],
  influence: [
    { id: 'personal-brand', en: 'Personal Brand', he: 'מיתוג אישי', topicIds: ['branding', 'authority', 'community-building'] },
    { id: 'content', en: 'Content Creation', he: 'יצירת תוכן', topicIds: ['content-strategy', 'video-content', 'copywriting', 'podcasting'] },
    { id: 'speaking', en: 'Speaking & Voice', he: 'דיבור וקול', topicIds: ['speech', 'public-speaking', 'storytelling'] },
    { id: 'persuasion-narrative', en: 'Persuasion & Narrative', he: 'שכנוע ונרטיב', topicIds: ['narrative', 'persuasion'] },
    { id: 'network-lead', en: 'Network & Leadership', he: 'רשת ומנהיגות', topicIds: ['social-media', 'networking', 'leadership'] },
  ],
  relationships: [
    { id: 'dating-attraction', en: 'Dating & Attraction', he: 'היכרויות ומשיכה', topicIds: ['dating', 'attraction', 'charisma'] },
    { id: 'social', en: 'Social Skills', he: 'מיומנויות חברתיות', topicIds: ['social-skills', 'communication', 'emotional-intelligence'] },
    { id: 'boundaries-conflict', en: 'Boundaries & Conflict', he: 'גבולות וקונפליקט', topicIds: ['boundaries', 'conflict-resolution', 'self-worth'] },
    { id: 'community-tribe', en: 'Tribe & Family', he: 'שבט ומשפחה', topicIds: ['tribe', 'family', 'trust-building', 'mentorship'] },
    { id: 'growth', en: 'Growth & Depth', he: 'צמיחה ועומק', topicIds: ['long-term', 'masculinity'] },
  ],
  business: [
    { id: 'product-offer', en: 'Product & Offer', he: 'מוצר והצעה', topicIds: ['offer-design', 'pricing', 'business-strategy'] },
    { id: 'sales-funnels', en: 'Sales & Funnels', he: 'מכירות ומשפכים', topicIds: ['sales', 'funnels', 'growth-hacking'] },
    { id: 'operations-team', en: 'Operations & Team', he: 'תפעול וצוות', topicIds: ['operations', 'automation', 'hiring'] },
    { id: 'models', en: 'Business Models', he: 'מודלים עסקיים', topicIds: ['freelancing', 'ecommerce', 'scaling', 'partnerships'] },
    { id: 'foundation', en: 'Foundation', he: 'בסיס', topicIds: ['legal', 'client-management'] },
  ],
  projects: [
    { id: 'planning', en: 'Planning', he: 'תכנון', topicIds: ['sprint-planning', 'mvp', 'ideation'] },
    { id: 'execution-build', en: 'Execution & Build', he: 'ביצוע ובנייה', topicIds: ['execution', 'build-logs', 'shipping'] },
    { id: 'tools', en: 'Tools & Systems', he: 'כלים ומערכות', topicIds: ['tools-stack', 'project-management', 'documentation'] },
    { id: 'social-growth', en: 'Community & Growth', he: 'קהילה וצמיחה', topicIds: ['accountability', 'showcase', 'collaboration', 'open-source'] },
    { id: 'learning-retro', en: 'Learning & Retro', he: 'למידה ורטרו', topicIds: ['retrospective', 'failure-lessons'] },
  ],
  play: [
    { id: 'adventure-travel', en: 'Adventure & Travel', he: 'הרפתקאות וטיולים', topicIds: ['adventure', 'travel', 'outdoor'] },
    { id: 'sports', en: 'Sports & Movement', he: 'ספורט ותנועה', topicIds: ['flow-sports', 'extreme-sports', 'dance'] },
    { id: 'creative', en: 'Creative', he: 'יצירתיות', topicIds: ['music', 'cooking', 'photography-play', 'diy'] },
    { id: 'social-fun', en: 'Social & Fun', he: 'חברתי וכיף', topicIds: ['social-events', 'humor', 'gaming'] },
    { id: 'recovery-regen', en: 'Recovery & Regen', he: 'התחדשות ומנוחה', topicIds: ['regeneration', 'tactical-games'] },
  ],
  order: [
    { id: 'physical-space', en: 'Physical Space', he: 'מרחב פיזי', topicIds: ['space-design', 'declutter', 'minimalism', 'environment-design'] },
    { id: 'digital', en: 'Digital Order', he: 'סדר דיגיטלי', topicIds: ['digital-order', 'automation-tools', 'filing-systems'] },
    { id: 'systems-routines', en: 'Systems & Routines', he: 'מערכות ושגרות', topicIds: ['productivity-systems', 'routine-consistency', 'time-blocking'] },
    { id: 'finance-track', en: 'Finance & Tracking', he: 'כספים ומעקב', topicIds: ['finance-tracking', 'inventory', 'goal-tracking', 'habits-tracking'] },
    { id: 'life-management', en: 'Life Management', he: 'ניהול חיים', topicIds: ['life-admin'] },
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
