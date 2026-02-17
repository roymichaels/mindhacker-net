/**
 * Core Launchpad Flow Spec — 10 macro steps
 * 
 * Steps 1, 2, 3, 8, 9 use FlowRenderer (renderer: 'card')
 * Steps 4, 5, 6, 7, 10 use existing custom components (renderer: 'custom')
 * 
 * All options extracted from existing WelcomeStep, PersonalProfileStep,
 * LifestyleRoutineStep, FocusAreasStep, FirstWeekStep.
 */
import type { FlowSpec, FlowAnswers } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB_STEP1: { table: string; column: string } = { table: 'launchpad_progress', column: 'step_1_intention' };
const DB_STEP2: { table: string; column: string } = { table: 'launchpad_progress', column: 'step_2_profile_data' };
const DB_STEP5: { table: string; column: string } = { table: 'launchpad_progress', column: 'step_5_focus_areas_selected' };
const DB_STEP6: { table: string; column: string } = { table: 'launchpad_progress', column: 'step_6_actions' };

export const coreLaunchpadSpec: FlowSpec = {
  id: 'core-launchpad',
  title_he: 'המסע שלך',
  title_en: 'Your Journey',
  description_he: 'תהליך קצר להכיר אותך ולבנות תוכנית חיים מותאמת אישית',
  description_en: 'A short process to get to know you and build a personalized life plan',

  steps: [
    // ─── STEP 1: Intent ───
    {
      id: 1,
      title_he: 'כוונה',
      title_en: 'Intent',
      renderer: 'card',
      miniSteps: [
        {
          id: 'main_area',
          title_he: 'במה אתה מתעסק כרגע בחיים?',
          title_en: 'What are you currently dealing with in life?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          options: [
            { value: 'career', label_he: 'קריירה/עבודה', label_en: 'Career/Work', icon: '💼' },
            { value: 'business', label_he: 'עסק/יזמות', label_en: 'Business/Entrepreneurship', icon: '🚀' },
            { value: 'relationships', label_he: 'זוגיות/מערכות יחסים', label_en: 'Relationships', icon: '❤️' },
            { value: 'family', label_he: 'משפחה/ילדים', label_en: 'Family/Children', icon: '👨‍👩‍👧' },
            { value: 'health', label_he: 'בריאות/כושר', label_en: 'Health/Fitness', icon: '💪' },
            { value: 'energy', label_he: 'אנרגיה/שינה', label_en: 'Energy/Sleep', icon: '🔋' },
            { value: 'finance', label_he: 'כסף/פיננסים', label_en: 'Money/Finances', icon: '💰' },
            { value: 'purpose', label_he: 'מטרה/כיוון בחיים', label_en: 'Purpose/Direction', icon: '🎯' },
            { value: 'emotional', label_he: 'רגשות/בריאות נפשית', label_en: 'Emotions/Mental Health', icon: '🧠' },
            { value: 'social', label_he: 'חברים/קהילה', label_en: 'Friends/Community', icon: '👥' },
            { value: 'learning', label_he: 'לימודים/התפתחות', label_en: 'Learning/Growth', icon: '📚' },
            { value: 'spirituality', label_he: 'רוחניות/משמעות', label_en: 'Spirituality/Meaning', icon: '✨' },
          ],
        },
        // Career sub
        {
          id: 'career_specific',
          title_he: 'מה בדיוק בקריירה?',
          title_en: 'What specifically about your career?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('career') },
          options: [
            { value: 'advance', label_he: 'רוצה להתקדם בתפקיד', label_en: 'Want to advance in my role', icon: '📈' },
            { value: 'change', label_he: 'רוצה לשנות מקצוע', label_en: 'Want to change profession', icon: '🔄' },
            { value: 'stuck', label_he: 'מרגיש תקוע ומשועמם', label_en: 'Feeling stuck and bored', icon: '😔' },
            { value: 'searching', label_he: 'מחפש עבודה', label_en: 'Looking for a job', icon: '🔍' },
            { value: 'independent', label_he: 'רוצה להפוך לעצמאי', label_en: 'Want to become independent', icon: '🚀' },
            { value: 'balance', label_he: 'רוצה איזון עבודה-חיים', label_en: 'Want work-life balance', icon: '⚖️' },
          ],
        },
        // Business sub
        {
          id: 'business_specific',
          title_he: 'מה בדיוק בעסק/יזמות?',
          title_en: 'What specifically about business?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('business') },
          options: [
            { value: 'start', label_he: 'רוצה להקים עסק', label_en: 'Want to start a business', icon: '🚀' },
            { value: 'grow', label_he: 'רוצה להגדיל את העסק', label_en: 'Want to grow the business', icon: '📈' },
            { value: 'struggle', label_he: 'העסק מתקשה', label_en: 'Business is struggling', icon: '😟' },
            { value: 'marketing', label_he: 'צריך עזרה בשיווק', label_en: 'Need help with marketing', icon: '📣' },
            { value: 'team', label_he: 'ניהול צוות', label_en: 'Team management', icon: '👥' },
            { value: 'pivot', label_he: 'רוצה לשנות כיוון', label_en: 'Want to pivot', icon: '🔄' },
          ],
        },
        // Relationships sub
        {
          id: 'relationships_specific',
          title_he: 'מה בדיוק במערכות יחסים?',
          title_en: 'What specifically about relationships?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('relationships') },
          options: [
            { value: 'find_partner', label_he: 'רוצה למצוא בן/בת זוג', label_en: 'Want to find a partner', icon: '💕' },
            { value: 'current_relationship', label_he: 'בעיות בזוגיות הנוכחית', label_en: 'Issues in current relationship', icon: '💔' },
            { value: 'healing', label_he: 'ריפוי מפרידה', label_en: 'Healing from separation', icon: '🩹' },
            { value: 'communication', label_he: 'רוצה לשפר תקשורת', label_en: 'Want to improve communication', icon: '💬' },
            { value: 'intimacy', label_he: 'קרבה ואינטימיות', label_en: 'Closeness and intimacy', icon: '🔥' },
            { value: 'commitment', label_he: 'פחד מהתחייבות', label_en: 'Fear of commitment', icon: '🔐' },
          ],
        },
        // Health sub
        {
          id: 'health_specific',
          title_he: 'מה בדיוק בבריאות?',
          title_en: 'What specifically about health?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('health') },
          options: [
            { value: 'weight', label_he: 'רוצה לרדת במשקל', label_en: 'Want to lose weight', icon: '⚖️' },
            { value: 'exercise', label_he: 'רוצה להתחיל להתאמן', label_en: 'Want to start exercising', icon: '🏃' },
            { value: 'nutrition', label_he: 'לשפר תזונה', label_en: 'Improve nutrition', icon: '🥗' },
            { value: 'pain', label_he: 'כאבים כרוניים', label_en: 'Chronic pain', icon: '🩹' },
            { value: 'condition', label_he: 'מצב רפואי מתמשך', label_en: 'Ongoing medical condition', icon: '🏥' },
            { value: 'habits', label_he: 'הרגלים לא בריאים', label_en: 'Unhealthy habits', icon: '🚭' },
          ],
        },
        // Energy sub
        {
          id: 'energy_specific',
          title_he: 'מה בדיוק באנרגיה/שינה?',
          title_en: 'What specifically about energy/sleep?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('energy') },
          options: [
            { value: 'tired', label_he: 'עייפות כרונית', label_en: 'Chronic fatigue', icon: '😫' },
            { value: 'sleep_quality', label_he: 'איכות שינה ירודה', label_en: 'Poor sleep quality', icon: '😴' },
            { value: 'insomnia', label_he: 'קשיי הירדמות', label_en: 'Difficulty falling asleep', icon: '🌙' },
            { value: 'morning', label_he: 'קושי להתעורר בבוקר', label_en: 'Difficulty waking up', icon: '⏰' },
            { value: 'focus', label_he: 'חוסר ריכוז', label_en: 'Lack of focus', icon: '🎯' },
            { value: 'burnout', label_he: 'שחיקה', label_en: 'Burnout', icon: '🔥' },
          ],
        },
        // Finance sub
        {
          id: 'finance_specific',
          title_he: 'מה בדיוק בכסף/פיננסים?',
          title_en: 'What specifically about money/finances?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('finance') },
          options: [
            { value: 'save', label_he: 'רוצה לחסוך יותר', label_en: 'Want to save more', icon: '🐷' },
            { value: 'debt', label_he: 'חובות שמטרידים', label_en: 'Troubling debts', icon: '📉' },
            { value: 'earn_more', label_he: 'רוצה להרוויח יותר', label_en: 'Want to earn more', icon: '💵' },
            { value: 'budget', label_he: 'לא יודע לנהל תקציב', label_en: "Don't know how to budget", icon: '📊' },
            { value: 'invest', label_he: 'רוצה להשקיע', label_en: 'Want to invest', icon: '📈' },
            { value: 'anxiety', label_he: 'חרדות כלכליות', label_en: 'Financial anxiety', icon: '😰' },
          ],
        },
        // Purpose sub
        {
          id: 'purpose_specific',
          title_he: 'מה בדיוק במטרה/כיוון?',
          title_en: 'What specifically about purpose/direction?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('purpose') },
          options: [
            { value: 'dont_know', label_he: 'לא יודע מה אני רוצה', label_en: "Don't know what I want", icon: '❓' },
            { value: 'lost', label_he: 'מרגיש אבוד', label_en: 'Feeling lost', icon: '🧭' },
            { value: 'passion', label_he: 'רוצה למצוא תשוקה', label_en: 'Want to find passion', icon: '🔥' },
            { value: 'meaning', label_he: 'מחפש משמעות', label_en: 'Seeking meaning', icon: '✨' },
            { value: 'big_change', label_he: 'רוצה לעשות שינוי גדול', label_en: 'Want to make a big change', icon: '🦋' },
            { value: 'legacy', label_he: 'רוצה להשאיר חותם', label_en: 'Want to leave a legacy', icon: '🏆' },
          ],
        },
        // Emotional sub
        {
          id: 'emotional_specific',
          title_he: 'מה בדיוק ברגשות/מנטלי?',
          title_en: 'What specifically about emotions/mental health?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('emotional') },
          options: [
            { value: 'anxiety', label_he: 'חרדה', label_en: 'Anxiety', icon: '😟' },
            { value: 'depression', label_he: 'דיכאון', label_en: 'Depression', icon: '😢' },
            { value: 'confidence', label_he: 'ביטחון עצמי', label_en: 'Self-confidence', icon: '💪' },
            { value: 'regulation', label_he: 'ויסות רגשי', label_en: 'Emotional regulation', icon: '🎭' },
            { value: 'anger', label_he: 'ניהול כעסים', label_en: 'Anger management', icon: '😤' },
            { value: 'trauma', label_he: 'טראומה מהעבר', label_en: 'Past trauma', icon: '🩹' },
          ],
        },
        // Social sub
        {
          id: 'social_specific',
          title_he: 'מה בדיוק בחברתי?',
          title_en: 'What specifically about social life?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('social') },
          options: [
            { value: 'lonely', label_he: 'בדידות', label_en: 'Loneliness', icon: '😔' },
            { value: 'friends', label_he: 'רוצה יותר חברים', label_en: 'Want more friends', icon: '👋' },
            { value: 'social_anxiety', label_he: 'חרדה חברתית', label_en: 'Social anxiety', icon: '😰' },
            { value: 'boundaries', label_he: 'הצבת גבולות', label_en: 'Setting boundaries', icon: '🚧' },
            { value: 'networking', label_he: 'נטוורקינג', label_en: 'Networking', icon: '🤝' },
            { value: 'community', label_he: 'רוצה קהילה', label_en: 'Want community', icon: '🏘️' },
          ],
        },
        // Learning sub
        {
          id: 'learning_specific',
          title_he: 'מה בדיוק בלימודים/התפתחות?',
          title_en: 'What specifically about learning/growth?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('learning') },
          options: [
            { value: 'new_skill', label_he: 'רוצה ללמוד מיומנות חדשה', label_en: 'Want to learn a new skill', icon: '🎯' },
            { value: 'degree', label_he: 'תואר/הסמכה', label_en: 'Degree/certification', icon: '🎓' },
            { value: 'focus', label_he: 'קושי להתמקד בלימודים', label_en: 'Difficulty focusing', icon: '📚' },
            { value: 'motivation', label_he: 'חוסר מוטיבציה', label_en: 'Lack of motivation', icon: '🔋' },
            { value: 'time', label_he: 'אין לי זמן', label_en: 'No time', icon: '⏰' },
            { value: 'direction', label_he: 'לא יודע מה ללמוד', label_en: "Don't know what to learn", icon: '🧭' },
          ],
        },
        // Spirituality sub
        {
          id: 'spirituality_specific',
          title_he: 'מה בדיוק ברוחניות/משמעות?',
          title_en: 'What specifically about spirituality/meaning?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('spirituality') },
          options: [
            { value: 'connection', label_he: 'רוצה חיבור רוחני', label_en: 'Want spiritual connection', icon: '🙏' },
            { value: 'meditation', label_he: 'רוצה להתחיל למדיטציה', label_en: 'Want to start meditating', icon: '🧘' },
            { value: 'faith', label_he: 'שאלות על אמונה', label_en: 'Questions about faith', icon: '✨' },
            { value: 'purpose', label_he: 'מחפש תכלית', label_en: 'Seeking purpose', icon: '🌟' },
            { value: 'peace', label_he: 'רוצה שקט פנימי', label_en: 'Want inner peace', icon: '☮️' },
            { value: 'growth', label_he: 'צמיחה אישית', label_en: 'Personal growth', icon: '🌱' },
          ],
        },
        // Family sub
        {
          id: 'family_specific',
          title_he: 'מה בדיוק במשפחה?',
          title_en: 'What specifically about family?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          branching: { showIf: (a: FlowAnswers) => Array.isArray(a.main_area) && a.main_area.includes('family') },
          options: [
            { value: 'parenting', label_he: 'אתגרי הורות', label_en: 'Parenting challenges', icon: '👶' },
            { value: 'teenagers', label_he: 'התמודדות עם מתבגרים', label_en: 'Dealing with teenagers', icon: '🧒' },
            { value: 'parents', label_he: 'יחסים עם הורים', label_en: 'Relationship with parents', icon: '👴' },
            { value: 'siblings', label_he: 'יחסים עם אחים', label_en: 'Relationship with siblings', icon: '👫' },
            { value: 'balance', label_he: 'איזון משפחה-עבודה', label_en: 'Family-work balance', icon: '⚖️' },
            { value: 'conflict', label_he: 'קונפליקטים משפחתיים', label_en: 'Family conflicts', icon: '⚡' },
          ],
        },
        // Emotional state
        {
          id: 'emotional_state',
          title_he: 'איך אתה מרגיש לגבי המצב?',
          title_en: 'How do you feel about the situation?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          options: [
            { value: 'frustrated', label_he: 'מתוסכל', label_en: 'Frustrated', icon: '😤' },
            { value: 'hopeful', label_he: 'מלא תקווה', label_en: 'Hopeful', icon: '🌟' },
            { value: 'confused', label_he: 'מבולבל', label_en: 'Confused', icon: '😵‍💫' },
            { value: 'motivated', label_he: 'מוטיבציה', label_en: 'Motivated', icon: '🚀' },
            { value: 'anxious', label_he: 'חרד', label_en: 'Anxious', icon: '😰' },
            { value: 'determined', label_he: 'נחוש', label_en: 'Determined', icon: '💪' },
          ],
        },
        // Tried before
        {
          id: 'tried_before',
          title_he: 'מה כבר ניסית?',
          title_en: 'What have you already tried?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          options: [
            { value: 'reading', label_he: 'ספרים/מאמרים', label_en: 'Books/articles', icon: '📚' },
            { value: 'courses', label_he: 'קורסים', label_en: 'Courses', icon: '🎓' },
            { value: 'coaching', label_he: 'אימון/ייעוץ', label_en: 'Coaching/counseling', icon: '👨‍💼' },
            { value: 'therapy', label_he: 'טיפול', label_en: 'Therapy', icon: '🛋️' },
            { value: 'apps', label_he: 'אפליקציות', label_en: 'Apps', icon: '📱' },
            { value: 'nothing', label_he: 'לא הרבה', label_en: 'Not much', icon: '🆕' },
          ],
        },
        // Help style
        {
          id: 'help_style',
          title_he: 'מה יעזור לך הכי הרבה?',
          title_en: 'What would help you the most?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP1,
          options: [
            { value: 'practical', label_he: 'פתרונות מעשיים', label_en: 'Practical solutions', icon: '🔧' },
            { value: 'listening', label_he: 'הקשבה', label_en: 'Being heard', icon: '👂' },
            { value: 'plan', label_he: 'תוכנית ברורה', label_en: 'Clear plan', icon: '📋' },
            { value: 'push', label_he: 'דחיפה לפעולה', label_en: 'Push to action', icon: '🚀' },
            { value: 'understanding', label_he: 'הבנה עצמית', label_en: 'Self-understanding', icon: '🔮' },
            { value: 'accountability', label_he: 'אחריותיות', label_en: 'Accountability', icon: '✅' },
          ],
        },
      ],
    },

    // ─── STEP 2: Essential Profile (CUT DOWN) ───
    {
      id: 2,
      title_he: 'פרופיל בסיסי',
      title_en: 'Essential Profile',
      renderer: 'card',
      miniSteps: [
        {
          id: 'age_group',
          title_he: 'קבוצת גיל',
          title_en: 'Age Group',
          inputType: 'single_select',
          validation: { required: true },
          dbPath: DB_STEP2,
          options: [
            { value: '18-24', label_he: '18-24', label_en: '18-24', icon: '🎂' },
            { value: '25-34', label_he: '25-34', label_en: '25-34', icon: '🎂' },
            { value: '35-44', label_he: '35-44', label_en: '35-44', icon: '🎂' },
            { value: '45-54', label_he: '45-54', label_en: '45-54', icon: '🎂' },
            { value: '55+', label_he: '55+', label_en: '55+', icon: '🎂' },
          ],
        },
        {
          id: 'gender',
          title_he: 'מין',
          title_en: 'Gender',
          inputType: 'single_select',
          validation: { required: true },
          dbPath: DB_STEP2,
          options: [
            { value: 'male', label_he: 'גבר', label_en: 'Male', icon: '👤' },
            { value: 'female', label_he: 'אישה', label_en: 'Female', icon: '👤' },
            { value: 'other', label_he: 'אחר', label_en: 'Other', icon: '👤' },
          ],
        },
        {
          id: 'relationship_status',
          title_he: 'מצב משפחתי',
          title_en: 'Relationship Status',
          inputType: 'single_select',
          validation: { required: true },
          dbPath: DB_STEP2,
          options: [
            { value: 'single', label_he: 'רווק/ה', label_en: 'Single', icon: '💑' },
            { value: 'dating', label_he: 'בזוגיות', label_en: 'Dating', icon: '💑' },
            { value: 'married', label_he: 'נשוי/אה', label_en: 'Married', icon: '💑' },
            { value: 'divorced', label_he: 'גרוש/ה', label_en: 'Divorced', icon: '💑' },
            { value: 'complicated', label_he: 'מסובך', label_en: 'Complicated', icon: '💑' },
          ],
        },
        {
          id: 'employment_status',
          title_he: 'תעסוקה',
          title_en: 'Employment',
          inputType: 'single_select',
          validation: { required: true },
          dbPath: DB_STEP2,
          options: [
            { value: 'employed', label_he: 'שכיר', label_en: 'Employed', icon: '💼' },
            { value: 'business-owner', label_he: 'בעל עסק', label_en: 'Business Owner', icon: '💼' },
            { value: 'self-employed', label_he: 'עצמאי / פרילנסר', label_en: 'Freelancer', icon: '💼' },
            { value: 'entrepreneur', label_he: 'יזם', label_en: 'Entrepreneur', icon: '💼' },
            { value: 'student', label_he: 'סטודנט/ית', label_en: 'Student', icon: '💼' },
            { value: 'unemployed', label_he: 'לא עובד/ת כרגע', label_en: 'Currently Unemployed', icon: '💼' },
            { value: 'retired', label_he: 'פנסיונר/ית', label_en: 'Retired', icon: '💼' },
          ],
        },
        {
          id: 'stress_level',
          title_he: 'מה רמת הסטרס שלך כרגע?',
          title_en: 'What is your current stress level?',
          inputType: 'single_select',
          validation: { required: true },
          dbPath: DB_STEP2,
          options: [
            { value: 'very-low', label_he: 'נמוכה מאוד', label_en: 'Very Low', icon: '😌' },
            { value: 'low', label_he: 'נמוכה', label_en: 'Low', icon: '🙂' },
            { value: 'medium', label_he: 'בינונית', label_en: 'Medium', icon: '😐' },
            { value: 'high', label_he: 'גבוהה', label_en: 'High', icon: '😰' },
            { value: 'very-high', label_he: 'גבוהה מאוד', label_en: 'Very High', icon: '🤯' },
          ],
        },
        {
          id: 'sleep_hours',
          title_he: 'כמה שעות אתה ישן בממוצע?',
          title_en: 'How many hours do you sleep on average?',
          inputType: 'single_select',
          validation: { required: true },
          dbPath: DB_STEP2,
          options: [
            { value: 'less-than-5', label_he: 'פחות מ-5', label_en: 'Less than 5', icon: '😴' },
            { value: '5-6', label_he: '5-6', label_en: '5-6', icon: '😴' },
            { value: '6-7', label_he: '6-7', label_en: '6-7', icon: '😴' },
            { value: '7-8', label_he: '7-8', label_en: '7-8', icon: '😴' },
            { value: 'more-than-8', label_he: 'יותר מ-8', label_en: 'More than 8', icon: '😴' },
          ],
        },
        {
          id: 'life_priorities',
          title_he: 'מה הכי חשוב לך בחיים?',
          title_en: 'What matters most to you in life?',
          prompt_he: 'בחר עד 3',
          prompt_en: 'Select up to 3',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1, maxSelected: 3 },
          dbPath: DB_STEP2,
          options: [
            { value: 'career', label_he: 'קריירה והצלחה מקצועית', label_en: 'Career & Professional Success', icon: '💼' },
            { value: 'family', label_he: 'משפחה וילדים', label_en: 'Family & Children', icon: '👨‍👩‍👧' },
            { value: 'health', label_he: 'בריאות ואורח חיים בריא', label_en: 'Health & Healthy Lifestyle', icon: '💪' },
            { value: 'wealth', label_he: 'ביטחון כלכלי ועושר', label_en: 'Financial Security & Wealth', icon: '💰' },
            { value: 'relationships', label_he: 'מערכות יחסים איכותיות', label_en: 'Quality Relationships', icon: '❤️' },
            { value: 'personal-growth', label_he: 'צמיחה אישית', label_en: 'Personal Growth', icon: '🌱' },
            { value: 'freedom', label_he: 'חופש וגמישות', label_en: 'Freedom & Flexibility', icon: '🦅' },
            { value: 'creativity', label_he: 'יצירתיות', label_en: 'Creativity', icon: '🎨' },
            { value: 'spirituality', label_he: 'רוחניות ומשמעות', label_en: 'Spirituality & Meaning', icon: '✨' },
            { value: 'peace', label_he: 'שלווה נפשית', label_en: 'Peace of Mind', icon: '☮️' },
          ],
        },
        {
          id: 'growth_focus',
          title_he: 'במה אתה רוצה לצמוח?',
          title_en: 'Where do you want to grow?',
          prompt_he: 'בחר עד 3',
          prompt_en: 'Select up to 3',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1, maxSelected: 3 },
          dbPath: DB_STEP2,
          options: [
            { value: 'confidence', label_he: 'ביטחון עצמי', label_en: 'Self-confidence', icon: '💪' },
            { value: 'discipline', label_he: 'משמעת ועקביות', label_en: 'Discipline & Consistency', icon: '⚙️' },
            { value: 'emotional-regulation', label_he: 'ויסות רגשי', label_en: 'Emotional Regulation', icon: '🎭' },
            { value: 'career-purpose', label_he: 'ייעוד מקצועי', label_en: 'Professional Purpose', icon: '💼' },
            { value: 'increase-income', label_he: 'הגדלת הכנסה', label_en: 'Increasing Income', icon: '💰' },
            { value: 'energy-vitality', label_he: 'אנרגיה וחיוניות', label_en: 'Energy & Vitality', icon: '⚡' },
            { value: 'find-meaning', label_he: 'מציאת משמעות', label_en: 'Finding Meaning', icon: '✨' },
            { value: 'improve-relationship', label_he: 'שיפור הזוגיות', label_en: 'Improving Relationship', icon: '❤️' },
            { value: 'communication', label_he: 'תקשורת בינאישית', label_en: 'Communication', icon: '💬' },
            { value: 'time-management', label_he: 'ניהול זמן', label_en: 'Time Management', icon: '⏰' },
          ],
        },
        {
          id: 'obstacles',
          title_he: 'מה הכי עוצר אותך מלהתקדם?',
          title_en: 'What stops you most from progressing?',
          inputType: 'multi_select',
          validation: { required: true, minSelected: 1 },
          dbPath: DB_STEP2,
          options: [
            { value: 'fear-of-failure', label_he: 'פחד מכישלון', label_en: 'Fear of failure', icon: '😨' },
            { value: 'low-confidence', label_he: 'חוסר ביטחון עצמי', label_en: 'Low self-confidence', icon: '😞' },
            { value: 'no-time', label_he: 'חוסר זמן', label_en: 'Lack of time', icon: '⏰' },
            { value: 'dont-know-how', label_he: 'לא יודע מאיפה להתחיל', label_en: "Don't know where to start", icon: '❓' },
            { value: 'external', label_he: 'גורמים חיצוניים', label_en: 'External factors', icon: '🌍' },
            { value: 'fatigue', label_he: 'עייפות/חוסר אנרגיה', label_en: 'Fatigue/Lack of energy', icon: '🔋' },
            { value: 'procrastination', label_he: 'דחיינות', label_en: 'Procrastination', icon: '⏳' },
            { value: 'perfectionism', label_he: 'פרפקציוניזם', label_en: 'Perfectionism', icon: '🎭' },
          ],
        },
      ],
    },

    // ─── STEP 3: Routine Snapshot (CUT DOWN) ───
    {
      id: 3,
      title_he: 'שגרה יומית',
      title_en: 'Daily Routine',
      renderer: 'card',
      miniSteps: [
        {
          id: 'wake_time',
          title_he: 'באיזו שעה אתה קם בדרך כלל?',
          title_en: 'What time do you usually wake up?',
          inputType: 'time_picker',
          validation: { required: true },
          dbPath: DB_STEP2,
          minHour: 3,
          maxHour: 12,
        },
        {
          id: 'sleep_time',
          title_he: 'באיזו שעה אתה הולך לישון?',
          title_en: 'What time do you go to sleep?',
          inputType: 'time_picker',
          validation: { required: true },
          dbPath: DB_STEP2,
          minHour: 18,
          maxHour: 3,
        },
        {
          id: 'peak_productivity',
          title_he: 'מתי אתה הכי פרודוקטיבי?',
          title_en: 'When are you most productive?',
          inputType: 'single_select',
          validation: { required: true },
          dbPath: DB_STEP2,
          options: [
            { value: 'early-morning', label_he: 'בוקר מוקדם (05:00-08:00)', label_en: 'Early morning (5-8 AM)', icon: '🌅' },
            { value: 'morning', label_he: 'בוקר (08:00-12:00)', label_en: 'Morning (8 AM-12 PM)', icon: '☀️' },
            { value: 'midday', label_he: 'צהריים (12:00-16:00)', label_en: 'Midday (12-4 PM)', icon: '🌤️' },
            { value: 'afternoon', label_he: 'אחר הצהריים (16:00-20:00)', label_en: 'Afternoon (4-8 PM)', icon: '🌇' },
            { value: 'evening', label_he: 'ערב (20:00-00:00)', label_en: 'Evening (8 PM-12 AM)', icon: '🌙' },
            { value: 'late-night', label_he: 'לילה מאוחר (אחרי חצות)', label_en: 'Late night (after midnight)', icon: '🦉' },
          ],
        },
        {
          id: 'low_energy_time',
          title_he: 'מתי אתה הכי עייף?',
          title_en: 'When do you feel most tired?',
          inputType: 'single_select',
          validation: { required: true },
          dbPath: DB_STEP2,
          options: [
            { value: 'morning', label_he: 'בוקר - קשה לי לקום', label_en: 'Morning - Hard to wake up', icon: '😫' },
            { value: 'mid-morning', label_he: 'אמצע הבוקר', label_en: 'Mid-morning', icon: '😐' },
            { value: 'after-lunch', label_he: 'אחרי הצהריים', label_en: 'After lunch', icon: '😴' },
            { value: 'late-afternoon', label_he: 'סוף היום', label_en: 'Late afternoon', icon: '🥱' },
            { value: 'evening', label_he: 'ערב (20:00+)', label_en: 'Evening (8 PM+)', icon: '😪' },
            { value: 'consistent', label_he: 'אנרגיה יציבה', label_en: 'Consistent energy', icon: '💪' },
          ],
        },
        {
          id: 'family_commitments',
          title_he: 'מחויבויות משפחתיות',
          title_en: 'Family Commitments',
          inputType: 'multi_select',
          validation: { required: false },
          dbPath: DB_STEP2,
          options: [
            { value: 'none', label_he: 'אין מחויבויות מיוחדות', label_en: 'No special commitments', icon: '✅' },
            { value: 'young-children', label_he: 'ילדים קטנים', label_en: 'Young children', icon: '👶' },
            { value: 'school-age-children', label_he: 'ילדים בגיל בית ספר', label_en: 'School-age children', icon: '🎒' },
            { value: 'elderly-care', label_he: 'טיפול בהורים מבוגרים', label_en: 'Elderly parent care', icon: '👴' },
            { value: 'shared-custody', label_he: 'משמורת משותפת', label_en: 'Shared custody', icon: '👨‍👧' },
            { value: 'pet-care', label_he: 'טיפול בחיות מחמד', label_en: 'Pet care', icon: '🐾' },
          ],
        },
      ],
    },

    // ─── STEP 4: Growth Deep Dive (CUSTOM) ───
    {
      id: 4,
      title_he: 'צלילה לעומק',
      title_en: 'Growth Deep Dive',
      renderer: 'custom',
      customComponent: 'GrowthDeepDiveStep',
      miniSteps: [],
    },

    // ─── STEP 5: First Chat (CUSTOM) ───
    {
      id: 5,
      title_he: 'שיחה ראשונה',
      title_en: 'First Chat',
      renderer: 'custom',
      customComponent: 'FirstChatStep',
      miniSteps: [],
    },

    // ─── STEP 6: Introspection (CUSTOM) ───
    {
      id: 6,
      title_he: 'הסתכלות פנימה',
      title_en: 'Introspection',
      renderer: 'custom',
      customComponent: 'IntrospectionStep',
      miniSteps: [],
    },

    // ─── STEP 7: Life Plan (CUSTOM) ───
    {
      id: 7,
      title_he: 'תוכנית חיים',
      title_en: 'Life Plan',
      renderer: 'custom',
      customComponent: 'LifePlanStep',
      miniSteps: [],
    },

    // ─── STEP 8: Focus Areas ───
    {
      id: 8,
      title_he: 'תחומי פוקוס',
      title_en: 'Focus Areas',
      renderer: 'custom',
      customComponent: 'FocusAreasStep',
      miniSteps: [],
    },

    // ─── STEP 9: First Week ───
    {
      id: 9,
      title_he: 'שבוע ראשון',
      title_en: 'First Week',
      renderer: 'custom',
      customComponent: 'FirstWeekStep',
      miniSteps: [],
    },

    // ─── STEP 10: Activation (CUSTOM) ───
    {
      id: 10,
      title_he: 'הפעלה',
      title_en: 'Activation',
      renderer: 'custom',
      customComponent: 'DashboardActivation',
      miniSteps: [],
    },
  ],

  // Map new core step IDs to old launchpad_progress step numbers
  stepMapping: {
    1: 1,   // Intent → step_1_intention
    2: 2,   // Essential Profile → step_2_profile_data
    3: 3,   // Routine → step_2_profile_data (merged)
    4: 4,   // Growth Deep Dive
    5: 5,   // First Chat
    6: 6,   // Introspection
    7: 7,   // Life Plan
    8: 8,   // Focus Areas → step_5
    9: 9,   // First Week → step_6
    10: 11, // Activation → step 11 (skipping old step 10 FinalNotes)
  },
};

// Register on import
registerFlow(coreLaunchpadSpec);
