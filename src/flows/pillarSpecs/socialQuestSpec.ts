/**
 * Social Pillar Quest Spec
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.social.answers' };

export const socialQuestSpec: FlowSpec = {
  id: 'quest-social',
  title_he: 'חברתי וקהילה',
  title_en: 'Social & Community',
  steps: [{
    id: 1,
    title_he: 'חברתי',
    title_en: 'Social',
    renderer: 'card',
    miniSteps: [
      {
        id: 'social_preference',
        title_he: 'מה מתאים לך יותר?',
        title_en: 'What suits you more?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'introvert', label_he: 'מועדף לבד', label_en: 'Prefer being alone', icon: '🧘' },
          { value: 'ambivert', label_he: 'תלוי במצב רוח', label_en: 'Depends on mood', icon: '🔄' },
          { value: 'extrovert', label_he: 'אוהב חברה', label_en: 'Love company', icon: '🎉' },
        ],
      },
      {
        id: 'community_involvement',
        title_he: 'כמה אתה מעורב בקהילה?',
        title_en: 'How involved are you in community?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'very', label_he: 'מאוד פעיל', label_en: 'Very active', icon: '🌟' },
          { value: 'somewhat', label_he: 'במידה מסוימת', label_en: 'Somewhat', icon: '🙂' },
          { value: 'rarely', label_he: 'לעיתים רחוקות', label_en: 'Rarely', icon: '😐' },
          { value: 'not-at-all', label_he: 'כלל לא', label_en: 'Not at all', icon: '😶' },
        ],
      },
      {
        id: 'networking_comfort',
        title_he: 'כמה נוח לך ליצור קשרים חדשים?',
        title_en: 'How comfortable are you networking?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'natural', label_he: 'טבעי לי', label_en: 'Comes naturally', icon: '🤝' },
          { value: 'okay', label_he: 'בסדר', label_en: 'Okay', icon: '🙂' },
          { value: 'uncomfortable', label_he: 'לא נוח', label_en: 'Uncomfortable', icon: '😬' },
          { value: 'anxious', label_he: 'חרדתי', label_en: 'Anxious', icon: '😰' },
        ],
      },
      {
        id: 'social_energy',
        title_he: 'מאיפה אתה שואב אנרגיה?',
        title_en: 'Where do you draw energy from?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'alone', label_he: 'זמן לבד', label_en: 'Time alone', icon: '🧘' },
          { value: 'small-groups', label_he: 'קבוצות קטנות', label_en: 'Small groups', icon: '👥' },
          { value: 'big-groups', label_he: 'קבוצות גדולות', label_en: 'Large groups', icon: '🎊' },
          { value: 'both', label_he: 'משניהם', label_en: 'Both', icon: '🔄' },
        ],
      },
      {
        id: 'social_goal',
        title_he: 'מה תרצה לשפר חברתית?',
        title_en: 'What social area to improve?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1, maxSelected: 3 },
        dbPath: DB,
        options: [
          { value: 'make-friends', label_he: 'למצוא חברים', label_en: 'Make friends', icon: '👋' },
          { value: 'confidence', label_he: 'ביטחון חברתי', label_en: 'Social confidence', icon: '💪' },
          { value: 'community', label_he: 'שייכות לקהילה', label_en: 'Community belonging', icon: '🏘️' },
          { value: 'leadership', label_he: 'מנהיגות', label_en: 'Leadership', icon: '👑' },
          { value: 'giving-back', label_he: 'לתת בחזרה', label_en: 'Giving back', icon: '🤲' },
        ],
      },
    ],
  }],
};

registerFlow(socialQuestSpec);
