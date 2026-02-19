/**
 * Step configurations for the Projects Journey
 */
export const PROJECTS_STEP_CONFIGS: Record<number, {
  icon: string; titleHe: string; titleEn: string;
  descriptionHe: string; descriptionEn: string;
  promptsHe: string[]; promptsEn: string[]; fieldKey: string;
}> = {
  1: {
    icon: '🗺️', titleHe: 'חזון ניהול פרויקטים', titleEn: 'Project Management Vision',
    descriptionHe: 'איך אתה רוצה לארגן את הפרויקטים שלך?',
    descriptionEn: 'How do you want to organize your projects?',
    promptsHe: ['מה סוגי הפרויקטים שאתה מנהל?', 'כמה פרויקטים במקביל?', 'מה הסגנון המועדף שלך?'],
    promptsEn: ['What types of projects do you manage?', 'How many projects in parallel?', 'What\'s your preferred style?'],
    fieldKey: 'vision_text',
  },
  2: {
    icon: '🏗️', titleHe: 'פרויקט ראשון', titleEn: 'First Project',
    descriptionHe: 'תאר את הפרויקט הראשון שלך',
    descriptionEn: 'Describe your first project',
    promptsHe: ['מה מטרת הפרויקט?', 'מה לוח הזמנים?', 'מי מעורב?'],
    promptsEn: ['What\'s the project goal?', 'What\'s the timeline?', 'Who\'s involved?'],
    fieldKey: 'first_project_text',
  },
  3: {
    icon: '🎯', titleHe: 'יישור מטרות', titleEn: 'Goals Alignment',
    descriptionHe: 'חבר את הפרויקטים לתוכנית 90 היום שלך',
    descriptionEn: 'Map your projects to your 90-day plan',
    promptsHe: ['איזה תחום חיים הפרויקט הזה משרת?', 'מה המטרה ברמת 90 יום?', 'מה יצליח אם הפרויקט יושלם?'],
    promptsEn: ['Which life pillar does this project serve?', 'What\'s the 90-day goal?', 'What succeeds if this project completes?'],
    fieldKey: 'goals_text',
  },
  4: {
    icon: '📋', titleHe: 'פירוק משימות', titleEn: 'Task Breakdown',
    descriptionHe: 'פרק את הפרויקט למשימות קטנות',
    descriptionEn: 'Break the project into small tasks',
    promptsHe: ['מה 3-5 המשימות הראשונות?', 'מה עדיפות כל משימה?', 'כמה זמן כל אחת תיקח?'],
    promptsEn: ['What are the first 3-5 tasks?', 'What\'s each task\'s priority?', 'How long will each take?'],
    fieldKey: 'tasks_text',
  },
  5: {
    icon: '🏆', titleHe: 'אבני דרך', titleEn: 'Milestones & Timeline',
    descriptionHe: 'הגדר ציוני דרך ולוח זמנים',
    descriptionEn: 'Set key milestones and deadlines',
    promptsHe: ['מה אבני הדרך העיקריות?', 'מה התאריכים הקריטיים?', 'איך תדע שהגעת?'],
    promptsEn: ['What are the key milestones?', 'What are the critical dates?', 'How will you know you\'ve arrived?'],
    fieldKey: 'milestones_text',
  },
  6: {
    icon: '🤝', titleHe: 'שיתוף פעולה', titleEn: 'Collaboration',
    descriptionHe: 'מי מעורב ומה המשאבים הנדרשים?',
    descriptionEn: 'Who\'s involved and what resources are needed?',
    promptsHe: ['מי בעלי העניין?', 'מה משאבים נדרשים?', 'מי תלויים בך ובמי אתה תלוי?'],
    promptsEn: ['Who are the stakeholders?', 'What resources are needed?', 'Who depends on you and vice versa?'],
    fieldKey: 'collaboration_text',
  },
  7: {
    icon: '📊', titleHe: 'מעקב התקדמות', titleEn: 'Progress Tracking',
    descriptionHe: 'הגדר קצב סקירה ומדדים',
    descriptionEn: 'Set up review cadence and metrics',
    promptsHe: ['כל כמה זמן תסקור?', 'מה המדדים העיקריים?', 'מי צריך לראות את ההתקדמות?'],
    promptsEn: ['How often will you review?', 'What are the key metrics?', 'Who needs to see progress?'],
    fieldKey: 'tracking_text',
  },
  8: {
    icon: '🤖', titleHe: 'אינטגרציית אורורה', titleEn: 'Aurora Integration',
    descriptionHe: 'הגדר אימון AI לפרויקטים שלך',
    descriptionEn: 'Configure AI coaching for your projects',
    promptsHe: ['באילו תחומים אתה צריך עזרה?', 'כמה תזכורות אתה רוצה?', 'מה סגנון האימון המועדף?'],
    promptsEn: ['What areas do you need help with?', 'How many reminders do you want?', 'What coaching style do you prefer?'],
    fieldKey: 'aurora_text',
  },
};
