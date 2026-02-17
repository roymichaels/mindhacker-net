/**
 * Relationships Pillar Quest Spec
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.relationships.answers' };

export const relationshipsQuestSpec: FlowSpec = {
  id: 'quest-relationships',
  title_he: 'מערכות יחסים',
  title_en: 'Relationships',
  steps: [{
    id: 1,
    title_he: 'מערכות יחסים',
    title_en: 'Relationships',
    renderer: 'card',
    miniSteps: [
      {
        id: 'communication_style',
        title_he: 'מה סגנון התקשורת שלך?',
        title_en: 'What is your communication style?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'direct', label_he: 'ישיר ופתוח', label_en: 'Direct & open', icon: '💬' },
          { value: 'passive', label_he: 'פסיבי', label_en: 'Passive', icon: '🤐' },
          { value: 'assertive', label_he: 'אסרטיבי', label_en: 'Assertive', icon: '✊' },
          { value: 'avoidant', label_he: 'נמנע מעימות', label_en: 'Conflict-avoidant', icon: '🙈' },
        ],
      },
      {
        id: 'social_circle',
        title_he: 'כמה חברים קרובים יש לך?',
        title_en: 'How many close friends do you have?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: '0', label_he: 'אין', label_en: 'None', icon: '😔' },
          { value: '1-2', label_he: '1-2', label_en: '1-2', icon: '👤' },
          { value: '3-5', label_he: '3-5', label_en: '3-5', icon: '👥' },
          { value: '5+', label_he: '5+', label_en: '5+', icon: '🎉' },
        ],
      },
      {
        id: 'boundaries',
        title_he: 'כמה קל לך להציב גבולות?',
        title_en: 'How easy is it for you to set boundaries?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'easy', label_he: 'קל לי', label_en: 'Easy for me', icon: '🚧' },
          { value: 'sometimes', label_he: 'תלוי במצב', label_en: 'Depends on situation', icon: '🤔' },
          { value: 'hard', label_he: 'קשה לי', label_en: 'Hard for me', icon: '😟' },
          { value: 'never', label_he: 'כמעט אף פעם', label_en: 'Almost never', icon: '😰' },
        ],
      },
      {
        id: 'relationship_satisfaction',
        title_he: 'כמה אתה מרוצה ממערכות היחסים שלך?',
        title_en: 'How satisfied are you with your relationships?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'very', label_he: 'מאוד', label_en: 'Very', icon: '❤️' },
          { value: 'mostly', label_he: 'ברובו', label_en: 'Mostly', icon: '🙂' },
          { value: 'mixed', label_he: 'מעורב', label_en: 'Mixed', icon: '😐' },
          { value: 'unsatisfied', label_he: 'לא מרוצה', label_en: 'Unsatisfied', icon: '😞' },
        ],
      },
      {
        id: 'relationship_growth',
        title_he: 'מה הכי חשוב לך לשפר?',
        title_en: 'What do you most want to improve?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1, maxSelected: 3 },
        dbPath: DB,
        options: [
          { value: 'deeper-connection', label_he: 'חיבור עמוק יותר', label_en: 'Deeper connection', icon: '💕' },
          { value: 'communication', label_he: 'תקשורת', label_en: 'Communication', icon: '💬' },
          { value: 'trust', label_he: 'אמון', label_en: 'Trust', icon: '🤝' },
          { value: 'independence', label_he: 'עצמאות', label_en: 'Independence', icon: '🦅' },
          { value: 'conflict-resolution', label_he: 'פתרון קונפליקטים', label_en: 'Conflict resolution', icon: '☮️' },
          { value: 'new-people', label_he: 'להכיר אנשים חדשים', label_en: 'Meeting new people', icon: '👋' },
        ],
      },
    ],
  }],
};

registerFlow(relationshipsQuestSpec);
