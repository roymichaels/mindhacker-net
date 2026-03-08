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
      {
        id: 'peak_focus_window',
        title_he: 'מתי אתה הכי ממוקד ופרודוקטיבי?',
        title_en: 'When are you most focused and productive?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'early_morning', label_he: 'בוקר מוקדם (6-9)', label_en: 'Early morning (6-9)', icon: '🌅' },
          { value: 'morning', label_he: 'בוקר (9-12)', label_en: 'Morning (9-12)', icon: '☀️' },
          { value: 'afternoon', label_he: 'אחר הצהריים (12-16)', label_en: 'Afternoon (12-4pm)', icon: '🌤️' },
          { value: 'evening', label_he: 'ערב (16-20)', label_en: 'Evening (4-8pm)', icon: '🌆' },
          { value: 'night', label_he: 'לילה (20+)', label_en: 'Night (8pm+)', icon: '🌙' },
        ],
      },
      {
        id: 'deep_work_hours',
        title_he: 'כמה שעות עבודה עמוקה אתה מסוגל ביום?',
        title_en: 'How many deep work hours can you do per day?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'under_1', label_he: 'פחות משעה', label_en: 'Under 1 hour', icon: '😬' },
          { value: '1_2', label_he: '1-2 שעות', label_en: '1-2 hours', icon: '🙂' },
          { value: '2_4', label_he: '2-4 שעות', label_en: '2-4 hours', icon: '💪' },
          { value: '4_plus', label_he: '4+ שעות', label_en: '4+ hours', icon: '🔥' },
        ],
      },
      {
        id: 'productivity_practices',
        title_he: 'אילו תרגולי פרודוקטיביות אתה עושה או רוצה?',
        title_en: 'Which productivity practices do you use or want?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1 },
        dbPath: DB,
        options: [
          { value: 'pomodoro', label_he: 'פומודורו / טיימר מיקוד', label_en: 'Pomodoro / Focus timer', icon: '🍅' },
          { value: 'time_blocking', label_he: 'חסימת זמן', label_en: 'Time blocking', icon: '📅' },
          { value: 'morning_planning', label_he: 'תכנון בוקר', label_en: 'Morning planning', icon: '🌅' },
          { value: 'weekly_review', label_he: 'סיכום שבועי', label_en: 'Weekly review', icon: '📊' },
          { value: 'deep_work_blocks', label_he: 'בלוקים של עבודה עמוקה', label_en: 'Deep work blocks', icon: '🧠' },
          { value: 'digital_detox', label_he: 'ניתוק דיגיטלי', label_en: 'Digital detox', icon: '📵' },
        ],
      },
    ],
  }],
};

registerFlow(careerQuestSpec);
