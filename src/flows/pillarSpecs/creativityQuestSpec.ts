/**
 * Creativity / Hobbies Pillar Quest Spec
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.creativity.answers' };

export const creativityQuestSpec: FlowSpec = {
  id: 'quest-creativity',
  title_he: 'יצירתיות ותחביבים',
  title_en: 'Creativity & Hobbies',
  steps: [{
    id: 1,
    title_he: 'יצירתיות',
    title_en: 'Creativity',
    renderer: 'card',
    miniSteps: [
      {
        id: 'hobbies',
        title_he: 'מה התחביבים שלך?',
        title_en: 'What are your hobbies?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1 },
        dbPath: DB,
        options: [
          { value: 'reading', label_he: 'קריאה', label_en: 'Reading', icon: '📚' },
          { value: 'music', label_he: 'מוזיקה', label_en: 'Music', icon: '🎵' },
          { value: 'art', label_he: 'אמנות/ציור', label_en: 'Art/Drawing', icon: '🎨' },
          { value: 'cooking', label_he: 'בישול', label_en: 'Cooking', icon: '👨‍🍳' },
          { value: 'gaming', label_he: 'משחקים', label_en: 'Gaming', icon: '🎮' },
          { value: 'photography', label_he: 'צילום', label_en: 'Photography', icon: '📷' },
          { value: 'writing', label_he: 'כתיבה', label_en: 'Writing', icon: '✍️' },
          { value: 'gardening', label_he: 'גינון', label_en: 'Gardening', icon: '🌱' },
          { value: 'diy', label_he: 'עשה זאת בעצמך', label_en: 'DIY/Crafts', icon: '🔨' },
          { value: 'travel', label_he: 'טיולים', label_en: 'Travel', icon: '✈️' },
        ],
      },
      {
        id: 'creative_time',
        title_he: 'כמה זמן בשבוע אתה מקדיש לתחביבים?',
        title_en: 'How much time weekly for hobbies?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'none', label_he: 'כמעט כלום', label_en: 'Almost none', icon: '😔' },
          { value: '1-2h', label_he: '1-2 שעות', label_en: '1-2 hours', icon: '⏰' },
          { value: '3-5h', label_he: '3-5 שעות', label_en: '3-5 hours', icon: '🙂' },
          { value: '5+h', label_he: '5+ שעות', label_en: '5+ hours', icon: '🎉' },
        ],
      },
      {
        id: 'creative_desire',
        title_he: 'מה היית רוצה לנסות?',
        title_en: 'What would you like to try?',
        inputType: 'multi_select',
        validation: { required: false },
        dbPath: DB,
        options: [
          { value: 'instrument', label_he: 'כלי נגינה', label_en: 'Musical instrument', icon: '🎸' },
          { value: 'language', label_he: 'שפה חדשה', label_en: 'New language', icon: '🗣️' },
          { value: 'dance', label_he: 'ריקוד', label_en: 'Dance', icon: '💃' },
          { value: 'pottery', label_he: 'קרמיקה', label_en: 'Pottery', icon: '🏺' },
          { value: 'coding', label_he: 'תכנות', label_en: 'Coding', icon: '💻' },
          { value: 'content', label_he: 'יצירת תוכן', label_en: 'Content creation', icon: '📹' },
        ],
      },
      {
        id: 'creative_blocker',
        title_he: 'מה מונע ממך יצירתיות?',
        title_en: 'What blocks your creativity?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'time', label_he: 'חוסר זמן', label_en: 'Lack of time', icon: '⏰' },
          { value: 'energy', label_he: 'חוסר אנרגיה', label_en: 'Lack of energy', icon: '🔋' },
          { value: 'fear', label_he: 'פחד מכישלון', label_en: 'Fear of failure', icon: '😨' },
          { value: 'nothing', label_he: 'שום דבר!', label_en: 'Nothing!', icon: '✨' },
        ],
      },
    ],
  }],
};

registerFlow(creativityQuestSpec);
