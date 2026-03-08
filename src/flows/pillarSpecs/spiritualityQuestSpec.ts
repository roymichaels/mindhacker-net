/**
 * Spirituality Pillar Quest Spec
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.spirituality.answers' };

export const spiritualityQuestSpec: FlowSpec = {
  id: 'quest-spirituality',
  title_he: 'רוחניות ומשמעות',
  title_en: 'Spirituality & Meaning',
  steps: [{
    id: 1,
    title_he: 'רוחניות',
    title_en: 'Spirituality',
    renderer: 'card',
    miniSteps: [
      {
        id: 'spiritual_practice',
        title_he: 'האם יש לך תרגול רוחני?',
        title_en: 'Do you have a spiritual practice?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'daily', label_he: 'תרגול יומי', label_en: 'Daily practice', icon: '🙏' },
          { value: 'regular', label_he: 'קבוע אך לא יומי', label_en: 'Regular but not daily', icon: '✨' },
          { value: 'occasional', label_he: 'מדי פעם', label_en: 'Occasionally', icon: '🌙' },
          { value: 'exploring', label_he: 'חוקר/ת', label_en: 'Exploring', icon: '🔍' },
          { value: 'none', label_he: 'לא', label_en: 'No', icon: '❌' },
        ],
      },
      {
        id: 'meaning_source',
        title_he: 'מאיפה אתה שואב משמעות?',
        title_en: 'Where do you find meaning?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1 },
        dbPath: DB,
        options: [
          { value: 'family', label_he: 'משפחה', label_en: 'Family', icon: '👨‍👩‍👧' },
          { value: 'work', label_he: 'עבודה משמעותית', label_en: 'Meaningful work', icon: '💼' },
          { value: 'nature', label_he: 'טבע', label_en: 'Nature', icon: '🌿' },
          { value: 'creativity', label_he: 'יצירה', label_en: 'Creation', icon: '🎨' },
          { value: 'service', label_he: 'עזרה לאחרים', label_en: 'Helping others', icon: '🤲' },
          { value: 'growth', label_he: 'צמיחה אישית', label_en: 'Personal growth', icon: '🌱' },
          { value: 'faith', label_he: 'אמונה', label_en: 'Faith', icon: '🕊️' },
        ],
      },
      {
        id: 'gratitude_practice',
        title_he: 'האם אתה מתרגל הכרת תודה?',
        title_en: 'Do you practice gratitude?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'daily', label_he: 'כל יום', label_en: 'Daily', icon: '🙏' },
          { value: 'sometimes', label_he: 'לפעמים', label_en: 'Sometimes', icon: '🙂' },
          { value: 'rarely', label_he: 'לעיתים רחוקות', label_en: 'Rarely', icon: '🤔' },
          { value: 'want-to-start', label_he: 'רוצה להתחיל', label_en: 'Want to start', icon: '🌟' },
        ],
      },
      {
        id: 'values_alignment',
        title_he: 'כמה החיים שלך מתואמים עם הערכים שלך?',
        title_en: 'How aligned is your life with your values?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'fully', label_he: 'מלאה', label_en: 'Fully aligned', icon: '✅' },
          { value: 'mostly', label_he: 'ברובה', label_en: 'Mostly', icon: '🙂' },
          { value: 'partially', label_he: 'חלקית', label_en: 'Partially', icon: '😐' },
          { value: 'not-at-all', label_he: 'כלל לא', label_en: 'Not at all', icon: '😞' },
        ],
      },
      {
        id: 'inner_peace',
        title_he: 'מה יעזור לך להרגיש יותר שלם?',
        title_en: 'What would help you feel more whole?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1, maxSelected: 3 },
        dbPath: DB,
        options: [
          { value: 'meditation', label_he: 'מדיטציה', label_en: 'Meditation', icon: '🧘' },
          { value: 'connection', label_he: 'חיבור לטבע', label_en: 'Nature connection', icon: '🌿' },
          { value: 'community', label_he: 'קהילה רוחנית', label_en: 'Spiritual community', icon: '🕊️' },
          { value: 'journaling', label_he: 'כתיבה', label_en: 'Journaling', icon: '📝' },
          { value: 'forgiveness', label_he: 'סליחה', label_en: 'Forgiveness', icon: '💜' },
          { value: 'purpose', label_he: 'מציאת ייעוד', label_en: 'Finding purpose', icon: '🎯' },
        ],
      },
      {
        id: 'spiritual_practices_specific',
        title_he: 'אילו תרגולים רוחניים ספציפיים מעניינים אותך?',
        title_en: 'Which specific spiritual practices interest you?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1 },
        dbPath: DB,
        options: [
          { value: 'seated_meditation', label_he: 'מדיטציה ישיבה', label_en: 'Seated meditation', icon: '🧘' },
          { value: 'walking_meditation', label_he: 'מדיטציה בהליכה', label_en: 'Walking meditation', icon: '🚶' },
          { value: 'tai_chi', label_he: 'טאי צ\'י', label_en: 'Tai Chi', icon: '☯️' },
          { value: 'qigong', label_he: 'צ\'י גונג', label_en: 'Qigong', icon: '🌊' },
          { value: 'pranayama', label_he: 'פראנאיאמה (נשימה)', label_en: 'Pranayama (breathwork)', icon: '🌬️' },
          { value: 'chanting', label_he: 'מנטרות / שירה', label_en: 'Chanting / Mantras', icon: '🕉️' },
          { value: 'prayer', label_he: 'תפילה', label_en: 'Prayer', icon: '🙏' },
          { value: 'contemplation', label_he: 'התבוננות / רפלקציה', label_en: 'Contemplation / Reflection', icon: '💭' },
          { value: 'body_scan', label_he: 'סריקת גוף', label_en: 'Body scan', icon: '🫧' },
          { value: 'grounding', label_he: 'הארקה / גראונדינג', label_en: 'Grounding / Earthing', icon: '🌍' },
        ],
      },
      {
        id: 'practice_duration_preference',
        title_he: 'כמה זמן תרצה להקדיש לתרגול רוחני ביום?',
        title_en: 'How much time would you like for daily spiritual practice?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: '5min', label_he: '5 דקות', label_en: '5 minutes', icon: '⏱️' },
          { value: '10_15min', label_he: '10-15 דקות', label_en: '10-15 minutes', icon: '🙂' },
          { value: '20_30min', label_he: '20-30 דקות', label_en: '20-30 minutes', icon: '💪' },
          { value: '30_plus', label_he: '30+ דקות', label_en: '30+ minutes', icon: '🔥' },
        ],
      },
    ],
  }],
};

registerFlow(spiritualityQuestSpec);
