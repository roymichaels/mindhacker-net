/**
 * MindOS Neural Architecture Intake V2
 * 
 * 5-Phase, 13-Step system calibration.
 * Collects measurable behavioral variables to power:
 * - Hormonal optimization scores
 * - 8-8-8 daily structure generation
 * - Personalized hypnosis calibration
 * - Fully customized 90-day plan
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

// ─── Pressure Zone to Pillar Mapping ───
export const FRICTION_PILLAR_MAP: Record<string, string> = {
  cognitive_overload: 'mind',
  energy_instability: 'health',
  career_stagnation: 'career',
  financial_instability: 'money',
  emotional_strain: 'relationships',
  direction_confusion: 'mind',
  lack_structure: 'health',
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
  title_he: 'כיול מערכת עצבים',
  title_en: 'Neural Architecture Intake',
  steps: [
    // ════════════════════════════════════════════
    // PHASE 1 — STATE DIAGNOSIS
    // ════════════════════════════════════════════

    // ─── Step 1: Primary Pressure Zone ───
    {
      id: 1,
      title_he: 'אזור לחץ ראשי',
      title_en: 'Primary Pressure Zone',
      renderer: 'card',
      miniSteps: [
        {
          id: 'pressure_zone',
          title_he: 'איזה תחום יוצר הכי הרבה לחץ פנימי כרגע?',
          title_en: 'Which area is creating the most internal pressure right now?',
          inputType: 'single_select',
          options: [
            { value: 'cognitive_overload', label_he: 'עומס קוגניטיבי — חשיבת יתר / חרדה / ראש מפוזר', label_en: 'Cognitive overload — overthinking / anxiety / scattered mind', icon: '🧠' },
            { value: 'energy_instability', label_he: 'חוסר יציבות אנרגטית — עייפות / שחיקה / התאוששות גרועה', label_en: 'Energy instability — fatigue / burnout / poor recovery', icon: '⚡' },
            { value: 'career_stagnation', label_he: 'קיפאון בקריירה', label_en: 'Career stagnation', icon: '💼' },
            { value: 'financial_instability', label_he: 'חוסר יציבות כלכלית', label_en: 'Financial instability', icon: '💰' },
            { value: 'emotional_strain', label_he: 'מתח רגשי / במערכות יחסים', label_en: 'Emotional / relationship strain', icon: '💔' },
            { value: 'direction_confusion', label_he: 'בלבול בכיוון החיים', label_en: 'Direction confusion', icon: '🧭' },
            { value: 'lack_structure', label_he: 'חוסר מבנה ומשמעת', label_en: 'Lack of structure / discipline', icon: '🏗' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'pressure_zone' },
        },
      ],
    },

    // ─── Step 2: Functional Impairment (branched per pressure zone) ───
    {
      id: 2,
      title_he: 'סימפטומים תפקודיים',
      title_en: 'Functional Impairment',
      renderer: 'card',
      miniSteps: [
        // Cognitive overload signals
        {
          id: 'functional_signals',
          title_he: 'אילו סימפטומים אתה חווה?',
          title_en: 'Which symptoms do you experience?',
          inputType: 'multi_select',
          options: [
            { value: 'racing_thoughts', label_he: 'מחשבות מתרוצצות כל הזמן', label_en: 'Constant racing thoughts', icon: '🌀' },
            { value: 'low_focus', label_he: 'טווח ריכוז נמוך', label_en: 'Low focus span', icon: '🎯' },
            { value: 'doom_scrolling', label_he: 'גלילה אינסופית במסכים', label_en: 'Doom scrolling', icon: '📱' },
            { value: 'decision_paralysis', label_he: 'שיתוק החלטות', label_en: 'Decision paralysis', icon: '🔄' },
            { value: 'emotional_reactivity', label_he: 'תגובתיות רגשית', label_en: 'Emotional reactivity', icon: '💥' },
          ],
          validation: { required: true, minSelected: 1 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'cognitive_overload' },
        },
        // Energy instability signals
        {
          id: 'functional_signals',
          title_he: 'אילו סימפטומים אתה חווה?',
          title_en: 'Which symptoms do you experience?',
          inputType: 'multi_select',
          options: [
            { value: 'afternoon_crash', label_he: 'קריסה אחרי הצהריים', label_en: 'Crash after lunch', icon: '📉' },
            { value: 'non_restorative_sleep', label_he: 'שינה לא מרעננת', label_en: 'Sleep not restorative', icon: '😴' },
            { value: 'caffeine_reliance', label_he: 'תלות בקפאין', label_en: 'Heavy caffeine reliance', icon: '☕' },
            { value: 'brain_fog', label_he: 'ערפל מוחי', label_en: 'Brain fog', icon: '🌫️' },
            { value: 'no_morning_drive', label_he: 'אין דרייב בבוקר', label_en: 'No morning drive', icon: '🔋' },
          ],
          validation: { required: true, minSelected: 1 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'energy_instability' },
        },
        // Career stagnation signals
        {
          id: 'functional_signals',
          title_he: 'אילו סימפטומים אתה חווה?',
          title_en: 'Which symptoms do you experience?',
          inputType: 'multi_select',
          options: [
            { value: 'no_growth', label_he: 'אין צמיחה מקצועית', label_en: 'No professional growth', icon: '📊' },
            { value: 'wrong_field', label_he: 'בתחום הלא נכון', label_en: 'In the wrong field', icon: '🔀' },
            { value: 'ideas_no_execution', label_he: 'רעיונות בלי ביצוע', label_en: 'Ideas but no execution', icon: '💡' },
            { value: 'toxic_environment', label_he: 'סביבת עבודה רעילה', label_en: 'Toxic work environment', icon: '☣️' },
            { value: 'fear_of_change', label_he: 'פחד לשנות', label_en: 'Fear of making a change', icon: '😨' },
          ],
          validation: { required: true, minSelected: 1 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'career_stagnation' },
        },
        // Financial instability signals
        {
          id: 'functional_signals',
          title_he: 'אילו סימפטומים אתה חווה?',
          title_en: 'Which symptoms do you experience?',
          inputType: 'multi_select',
          options: [
            { value: 'earn_no_progress', label_he: 'מרוויח אבל לא מתקדם', label_en: 'Earn but never get ahead', icon: '💳' },
            { value: 'avoid_finances', label_he: 'נמנע מלהסתכל על כסף', label_en: 'Avoid looking at finances', icon: '🙈' },
            { value: 'single_income', label_he: 'תלוי במקור הכנסה אחד', label_en: 'Single income dependency', icon: '🔗' },
            { value: 'earning_ceiling', label_he: 'תקרת השתכרות', label_en: 'Earning ceiling', icon: '📈' },
            { value: 'no_financial_plan', label_he: 'אין תוכנית פיננסית', label_en: 'No financial plan', icon: '📋' },
          ],
          validation: { required: true, minSelected: 1 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'financial_instability' },
        },
        // Emotional strain signals
        {
          id: 'functional_signals',
          title_he: 'אילו סימפטומים אתה חווה?',
          title_en: 'Which symptoms do you experience?',
          inputType: 'multi_select',
          options: [
            { value: 'partner_disconnect', label_he: 'ניתוק מבן/בת זוג', label_en: 'Disconnected from partner', icon: '💑' },
            { value: 'loneliness', label_he: 'בדידות עמוקה', label_en: 'Deep loneliness', icon: '🏝️' },
            { value: 'conflict_avoidance', label_he: 'הימנעות מקונפליקט', label_en: 'Conflict avoidance', icon: '🤐' },
            { value: 'no_boundaries', label_he: 'קושי בהצבת גבולות', label_en: "Can't set boundaries", icon: '🚧' },
            { value: 'trust_issues', label_he: 'בעיות אמון', label_en: 'Trust issues', icon: '🔒' },
          ],
          validation: { required: true, minSelected: 1 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'emotional_strain' },
        },
        // Direction confusion signals
        {
          id: 'functional_signals',
          title_he: 'אילו סימפטומים אתה חווה?',
          title_en: 'Which symptoms do you experience?',
          inputType: 'multi_select',
          options: [
            { value: 'no_purpose', label_he: 'אין תחושת מטרה', label_en: 'No sense of purpose', icon: '🎯' },
            { value: 'comparing_others', label_he: 'משווה את עצמי לאחרים', label_en: 'Constantly comparing to others', icon: '👥' },
            { value: 'existential_dread', label_he: 'חרדה קיומית', label_en: 'Existential dread', icon: '🌑' },
            { value: 'analysis_paralysis', label_he: 'משותק מניתוח יתר', label_en: 'Analysis paralysis on life choices', icon: '🔄' },
            { value: 'values_misalignment', label_he: 'חיים לא תואמים לערכים', label_en: 'Living misaligned with values', icon: '⚖️' },
          ],
          validation: { required: true, minSelected: 1 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'direction_confusion' },
        },
        // Lack of structure signals
        {
          id: 'functional_signals',
          title_he: 'אילו סימפטומים אתה חווה?',
          title_en: 'Which symptoms do you experience?',
          inputType: 'multi_select',
          options: [
            { value: 'cant_stick_habits', label_he: 'לא מצליח לשמור על הרגלים', label_en: "Can't stick to habits", icon: '📅' },
            { value: 'chronic_procrastination', label_he: 'דחיינות כרונית', label_en: 'Chronic procrastination', icon: '⏰' },
            { value: 'no_routine', label_he: 'אין שגרה בכלל', label_en: 'No routine whatsoever', icon: '🔄' },
            { value: 'start_never_finish', label_he: 'מתחיל ולא גומר', label_en: 'Start but never finish', icon: '🏁' },
            { value: 'overwhelmed', label_he: 'מוצף מאפשרויות', label_en: 'Overwhelmed by options', icon: '🌊' },
          ],
          validation: { required: true, minSelected: 1 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'lack_structure' },
        },
      ],
    },

    // ════════════════════════════════════════════
    // PHASE 2 — BIOLOGICAL BASELINE
    // ════════════════════════════════════════════

    // ─── Step 3: Biological Identity ───
    {
      id: 3,
      title_he: 'זהות ביולוגית',
      title_en: 'Biological Identity',
      renderer: 'card',
      miniSteps: [
        {
          id: 'age_bracket',
          title_he: 'מה טווח הגילאים שלך?',
          title_en: 'What is your age bracket?',
          inputType: 'single_select',
          options: [
            { value: '18_24', label_he: '18-24', label_en: '18-24', icon: '🌱' },
            { value: '25_34', label_he: '25-34', label_en: '25-34', icon: '🌿' },
            { value: '35_44', label_he: '35-44', label_en: '35-44', icon: '🌳' },
            { value: '45_54', label_he: '45-54', label_en: '45-54', icon: '🏔️' },
            { value: '55_plus', label_he: '55+', label_en: '55+', icon: '🌄' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'age_bracket' },
        },
        {
          id: 'gender',
          title_he: 'מגדר',
          title_en: 'Gender',
          inputType: 'single_select',
          options: [
            { value: 'male', label_he: 'זכר', label_en: 'Male', icon: '♂️' },
            { value: 'female', label_he: 'נקבה', label_en: 'Female', icon: '♀️' },
            { value: 'other', label_he: 'אחר', label_en: 'Other', icon: '⚧' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'gender' },
        },
        {
          id: 'body_fat_estimate',
          title_he: 'הערכת אחוז שומן גוף',
          title_en: 'Body fat estimate',
          inputType: 'single_select',
          options: [
            { value: 'low', label_he: 'נמוך', label_en: 'Low', icon: '🏃' },
            { value: 'moderate', label_he: 'בינוני', label_en: 'Moderate', icon: '🚶' },
            { value: 'high', label_he: 'גבוה', label_en: 'High', icon: '🛋️' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'body_fat_estimate' },
        },
        {
          id: 'activity_level',
          title_he: 'רמת פעילות גופנית',
          title_en: 'Physical activity level',
          inputType: 'single_select',
          options: [
            { value: 'sedentary', label_he: 'ישיבני', label_en: 'Sedentary', icon: '🪑' },
            { value: '1_2_week', label_he: '1-2 פעמים בשבוע', label_en: '1-2x per week', icon: '🚶' },
            { value: '3_5_week', label_he: '3-5 פעמים בשבוע', label_en: '3-5x per week', icon: '🏋️' },
            { value: 'daily', label_he: 'אימון יומי', label_en: 'Daily training', icon: '🔥' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'activity_level' },
        },
      ],
    },

    // ─── Step 4: Sleep Structure ───
    {
      id: 4,
      title_he: 'מבנה שינה',
      title_en: 'Sleep Structure',
      renderer: 'card',
      miniSteps: [
        {
          id: 'wake_time',
          title_he: 'באיזו שעה אתה קם בדרך כלל?',
          title_en: 'What time do you usually wake up?',
          inputType: 'single_select',
          options: [
            { value: '5:00', label_he: '5:00-6:00', label_en: '5:00-6:00 AM', icon: '🌅' },
            { value: '6:00', label_he: '6:00-7:00', label_en: '6:00-7:00 AM', icon: '☀️' },
            { value: '7:00', label_he: '7:00-8:00', label_en: '7:00-8:00 AM', icon: '🌤️' },
            { value: '8:00', label_he: '8:00-9:00', label_en: '8:00-9:00 AM', icon: '⛅' },
            { value: '9:00+', label_he: '9:00+', label_en: '9:00+ AM', icon: '🌥️' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'wake_time' },
        },
        {
          id: 'sleep_time',
          title_he: 'באיזו שעה אתה הולך לישון?',
          title_en: 'What time do you go to sleep?',
          inputType: 'single_select',
          options: [
            { value: '21:00', label_he: '21:00-22:00', label_en: '9-10 PM', icon: '🌙' },
            { value: '22:00', label_he: '22:00-23:00', label_en: '10-11 PM', icon: '🌃' },
            { value: '23:00', label_he: '23:00-00:00', label_en: '11 PM-12 AM', icon: '🌌' },
            { value: '00:00', label_he: '00:00-01:00', label_en: '12-1 AM', icon: '🦉' },
            { value: '01:00+', label_he: '01:00+', label_en: '1:00+ AM', icon: '🌑' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'sleep_time' },
        },
        {
          id: 'sleep_quality',
          title_he: 'איכות שינה (1 = גרועה, 5 = מצוינת)',
          title_en: 'Sleep quality (1 = poor, 5 = excellent)',
          inputType: 'slider',
          sliderMin: 1,
          sliderMax: 5,
          sliderStep: 1,
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'sleep_quality' },
        },
        {
          id: 'screen_before_bed',
          title_he: 'שימוש במסכים 60 דקות לפני השינה?',
          title_en: 'Screen use 60 minutes before bed?',
          inputType: 'single_select',
          options: [
            { value: 'yes', label_he: 'כן', label_en: 'Yes', icon: '📱' },
            { value: 'no', label_he: 'לא', label_en: 'No', icon: '📵' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'screen_before_bed' },
        },
      ],
    },

    // ─── Step 5: Dopamine Load ───
    {
      id: 5,
      title_he: 'עומס דופמין',
      title_en: 'Dopamine Load',
      renderer: 'card',
      miniSteps: [
        {
          id: 'daily_screen_time',
          title_he: 'זמן מסך יומי (לא עבודה)',
          title_en: 'Daily screen time estimate (non-work)',
          inputType: 'single_select',
          options: [
            { value: 'under_2h', label_he: 'פחות מ-2 שעות', label_en: 'Less than 2 hours', icon: '✅' },
            { value: '2_4h', label_he: '2-4 שעות', label_en: '2-4 hours', icon: '⚠️' },
            { value: '4_6h', label_he: '4-6 שעות', label_en: '4-6 hours', icon: '🔶' },
            { value: '6h_plus', label_he: '6+ שעות', label_en: '6+ hours', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'daily_screen_time' },
        },
        {
          id: 'social_media_frequency',
          title_he: 'תדירות שימוש ברשתות חברתיות',
          title_en: 'Social media usage frequency',
          inputType: 'single_select',
          options: [
            { value: 'minimal', label_he: 'מינימלי', label_en: 'Minimal', icon: '🟢' },
            { value: 'moderate', label_he: 'בינוני — כמה פעמים ביום', label_en: 'Moderate — several times/day', icon: '🟡' },
            { value: 'heavy', label_he: 'כבד — בודק כל הזמן', label_en: 'Heavy — checking constantly', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'social_media_frequency' },
        },
        {
          id: 'caffeine_intake',
          title_he: 'צריכת קפאין יומית',
          title_en: 'Daily caffeine intake',
          inputType: 'single_select',
          options: [
            { value: '0', label_he: 'ללא', label_en: 'None', icon: '🚫' },
            { value: '1', label_he: 'כוס אחת', label_en: '1 cup', icon: '☕' },
            { value: '2_3', label_he: '2-3 כוסות', label_en: '2-3 cups', icon: '☕☕' },
            { value: '4_plus', label_he: '4+ כוסות', label_en: '4+ cups', icon: '⚡' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'caffeine_intake' },
        },
        {
          id: 'alcohol_frequency',
          title_he: 'תדירות צריכת אלכוהול',
          title_en: 'Alcohol frequency',
          inputType: 'single_select',
          options: [
            { value: 'never', label_he: 'לעולם לא', label_en: 'Never', icon: '🚫' },
            { value: 'rare', label_he: 'נדיר', label_en: 'Rarely', icon: '🟢' },
            { value: 'weekly', label_he: 'שבועי', label_en: 'Weekly', icon: '🟡' },
            { value: 'daily', label_he: 'יומי', label_en: 'Daily', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'alcohol_frequency' },
        },
      ],
    },

    // ─── Step 6: Physical Inputs ───
    {
      id: 6,
      title_he: 'קלטים פיזיים',
      title_en: 'Physical Inputs',
      renderer: 'card',
      miniSteps: [
        {
          id: 'diet_type',
          title_he: 'סוג תזונה',
          title_en: 'Diet type',
          inputType: 'single_select',
          options: [
            { value: 'whole_food', label_he: 'מזון מלא / טבעי', label_en: 'Whole food / natural', icon: '🥗' },
            { value: 'mixed', label_he: 'מעורב', label_en: 'Mixed', icon: '🍽️' },
            { value: 'processed_heavy', label_he: 'הרבה מזון מעובד', label_en: 'Processed heavy', icon: '🍔' },
            { value: 'high_sugar', label_he: 'עתיר סוכר', label_en: 'High sugar', icon: '🍭' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'diet_type' },
        },
        {
          id: 'protein_awareness',
          title_he: 'מודעות לצריכת חלבון',
          title_en: 'Protein intake awareness',
          inputType: 'single_select',
          options: [
            { value: 'low', label_he: 'לא עוקב', label_en: 'Not tracking', icon: '❌' },
            { value: 'medium', label_he: 'מודע חלקית', label_en: 'Somewhat aware', icon: '🤷' },
            { value: 'high', label_he: 'עוקב באופן פעיל', label_en: 'Actively tracking', icon: '✅' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'protein_awareness' },
        },
        {
          id: 'water_intake',
          title_he: 'צריכת מים יומית',
          title_en: 'Daily water intake',
          inputType: 'single_select',
          options: [
            { value: 'under_1L', label_he: 'פחות מליטר', label_en: 'Less than 1L', icon: '🔴' },
            { value: '1_2L', label_he: '1-2 ליטר', label_en: '1-2L', icon: '🟡' },
            { value: '2_3L', label_he: '2-3 ליטר', label_en: '2-3L', icon: '🟢' },
            { value: 'over_3L', label_he: '3+ ליטר', label_en: '3L+', icon: '💧' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'water_intake' },
        },
        {
          id: 'sun_exposure',
          title_he: 'חשיפה לשמש יומית',
          title_en: 'Daily sun exposure',
          inputType: 'single_select',
          options: [
            { value: 'under_10m', label_he: 'פחות מ-10 דקות', label_en: 'Less than 10 min', icon: '🌧️' },
            { value: '10_30m', label_he: '10-30 דקות', label_en: '10-30 min', icon: '⛅' },
            { value: 'over_30m', label_he: '30+ דקות', label_en: '30+ min', icon: '☀️' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'sun_exposure' },
        },
        {
          id: 'cold_exposure',
          title_he: 'חשיפה לקור (מקלחת קרה וכו׳)',
          title_en: 'Cold exposure (cold showers etc.)',
          inputType: 'single_select',
          options: [
            { value: 'never', label_he: 'לעולם לא', label_en: 'Never', icon: '❌' },
            { value: 'occasionally', label_he: 'לפעמים', label_en: 'Occasionally', icon: '🟡' },
            { value: 'weekly', label_he: 'שבועי', label_en: 'Weekly', icon: '🟢' },
            { value: 'frequent', label_he: 'תדיר', label_en: 'Frequently', icon: '🧊' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'cold_exposure' },
        },
      ],
    },

    // ════════════════════════════════════════════
    // PHASE 3 — TIME ARCHITECTURE
    // ════════════════════════════════════════════

    // ─── Step 7: Work Reality ───
    {
      id: 7,
      title_he: 'מציאות עבודה',
      title_en: 'Work Reality',
      renderer: 'card',
      miniSteps: [
        {
          id: 'work_type',
          title_he: 'סוג עבודה',
          title_en: 'Work type',
          inputType: 'single_select',
          options: [
            { value: 'fixed_hours', label_he: 'שעות קבועות', label_en: 'Fixed hours', icon: '🏢' },
            { value: 'flexible', label_he: 'גמיש', label_en: 'Flexible', icon: '🌐' },
            { value: 'shift', label_he: 'משמרות', label_en: 'Shift work', icon: '🔄' },
            { value: 'self_employed', label_he: 'עצמאי', label_en: 'Self-employed', icon: '💼' },
            { value: 'student', label_he: 'סטודנט', label_en: 'Student', icon: '📚' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'work_type' },
        },
        {
          id: 'daily_work_hours',
          title_he: 'שעות עבודה ביום',
          title_en: 'Daily work hours',
          inputType: 'slider',
          sliderMin: 2,
          sliderMax: 14,
          sliderStep: 1,
          sliderUnit: 'h',
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'daily_work_hours' },
        },
        {
          id: 'commute_duration',
          title_he: 'זמן נסיעה (כיוון אחד)',
          title_en: 'Commute duration (one way)',
          inputType: 'single_select',
          options: [
            { value: 'none', label_he: 'עבודה מהבית', label_en: 'Work from home', icon: '🏠' },
            { value: 'under_30m', label_he: 'עד 30 דקות', label_en: 'Under 30 min', icon: '🚗' },
            { value: '30_60m', label_he: '30-60 דקות', label_en: '30-60 min', icon: '🚌' },
            { value: 'over_60m', label_he: 'מעל 60 דקות', label_en: 'Over 60 min', icon: '🚂' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'commute_duration' },
        },
        {
          id: 'energy_peak_time',
          title_he: 'מתי האנרגיה שלך בשיא?',
          title_en: 'When is your energy at its peak?',
          inputType: 'single_select',
          options: [
            { value: 'early_morning', label_he: 'בוקר מוקדם (5-8)', label_en: 'Early morning (5-8)', icon: '🌅' },
            { value: 'morning', label_he: 'בוקר (8-12)', label_en: 'Morning (8-12)', icon: '☀️' },
            { value: 'afternoon', label_he: 'צהריים (12-16)', label_en: 'Afternoon (12-4)', icon: '🌤️' },
            { value: 'evening', label_he: 'ערב (16-20)', label_en: 'Evening (4-8)', icon: '🌆' },
            { value: 'night', label_he: 'לילה (20+)', label_en: 'Night (8 PM+)', icon: '🌙' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'energy_peak_time' },
        },
        {
          id: 'energy_crash_time',
          title_he: 'מתי האנרגיה שלך צונחת?',
          title_en: 'When does your energy crash?',
          inputType: 'single_select',
          options: [
            { value: 'late_morning', label_he: 'בוקר מאוחר (10-12)', label_en: 'Late morning (10-12)', icon: '😶' },
            { value: 'after_lunch', label_he: 'אחרי הצהריים (13-15)', label_en: 'After lunch (1-3 PM)', icon: '😴' },
            { value: 'late_afternoon', label_he: 'אחר הצהריים מאוחר (15-17)', label_en: 'Late afternoon (3-5 PM)', icon: '📉' },
            { value: 'evening', label_he: 'ערב (17-20)', label_en: 'Evening (5-8 PM)', icon: '🌅' },
            { value: 'no_crash', label_he: 'אין קריסה בולטת', label_en: 'No significant crash', icon: '⚡' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'energy_crash_time' },
        },
      ],
    },

    // ─── Step 8: Life Load ───
    {
      id: 8,
      title_he: 'עומס חיים',
      title_en: 'Life Load',
      renderer: 'card',
      miniSteps: [
        {
          id: 'dependents',
          title_he: 'תלויים',
          title_en: 'Dependents',
          inputType: 'single_select',
          options: [
            { value: 'none', label_he: 'ללא', label_en: 'None', icon: '🙋' },
            { value: 'partner', label_he: 'בן/בת זוג', label_en: 'Partner', icon: '💑' },
            { value: 'children', label_he: 'ילדים', label_en: 'Children', icon: '👨‍👩‍👧' },
            { value: 'elder_care', label_he: 'טיפול בהורים מבוגרים', label_en: 'Elder care', icon: '🧓' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'dependents' },
        },
        {
          id: 'household_responsibility',
          title_he: 'רמת אחריות בבית',
          title_en: 'Household responsibility level',
          inputType: 'single_select',
          options: [
            { value: 'low', label_he: 'נמוכה', label_en: 'Low', icon: '🟢' },
            { value: 'medium', label_he: 'בינונית', label_en: 'Medium', icon: '🟡' },
            { value: 'high', label_he: 'גבוהה', label_en: 'High', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'household_responsibility' },
        },
        {
          id: 'social_life_frequency',
          title_he: 'תדירות חיי חברה',
          title_en: 'Social life frequency',
          inputType: 'single_select',
          options: [
            { value: 'rare', label_he: 'נדיר', label_en: 'Rare', icon: '🤫' },
            { value: 'weekly', label_he: 'שבועי', label_en: 'Weekly', icon: '🙂' },
            { value: 'multiple_week', label_he: 'כמה פעמים בשבוע', label_en: 'Multiple times per week', icon: '🎉' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'social_life_frequency' },
        },
      ],
    },

    // ════════════════════════════════════════════
    // PHASE 4 — PSYCHOLOGICAL OPERATING SYSTEM
    // ════════════════════════════════════════════

    // ─── Step 9: Execution Pattern ───
    {
      id: 9,
      title_he: 'דפוס ביצוע',
      title_en: 'Execution Pattern',
      renderer: 'card',
      miniSteps: [
        {
          id: 'execution_pattern',
          title_he: 'מה הדפוס הדומיננטי שלך?',
          title_en: 'What is your dominant execution pattern?',
          inputType: 'single_select',
          options: [
            { value: 'start_and_quit', label_he: 'מתחיל ועוזב', label_en: 'I start and quit', icon: '🚪' },
            { value: 'overplan_delay', label_he: 'מתכנן יתר על המידה ודוחה', label_en: 'I overplan and delay', icon: '📋' },
            { value: 'avoid_hard', label_he: 'נמנע ממשימות קשות', label_en: 'I avoid hard tasks', icon: '🐢' },
            { value: 'burnout_fast', label_he: 'נשרף מהר', label_en: 'I burn out quickly', icon: '🔥' },
            { value: 'intense_inconsistent', label_he: 'אינטנסיבי אבל לא עקבי', label_en: 'Intense but inconsistent', icon: '⚡' },
            { value: 'consistent_plateaued', label_he: 'עקבי אבל ברמה קבועה', label_en: 'Consistent but plateaued', icon: '📊' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'execution_pattern' },
        },
      ],
    },

    // ─── Step 10: Motivation Driver ───
    {
      id: 10,
      title_he: 'מניע מוטיבציה',
      title_en: 'Motivation Driver',
      renderer: 'card',
      miniSteps: [
        {
          id: 'motivation_driver',
          title_he: 'מה הכוח המניע העיקרי שלך?',
          title_en: 'What is your primary motivation driver?',
          inputType: 'single_select',
          options: [
            { value: 'fear_of_failure', label_he: 'פחד מכישלון', label_en: 'Fear of failure', icon: '😰' },
            { value: 'desire_for_status', label_he: 'רצון לסטטוס', label_en: 'Desire for status', icon: '👑' },
            { value: 'identity_upgrade', label_he: 'שדרוג זהות', label_en: 'Identity upgrade', icon: '🦅' },
            { value: 'freedom', label_he: 'חופש', label_en: 'Freedom', icon: '🕊️' },
            { value: 'stability', label_he: 'יציבות', label_en: 'Stability', icon: '🏠' },
            { value: 'approval', label_he: 'הכרה ואישור', label_en: 'Approval', icon: '👏' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'motivation_driver' },
        },
      ],
    },

    // ─── Step 11: 90-Day Vector ───
    {
      id: 11,
      title_he: 'וקטור 90 יום',
      title_en: '90-Day Vector',
      renderer: 'card',
      miniSteps: [
        {
          id: 'target_90_days',
          title_he: 'מה היעד העיקרי שלך ל-90 הימים הקרובים?',
          title_en: 'What is your primary 90-day target?',
          inputType: 'single_select',
          options: [
            { value: 'body_composition', label_he: 'שיפור הרכב גוף', label_en: 'Improve body composition', icon: '💪' },
            { value: 'stabilize_energy', label_he: 'ייצוב אנרגיה', label_en: 'Stabilize energy', icon: '⚡' },
            { value: 'increase_income', label_he: 'הגדלת הכנסה', label_en: 'Increase income', icon: '💰' },
            { value: 'change_career', label_he: 'שינוי כיוון בקריירה', label_en: 'Change career direction', icon: '🔀' },
            { value: 'build_discipline', label_he: 'בניית מבנה ומשמעת', label_en: 'Build disciplined structure', icon: '🏗️' },
            { value: 'improve_relationship', label_he: 'שיפור מערכת יחסים', label_en: 'Improve relationship', icon: '💜' },
            { value: 'build_business', label_he: 'בניית עסק', label_en: 'Build business', icon: '🚀' },
            { value: 'mental_clarity', label_he: 'בהירות מנטלית', label_en: 'Gain mental clarity', icon: '🧠' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'target_90_days' },
        },
        {
          id: 'why_matters',
          title_he: 'למה זה חשוב לך? (בקצרה)',
          title_en: 'Why does this matter to you? (briefly)',
          inputType: 'textarea',
          validation: { required: true, minChars: 10 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'why_matters' },
        },
        {
          id: 'urgency_scale',
          title_he: 'רמת דחיפות (1 = לא דחוף, 10 = קריטי)',
          title_en: 'Urgency scale (1 = not urgent, 10 = critical)',
          inputType: 'slider',
          sliderMin: 1,
          sliderMax: 10,
          sliderStep: 1,
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'urgency_scale' },
        },
      ],
    },

    // ════════════════════════════════════════════
    // PHASE 5 — COMMITMENT FILTER
    // ════════════════════════════════════════════

    // ─── Step 12: Lifestyle Restructure Willingness ───
    {
      id: 12,
      title_he: 'מחויבות לשינוי',
      title_en: 'Commitment Filter',
      renderer: 'card',
      miniSteps: [
        {
          id: 'restructure_willingness',
          title_he: 'כמה מוכן אתה לשנות את מבנה החיים הנוכחי? (1 = שמרני, 10 = שינוי מוחלט)',
          title_en: 'How willing are you to restructure your current lifestyle? (1 = conservative, 10 = total overhaul)',
          inputType: 'slider',
          sliderMin: 1,
          sliderMax: 10,
          sliderStep: 1,
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'restructure_willingness' },
        },
      ],
    },

    // ─── Step 13: Final Notes ───
    {
      id: 13,
      title_he: 'הערות אחרונות',
      title_en: 'Final Notes',
      renderer: 'card',
      miniSteps: [
        {
          id: 'final_notes',
          title_he: 'משהו נוסף שהמערכת צריכה לדעת?',
          title_en: 'Anything else the system should know?',
          inputType: 'textarea',
          validation: { required: false },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'final_notes' },
        },
      ],
    },
  ],
};

// Register the flow
registerFlow(onboardingFlowSpec);

export default onboardingFlowSpec;
