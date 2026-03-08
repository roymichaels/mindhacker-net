/**
 * Presence Pillar Quest Spec
 * Collects grooming, style, posture, and self-image habits to generate presence practices.
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.presence.answers' };

export const presenceQuestSpec: FlowSpec = {
  id: 'quest-presence',
  title_he: 'נוכחות ודימוי',
  title_en: 'Presence & Image',
  steps: [{
    id: 1,
    title_he: 'נוכחות',
    title_en: 'Presence',
    renderer: 'card',
    miniSteps: [
      {
        id: 'grooming_routine',
        title_he: 'מה רמת שגרת הטיפוח שלך?',
        title_en: 'What is your grooming routine level?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'full', label_he: 'שגרה מלאה יומית', label_en: 'Full daily routine', icon: '✨' },
          { value: 'basic', label_he: 'בסיסית', label_en: 'Basic', icon: '🙂' },
          { value: 'minimal', label_he: 'מינימלית', label_en: 'Minimal', icon: '😐' },
          { value: 'none', label_he: 'כמעט כלום', label_en: 'Almost nothing', icon: '😅' },
        ],
      },
      {
        id: 'posture_awareness',
        title_he: 'כמה מודע אתה ליציבה שלך?',
        title_en: 'How aware are you of your posture?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'very', label_he: 'מאוד — מתקן באופן קבוע', label_en: 'Very — correct regularly', icon: '🧍' },
          { value: 'somewhat', label_he: 'לפעמים שם לב', label_en: 'Sometimes notice', icon: '🤔' },
          { value: 'rarely', label_he: 'לעיתים רחוקות', label_en: 'Rarely', icon: '😕' },
          { value: 'never', label_he: 'לא חושב על זה', label_en: 'Don\'t think about it', icon: '🤷' },
        ],
      },
      {
        id: 'presence_practices',
        title_he: 'אילו תרגולי נוכחות מעניינים אותך?',
        title_en: 'Which presence practices interest you?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1 },
        dbPath: DB,
        options: [
          { value: 'mirror_work', label_he: 'עבודה מול מראה', label_en: 'Mirror work', icon: '🪞' },
          { value: 'power_posing', label_he: 'תנוחות כוח', label_en: 'Power posing', icon: '💪' },
          { value: 'voice_training', label_he: 'אימון קול', label_en: 'Voice training', icon: '🎤' },
          { value: 'eye_contact', label_he: 'תרגול קשר עין', label_en: 'Eye contact practice', icon: '👁️' },
          { value: 'style_upgrade', label_he: 'שדרוג סגנון', label_en: 'Style upgrade', icon: '👔' },
          { value: 'skincare', label_he: 'טיפוח עור', label_en: 'Skincare routine', icon: '🧴' },
          { value: 'body_language', label_he: 'שפת גוף', label_en: 'Body language', icon: '🕺' },
        ],
      },
      {
        id: 'style_confidence',
        title_he: 'כמה בטוח אתה בסגנון שלך?',
        title_en: 'How confident are you in your personal style?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'very', label_he: 'מאוד — יודע מה מתאים לי', label_en: 'Very — know my style', icon: '😎' },
          { value: 'okay', label_he: 'בסדר', label_en: 'Okay', icon: '🙂' },
          { value: 'unsure', label_he: 'לא בטוח', label_en: 'Unsure', icon: '🤔' },
          { value: 'want_help', label_he: 'רוצה עזרה', label_en: 'Want help', icon: '🙋' },
        ],
      },
      {
        id: 'presence_goal',
        title_he: 'מה הכי חשוב לך לשפר בנוכחות?',
        title_en: 'What do you most want to improve in your presence?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1, maxSelected: 3 },
        dbPath: DB,
        options: [
          { value: 'confidence', label_he: 'ביטחון בהופעה', label_en: 'Appearance confidence', icon: '💪' },
          { value: 'first_impression', label_he: 'רושם ראשוני', label_en: 'First impressions', icon: '🤝' },
          { value: 'posture', label_he: 'יציבה', label_en: 'Posture', icon: '🧍' },
          { value: 'charisma', label_he: 'כריזמה', label_en: 'Charisma', icon: '✨' },
          { value: 'grooming', label_he: 'טיפוח', label_en: 'Grooming', icon: '💈' },
        ],
      },
    ],
  }],
};

registerFlow(presenceQuestSpec);
