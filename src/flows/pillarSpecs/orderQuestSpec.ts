/**
 * Order Pillar Quest Spec
 * Collects organization, routine, and environmental order habits to generate order practices.
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.order.answers' };

export const orderQuestSpec: FlowSpec = {
  id: 'quest-order',
  title_he: 'סדר ומבנה',
  title_en: 'Order & Structure',
  steps: [{
    id: 1,
    title_he: 'סדר',
    title_en: 'Order',
    renderer: 'card',
    miniSteps: [
      {
        id: 'daily_routine',
        title_he: 'יש לך שגרת סדר יומית קבועה?',
        title_en: 'Do you have a consistent daily routine?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'strict', label_he: 'כן, קפדנית', label_en: 'Yes, strict', icon: '📋' },
          { value: 'flexible', label_he: 'גמישה אבל קיימת', label_en: 'Flexible but exists', icon: '🔄' },
          { value: 'partial', label_he: 'חלקית', label_en: 'Partial', icon: '😐' },
          { value: 'none', label_he: 'אין לי שגרה', label_en: 'No routine', icon: '🌀' },
        ],
      },
      {
        id: 'cleaning_frequency',
        title_he: 'כמה פעמים בשבוע אתה מנקה/מסדר?',
        title_en: 'How often do you clean/organize per week?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'daily', label_he: 'כל יום', label_en: 'Daily', icon: '✨' },
          { value: '3-4', label_he: '3-4 פעמים', label_en: '3-4 times', icon: '🧹' },
          { value: '1-2', label_he: '1-2 פעמים', label_en: '1-2 times', icon: '😐' },
          { value: 'rarely', label_he: 'לעיתים רחוקות', label_en: 'Rarely', icon: '😅' },
        ],
      },
      {
        id: 'digital_organization',
        title_he: 'כמה מסודרת הסביבה הדיגיטלית שלך?',
        title_en: 'How organized is your digital environment?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'very', label_he: 'מאוד — תיקיות, תגיות, אפס אינבוקס', label_en: 'Very — folders, tags, inbox zero', icon: '📁' },
          { value: 'okay', label_he: 'בסדר', label_en: 'Okay', icon: '🙂' },
          { value: 'messy', label_he: 'בלגן', label_en: 'Messy', icon: '📧' },
          { value: 'chaos', label_he: 'כאוס מוחלט', label_en: 'Total chaos', icon: '🌋' },
        ],
      },
      {
        id: 'order_practices',
        title_he: 'אילו תרגולי סדר מעניינים אותך?',
        title_en: 'Which order practices interest you?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1 },
        dbPath: DB,
        options: [
          { value: 'morning_routine', label_he: 'שגרת בוקר מובנית', label_en: 'Structured morning routine', icon: '🌅' },
          { value: 'evening_review', label_he: 'סיכום ערב', label_en: 'Evening review', icon: '🌙' },
          { value: 'weekly_planning', label_he: 'תכנון שבועי', label_en: 'Weekly planning', icon: '📅' },
          { value: 'declutter', label_he: 'פינוי וסידור', label_en: 'Decluttering', icon: '🗑️' },
          { value: 'time_blocking', label_he: 'חסימת זמן', label_en: 'Time blocking', icon: '⏰' },
          { value: 'inbox_zero', label_he: 'אינבוקס אפס', label_en: 'Inbox zero', icon: '📧' },
          { value: 'meal_prep', label_he: 'הכנת ארוחות מראש', label_en: 'Meal prep', icon: '🍱' },
        ],
      },
      {
        id: 'space_satisfaction',
        title_he: 'כמה מרוצה אתה מהסביבה הפיזית שלך?',
        title_en: 'How satisfied are you with your physical environment?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'love_it', label_he: 'אוהב את המקום שלי', label_en: 'Love my space', icon: '🏡' },
          { value: 'okay', label_he: 'בסדר', label_en: 'Okay', icon: '🙂' },
          { value: 'needs_work', label_he: 'צריך שיפור', label_en: 'Needs improvement', icon: '🔧' },
          { value: 'frustrated', label_he: 'מתוסכל', label_en: 'Frustrated', icon: '😤' },
        ],
      },
      {
        id: 'order_goal',
        title_he: 'מה המטרה שלך בתחום הסדר ב-100 ימים?',
        title_en: 'What\'s your order goal for the next 100 days?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1, maxSelected: 3 },
        dbPath: DB,
        options: [
          { value: 'build_routine', label_he: 'לבנות שגרה יציבה', label_en: 'Build a stable routine', icon: '📋' },
          { value: 'declutter_home', label_he: 'לסדר את הבית', label_en: 'Declutter home', icon: '🏠' },
          { value: 'digital_cleanup', label_he: 'סדר דיגיטלי', label_en: 'Digital cleanup', icon: '💻' },
          { value: 'time_management', label_he: 'ניהול זמן', label_en: 'Time management', icon: '⏰' },
          { value: 'systems', label_he: 'מערכות וכלים', label_en: 'Systems & Tools', icon: '⚙️' },
        ],
      },
    ],
  }],
};

registerFlow(orderQuestSpec);
