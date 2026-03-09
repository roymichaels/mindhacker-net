/**
 * Romantics Pillar Quest Spec
 * Covers: dating, seduction, polarity, intimacy, romantic mastery
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.romantics.answers' };

export const romanticsQuestSpec: FlowSpec = {
  id: 'quest-romantics',
  title_he: 'רומנטיקה',
  title_en: 'Romantics',
  steps: [{
    id: 1,
    title_he: 'רומנטיקה',
    title_en: 'Romantics',
    renderer: 'card',
    miniSteps: [
      {
        id: 'relationship_status',
        title_he: 'מה הסטטוס הרומנטי שלך כרגע?',
        title_en: 'What is your current romantic status?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'single', label_he: 'רווק/ה', label_en: 'Single', icon: '🦁' },
          { value: 'dating', label_he: 'דייטינג פעיל', label_en: 'Actively dating', icon: '💫' },
          { value: 'relationship', label_he: 'בזוגיות', label_en: 'In a relationship', icon: '💕' },
          { value: 'complicated', label_he: 'מסובך', label_en: 'It\'s complicated', icon: '🌀' },
        ],
      },
      {
        id: 'confidence_level',
        title_he: 'איך הביטחון העצמי שלך סביב רומנטיקה?',
        title_en: 'How is your confidence around romance?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'high', label_he: 'גבוה — אני מוביל/ה', label_en: 'High — I lead', icon: '👑' },
          { value: 'medium', label_he: 'בינוני — תלוי במצב', label_en: 'Medium — depends', icon: '🤔' },
          { value: 'low', label_he: 'נמוך — עובד/ת על זה', label_en: 'Low — working on it', icon: '🌱' },
          { value: 'avoidant', label_he: 'נמנע/ת', label_en: 'Avoidant', icon: '🛡️' },
        ],
      },
      {
        id: 'polarity_awareness',
        title_he: 'כמה אתה מודע/ת לדינמיקת קוטביות (masculine/feminine)?',
        title_en: 'How aware are you of polarity dynamics (masculine/feminine)?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'mastered', label_he: 'שולט/ת בזה', label_en: 'Mastered it', icon: '⚡' },
          { value: 'aware', label_he: 'מודע/ת', label_en: 'Aware', icon: '🧭' },
          { value: 'learning', label_he: 'בתהליך למידה', label_en: 'Learning', icon: '📖' },
          { value: 'unaware', label_he: 'לא מכיר/ה', label_en: 'Not familiar', icon: '❓' },
        ],
      },
      {
        id: 'intimacy_depth',
        title_he: 'כמה עומק יש לך ביחסים אינטימיים?',
        title_en: 'How deep are your intimate connections?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'deep', label_he: 'עמוק ומשמעותי', label_en: 'Deep & meaningful', icon: '🔥' },
          { value: 'surface', label_he: 'שטחי', label_en: 'Surface level', icon: '🏖️' },
          { value: 'fear', label_he: 'פוחד/ת מקרבה', label_en: 'Fear of closeness', icon: '🧊' },
          { value: 'none', label_he: 'אין כרגע', label_en: 'None currently', icon: '🌑' },
        ],
      },
      {
        id: 'romantic_goals',
        title_he: 'מה הכי חשוב לך לפתח ברומנטיקה?',
        title_en: 'What do you most want to develop in romance?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1, maxSelected: 3 },
        dbPath: DB,
        options: [
          { value: 'attraction', label_he: 'כוח משיכה ונוכחות', label_en: 'Attraction & presence', icon: '🧲' },
          { value: 'dating-skills', label_he: 'מיומנויות דייטינג', label_en: 'Dating skills', icon: '🎯' },
          { value: 'sexual-polarity', label_he: 'קוטביות מינית', label_en: 'Sexual polarity', icon: '⚡' },
          { value: 'emotional-depth', label_he: 'עומק רגשי', label_en: 'Emotional depth', icon: '💎' },
          { value: 'commitment', label_he: 'יכולת מחויבות', label_en: 'Commitment ability', icon: '💍' },
          { value: 'communication', label_he: 'תקשורת אינטימית', label_en: 'Intimate communication', icon: '💬' },
        ],
      },
    ],
  }],
};

registerFlow(romanticsQuestSpec);
