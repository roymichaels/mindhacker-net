/**
 * Career Pillar Quest Spec
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.career.answers' };

export const careerQuestSpec: FlowSpec = {
  id: 'quest-career',
  title_he: 'קריירה ועבודה',
  title_en: 'Career & Work',
  steps: [{
    id: 1,
    title_he: 'קריירה',
    title_en: 'Career',
    renderer: 'card',
    miniSteps: [
      {
        id: 'work_satisfaction',
        title_he: 'כמה אתה מרוצה מהעבודה שלך?',
        title_en: 'How satisfied are you with your work?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'love-it', label_he: 'אוהב את מה שאני עושה', label_en: 'Love what I do', icon: '❤️' },
          { value: 'good', label_he: 'טוב', label_en: 'Good', icon: '🙂' },
          { value: 'okay', label_he: 'סביר', label_en: 'Okay', icon: '😐' },
          { value: 'unhappy', label_he: 'לא מרוצה', label_en: 'Unhappy', icon: '😞' },
          { value: 'searching', label_he: 'מחפש עבודה', label_en: 'Job searching', icon: '🔍' },
        ],
      },
      {
        id: 'work_flexibility',
        title_he: 'מה רמת הגמישות בעבודה?',
        title_en: 'How flexible is your work?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'fully-remote', label_he: 'עבודה מהבית מלאה', label_en: 'Fully remote', icon: '🏠' },
          { value: 'hybrid', label_he: 'היברידי', label_en: 'Hybrid', icon: '🔄' },
          { value: 'office', label_he: 'משרד קבוע', label_en: 'Fixed office', icon: '🏢' },
          { value: 'shifts', label_he: 'משמרות', label_en: 'Shifts', icon: '⏰' },
          { value: 'freelance', label_he: 'עצמאי/פרילנס', label_en: 'Freelance', icon: '💻' },
        ],
      },
      {
        id: 'career_aspirations',
        title_he: 'מה השאיפה המקצועית שלך?',
        title_en: 'What is your career aspiration?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1, maxSelected: 3 },
        dbPath: DB,
        options: [
          { value: 'leadership', label_he: 'מנהיגות/ניהול', label_en: 'Leadership/Management', icon: '👑' },
          { value: 'expertise', label_he: 'מומחיות', label_en: 'Expertise', icon: '🎯' },
          { value: 'independence', label_he: 'עצמאות', label_en: 'Independence', icon: '🚀' },
          { value: 'impact', label_he: 'השפעה', label_en: 'Impact', icon: '🌍' },
          { value: 'income', label_he: 'הגדלת הכנסה', label_en: 'Higher income', icon: '💰' },
          { value: 'balance', label_he: 'איזון', label_en: 'Work-life balance', icon: '⚖️' },
        ],
      },
      {
        id: 'career_blockers',
        title_he: 'מה עוצר אותך בקריירה?',
        title_en: 'What blocks your career progress?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1 },
        dbPath: DB,
        options: [
          { value: 'skills', label_he: 'חוסר מיומנויות', label_en: 'Lack of skills', icon: '📚' },
          { value: 'confidence', label_he: 'חוסר ביטחון', label_en: 'Low confidence', icon: '😟' },
          { value: 'network', label_he: 'חוסר קשרים', label_en: 'Weak network', icon: '🕸️' },
          { value: 'clarity', label_he: 'חוסר בהירות', label_en: 'Lack of clarity', icon: '🌫️' },
          { value: 'market', label_he: 'שוק קשה', label_en: 'Tough market', icon: '📉' },
          { value: 'fear', label_he: 'פחד מהשינוי', label_en: 'Fear of change', icon: '😨' },
        ],
      },
      {
        id: 'work_hours_weekly',
        title_he: 'כמה שעות בשבוע אתה עובד?',
        title_en: 'How many hours a week do you work?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'under-30', label_he: 'פחות מ-30', label_en: 'Under 30', icon: '⏰' },
          { value: '30-40', label_he: '30-40', label_en: '30-40', icon: '⏰' },
          { value: '40-50', label_he: '40-50', label_en: '40-50', icon: '⏰' },
          { value: '50-60', label_he: '50-60', label_en: '50-60', icon: '😤' },
          { value: '60+', label_he: '60+', label_en: '60+', icon: '🔥' },
        ],
      },
    ],
  }],
};

registerFlow(careerQuestSpec);
