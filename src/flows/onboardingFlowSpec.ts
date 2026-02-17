/**
 * Onboarding Flow Spec — 5-Step Friction-First Identity Calibration
 * 
 * Maps emotional pain points to internal pillars silently.
 * No pillar grid shown. Pure friction-first UX.
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

// ─── Friction-to-Pillar Mapping ───
export const FRICTION_PILLAR_MAP: Record<string, string> = {
  mentally_exhausted: 'mind',
  stuck_career: 'career',
  financially_stressed: 'money',
  relationships_disconnected: 'relationships',
  lack_structure: 'health',
  physically_drained: 'health',
};

// ─── Pillar display labels ───
export const PILLAR_LABELS: Record<string, { he: string; en: string; icon: string }> = {
  mind: { he: 'תודעה ומנטליות', en: 'Mind & Mentality', icon: '🧠' },
  career: { he: 'קריירה והתפתחות', en: 'Career & Growth', icon: '🚀' },
  money: { he: 'כסף ומשאבים', en: 'Money & Resources', icon: '💰' },
  relationships: { he: 'מערכות יחסים', en: 'Relationships', icon: '💜' },
  health: { he: 'בריאות ומשמעת', en: 'Health & Discipline', icon: '💪' },
};

// ─── Suggested quests/habits per pillar ───
export const PILLAR_SUGGESTIONS: Record<string, { quest_he: string; quest_en: string; habit_he: string; habit_en: string }> = {
  mind: { quest_he: 'שליטה מנטלית ב-7 ימים', quest_en: '7-Day Mental Mastery', habit_he: '10 דקות מדיטציה בוקר', habit_en: '10min Morning Meditation' },
  career: { quest_he: 'מיקוד קריירה ב-7 ימים', quest_en: '7-Day Career Focus', habit_he: 'שעה של עבודה עמוקה', habit_en: '1hr Deep Work Block' },
  money: { quest_he: 'שליטה פיננסית ב-7 ימים', quest_en: '7-Day Money Mastery', habit_he: 'מעקב הוצאות יומי', habit_en: 'Daily Expense Tracking' },
  relationships: { quest_he: 'חיבור מחדש ב-7 ימים', quest_en: '7-Day Reconnection', habit_he: 'שיחה משמעותית אחת', habit_en: '1 Meaningful Conversation' },
  health: { quest_he: 'משמעת גוף ב-7 ימים', quest_en: '7-Day Body Discipline', habit_he: '30 דקות תנועה', habit_en: '30min Movement' },
};

const onboardingFlowSpec: FlowSpec = {
  id: 'onboarding',
  title_he: 'כיול זהות',
  title_en: 'Identity Calibration',
  steps: [
    // ─── STEP 1: Friction Anchor ───
    {
      id: 1,
      title_he: 'מה הכי מאתגר?',
      title_en: 'What feels hardest?',
      renderer: 'card',
      miniSteps: [
        {
          id: 'friction_type',
          title_he: 'מה מרגיש הכי קשה בחיים שלך עכשיו?',
          title_en: 'What feels hardest in your life right now?',
          inputType: 'single_select',
          options: [
            { value: 'mentally_exhausted', label_he: 'אני מותש/ת נפשית', label_en: 'I feel mentally exhausted', icon: '🧠' },
            { value: 'stuck_career', label_he: 'אני תקוע/ה בקריירה', label_en: 'I feel stuck in my career', icon: '📉' },
            { value: 'financially_stressed', label_he: 'אני בלחץ כלכלי', label_en: 'I feel financially stressed', icon: '💸' },
            { value: 'relationships_disconnected', label_he: 'מערכות היחסים שלי מנותקות', label_en: 'My relationships feel disconnected', icon: '💔' },
            { value: 'lack_structure', label_he: 'חסר לי מבנה ומשמעת', label_en: 'I lack structure and discipline', icon: '🔄' },
            { value: 'physically_drained', label_he: 'אני מרגיש/ה מרוקנ/ת פיזית', label_en: 'I feel physically drained', icon: '⚡' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'friction_type' },
        },
      ],
    },

    // ─── STEP 2: Specific Tension (branched) ───
    {
      id: 2,
      title_he: 'המתח הספציפי',
      title_en: 'The Specific Tension',
      renderer: 'card',
      miniSteps: [
        // Mind tensions
        {
          id: 'specific_tension',
          title_he: 'מה בדיוק העומס המנטלי?',
          title_en: "What's the real mental tension?",
          inputType: 'single_select',
          options: [
            { value: 'cant_stop_overthinking', label_he: 'אני לא מצליח/ה להפסיק לחשוב יותר מדי', label_en: "I can't stop overthinking", icon: '🌀' },
            { value: 'anxiety_wont_stop', label_he: 'החרדה לא נעצרת', label_en: "Anxiety won't stop", icon: '😰' },
            { value: 'lost_motivation', label_he: 'איבדתי מוטיבציה', label_en: "I've lost all motivation", icon: '😶' },
            { value: 'cant_focus', label_he: 'אני לא מצליח/ה להתרכז', label_en: "I can't focus on anything", icon: '🎯' },
            { value: 'emotional_rollercoaster', label_he: 'רגשות כמו רכבת הרים', label_en: "Emotional rollercoaster", icon: '🎢' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'specific_tension' },
          branching: { showIf: (a) => a.friction_type === 'mentally_exhausted' },
        },
        // Career tensions
        {
          id: 'specific_tension',
          title_he: 'מה בדיוק התקיעות בקריירה?',
          title_en: "What's the real career tension?",
          inputType: 'single_select',
          options: [
            { value: 'no_growth', label_he: 'אין צמיחה מקצועית', label_en: 'No professional growth', icon: '📊' },
            { value: 'wrong_field', label_he: 'אני בתחום הלא נכון', label_en: "I'm in the wrong field", icon: '🔀' },
            { value: 'cant_get_started', label_he: 'יש לי רעיונות אבל לא מתחיל/ה', label_en: 'Ideas but no execution', icon: '💡' },
            { value: 'toxic_environment', label_he: 'סביבת עבודה רעילה', label_en: 'Toxic work environment', icon: '☣️' },
            { value: 'fear_of_change', label_he: 'פחד לעשות שינוי', label_en: 'Fear of making a change', icon: '😨' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'specific_tension' },
          branching: { showIf: (a) => a.friction_type === 'stuck_career' },
        },
        // Money tensions
        {
          id: 'specific_tension',
          title_he: 'מה בדיוק הלחץ הכלכלי?',
          title_en: "What's the real money tension?",
          inputType: 'single_select',
          options: [
            { value: 'earn_but_no_progress', label_he: 'מרוויח/ה אבל לא מתקדם/ת', label_en: 'I earn but never get ahead', icon: '💳' },
            { value: 'avoid_finances', label_he: 'נמנע/ת מלהסתכל על הכסף', label_en: 'I avoid looking at my finances', icon: '🙈' },
            { value: 'single_income', label_he: 'תלוי/ה במקור הכנסה אחד', label_en: 'I depend on one income source', icon: '🔗' },
            { value: 'earning_ceiling', label_he: 'מרגיש/ה תקרת השתכרות', label_en: 'I feel capped at my earning ceiling', icon: '📈' },
            { value: 'no_financial_plan', label_he: 'אין לי תוכנית פיננסית', label_en: 'No financial plan at all', icon: '📋' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'specific_tension' },
          branching: { showIf: (a) => a.friction_type === 'financially_stressed' },
        },
        // Relationships tensions
        {
          id: 'specific_tension',
          title_he: 'מה בדיוק הניתוק במערכות יחסים?',
          title_en: "What's the real relationship tension?",
          inputType: 'single_select',
          options: [
            { value: 'partner_disconnect', label_he: 'ניתוק מבן/בת הזוג', label_en: 'Disconnected from partner', icon: '💑' },
            { value: 'loneliness', label_he: 'בדידות עמוקה', label_en: 'Deep loneliness', icon: '🏝️' },
            { value: 'conflict_avoidance', label_he: 'נמנע/ת מקונפליקטים', label_en: 'I avoid all conflict', icon: '🤐' },
            { value: 'boundaries', label_he: 'קושי להציב גבולות', label_en: "Can't set boundaries", icon: '🚧' },
            { value: 'trust_issues', label_he: 'בעיות אמון', label_en: 'Trust issues', icon: '🔒' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'specific_tension' },
          branching: { showIf: (a) => a.friction_type === 'relationships_disconnected' },
        },
        // Structure/discipline tensions
        {
          id: 'specific_tension',
          title_he: 'מה בדיוק חסר במשמעת?',
          title_en: "What's the real discipline gap?",
          inputType: 'single_select',
          options: [
            { value: 'cant_stick_to_habits', label_he: 'לא מצליח/ה לשמור על הרגלים', label_en: "Can't stick to habits", icon: '📅' },
            { value: 'procrastination', label_he: 'דחיינות כרונית', label_en: 'Chronic procrastination', icon: '⏰' },
            { value: 'no_routine', label_he: 'אין שגרה בכלל', label_en: 'No routine whatsoever', icon: '🔄' },
            { value: 'start_never_finish', label_he: 'מתחיל/ה ולא גומר/ת', label_en: 'I start but never finish', icon: '🏁' },
            { value: 'overwhelmed_by_options', label_he: 'מוצף/ת מאפשרויות', label_en: 'Overwhelmed by options', icon: '🌊' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'specific_tension' },
          branching: { showIf: (a) => a.friction_type === 'lack_structure' },
        },
        // Physical drain tensions
        {
          id: 'specific_tension',
          title_he: 'מה בדיוק מרוקן אותך פיזית?',
          title_en: "What's draining you physically?",
          inputType: 'single_select',
          options: [
            { value: 'no_energy', label_he: 'אין אנרגיה בכלל', label_en: 'Zero energy all day', icon: '🔋' },
            { value: 'poor_sleep', label_he: 'שינה גרועה', label_en: 'Terrible sleep quality', icon: '😴' },
            { value: 'unhealthy_eating', label_he: 'תזונה לא בריאה', label_en: 'Unhealthy eating patterns', icon: '🍔' },
            { value: 'no_exercise', label_he: 'לא מתאמנ/ת בכלל', label_en: 'No exercise at all', icon: '🏃' },
            { value: 'chronic_stress', label_he: 'סטרס כרוני בגוף', label_en: 'Chronic physical stress', icon: '😫' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'specific_tension' },
          branching: { showIf: (a) => a.friction_type === 'physically_drained' },
        },
      ],
    },

    // ─── STEP 3: Desired Shift ───
    {
      id: 3,
      title_he: 'השינוי הרצוי',
      title_en: 'The Desired Shift',
      renderer: 'card',
      miniSteps: [
        {
          id: 'desired_shift',
          title_he: 'אם האזור הזה היה משתפר דרמטית, מה היה משתנה?',
          title_en: 'If this area improved dramatically, what would change?',
          inputType: 'single_select',
          options: [
            { value: 'wake_without_anxiety', label_he: 'הייתי מתעורר/ת בלי חרדה', label_en: "I'd wake up without anxiety", icon: '🌅' },
            { value: 'confident_decisions', label_he: 'הייתי מרגיש/ה ביטחון בהחלטות', label_en: "I'd feel confident making decisions", icon: '💎' },
            { value: 'stop_avoiding', label_he: 'הייתי מפסיק/ה להימנע מפעולות חשובות', label_en: "I'd stop avoiding important actions", icon: '⚡' },
            { value: 'control_future', label_he: 'הייתי מרגיש/ה שליטה בעתיד שלי', label_en: "I'd feel in control of my future", icon: '🎯' },
            { value: 'proud_discipline', label_he: 'הייתי גאה במשמעת שלי', label_en: "I'd feel proud of my discipline", icon: '🏆' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'desired_shift' },
        },
      ],
    },

    // ─── STEP 4: Commitment Calibration ───
    {
      id: 4,
      title_he: 'רמת המחויבות',
      title_en: 'Commitment Level',
      renderer: 'card',
      miniSteps: [
        {
          id: 'commitment_level',
          title_he: 'כמה רציני/ת את/ה לגבי שדרוג הנושא הזה?',
          title_en: 'How serious are you about upgrading this?',
          inputType: 'single_select',
          options: [
            { value: 'real_change', label_he: 'אני רוצה שינוי אמיתי', label_en: 'I want real change', icon: '🔥' },
            { value: 'curious_cautious', label_he: 'סקרן/ית אבל זהיר/ה', label_en: "I'm curious but cautious", icon: '🤔' },
            { value: 'need_structure', label_he: 'אני צריך/ה מבנה', label_en: 'I need structure', icon: '🏗️' },
            { value: 'want_clarity', label_he: 'אני רוצה בהירות', label_en: 'I just want clarity', icon: '💡' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'commitment_level' },
        },
      ],
    },

    // ─── STEP 5: Light Personalization ───
    {
      id: 5,
      title_he: 'התאמה אישית',
      title_en: 'Personalization',
      renderer: 'card',
      miniSteps: [
        {
          id: 'age_range',
          title_he: 'מה טווח הגילאים שלך?',
          title_en: 'What is your age range?',
          inputType: 'single_select',
          options: [
            { value: '18_24', label_he: '18-24', label_en: '18-24', icon: '🌱' },
            { value: '25_34', label_he: '25-34', label_en: '25-34', icon: '🌿' },
            { value: '35_44', label_he: '35-44', label_en: '35-44', icon: '🌳' },
            { value: '45_plus', label_he: '45+', label_en: '45+', icon: '🏔️' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'age_range' },
        },
        {
          id: 'work_structure',
          title_he: 'מה מבנה העבודה שלך?',
          title_en: 'What is your work structure?',
          inputType: 'single_select',
          options: [
            { value: 'employed', label_he: 'שכיר/ה', label_en: 'Employed', icon: '🏢' },
            { value: 'self_employed', label_he: 'עצמאי/ת', label_en: 'Self-employed', icon: '💼' },
            { value: 'student', label_he: 'סטודנט/ית', label_en: 'Student', icon: '📚' },
            { value: 'building', label_he: 'בונה משהו חדש', label_en: 'Building something', icon: '🚀' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'work_structure' },
        },
        {
          id: 'experience_level',
          title_he: 'איפה את/ה במסע?',
          title_en: 'Where are you in the journey?',
          inputType: 'single_select',
          options: [
            { value: 'beginner', label_he: 'מתחיל/ה', label_en: 'Beginner — first time', icon: '🌱' },
            { value: 'rebuilding', label_he: 'בונה מחדש', label_en: 'Rebuilding — starting over', icon: '🔄' },
            { value: 'optimizing', label_he: 'משפר/ת', label_en: 'Optimizing — already moving', icon: '⚡' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'experience_level' },
        },
      ],
    },
  ],
};

// Register the flow
registerFlow(onboardingFlowSpec);

export default onboardingFlowSpec;
