/**
 * Health Pillar Quest Spec
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.health.answers' };

export const healthQuestSpec: FlowSpec = {
  id: 'quest-health',
  title_he: 'בריאות וכושר',
  title_en: 'Health & Fitness',
  steps: [{
    id: 1,
    title_he: 'בריאות',
    title_en: 'Health',
    renderer: 'card',
    miniSteps: [
      {
        id: 'exercise_frequency',
        title_he: 'כמה פעמים בשבוע אתה מתאמן?',
        title_en: 'How many times a week do you exercise?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'never', label_he: 'כלום', label_en: 'Never', icon: '🚫' },
          { value: '1-2', label_he: '1-2 פעמים', label_en: '1-2 times', icon: '🏃' },
          { value: '3-4', label_he: '3-4 פעמים', label_en: '3-4 times', icon: '💪' },
          { value: '5+', label_he: '5+ פעמים', label_en: '5+ times', icon: '🔥' },
        ],
      },
      {
        id: 'exercise_types',
        title_he: 'סוגי פעילות שאתה נהנה מהם',
        title_en: 'Types of exercise you enjoy',
        inputType: 'multi_select',
        validation: { required: false },
        dbPath: DB,
        options: [
          { value: 'gym', label_he: 'חדר כושר', label_en: 'Gym', icon: '🏋️' },
          { value: 'running', label_he: 'ריצה', label_en: 'Running', icon: '🏃' },
          { value: 'swimming', label_he: 'שחייה', label_en: 'Swimming', icon: '🏊' },
          { value: 'yoga', label_he: 'יוגה', label_en: 'Yoga', icon: '🧘' },
          { value: 'martial-arts', label_he: 'אומנויות לחימה', label_en: 'Martial Arts', icon: '🥋' },
          { value: 'team-sports', label_he: 'ספורט קבוצתי', label_en: 'Team Sports', icon: '⚽' },
          { value: 'walking', label_he: 'הליכה', label_en: 'Walking', icon: '🚶' },
          { value: 'cycling', label_he: 'רכיבת אופניים', label_en: 'Cycling', icon: '🚴' },
        ],
      },
      {
        id: 'diet',
        title_he: 'איך היית מתאר את התזונה שלך?',
        title_en: 'How would you describe your diet?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'healthy', label_he: 'בריאה ומאוזנת', label_en: 'Healthy & balanced', icon: '🥗' },
          { value: 'mostly-healthy', label_he: 'בעיקר בריאה', label_en: 'Mostly healthy', icon: '🍎' },
          { value: 'mixed', label_he: 'מעורבת', label_en: 'Mixed', icon: '🍕' },
          { value: 'poor', label_he: 'צריך שיפור', label_en: 'Needs improvement', icon: '🍔' },
        ],
      },
      {
        id: 'daily_fluid_volume',
        title_he: 'כמה נוזלים אתה צורך ביום (סה"כ)?',
        title_en: 'How much total fluids do you consume daily?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'under_1L', label_he: 'פחות מליטר', label_en: 'Less than 1L', icon: '🔴' },
          { value: '1_2L', label_he: '1-2 ליטר', label_en: '1-2L', icon: '🟡' },
          { value: '2_3L', label_he: '2-3 ליטר', label_en: '2-3L', icon: '🟢' },
          { value: 'over_3L', label_he: '3+ ליטר', label_en: '3L+', icon: '💧' },
        ],
      },
      {
        id: 'fluid_sources',
        title_he: 'מה מקורות הנוזלים העיקריים שלך?',
        title_en: 'What are your main fluid sources?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1 },
        dbPath: DB,
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
      },
      {
        id: 'sleep_quality',
        title_he: 'מה איכות השינה שלך?',
        title_en: 'How is your sleep quality?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'great', label_he: 'מעולה', label_en: 'Great', icon: '😴' },
          { value: 'good', label_he: 'טובה', label_en: 'Good', icon: '🙂' },
          { value: 'fair', label_he: 'סבירה', label_en: 'Fair', icon: '😐' },
          { value: 'poor', label_he: 'גרועה', label_en: 'Poor', icon: '😫' },
        ],
      },
      {
        id: 'health_goal',
        title_he: 'מה המטרה הבריאותית העיקרית שלך?',
        title_en: 'What is your main health goal?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'lose-weight', label_he: 'הורדת משקל', label_en: 'Lose weight', icon: '⚖️' },
          { value: 'build-muscle', label_he: 'בניית שריר', label_en: 'Build muscle', icon: '💪' },
          { value: 'more-energy', label_he: 'יותר אנרגיה', label_en: 'More energy', icon: '⚡' },
          { value: 'better-sleep', label_he: 'שינה טובה יותר', label_en: 'Better sleep', icon: '🛌' },
          { value: 'flexibility', label_he: 'גמישות', label_en: 'Flexibility', icon: '🤸' },
          { value: 'overall', label_he: 'בריאות כללית', label_en: 'Overall health', icon: '❤️' },
        ],
      },
    ],
  }],
};

registerFlow(healthQuestSpec);
