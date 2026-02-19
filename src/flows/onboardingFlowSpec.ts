/**
 * MindOS Neural Architecture Intake V3
 * 
 * 5-Phase, 16-Step system calibration.
 * Collects ~65-80 measurable behavioral variables to power:
 * - Hormonal optimization scores
 * - 8-8-8 daily structure generation
 * - Personalized hypnosis calibration
 * - Fully customized 90-day plan
 * - Adaptive feedback loop engine
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

// ─── Pressure Zone to Pillar Mapping ───
export const FRICTION_PILLAR_MAP: Record<string, string> = {
  cognitive_overload: 'mind',
  energy_instability: 'health',
  execution_failure: 'health',
  emotional_volatility: 'relationships',
  direction_fog: 'mind',
  money_stress: 'money',
  relationship_friction: 'relationships',
  // Legacy mappings
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
  title_he: 'כיול מערכת עצבים V3',
  title_en: 'Neural Architecture Intake V3',
  steps: [
    // ════════════════════════════════════════════
    // PHASE 0 — ENTRY CONTEXT
    // ════════════════════════════════════════════

    // ─── Step 0: Entry Context ───
    {
      id: 0,
      title_he: 'הקשר כניסה',
      title_en: 'Entry Context',
      renderer: 'card',
      miniSteps: [
        {
          id: 'entry_context',
          title_he: 'למה אתה כאן?',
          title_en: 'Why are you here?',
          inputType: 'single_select',
          options: [
            { value: 'fix_structure', label_he: 'לתקן את מבנה החיים שלי', label_en: 'Fix my life structure', icon: '🏗️' },
            { value: 'optimize_performance', label_he: 'לייעל ביצועים', label_en: 'Optimize performance', icon: '⚡' },
            { value: 'recover_energy', label_he: 'לשחזר אנרגיה / בריאות נפשית', label_en: 'Recover energy / mental health', icon: '🔋' },
            { value: 'build_income', label_he: 'לבנות הכנסה / קריירה', label_en: 'Build income / career', icon: '💰' },
            { value: 'build_discipline', label_he: 'משמעת וביצוע', label_en: 'Discipline & execution', icon: '🎯' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'entry_context' },
        },
      ],
    },

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
            { value: 'cognitive_overload', label_he: 'עומס קוגניטיבי — ראש מתרוצץ', label_en: 'Cognitive overload — racing mind', icon: '🧠' },
            { value: 'energy_instability', label_he: 'חוסר יציבות אנרגטית — דפוסי קריסה', label_en: 'Energy instability — crash patterns', icon: '⚡' },
            { value: 'execution_failure', label_he: 'כשל ביצוע — לא מצליח למשוך', label_en: 'Execution failure — can\'t follow through', icon: '🚪' },
            { value: 'emotional_volatility', label_he: 'תנודתיות רגשית — תגובתיות', label_en: 'Emotional volatility — reactivity', icon: '💥' },
            { value: 'direction_fog', label_he: 'ערפל כיוון — אין נתיב ברור', label_en: 'Direction fog — no clear path', icon: '🧭' },
            { value: 'money_stress', label_he: 'לחץ כספי — כספים לא יציבים', label_en: 'Money stress — unstable finances', icon: '💰' },
            { value: 'relationship_friction', label_he: 'חיכוך במערכות יחסים', label_en: 'Relationship friction — conflict/distance', icon: '💔' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'pressure_zone' },
        },
      ],
    },

    // ─── Step 2: Functional Impairment (branched per pressure zone, 8 options, max 3) ───
    {
      id: 2,
      title_he: 'סימפטומים תפקודיים',
      title_en: 'Functional Impairment',
      renderer: 'card',
      miniSteps: [
        // Cognitive overload signals (8 options)
        {
          id: 'functional_signals',
          title_he: 'בחר עד 3 סימפטומים שאתה חווה',
          title_en: 'Select up to 3 symptoms you experience',
          inputType: 'multi_select',
          options: [
            { value: 'racing_thoughts', label_he: 'מחשבות מתרוצצות כל הזמן', label_en: 'Constant racing thoughts', icon: '🌀' },
            { value: 'low_focus', label_he: 'טווח ריכוז נמוך', label_en: 'Low focus span', icon: '🎯' },
            { value: 'doom_scrolling', label_he: 'גלילה אינסופית במסכים', label_en: 'Doom scrolling', icon: '📱' },
            { value: 'decision_paralysis', label_he: 'שיתוק החלטות', label_en: 'Decision paralysis', icon: '🔄' },
            { value: 'emotional_reactivity', label_he: 'תגובתיות רגשית', label_en: 'Emotional reactivity', icon: '💥' },
            { value: 'insomnia_from_thinking', label_he: 'קושי להירדם בגלל מחשבות', label_en: 'Can\'t sleep due to thoughts', icon: '🌙' },
            { value: 'memory_gaps', label_he: 'שכחה ובלבול', label_en: 'Memory gaps and confusion', icon: '🧩' },
            { value: 'anxiety_spikes', label_he: 'התקפי חרדה', label_en: 'Anxiety spikes', icon: '📈' },
          ],
          validation: { required: true, minSelected: 1, maxSelected: 3 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'cognitive_overload' },
        },
        // Energy instability signals (8 options)
        {
          id: 'functional_signals',
          title_he: 'בחר עד 3 סימפטומים שאתה חווה',
          title_en: 'Select up to 3 symptoms you experience',
          inputType: 'multi_select',
          options: [
            { value: 'afternoon_crash', label_he: 'קריסה אחרי הצהריים', label_en: 'Crash after lunch most days', icon: '📉' },
            { value: 'caffeine_reliance', label_he: 'צריך קפאין כדי לתפקד', label_en: 'Need caffeine to function', icon: '☕' },
            { value: 'non_restorative_sleep', label_he: 'קם עייף גם אחרי שינה', label_en: 'Wake up tired even after sleep', icon: '😴' },
            { value: 'night_energy_spike', label_he: 'קפיצת אנרגיה בלילה', label_en: 'Energy spikes at night', icon: '🦉' },
            { value: 'brain_fog', label_he: 'ערפל מוחי בבקרים', label_en: 'Brain fog in mornings', icon: '🌫️' },
            { value: 'training_impossible', label_he: 'אימון מרגיש בלתי אפשרי', label_en: 'Training feels impossible lately', icon: '🏋️' },
            { value: 'late_night_cravings', label_he: 'תאבון כפייתי בלילה', label_en: 'Late-night appetite cravings', icon: '🍕' },
            { value: 'weekend_oversleep', label_he: 'שינה מוגזמת בסופ"ש', label_en: 'Weekend recovery oversleep', icon: '😪' },
          ],
          validation: { required: true, minSelected: 1, maxSelected: 3 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'energy_instability' },
        },
        // Execution failure signals (8 options)
        {
          id: 'functional_signals',
          title_he: 'בחר עד 3 סימפטומים שאתה חווה',
          title_en: 'Select up to 3 symptoms you experience',
          inputType: 'multi_select',
          options: [
            { value: 'start_and_quit', label_he: 'מתחיל ועוזב אחרי ימים ספורים', label_en: 'Start and quit after a few days', icon: '🚪' },
            { value: 'chronic_procrastination', label_he: 'דחיינות כרונית', label_en: 'Chronic procrastination', icon: '⏰' },
            { value: 'avoid_hard_tasks', label_he: 'נמנע ממשימות קשות', label_en: 'Avoid hard tasks', icon: '🐢' },
            { value: 'overwhelmed_by_options', label_he: 'מוצף מאפשרויות', label_en: 'Overwhelmed by options', icon: '🌊' },
            { value: 'plans_no_action', label_he: 'מתכנן מצוין, ביצוע אפס', label_en: 'Great planner, zero action', icon: '📋' },
            { value: 'perfectionism_block', label_he: 'פרפקציוניזם משתק', label_en: 'Perfectionism blocks action', icon: '🔒' },
            { value: 'no_accountability', label_he: 'אין אחריותיות', label_en: 'No accountability system', icon: '🤷' },
            { value: 'distraction_loop', label_he: 'לולאת הסחות דעת', label_en: 'Distraction loop', icon: '🔄' },
          ],
          validation: { required: true, minSelected: 1, maxSelected: 3 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'execution_failure' },
        },
        // Emotional volatility signals (8 options)
        {
          id: 'functional_signals',
          title_he: 'בחר עד 3 סימפטומים שאתה חווה',
          title_en: 'Select up to 3 symptoms you experience',
          inputType: 'multi_select',
          options: [
            { value: 'emotional_reactivity', label_he: 'תגובתיות רגשית מוגברת', label_en: 'Heightened emotional reactivity', icon: '💥' },
            { value: 'mood_swings', label_he: 'תנודות מצב רוח', label_en: 'Mood swings', icon: '🎢' },
            { value: 'anger_outbursts', label_he: 'התפרצויות כעס', label_en: 'Anger outbursts', icon: '🌋' },
            { value: 'anxiety_loops', label_he: 'לולאות חרדה', label_en: 'Anxiety loops', icon: '🔁' },
            { value: 'numbness', label_he: 'אדישות רגשית', label_en: 'Emotional numbness', icon: '😶' },
            { value: 'crying_spells', label_he: 'התקפי בכי', label_en: 'Crying spells', icon: '😢' },
            { value: 'shame_spirals', label_he: 'ספירלות בושה', label_en: 'Shame spirals', icon: '🌀' },
            { value: 'self_sabotage', label_he: 'חבלה עצמית', label_en: 'Self-sabotage patterns', icon: '💣' },
          ],
          validation: { required: true, minSelected: 1, maxSelected: 3 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'emotional_volatility' },
        },
        // Direction fog signals (8 options)
        {
          id: 'functional_signals',
          title_he: 'בחר עד 3 סימפטומים שאתה חווה',
          title_en: 'Select up to 3 symptoms you experience',
          inputType: 'multi_select',
          options: [
            { value: 'no_purpose', label_he: 'אין תחושת מטרה', label_en: 'No sense of purpose', icon: '🎯' },
            { value: 'comparing_others', label_he: 'משווה את עצמי לאחרים', label_en: 'Constantly comparing to others', icon: '👥' },
            { value: 'existential_dread', label_he: 'חרדה קיומית', label_en: 'Existential dread', icon: '🌑' },
            { value: 'analysis_paralysis', label_he: 'שיתוק מניתוח יתר', label_en: 'Analysis paralysis on life choices', icon: '🔄' },
            { value: 'values_misalignment', label_he: 'חיים לא תואמים לערכים', label_en: 'Living misaligned with values', icon: '⚖️' },
            { value: 'multiple_interests', label_he: 'יותר מדי כיוונים, אף אחד לא מתמקד', label_en: 'Too many interests, none focused', icon: '🔀' },
            { value: 'fear_wrong_choice', label_he: 'פחד לבחור לא נכון', label_en: 'Fear of making the wrong choice', icon: '😨' },
            { value: 'stuck_in_comfort', label_he: 'תקוע באזור הנוחות', label_en: 'Stuck in comfort zone', icon: '🛋️' },
          ],
          validation: { required: true, minSelected: 1, maxSelected: 3 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'direction_fog' },
        },
        // Money stress signals (8 options)
        {
          id: 'functional_signals',
          title_he: 'בחר עד 3 סימפטומים שאתה חווה',
          title_en: 'Select up to 3 symptoms you experience',
          inputType: 'multi_select',
          options: [
            { value: 'earn_no_progress', label_he: 'מרוויח אבל לא מתקדם', label_en: 'Earn but never get ahead', icon: '💳' },
            { value: 'avoid_finances', label_he: 'נמנע מלהסתכל על כסף', label_en: 'Avoid looking at finances', icon: '🙈' },
            { value: 'single_income', label_he: 'תלוי במקור הכנסה אחד', label_en: 'Single income dependency', icon: '🔗' },
            { value: 'earning_ceiling', label_he: 'תקרת השתכרות', label_en: 'Earning ceiling', icon: '📈' },
            { value: 'no_financial_plan', label_he: 'אין תוכנית פיננסית', label_en: 'No financial plan', icon: '📋' },
            { value: 'impulse_spending', label_he: 'הוצאות אימפולסיביות', label_en: 'Impulse spending', icon: '🛍️' },
            { value: 'debt_pressure', label_he: 'לחץ חובות', label_en: 'Debt pressure', icon: '📉' },
            { value: 'no_savings', label_he: 'אין חיסכון', label_en: 'No savings', icon: '🏦' },
          ],
          validation: { required: true, minSelected: 1, maxSelected: 3 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'money_stress' },
        },
        // Relationship friction signals (8 options)
        {
          id: 'functional_signals',
          title_he: 'בחר עד 3 סימפטומים שאתה חווה',
          title_en: 'Select up to 3 symptoms you experience',
          inputType: 'multi_select',
          options: [
            { value: 'partner_disconnect', label_he: 'ניתוק מבן/בת זוג', label_en: 'Disconnected from partner', icon: '💑' },
            { value: 'loneliness', label_he: 'בדידות עמוקה', label_en: 'Deep loneliness', icon: '🏝️' },
            { value: 'conflict_avoidance', label_he: 'הימנעות מקונפליקט', label_en: 'Conflict avoidance', icon: '🤐' },
            { value: 'no_boundaries', label_he: 'קושי בהצבת גבולות', label_en: "Can't set boundaries", icon: '🚧' },
            { value: 'trust_issues', label_he: 'בעיות אמון', label_en: 'Trust issues', icon: '🔒' },
            { value: 'people_pleasing', label_he: 'צורך לרצות אחרים', label_en: 'People pleasing', icon: '🎭' },
            { value: 'communication_breakdown', label_he: 'קריסת תקשורת', label_en: 'Communication breakdown', icon: '📵' },
            { value: 'resentment_buildup', label_he: 'הצטברות טינה', label_en: 'Resentment buildup', icon: '🌋' },
          ],
          validation: { required: true, minSelected: 1, maxSelected: 3 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'relationship_friction' },
        },
        // Legacy branching (backward compatibility)
        {
          id: 'functional_signals',
          title_he: 'בחר עד 3 סימפטומים שאתה חווה',
          title_en: 'Select up to 3 symptoms you experience',
          inputType: 'multi_select',
          options: [
            { value: 'no_growth', label_he: 'אין צמיחה מקצועית', label_en: 'No professional growth', icon: '📊' },
            { value: 'wrong_field', label_he: 'בתחום הלא נכון', label_en: 'In the wrong field', icon: '🔀' },
            { value: 'ideas_no_execution', label_he: 'רעיונות בלי ביצוע', label_en: 'Ideas but no execution', icon: '💡' },
            { value: 'toxic_environment', label_he: 'סביבת עבודה רעילה', label_en: 'Toxic work environment', icon: '☣️' },
            { value: 'fear_of_change', label_he: 'פחד לשנות', label_en: 'Fear of making a change', icon: '😨' },
            { value: 'no_mentorship', label_he: 'אין ליווי מקצועי', label_en: 'No mentorship or guidance', icon: '🧭' },
            { value: 'skill_gap', label_he: 'פער מיומנויות', label_en: 'Skill gap', icon: '📚' },
            { value: 'burnout', label_he: 'שחיקה מקצועית', label_en: 'Professional burnout', icon: '🔥' },
          ],
          validation: { required: true, minSelected: 1, maxSelected: 3 },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'functional_signals' },
          branching: { showIf: (a) => a.pressure_zone === 'career_stagnation' || a.pressure_zone === 'financial_instability' || a.pressure_zone === 'emotional_strain' || a.pressure_zone === 'direction_confusion' || a.pressure_zone === 'lack_structure' },
        },
      ],
    },

    // ─── Step 3: Failure Moment ───
    {
      id: 3,
      title_he: 'רגע הכישלון',
      title_en: 'Failure Moment',
      renderer: 'card',
      miniSteps: [
        {
          id: 'failure_moment',
          title_he: 'מתי אתה נכשל הכי הרבה?',
          title_en: 'When do you fail most often?',
          inputType: 'single_select',
          options: [
            { value: 'morning_start', label_he: 'התחלת בוקר (0-11)', label_en: 'Morning start (0-11)', icon: '🌅' },
            { value: 'midday_drift', label_he: 'סחף בצהריים (11-16)', label_en: 'Midday drift (11-16)', icon: '🌤️' },
            { value: 'evening_collapse', label_he: 'קריסת ערב (16-21)', label_en: 'Evening collapse (16-21)', icon: '🌆' },
            { value: 'late_night_spiral', label_he: 'ספירלת לילה (21+)', label_en: 'Late-night spiral (21+)', icon: '🌙' },
            { value: 'random', label_he: 'אקראי / משתנה', label_en: 'Random / depends', icon: '🎲' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'failure_moment' },
        },
      ],
    },

    // ════════════════════════════════════════════
    // PHASE 2 — BIOLOGICAL BASELINE
    // ════════════════════════════════════════════

    // ─── Step 4: Biological Identity ───
    {
      id: 4,
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
            { value: '16_18', label_he: '16-18', label_en: '16-18', icon: '🌱' },
            { value: '19_24', label_he: '19-24', label_en: '19-24', icon: '🌿' },
            { value: '25_34', label_he: '25-34', label_en: '25-34', icon: '🌳' },
            { value: '35_44', label_he: '35-44', label_en: '35-44', icon: '🏔️' },
            { value: '45_54', label_he: '45-54', label_en: '45-54', icon: '🌄' },
            { value: '55_plus', label_he: '55+', label_en: '55+', icon: '🏛️' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'age_bracket' },
        },
        {
          id: 'gender',
          title_he: 'מין ביולוגי',
          title_en: 'Sex at birth',
          inputType: 'single_select',
          options: [
            { value: 'male', label_he: 'זכר', label_en: 'Male', icon: '♂️' },
            { value: 'female', label_he: 'נקבה', label_en: 'Female', icon: '♀️' },
            { value: 'prefer_not', label_he: 'מעדיף לא לומר', label_en: 'Prefer not to say', icon: '⚧' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'gender' },
        },
        {
          id: 'body_fat_estimate',
          title_he: 'הערכת שומן גוף נוכחית',
          title_en: 'Current body fat estimate',
          inputType: 'single_select',
          options: [
            { value: 'lean', label_he: 'רזה — שרירים נראים', label_en: 'Lean — muscles visible', icon: '🏃' },
            { value: 'average', label_he: 'ממוצע — כמה ק"ג מיותרים', label_en: 'Average — a few extra kg', icon: '🚶' },
            { value: 'high', label_he: 'גבוה — עודף ניכר', label_en: 'High — noticeable excess', icon: '🛋️' },
            { value: 'very_high', label_he: 'גבוה מאוד — השפעה על תפקוד', label_en: 'Very high — impacts function', icon: '⚠️' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'body_fat_estimate' },
        },
        {
          id: 'activity_level',
          title_he: 'רמת אימון נוכחית',
          title_en: 'Current training level',
          inputType: 'single_select',
          options: [
            { value: 'none', label_he: 'ללא', label_en: 'None', icon: '🪑' },
            { value: '1_2_week', label_he: '1-2 פעמים בשבוע', label_en: '1-2x/week', icon: '🚶' },
            { value: '3_4_week', label_he: '3-4 פעמים בשבוע', label_en: '3-4x/week', icon: '🏋️' },
            { value: '5_plus', label_he: '5+ פעמים בשבוע', label_en: '5x+', icon: '🔥' },
            { value: 'athlete', label_he: 'ספורטאי', label_en: 'Athlete', icon: '🏆' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'activity_level' },
        },
      ],
    },

    // ─── Step 5: Sleep Architecture ───
    {
      id: 5,
      title_he: 'ארכיטקטורת שינה',
      title_en: 'Sleep Architecture',
      renderer: 'card',
      miniSteps: [
        {
          id: 'wake_time',
          title_he: 'באיזו שעה אתה קם בדרך כלל?',
          title_en: 'What time do you usually wake up?',
          inputType: 'single_select',
          options: [
            { value: '03:00-04:00', label_he: '03:00-04:00', label_en: '3:00-4:00 AM', icon: '🌑' },
            { value: '04:00-05:00', label_he: '04:00-05:00', label_en: '4:00-5:00 AM', icon: '🌒' },
            { value: '05:00-06:00', label_he: '05:00-06:00', label_en: '5:00-6:00 AM', icon: '🌅' },
            { value: '06:00-07:00', label_he: '06:00-07:00', label_en: '6:00-7:00 AM', icon: '☀️' },
            { value: '07:00-08:00', label_he: '07:00-08:00', label_en: '7:00-8:00 AM', icon: '🌤️' },
            { value: '08:00-09:00', label_he: '08:00-09:00', label_en: '8:00-9:00 AM', icon: '⛅' },
            { value: '09:00-10:00', label_he: '09:00-10:00', label_en: '9:00-10:00 AM', icon: '🌥️' },
            { value: '10:00-11:00', label_he: '10:00-11:00', label_en: '10:00-11:00 AM', icon: '🕙' },
            { value: '11:00+', label_he: '11:00+', label_en: '11:00+ AM', icon: '🌞' },
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
          id: 'sleep_duration_avg',
          title_he: 'ממוצע שעות שינה',
          title_en: 'Average sleep duration',
          inputType: 'single_select',
          options: [
            { value: 'under_5', label_he: 'פחות מ-5 שעות', label_en: 'Less than 5h', icon: '🔴' },
            { value: '5_6', label_he: '5-6 שעות', label_en: '5-6h', icon: '🟠' },
            { value: '6_7', label_he: '6-7 שעות', label_en: '6-7h', icon: '🟡' },
            { value: '7_8', label_he: '7-8 שעות', label_en: '7-8h', icon: '🟢' },
            { value: '8_plus', label_he: '8+ שעות', label_en: '8h+', icon: '💤' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'sleep_duration_avg' },
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
          title_en: 'Screen use within 60 min of bed?',
          inputType: 'single_select',
          options: [
            { value: 'yes', label_he: 'כן', label_en: 'Yes', icon: '📱' },
            { value: 'no', label_he: 'לא', label_en: 'No', icon: '📵' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'screen_before_bed' },
        },
        {
          id: 'wake_during_night',
          title_he: 'התעוררות במהלך הלילה',
          title_en: 'Wake during night',
          inputType: 'single_select',
          options: [
            { value: 'never', label_he: 'אף פעם', label_en: 'Never', icon: '🟢' },
            { value: '1x', label_he: 'פעם אחת', label_en: '1x', icon: '🟡' },
            { value: '2x_plus', label_he: '2+ פעמים', label_en: '2x+', icon: '🟠' },
            { value: 'often', label_he: 'לעיתים קרובות', label_en: 'Often', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'wake_during_night' },
        },
        {
          id: 'sunlight_after_waking',
          title_he: 'אור שמש תוך 60 דקות מהקימה?',
          title_en: 'Sunlight within 60 min of waking?',
          inputType: 'single_select',
          options: [
            { value: 'yes', label_he: 'כן', label_en: 'Yes', icon: '☀️' },
            { value: 'no', label_he: 'לא', label_en: 'No', icon: '🏠' },
            { value: 'sometimes', label_he: 'לפעמים', label_en: 'Sometimes', icon: '⛅' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'sunlight_after_waking' },
        },
      ],
    },

    // ─── Step 6: Stimulants & Downers ───
    {
      id: 6,
      title_he: 'ממריצים ומדכאים',
      title_en: 'Stimulants & Downers',
      renderer: 'card',
      miniSteps: [
        {
          id: 'caffeine_intake',
          title_he: 'כמות קפאין יומית',
          title_en: 'Daily caffeine count',
          inputType: 'single_select',
          options: [
            { value: '0', label_he: 'ללא', label_en: '0', icon: '🚫' },
            { value: '1', label_he: 'כוס אחת', label_en: '1', icon: '☕' },
            { value: '2', label_he: '2 כוסות', label_en: '2', icon: '☕☕' },
            { value: '3_plus', label_he: '3+ כוסות', label_en: '3+', icon: '⚡' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'caffeine_intake' },
        },
        {
          id: 'first_caffeine_timing',
          title_he: 'תזמון קפאין ראשון',
          title_en: 'First caffeine timing',
          inputType: 'single_select',
          options: [
            { value: 'within_60min', label_he: 'תוך 60 דקות מהקימה', label_en: 'Within 60 min of waking', icon: '⏰' },
            { value: '1_3h', label_he: '1-3 שעות אחרי קימה', label_en: '1-3h after waking', icon: '🕐' },
            { value: 'after_3h', label_he: 'אחרי 3 שעות', label_en: 'After 3h', icon: '🕒' },
            { value: 'varies', label_he: 'משתנה', label_en: 'Varies', icon: '🔄' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'first_caffeine_timing' },
        },
        {
          id: 'alcohol_frequency',
          title_he: 'תדירות אלכוהול',
          title_en: 'Alcohol frequency',
          inputType: 'single_select',
          options: [
            { value: 'never', label_he: 'אף פעם', label_en: 'Never', icon: '🚫' },
            { value: '1x_week', label_he: 'פעם בשבוע', label_en: '1x/week', icon: '🟢' },
            { value: '2_3x_week', label_he: '2-3 בשבוע', label_en: '2-3x/week', icon: '🟡' },
            { value: '4x_plus', label_he: '4+ בשבוע', label_en: '4x+/week', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'alcohol_frequency' },
        },
        {
          id: 'nicotine',
          title_he: 'ניקוטין',
          title_en: 'Nicotine',
          inputType: 'single_select',
          options: [
            { value: 'no', label_he: 'לא', label_en: 'No', icon: '🚫' },
            { value: 'sometimes', label_he: 'לפעמים', label_en: 'Sometimes', icon: '🟡' },
            { value: 'daily', label_he: 'יומי', label_en: 'Daily', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'nicotine' },
        },
        {
          id: 'weed_thc',
          title_he: 'קנאביס / THC',
          title_en: 'Weed / THC',
          inputType: 'single_select',
          options: [
            { value: 'no', label_he: 'לא', label_en: 'No', icon: '🚫' },
            { value: 'sometimes', label_he: 'לפעמים', label_en: 'Sometimes', icon: '🟡' },
            { value: 'weekly', label_he: 'שבועי', label_en: 'Weekly', icon: '🟠' },
            { value: 'daily', label_he: 'יומי', label_en: 'Daily', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'weed_thc' },
        },
      ],
    },

    // ─── Step 7: Dopamine Load ───
    {
      id: 7,
      title_he: 'עומס דופמין',
      title_en: 'Dopamine Load',
      renderer: 'card',
      miniSteps: [
        {
          id: 'daily_screen_time',
          title_he: 'זמן מסך יומי (לא עבודה)',
          title_en: 'Daily screen time (non-work)',
          inputType: 'single_select',
          options: [
            { value: 'under_30m', label_he: 'פחות מ-30 דקות', label_en: 'Less than 30 min', icon: '✅' },
            { value: '30_60m', label_he: '30-60 דקות', label_en: '30-60 min', icon: '🟢' },
            { value: '1_2h', label_he: '1-2 שעות', label_en: '1-2h', icon: '🟡' },
            { value: '2_4h', label_he: '2-4 שעות', label_en: '2-4h', icon: '🟠' },
            { value: '4h_plus', label_he: '4+ שעות', label_en: '4h+', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'daily_screen_time' },
        },
        {
          id: 'shorts_reels',
          title_he: 'Shorts / Reels / TikTok',
          title_en: 'Shorts / Reels / TikTok',
          inputType: 'single_select',
          options: [
            { value: 'never', label_he: 'אף פעם', label_en: 'Never', icon: '🚫' },
            { value: 'sometimes', label_he: 'לפעמים', label_en: 'Sometimes', icon: '🟡' },
            { value: 'daily', label_he: 'יומי', label_en: 'Daily', icon: '🟠' },
            { value: 'heavy_daily', label_he: 'הרבה ביום', label_en: 'Heavy daily', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'shorts_reels' },
        },
        {
          id: 'gaming',
          title_he: 'גיימינג',
          title_en: 'Gaming',
          inputType: 'single_select',
          options: [
            { value: 'none', label_he: 'ללא', label_en: 'None', icon: '🚫' },
            { value: 'weekends', label_he: 'סופ"ש בלבד', label_en: 'Weekends', icon: '🎮' },
            { value: 'few_days', label_he: 'כמה ימים בשבוע', label_en: 'Few days/week', icon: '🟡' },
            { value: 'daily', label_he: 'יומי', label_en: 'Daily', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'gaming' },
        },
        {
          id: 'porn_frequency',
          title_he: 'פורנוגרפיה',
          title_en: 'Pornography',
          inputType: 'single_select',
          options: [
            { value: 'prefer_not', label_he: 'מעדיף לא לומר', label_en: 'Prefer not to say', icon: '🤐' },
            { value: 'never', label_he: 'אף פעם', label_en: 'Never', icon: '🚫' },
            { value: 'monthly', label_he: 'חודשי', label_en: 'Monthly', icon: '🟢' },
            { value: 'weekly', label_he: 'שבועי', label_en: 'Weekly', icon: '🟡' },
            { value: '2_5x_week', label_he: '2-5 פעמים בשבוע', label_en: '2-5x/week', icon: '🟠' },
            { value: 'daily', label_he: 'יומי', label_en: 'Daily', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'porn_frequency' },
        },
        {
          id: 'late_night_scrolling',
          title_he: 'גלילת מסך אחרי שכיבה במיטה',
          title_en: 'Scrolling after getting into bed',
          inputType: 'single_select',
          options: [
            { value: 'never', label_he: 'אף פעם', label_en: 'Never', icon: '🚫' },
            { value: 'sometimes', label_he: 'לפעמים', label_en: 'Sometimes', icon: '🟡' },
            { value: 'often', label_he: 'לעיתים קרובות', label_en: 'Often', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'late_night_scrolling' },
        },
      ],
    },

    // ─── Step 8: Nutrition & Hydration ───
    {
      id: 8,
      title_he: 'תזונה ונוזלים',
      title_en: 'Nutrition & Hydration',
      renderer: 'card',
      miniSteps: [
        {
          id: 'diet_type',
          title_he: 'סוג תזונה',
          title_en: 'Diet type',
          inputType: 'multi_select',
          options: [
            { value: 'mixed', label_he: 'מעורב', label_en: 'Mixed', icon: '🍽️' },
            { value: 'high_carb', label_he: 'עתיר פחמימות', label_en: 'High-carb', icon: '🍞' },
            { value: 'low_carb', label_he: 'דל פחמימות', label_en: 'Low-carb', icon: '🥩' },
            { value: 'keto', label_he: 'קטוגני', label_en: 'Keto', icon: '🥑' },
            { value: 'vegetarian', label_he: 'צמחוני', label_en: 'Vegetarian', icon: '🥗' },
            { value: 'vegan', label_he: 'טבעוני', label_en: 'Vegan', icon: '🌱' },
            { value: 'fruitarian', label_he: 'פרוטריאני', label_en: 'Fruitarian', icon: '🍇' },
            { value: 'alkaline', label_he: 'אלקליני', label_en: 'Alkaline', icon: '🥒' },
            { value: 'organic', label_he: 'אורגני', label_en: 'Organic', icon: '🌿' },
            { value: 'paleo', label_he: 'פליאו', label_en: 'Paleo', icon: '🦴' },
            { value: 'mediterranean', label_he: 'ים תיכוני', label_en: 'Mediterranean', icon: '🫒' },
            { value: 'intermittent_fasting', label_he: 'צום לסירוגין', label_en: 'Intermittent Fasting', icon: '⏰' },
            { value: 'chaotic', label_he: 'כאוטי', label_en: 'Chaotic', icon: '🎲' },
          ],
          validation: { required: true, minSelected: 1 },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'diet_type' },
        },
        {
          id: 'protein_awareness',
          title_he: 'מודעות לחלבון',
          title_en: 'Protein awareness',
          inputType: 'single_select',
          options: [
            { value: 'no_idea', label_he: 'אין לי מושג', label_en: 'No idea', icon: '❌' },
            { value: 'some', label_he: 'מודע חלקית', label_en: 'Some awareness', icon: '🤷' },
            { value: 'track_it', label_he: 'עוקב באופן פעיל', label_en: 'Track it', icon: '✅' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'protein_awareness' },
        },
        {
          id: 'meals_per_day',
          title_he: 'כמה ארוחות ביום?',
          title_en: 'Meals per day',
          inputType: 'single_select',
          options: [
            { value: '1', label_he: '1', label_en: '1', icon: '1️⃣' },
            { value: '2', label_he: '2', label_en: '2', icon: '2️⃣' },
            { value: '3', label_he: '3', label_en: '3', icon: '3️⃣' },
            { value: '4_plus', label_he: '4+', label_en: '4+', icon: '4️⃣' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'meals_per_day' },
        },
        {
          id: 'daily_fluid_volume',
          title_he: 'כמה נוזלים אתה צורך ביום (סה"כ)?',
          title_en: 'How much total fluids do you consume daily?',
          inputType: 'single_select',
          options: [
            { value: 'under_1L', label_he: 'פחות מליטר', label_en: 'Less than 1L', icon: '🔴' },
            { value: '1_2L', label_he: '1-2 ליטר', label_en: '1-2L', icon: '🟡' },
            { value: '2_3L', label_he: '2-3 ליטר', label_en: '2-3L', icon: '🟢' },
            { value: 'over_3L', label_he: '3+ ליטר', label_en: '3L+', icon: '💧' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'daily_fluid_volume' },
        },
        {
          id: 'fluid_sources',
          title_he: 'מה מקורות הנוזלים העיקריים שלך?',
          title_en: 'What are your main fluid sources?',
          inputType: 'multi_select',
          options: [
            { value: 'water', label_he: 'מים', label_en: 'Water', icon: '💧' },
            { value: 'coconut_water', label_he: 'מי קוקוס', label_en: 'Coconut Water', icon: '🥥' },
            { value: 'fresh_juice', label_he: 'מיצים טבעיים 100%', label_en: '100% Natural Juice', icon: '🍊' },
            { value: 'smoothies', label_he: 'שייקים / סמוזי', label_en: 'Smoothies', icon: '🥤' },
            { value: 'herbal_tea', label_he: 'תה צמחים', label_en: 'Herbal Tea', icon: '🍵' },
            { value: 'coffee', label_he: 'קפה', label_en: 'Coffee', icon: '☕' },
            { value: 'sparkling', label_he: 'מים מוגזים', label_en: 'Sparkling Water', icon: '🫧' },
            { value: 'soft_drinks', label_he: 'שתייה ממותקת', label_en: 'Soft Drinks', icon: '🥤' },
            { value: 'energy_drinks', label_he: 'משקאות אנרגיה', label_en: 'Energy Drinks', icon: '⚡' },
            { value: 'alcohol', label_he: 'אלכוהול', label_en: 'Alcohol', icon: '🍷' },
          ],
          validation: { required: true, minSelected: 1 },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'fluid_sources' },
        },
        {
          id: 'nutrition_weak_point',
          title_he: 'נקודת תורפה תזונתית',
          title_en: 'Biggest nutrition weak point',
          inputType: 'single_select',
          options: [
            { value: 'sugar', label_he: 'סוכר', label_en: 'Sugar', icon: '🍭' },
            { value: 'late_night_eating', label_he: 'אכילה מאוחרת', label_en: 'Late-night eating', icon: '🌙' },
            { value: 'skipping_meals', label_he: 'דילוג ארוחות', label_en: 'Skipping meals', icon: '⏭️' },
            { value: 'ultra_processed', label_he: 'מזון מעובד', label_en: 'Ultra-processed', icon: '🍔' },
            { value: 'inconsistent_timing', label_he: 'תזמון לא עקבי', label_en: 'Inconsistent timing', icon: '🔄' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'nutrition_weak_point' },
        },
      ],
    },

    // ════════════════════════════════════════════
    // PHASE 3 — TIME ARCHITECTURE
    // ════════════════════════════════════════════

    // ─── Step 9: Work Reality ───
    {
      id: 9,
      title_he: 'מציאות עבודה',
      title_en: 'Work Reality',
      renderer: 'card',
      miniSteps: [
        {
          id: 'work_type',
          title_he: 'מה מתאר את המצב התעסוקתי שלך? (ניתן לבחור כמה)',
          title_en: 'What describes your work situation? (select all that apply)',
          inputType: 'multi_select',
          options: [
            { value: 'employed', label_he: 'שכיר', label_en: 'Employed', icon: '🏢' },
            { value: 'self_employed', label_he: 'עצמאי / פרילנסר', label_en: 'Self-employed / Freelancer', icon: '💼' },
            { value: 'business_owner', label_he: 'בעל עסק פעיל', label_en: 'Active Business Owner', icon: '🏪' },
            { value: 'entrepreneur', label_he: 'יזם', label_en: 'Entrepreneur', icon: '💡' },
            { value: 'building_business', label_he: 'בהקמת עסק חדש', label_en: 'Building a New Business', icon: '🚀' },
            { value: 'investor', label_he: 'משקיע', label_en: 'Investor', icon: '📈' },
            { value: 'student', label_he: 'סטודנט / לומד', label_en: 'Student / Learning', icon: '📚' },
            { value: 'between_jobs', label_he: 'בין עבודות / בחיפוש', label_en: 'Between Jobs / Searching', icon: '🔍' },
            { value: 'retired', label_he: 'פנסיונר', label_en: 'Retired', icon: '🌴' },
            { value: 'creative', label_he: 'יוצר / אמן', label_en: 'Creator / Artist', icon: '🎨' },
          ],
          validation: { required: true, minSelected: 1 },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'work_type' },
        },
        {
          id: 'active_work_hours',
          title_he: 'כמה שעות עבודה אקטיבית ביום? (ישיבות, משימות, יצירה)',
          title_en: 'How many hours of active work per day? (meetings, tasks, creating)',
          inputType: 'single_select',
          options: [
            { value: '0_2', label_he: '0-2', label_en: '0-2', icon: '🟢' },
            { value: '2_4', label_he: '2-4', label_en: '2-4', icon: '🟡' },
            { value: '4_6', label_he: '4-6', label_en: '4-6', icon: '🟠' },
            { value: '6_8', label_he: '6-8', label_en: '6-8', icon: '🔶' },
            { value: '8_10', label_he: '8-10', label_en: '8-10', icon: '🔴' },
            { value: '10_plus', label_he: '10+', label_en: '10+', icon: '🔴' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'active_work_hours' },
        },
        {
          id: 'availability_hours',
          title_he: 'כמה שעות אתה צריך להיות זמין/on-call ביום? (גם אם לא עובד אקטיבית)',
          title_en: 'How many hours do you need to be available/on-call daily? (even if not actively working)',
          inputType: 'single_select',
          options: [
            { value: '0', label_he: 'לא רלוונטי', label_en: 'Not relevant', icon: '✅' },
            { value: '2_4', label_he: '2-4', label_en: '2-4', icon: '📱' },
            { value: '4_8', label_he: '4-8', label_en: '4-8', icon: '📱' },
            { value: '8_12', label_he: '8-12', label_en: '8-12', icon: '📱' },
            { value: '12_plus', label_he: '12+ (כמעט כל היום)', label_en: '12+ (almost all day)', icon: '📱' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'availability_hours' },
        },
        {
          id: 'side_projects',
          title_he: 'האם יש לך פרויקטים נוספים שדורשים זמן? (בנייה, קרקע, לימודים, התנדבות וכו\')',
          title_en: 'Do you have side projects that require time? (construction, land, studies, volunteering, etc.)',
          inputType: 'multi_select',
          options: [
            { value: 'none', label_he: 'אין כרגע', label_en: 'None right now', icon: '✅' },
            { value: 'construction', label_he: 'בנייה / שיפוץ', label_en: 'Construction / Renovation', icon: '🏗️' },
            { value: 'land', label_he: 'קרקע / חקלאות', label_en: 'Land / Agriculture', icon: '🌱' },
            { value: 'studies', label_he: 'לימודים / קורסים', label_en: 'Studies / Courses', icon: '📖' },
            { value: 'creative_project', label_he: 'פרויקט יצירתי', label_en: 'Creative Project', icon: '🎨' },
            { value: 'volunteering', label_he: 'התנדבות / קהילה', label_en: 'Volunteering / Community', icon: '🤝' },
            { value: 'family_care', label_he: 'טיפול במשפחה', label_en: 'Family Care', icon: '👨‍👩‍👧' },
            { value: 'investment', label_he: 'ניהול השקעות / נכסים', label_en: 'Managing Investments / Assets', icon: '🏠' },
            { value: 'other', label_he: 'אחר', label_en: 'Other', icon: '📌' },
          ],
          validation: { required: true, minSelected: 1 },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'side_projects' },
        },
        {
          id: 'commute_duration',
          title_he: 'זמן נסיעה (כיוון אחד)',
          title_en: 'Commute (one way)',
          inputType: 'single_select',
          options: [
            { value: '0', label_he: 'עבודה מהבית', label_en: '0 — WFH', icon: '🏠' },
            { value: 'under_30m', label_he: 'עד 30 דקות', label_en: '<30 min', icon: '🚗' },
            { value: '30_60m', label_he: '30-60 דקות', label_en: '30-60 min', icon: '🚌' },
            { value: 'over_60m', label_he: '60+ דקות', label_en: '60+ min', icon: '🚂' },
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
            { value: 'early', label_he: 'מוקדם (5-8)', label_en: 'Early (5-8)', icon: '🌅' },
            { value: 'morning', label_he: 'בוקר (8-12)', label_en: 'Morning (8-12)', icon: '☀️' },
            { value: 'midday', label_he: 'צהריים (12-14)', label_en: 'Midday (12-14)', icon: '🌤️' },
            { value: 'afternoon', label_he: 'אחה"צ (14-18)', label_en: 'Afternoon (14-18)', icon: '🌆' },
            { value: 'evening', label_he: 'ערב (18-22)', label_en: 'Evening (18-22)', icon: '🌙' },
            { value: 'late_night', label_he: 'לילה (22+)', label_en: 'Late night (22+)', icon: '🦉' },
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
            { value: 'morning', label_he: 'בוקר', label_en: 'Morning', icon: '😶' },
            { value: 'after_lunch', label_he: 'אחרי צהריים', label_en: 'After lunch', icon: '😴' },
            { value: 'late_afternoon', label_he: 'אחה"צ מאוחר', label_en: 'Late afternoon', icon: '📉' },
            { value: 'evening', label_he: 'ערב', label_en: 'Evening', icon: '🌅' },
            { value: 'no_crash', label_he: 'אין קריסה בולטת', label_en: 'No significant crash', icon: '⚡' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'energy_crash_time' },
        },
      ],
    },

    // ─── Step 10: Life Load ───
    {
      id: 10,
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
            { value: 'kids', label_he: 'ילדים', label_en: 'Kids', icon: '👶' },
            { value: 'elder_care', label_he: 'טיפול בהורים', label_en: 'Elder care', icon: '🧓' },
            { value: 'shared_custody', label_he: 'משמורת משותפת', label_en: 'Shared custody', icon: '👨‍👧' },
            { value: 'other', label_he: 'אחר', label_en: 'Other', icon: '👥' },
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
          title_en: 'Social frequency',
          inputType: 'single_select',
          options: [
            { value: 'rare', label_he: 'נדיר', label_en: 'Rare', icon: '🤫' },
            { value: '1x_week', label_he: 'פעם בשבוע', label_en: '1x/week', icon: '🙂' },
            { value: '2_3x_week', label_he: '2-3 בשבוע', label_en: '2-3x/week', icon: '😊' },
            { value: '4x_plus', label_he: '4+ בשבוע', label_en: '4x+/week', icon: '🎉' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'social_life_frequency' },
        },
        {
          id: 'training_window_available',
          title_he: 'חלון אימון זמין',
          title_en: 'Available training window',
          inputType: 'single_select',
          options: [
            { value: 'morning', label_he: 'בוקר', label_en: 'Morning', icon: '🌅' },
            { value: 'midday', label_he: 'צהריים', label_en: 'Midday', icon: '☀️' },
            { value: 'evening', label_he: 'ערב', label_en: 'Evening', icon: '🌆' },
            { value: 'none', label_he: 'אין חלון עקבי', label_en: 'No consistent window', icon: '❌' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'training_window_available' },
        },
      ],
    },

    // ════════════════════════════════════════════
    // PHASE 4 — PSYCHOLOGICAL OPERATING SYSTEM
    // ════════════════════════════════════════════

    // ─── Step 11: Execution Pattern ───
    {
      id: 11,
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
            { value: 'start_and_quit', label_he: 'מתחיל חזק ואז עוזב', label_en: 'Start strong then quit', icon: '🚪' },
            { value: 'overplan_delay', label_he: 'מתכנן יתר ודוחה', label_en: 'Overplan and delay', icon: '📋' },
            { value: 'avoid_hard', label_he: 'נמנע ממשימות קשות', label_en: 'Avoid hard tasks', icon: '🐢' },
            { value: 'burnout_fast', label_he: 'נשרף מהר', label_en: 'Burn out fast', icon: '🔥' },
            { value: 'intense_inconsistent', label_he: 'אינטנסיבי אבל לא עקבי', label_en: 'Intense but inconsistent', icon: '⚡' },
            { value: 'consistent_plateaued', label_he: 'עקבי אבל ברמה קבועה', label_en: 'Consistent but plateaued', icon: '📊' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'execution_pattern' },
        },
      ],
    },

    // ─── Step 12: Friction Trigger ───
    {
      id: 12,
      title_he: 'טריגר חיכוך',
      title_en: 'Friction Trigger',
      renderer: 'card',
      miniSteps: [
        {
          id: 'friction_trigger',
          title_he: 'מה בדרך כלל שובר אותך?',
          title_en: 'What usually breaks you?',
          inputType: 'single_select',
          options: [
            { value: 'too_tired', label_he: 'עייף מדי', label_en: 'Too tired', icon: '😴' },
            { value: 'too_distracted', label_he: 'מוסח מדי', label_en: 'Too distracted', icon: '📱' },
            { value: 'too_overwhelmed', label_he: 'מוצף מדי', label_en: 'Too overwhelmed', icon: '🌊' },
            { value: 'too_perfectionist', label_he: 'פרפקציוניסט מדי', label_en: 'Too perfectionist', icon: '🔒' },
            { value: 'too_reactive', label_he: 'תגובתי רגשית מדי', label_en: 'Too emotionally reactive', icon: '💥' },
            { value: 'no_clear_step', label_he: 'אין צעד ברור הבא', label_en: 'No clear next step', icon: '🧭' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'friction_trigger' },
        },
      ],
    },

    // ─── Step 13: Motivation Driver ───
    {
      id: 13,
      title_he: 'מניע מוטיבציה',
      title_en: 'Motivation Driver',
      renderer: 'card',
      miniSteps: [
        {
          id: 'motivation_driver',
          title_he: 'מה הכוח המניע העיקרי שלך? (בחר אחד)',
          title_en: 'What is your primary motivation driver? (pick one)',
          inputType: 'single_select',
          options: [
            { value: 'freedom', label_he: 'חופש — זמן ומיקום', label_en: 'Freedom — time/location', icon: '🕊️' },
            { value: 'status', label_he: 'סטטוס — כבוד והכרה', label_en: 'Status — respect/recognition', icon: '👑' },
            { value: 'stability', label_he: 'יציבות — ביטחון ושליטה', label_en: 'Stability — safety/control', icon: '🏠' },
            { value: 'identity_upgrade', label_he: 'שדרוג זהות — להפוך לאדם הזה', label_en: 'Identity upgrade — becoming that person', icon: '🦅' },
            { value: 'approval', label_he: 'אישור — להוכיח את עצמי', label_en: 'Approval — prove myself', icon: '👏' },
            { value: 'purpose', label_he: 'מטרה — משמעות ומשימה', label_en: 'Purpose — meaning/mission', icon: '🎯' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'motivation_driver' },
        },
      ],
    },

    // ════════════════════════════════════════════
    // PHASE 5 — TARGET + COMMITMENT
    // ════════════════════════════════════════════

    // ─── Step 14: 90-Day Vector ───
    {
      id: 14,
      title_he: 'וקטור 90 יום',
      title_en: '90-Day Vector',
      renderer: 'card',
      miniSteps: [
        {
          id: 'target_90_days',
          title_he: 'סדר את היעדים שלך ל-90 הימים הקרובים לפי חשיבות',
          title_en: 'Rank your 90-day targets by priority',
          prompt_he: 'גרור כדי לסדר — הראשון הוא הכי חשוב',
          prompt_en: 'Drag to reorder — first is most important',
          inputType: 'priority_rank',
          options: [
            { value: 'fix_sleep_energy', label_he: 'תיקון שינה ואנרגיה', label_en: 'Fix sleep & energy', icon: '🔋' },
            { value: 'build_training', label_he: 'בניית גוף ואימון עקבי', label_en: 'Build consistent training', icon: '💪' },
            { value: 'build_income', label_he: 'בניית הכנסה / עסק', label_en: 'Build income / business', icon: '💰' },
            { value: 'career_change', label_he: 'שדרוג קריירה / מיומנויות', label_en: 'Upgrade career / skills', icon: '🚀' },
            { value: 'emotional_regulation', label_he: 'ויסות רגשי / הפחתת חרדה', label_en: 'Emotional regulation', icon: '🧘' },
            { value: 'relationships', label_he: 'מערכות יחסים ותקשורת', label_en: 'Relationships & communication', icon: '💜' },
            { value: 'spiritual_growth', label_he: 'צמיחה רוחנית / תודעתית', label_en: 'Spiritual / consciousness growth', icon: '✨' },
            { value: 'financial_freedom', label_he: 'חופש כלכלי / השקעות', label_en: 'Financial freedom / investing', icon: '📈' },
            { value: 'creativity', label_he: 'יצירתיות ופרויקטים אישיים', label_en: 'Creativity & personal projects', icon: '🎨' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'target_90_days' },
        },
        {
          id: 'urgency_scale',
          title_he: 'רמת דחיפות (1 = לא דחוף, 10 = קריטי)',
          title_en: 'Urgency (1 = not urgent, 10 = critical)',
          inputType: 'slider',
          sliderMin: 1,
          sliderMax: 10,
          sliderStep: 1,
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'urgency_scale' },
        },
        {
          id: 'restructure_willingness',
          title_he: 'נכונות לשנות מבנה חיים (1 = שמרני, 10 = שינוי מוחלט)',
          title_en: 'Willingness to restructure (1 = conservative, 10 = total overhaul)',
          inputType: 'slider',
          sliderMin: 1,
          sliderMax: 10,
          sliderStep: 1,
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'restructure_willingness' },
        },
        {
          id: 'non_negotiable_constraint',
          title_he: 'המגבלה הגדולה ביותר שאי אפשר לשנות',
          title_en: 'Biggest non-negotiable constraint',
          inputType: 'single_select',
          options: [
            { value: 'time', label_he: 'זמן', label_en: 'Time', icon: '⏰' },
            { value: 'money', label_he: 'כסף', label_en: 'Money', icon: '💸' },
            { value: 'family', label_he: 'משפחה', label_en: 'Family', icon: '👨‍👩‍👧' },
            { value: 'mental_state', label_he: 'מצב נפשי', label_en: 'Mental state', icon: '🧠' },
            { value: 'health', label_he: 'בריאות', label_en: 'Health', icon: '🏥' },
            { value: 'environment', label_he: 'סביבה', label_en: 'Environment', icon: '🏠' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_1_intention', jsonPath: 'non_negotiable_constraint' },
        },
      ],
    },

    // ─── Step 15: System Preferences ───
    {
      id: 15,
      title_he: 'העדפות מערכת',
      title_en: 'System Preferences',
      renderer: 'card',
      miniSteps: [
        {
          id: 'hypnosis_style',
          title_he: 'סגנון היפנוזה מועדף',
          title_en: 'Preferred hypnosis style',
          inputType: 'single_select',
          options: [
            { value: 'calm', label_he: 'רגוע', label_en: 'Calm', icon: '🌊' },
            { value: 'intense', label_he: 'אינטנסיבי', label_en: 'Intense', icon: '🔥' },
            { value: 'direct', label_he: 'ישיר', label_en: 'Direct', icon: '🎯' },
            { value: 'spiritual', label_he: 'רוחני', label_en: 'Spiritual', icon: '✨' },
            { value: 'scientific', label_he: 'מדעי', label_en: 'Scientific', icon: '🔬' },
            { value: 'coach_like', label_he: 'מאמני', label_en: 'Coach-like', icon: '🏋️' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'hypnosis_style' },
        },
        {
          id: 'preferred_session_length',
          title_he: 'אורך סשן מועדף',
          title_en: 'Preferred session length',
          inputType: 'single_select',
          options: [
            { value: '8', label_he: '8 דקות', label_en: '8 minutes', icon: '⚡' },
            { value: '12', label_he: '12 דקות', label_en: '12 minutes', icon: '🕐' },
            { value: '20', label_he: '20 דקות', label_en: '20 minutes', icon: '🕓' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'preferred_session_length' },
        },
        {
          id: 'preferred_reminders',
          title_he: 'רמת תזכורות',
          title_en: 'Preferred reminders',
          inputType: 'single_select',
          options: [
            { value: 'minimal', label_he: 'מינימלי', label_en: 'Minimal', icon: '🔕' },
            { value: 'normal', label_he: 'רגיל', label_en: 'Normal', icon: '🔔' },
            { value: 'strict', label_he: 'קפדני', label_en: 'Strict', icon: '📢' },
          ],
          validation: { required: true },
          dbPath: { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'preferred_reminders' },
        },
      ],
    },

    // ─── Step 16: Final Notes ───
    {
      id: 16,
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
