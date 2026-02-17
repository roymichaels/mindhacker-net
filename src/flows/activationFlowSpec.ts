/**
 * Unified Identity Activation Flow — 10 Screens
 * Psychologically sequenced: Emotion → Commitment → Identity → Vision
 * 
 * Data maps to existing launchpad_progress columns:
 * - step_1_intention (JSON): all activation answers
 * - step_2_profile_data (JSON): merged profile context
 */
import type { FlowSpec, FlowAnswers } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

// ─── Pain options per pillar ───
const PAIN_OPTIONS: Record<string, Array<{ value: string; label_he: string; label_en: string; icon?: string }>> = {
  health: [
    { value: 'low_energy', label_he: 'אנרגיה נמוכה', label_en: 'Low energy', icon: '🔋' },
    { value: 'weight', label_he: 'משקל עודף', label_en: 'Weight issues', icon: '⚖️' },
    { value: 'inconsistency', label_he: 'חוסר עקביות', label_en: 'Inconsistency', icon: '📉' },
    { value: 'sleep', label_he: 'בעיות שינה', label_en: 'Sleep problems', icon: '😴' },
    { value: 'discipline', label_he: 'חוסר משמעת', label_en: 'Lack of discipline', icon: '💪' },
    { value: 'stress', label_he: 'לחץ ומתח', label_en: 'Stress & tension', icon: '😤' },
  ],
  career: [
    { value: 'stuck', label_he: 'תחושת תקיעות', label_en: 'Feeling stuck', icon: '🧱' },
    { value: 'no_direction', label_he: 'חוסר כיוון', label_en: 'No clear direction', icon: '🧭' },
    { value: 'burnout', label_he: 'שחיקה', label_en: 'Burnout', icon: '🔥' },
    { value: 'underearning', label_he: 'הכנסה נמוכה', label_en: 'Underearning', icon: '💸' },
    { value: 'fear', label_he: 'פחד מכישלון', label_en: 'Fear of failure', icon: '😰' },
    { value: 'no_passion', label_he: 'חוסר תשוקה', label_en: 'No passion', icon: '💔' },
  ],
  money: [
    { value: 'debt', label_he: 'חובות', label_en: 'Debt', icon: '💳' },
    { value: 'no_savings', label_he: 'אין חסכונות', label_en: 'No savings', icon: '🏦' },
    { value: 'scarcity', label_he: 'חשיבה של מחסור', label_en: 'Scarcity mindset', icon: '🧠' },
    { value: 'overspending', label_he: 'הוצאות מיותרות', label_en: 'Overspending', icon: '🛒' },
    { value: 'low_income', label_he: 'הכנסה לא מספיקה', label_en: 'Insufficient income', icon: '📊' },
    { value: 'no_plan', label_he: 'אין תכנית פיננסית', label_en: 'No financial plan', icon: '📋' },
  ],
  relationships: [
    { value: 'loneliness', label_he: 'בדידות', label_en: 'Loneliness', icon: '🥀' },
    { value: 'conflict', label_he: 'קונפליקטים', label_en: 'Conflicts', icon: '⚡' },
    { value: 'boundaries', label_he: 'חוסר גבולות', label_en: 'Poor boundaries', icon: '🚧' },
    { value: 'trust', label_he: 'בעיות אמון', label_en: 'Trust issues', icon: '🔒' },
    { value: 'communication', label_he: 'תקשורת לקויה', label_en: 'Poor communication', icon: '🗣️' },
    { value: 'codependency', label_he: 'תלות רגשית', label_en: 'Codependency', icon: '🔗' },
  ],
  mind: [
    { value: 'anxiety', label_he: 'חרדה', label_en: 'Anxiety', icon: '😟' },
    { value: 'overthinking', label_he: 'חשיבת יתר', label_en: 'Overthinking', icon: '🌀' },
    { value: 'low_confidence', label_he: 'ביטחון עצמי נמוך', label_en: 'Low confidence', icon: '📉' },
    { value: 'emotional_eating', label_he: 'אכילה רגשית', label_en: 'Emotional eating', icon: '🍕' },
    { value: 'procrastination', label_he: 'דחיינות', label_en: 'Procrastination', icon: '⏰' },
    { value: 'negativity', label_he: 'שליליות כרונית', label_en: 'Chronic negativity', icon: '☁️' },
  ],
  creativity: [
    { value: 'blocked', label_he: 'חסימה יצירתית', label_en: 'Creative block', icon: '🧱' },
    { value: 'no_time', label_he: 'אין זמן ליצירה', label_en: 'No time to create', icon: '⏳' },
    { value: 'perfectionism', label_he: 'פרפקציוניזם', label_en: 'Perfectionism', icon: '✨' },
    { value: 'fear_judgment', label_he: 'פחד משיפוט', label_en: 'Fear of judgment', icon: '👁️' },
    { value: 'no_inspiration', label_he: 'חוסר השראה', label_en: 'No inspiration', icon: '💡' },
    { value: 'unfinished', label_he: 'פרויקטים לא גמורים', label_en: 'Unfinished projects', icon: '📦' },
  ],
  social: [
    { value: 'isolation', label_he: 'בידוד חברתי', label_en: 'Social isolation', icon: '🏠' },
    { value: 'awkwardness', label_he: 'מבוכה חברתית', label_en: 'Social awkwardness', icon: '😶' },
    { value: 'no_community', label_he: 'אין קהילה', label_en: 'No community', icon: '👥' },
    { value: 'people_pleasing', label_he: 'ריצוי אנשים', label_en: 'People pleasing', icon: '🎭' },
    { value: 'toxic_circle', label_he: 'חוג חברתי רעיל', label_en: 'Toxic circle', icon: '☠️' },
    { value: 'networking', label_he: 'קושי בנטוורקינג', label_en: 'Networking difficulty', icon: '🤝' },
  ],
  spirituality: [
    { value: 'no_meaning', label_he: 'חוסר משמעות', label_en: 'No meaning', icon: '❓' },
    { value: 'disconnected', label_he: 'ניתוק מעצמי', label_en: 'Disconnected from self', icon: '🔌' },
    { value: 'existential', label_he: 'משבר קיומי', label_en: 'Existential crisis', icon: '🌌' },
    { value: 'no_practice', label_he: 'אין פרקטיקה רוחנית', label_en: 'No spiritual practice', icon: '🧘' },
    { value: 'lost_faith', label_he: 'אובדן אמונה', label_en: 'Lost faith', icon: '🕯️' },
    { value: 'empty', label_he: 'ריקנות פנימית', label_en: 'Inner emptiness', icon: '🕳️' },
  ],
};

// ─── Outcome options per pillar ───
const OUTCOME_OPTIONS: Record<string, Array<{ value: string; label_he: string; label_en: string; icon?: string }>> = {
  health: [
    { value: 'consistent_energy', label_he: 'אנרגיה יציבה לאורך היום', label_en: 'Consistent energy all day', icon: '⚡' },
    { value: 'ideal_body', label_he: 'הגוף שאני רוצה', label_en: 'My ideal body', icon: '💪' },
    { value: 'deep_sleep', label_he: 'שינה עמוקה ומרעננת', label_en: 'Deep refreshing sleep', icon: '🌙' },
    { value: 'daily_routine', label_he: 'שגרה בריאה יומית', label_en: 'Healthy daily routine', icon: '🌅' },
    { value: 'mental_clarity', label_he: 'בהירות מנטלית', label_en: 'Mental clarity', icon: '🧠' },
  ],
  career: [
    { value: 'dream_job', label_he: 'העבודה שאני חולם עליה', label_en: 'My dream job', icon: '🎯' },
    { value: 'own_business', label_he: 'עסק משלי', label_en: 'My own business', icon: '🏢' },
    { value: 'double_income', label_he: 'הכפלת הכנסה', label_en: 'Double my income', icon: '💰' },
    { value: 'work_life_balance', label_he: 'איזון עבודה-חיים', label_en: 'Work-life balance', icon: '⚖️' },
    { value: 'leadership', label_he: 'מנהיגות ועמדת כוח', label_en: 'Leadership & power', icon: '👑' },
  ],
  money: [
    { value: 'financial_freedom', label_he: 'חופש כלכלי', label_en: 'Financial freedom', icon: '🗽' },
    { value: 'passive_income', label_he: 'הכנסה פאסיבית', label_en: 'Passive income', icon: '💰' },
    { value: 'debt_free', label_he: 'חיים ללא חובות', label_en: 'Debt-free life', icon: '🆓' },
    { value: 'abundance_mindset', label_he: 'חשיבה של שפע', label_en: 'Abundance mindset', icon: '✨' },
    { value: 'smart_investing', label_he: 'השקעות חכמות', label_en: 'Smart investing', icon: '📈' },
  ],
  relationships: [
    { value: 'deep_connection', label_he: 'חיבור עמוק עם אנשים', label_en: 'Deep connection with people', icon: '❤️' },
    { value: 'healthy_partnership', label_he: 'זוגיות בריאה', label_en: 'Healthy partnership', icon: '💑' },
    { value: 'strong_boundaries', label_he: 'גבולות ברורים', label_en: 'Clear boundaries', icon: '🛡️' },
    { value: 'better_communication', label_he: 'תקשורת טובה יותר', label_en: 'Better communication', icon: '💬' },
    { value: 'self_love', label_he: 'אהבה עצמית', label_en: 'Self love', icon: '🌹' },
  ],
  mind: [
    { value: 'inner_peace', label_he: 'שקט פנימי', label_en: 'Inner peace', icon: '🕊️' },
    { value: 'unshakeable_confidence', label_he: 'ביטחון עצמי חזק', label_en: 'Unshakeable confidence', icon: '🦁' },
    { value: 'emotional_mastery', label_he: 'שליטה רגשית', label_en: 'Emotional mastery', icon: '🧘' },
    { value: 'focus_clarity', label_he: 'פוקוס ובהירות', label_en: 'Focus & clarity', icon: '🎯' },
    { value: 'positive_mindset', label_he: 'חשיבה חיובית', label_en: 'Positive mindset', icon: '☀️' },
  ],
  creativity: [
    { value: 'creative_flow', label_he: 'זרימה יצירתית', label_en: 'Creative flow', icon: '🌊' },
    { value: 'ship_projects', label_he: 'להשלים פרויקטים', label_en: 'Ship projects', icon: '🚀' },
    { value: 'monetize_art', label_he: 'להרוויח מיצירה', label_en: 'Monetize my art', icon: '💎' },
    { value: 'daily_practice', label_he: 'פרקטיקה יומית', label_en: 'Daily practice', icon: '🎨' },
    { value: 'authentic_expression', label_he: 'ביטוי אותנטי', label_en: 'Authentic expression', icon: '🎤' },
  ],
  social: [
    { value: 'strong_network', label_he: 'רשת חברתית חזקה', label_en: 'Strong network', icon: '🌐' },
    { value: 'meaningful_friendships', label_he: 'חברויות עמוקות', label_en: 'Meaningful friendships', icon: '🤝' },
    { value: 'social_confidence', label_he: 'ביטחון חברתי', label_en: 'Social confidence', icon: '🌟' },
    { value: 'community_belonging', label_he: 'שייכות לקהילה', label_en: 'Community belonging', icon: '🏡' },
    { value: 'influence', label_he: 'השפעה חברתית', label_en: 'Social influence', icon: '📢' },
  ],
  spirituality: [
    { value: 'deep_purpose', label_he: 'תחושת ייעוד עמוקה', label_en: 'Deep sense of purpose', icon: '🌟' },
    { value: 'inner_connection', label_he: 'חיבור פנימי עמוק', label_en: 'Deep inner connection', icon: '🔮' },
    { value: 'daily_practice', label_he: 'פרקטיקה רוחנית יומית', label_en: 'Daily spiritual practice', icon: '🧘' },
    { value: 'peace_of_mind', label_he: 'שלווה פנימית', label_en: 'Peace of mind', icon: '☮️' },
    { value: 'awakening', label_he: 'התעוררות תודעתית', label_en: 'Consciousness awakening', icon: '👁️' },
  ],
};

// Helper to get dynamic options
function getPainOptions(answers: FlowAnswers) {
  const focus = answers.primary_focus as string;
  return PAIN_OPTIONS[focus] || PAIN_OPTIONS.mind;
}

function getOutcomeOptions(answers: FlowAnswers) {
  const focus = answers.primary_focus as string;
  return OUTCOME_OPTIONS[focus] || OUTCOME_OPTIONS.mind;
}

// ─── The Flow Spec ───
export const activationFlowSpec: FlowSpec = {
  id: 'identity-activation',
  title_he: 'הפעלת זהות',
  title_en: 'Identity Activation',
  description_he: 'מסע הטרנספורמציה שלך מתחיל כאן',
  description_en: 'Your transformation journey starts here',
  steps: [
    // SCREEN 1 — Focus
    {
      id: 1,
      title_he: 'פוקוס',
      title_en: 'Focus',
      renderer: 'card',
      miniSteps: [{
        id: 'primary_focus',
        title_he: 'איזה תחום בחיים שלך דורש את מירב תשומת הלב?',
        title_en: 'What area of your life needs the most attention right now?',
        prompt_he: 'בחר את התחום שהכי מציק לך',
        prompt_en: 'Choose the area that bothers you most',
        inputType: 'single_select',
        options: [
          { value: 'health', label_he: 'בריאות וגוף', label_en: 'Health & Body', icon: '💪' },
          { value: 'career', label_he: 'קריירה ועבודה', label_en: 'Career & Work', icon: '💼' },
          { value: 'money', label_he: 'כסף ושפע', label_en: 'Money & Abundance', icon: '💰' },
          { value: 'relationships', label_he: 'מערכות יחסים', label_en: 'Relationships', icon: '❤️' },
          { value: 'mind', label_he: 'מיינד ורגש', label_en: 'Mind & Emotional', icon: '🧠' },
          { value: 'creativity', label_he: 'יצירתיות', label_en: 'Creativity', icon: '🎨' },
          { value: 'social', label_he: 'חברה וקהילה', label_en: 'Social & Community', icon: '👥' },
          { value: 'spirituality', label_he: 'רוחניות ומשמעות', label_en: 'Spirituality & Meaning', icon: '✨' },
        ],
        validation: { required: true },
        dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'primary_focus' },
      }],
    },

    // SCREEN 2 — Pain (dynamic)
    {
      id: 2,
      title_he: 'כאב',
      title_en: 'Pain',
      renderer: 'card',
      miniSteps: [
        // One mini-step per pillar, shown conditionally
        ...Object.keys(PAIN_OPTIONS).map(pillar => ({
          id: `primary_pain_${pillar}`,
          title_he: 'מה הכי מתסכל אותך עכשיו בתחום הזה?',
          title_en: 'What feels most frustrating right now?',
          prompt_he: 'בחר את האתגר העיקרי שלך',
          prompt_en: 'Pick your main challenge',
          inputType: 'single_select' as const,
          options: PAIN_OPTIONS[pillar],
          validation: { required: true },
          branching: { showIf: (a: FlowAnswers) => a.primary_focus === pillar },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'primary_pain' },
        })),
      ],
    },

    // SCREEN 3 — Desired Outcome (dynamic)
    {
      id: 3,
      title_he: 'תוצאה',
      title_en: 'Outcome',
      renderer: 'card',
      miniSteps: [
        ...Object.keys(OUTCOME_OPTIONS).map(pillar => ({
          id: `desired_outcome_${pillar}`,
          title_he: 'מה ישנה הכל עבורך בתחום הזה?',
          title_en: 'What would change everything for you in this area?',
          prompt_he: 'דמיין את התוצאה הטובה ביותר',
          prompt_en: 'Imagine the best possible outcome',
          inputType: 'single_select' as const,
          options: OUTCOME_OPTIONS[pillar],
          validation: { required: true },
          branching: { showIf: (a: FlowAnswers) => a.primary_focus === pillar },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'desired_outcome' },
        })),
      ],
    },

    // SCREEN 4 — Commitment
    {
      id: 4,
      title_he: 'מחויבות',
      title_en: 'Commitment',
      renderer: 'card',
      miniSteps: [{
        id: 'commitment_level',
        title_he: 'כמה רציני אתה לגבי השינוי הזה?',
        title_en: 'How serious are you about this upgrade?',
        prompt_he: 'היה כנה עם עצמך',
        prompt_en: 'Be honest with yourself',
        inputType: 'single_select',
        options: [
          { value: 'exploring', label_he: 'רק מסתכל', label_en: 'Just exploring', icon: '👀' },
          { value: 'curious', label_he: 'סקרן אבל לא בטוח', label_en: 'Curious but unsure', icon: '🤔' },
          { value: 'ready', label_he: 'מוכן להתחייב', label_en: 'Ready to commit', icon: '🎯' },
          { value: 'locked_in', label_he: 'נעול על זה לגמרי', label_en: 'Fully locked in', icon: '🔥' },
        ],
        validation: { required: true },
        dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'commitment_level' },
      }],
    },

    // SCREEN 5 — Growth Intent (multi-select)
    {
      id: 5,
      title_he: 'צמיחה',
      title_en: 'Growth',
      renderer: 'card',
      miniSteps: [{
        id: 'secondary_focus',
        title_he: 'באילו תחומים נוספים אתה רוצה שיפור?',
        title_en: 'Where else do you want improvement?',
        prompt_he: 'בחר עד 2 תחומים נוספים',
        prompt_en: 'Select up to 2 additional areas',
        inputType: 'multi_select',
        options: [
          { value: 'health', label_he: 'בריאות וגוף', label_en: 'Health & Body', icon: '💪' },
          { value: 'career', label_he: 'קריירה ועבודה', label_en: 'Career & Work', icon: '💼' },
          { value: 'money', label_he: 'כסף ושפע', label_en: 'Money & Abundance', icon: '💰' },
          { value: 'relationships', label_he: 'מערכות יחסים', label_en: 'Relationships', icon: '❤️' },
          { value: 'mind', label_he: 'מיינד ורגש', label_en: 'Mind & Emotional', icon: '🧠' },
          { value: 'creativity', label_he: 'יצירתיות', label_en: 'Creativity', icon: '🎨' },
          { value: 'social', label_he: 'חברה וקהילה', label_en: 'Social & Community', icon: '👥' },
          { value: 'spirituality', label_he: 'רוחניות ומשמעות', label_en: 'Spirituality & Meaning', icon: '✨' },
        ],
        validation: { required: false, maxSelected: 2 },
        dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'secondary_focus' },
      }],
    },

    // SCREEN 6 — Behavioral Block
    {
      id: 6,
      title_he: 'חסם',
      title_en: 'Block',
      renderer: 'card',
      miniSteps: [{
        id: 'core_obstacle',
        title_he: 'מה הכי עוצר אותך?',
        title_en: 'What stops you most?',
        prompt_he: 'זהה את החסם המרכזי שלך',
        prompt_en: 'Identify your core blocker',
        inputType: 'single_select',
        options: [
          { value: 'procrastination', label_he: 'דחיינות', label_en: 'Procrastination', icon: '⏰' },
          { value: 'fear', label_he: 'פחד מכישלון', label_en: 'Fear of failure', icon: '😰' },
          { value: 'overthinking', label_he: 'חשיבת יתר', label_en: 'Overthinking', icon: '🌀' },
          { value: 'no_discipline', label_he: 'חוסר משמעת', label_en: 'Lack of discipline', icon: '📉' },
          { value: 'distraction', label_he: 'הסחות דעת', label_en: 'Distractions', icon: '📱' },
          { value: 'limiting_beliefs', label_he: 'אמונות מגבילות', label_en: 'Limiting beliefs', icon: '🔗' },
          { value: 'perfectionism', label_he: 'פרפקציוניזם', label_en: 'Perfectionism', icon: '✨' },
          { value: 'low_energy', label_he: 'אנרגיה נמוכה', label_en: 'Low energy', icon: '🔋' },
        ],
        validation: { required: true },
        dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'core_obstacle' },
      }],
    },

    // SCREEN 7 — Energy Pattern
    {
      id: 7,
      title_he: 'אנרגיה',
      title_en: 'Energy',
      renderer: 'card',
      miniSteps: [{
        id: 'peak_productivity',
        title_he: 'מתי אתה הכי פרודוקטיבי?',
        title_en: 'When are you most productive?',
        prompt_he: 'כשאתה במיטבך',
        prompt_en: 'When you\'re at your best',
        inputType: 'single_select',
        options: [
          { value: 'early_morning', label_he: 'בוקר מוקדם (5-8)', label_en: 'Early morning (5-8)', icon: '🌅' },
          { value: 'morning', label_he: 'בוקר (8-12)', label_en: 'Morning (8-12)', icon: '☀️' },
          { value: 'afternoon', label_he: 'צהריים (12-16)', label_en: 'Afternoon (12-4)', icon: '🌤️' },
          { value: 'evening', label_he: 'ערב (16-20)', label_en: 'Evening (4-8)', icon: '🌆' },
          { value: 'night', label_he: 'לילה (20-00)', label_en: 'Night (8-12)', icon: '🌙' },
          { value: 'late_night', label_he: 'לילה מאוחר (00+)', label_en: 'Late night (12+)', icon: '🦉' },
        ],
        validation: { required: true },
        dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'peak_productivity' },
      }],
    },

    // SCREEN 8 — Identity Anchor
    {
      id: 8,
      title_he: 'זהות',
      title_en: 'Identity',
      renderer: 'card',
      miniSteps: [{
        id: 'identity_statement',
        title_he: 'מי אתה צריך להפוך כדי שזה יקרה?',
        title_en: 'Who do you need to become to make this happen?',
        prompt_he: 'תאר את הגרסה הטובה ביותר שלך... (מינימום 20 תווים)',
        prompt_en: 'Describe the best version of yourself... (minimum 20 characters)',
        inputType: 'textarea',
        validation: { required: true, minChars: 20 },
        dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'identity_statement' },
      }],
    },

    // SCREEN 9 — Future Visualization
    {
      id: 9,
      title_he: 'חזון',
      title_en: 'Vision',
      renderer: 'card',
      miniSteps: [{
        id: 'ninety_day_vision',
        title_he: 'דמיין את עצמך 90 יום מהיום. מה השתנה?',
        title_en: 'Imagine 90 days from now. What has changed?',
        prompt_he: 'תן לעצמך לחלום בגדול... (מינימום 20 תווים)',
        prompt_en: 'Let yourself dream big... (minimum 20 characters)',
        inputType: 'textarea',
        validation: { required: true, minChars: 20 },
        dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'ninety_day_vision' },
      }],
    },

    // SCREEN 10 — Reveal (custom renderer)
    {
      id: 10,
      title_he: 'הסיכום שלך',
      title_en: 'Your Reveal',
      renderer: 'custom',
      customComponent: 'reveal',
      miniSteps: [],
    },
  ],
};

// Register on import
registerFlow(activationFlowSpec);
