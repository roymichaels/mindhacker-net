/**
 * Step configurations for the Admin Journey
 * Each step defines prompts and metadata used by GenericJourneyStep
 */
export const ADMIN_STEP_CONFIGS: Record<number, {
  icon: string; titleHe: string; titleEn: string;
  descriptionHe: string; descriptionEn: string;
  promptsHe: string[]; promptsEn: string[]; fieldKey: string;
}> = {
  1: {
    icon: '🎯', titleHe: 'חזון הפלטפורמה', titleEn: 'Platform Vision',
    descriptionHe: 'מה המטרה של הפלטפורמה שלך? מי קהל היעד?',
    descriptionEn: 'What is your platform\'s purpose? Who is your audience?',
    promptsHe: ['מה הבעיה שאתה פותר?', 'מי האנשים שייהנו הכי הרבה?', 'מה ההבדל בינך לבין פלטפורמות אחרות?'],
    promptsEn: ['What problem are you solving?', 'Who benefits the most?', 'What makes you different from other platforms?'],
    fieldKey: 'vision_text',
  },
  2: {
    icon: '👥', titleHe: 'צוות ותפקידים', titleEn: 'Team & Roles',
    descriptionHe: 'איך הצוות שלך בנוי? מי מנהל מה?',
    descriptionEn: 'How is your team structured? Who manages what?',
    promptsHe: ['כמה מנהלים יש לך?', 'מי אחראי על התוכן?', 'מי מנהל את הלקוחות?'],
    promptsEn: ['How many admins do you have?', 'Who handles content?', 'Who manages clients?'],
    fieldKey: 'team_text',
  },
  3: {
    icon: '🎨', titleHe: 'מיתוג ועיצוב', titleEn: 'Branding & Theme',
    descriptionHe: 'מה הזהות החזותית של הפלטפורמה שלך?',
    descriptionEn: 'What is your platform\'s visual identity?',
    promptsHe: ['מה הצבעים המרכזיים?', 'מה הטון שלך - רשמי או ידידותי?', 'יש לך לוגו?'],
    promptsEn: ['What are your main colors?', 'What\'s your tone - formal or friendly?', 'Do you have a logo?'],
    fieldKey: 'branding_text',
  },
  4: {
    icon: '🛍️', titleHe: 'קטלוג מוצרים', titleEn: 'Product Catalog',
    descriptionHe: 'אילו מוצרים ושירותים תציע?',
    descriptionEn: 'What products and services will you offer?',
    promptsHe: ['מוצרים דיגיטליים, קורסים, או שירותים?', 'מה טווח המחירים?', 'יש מוצר מוביל?'],
    promptsEn: ['Digital products, courses, or services?', 'What\'s the price range?', 'Is there a flagship product?'],
    fieldKey: 'products_text',
  },
  5: {
    icon: '📝', titleHe: 'אסטרטגיית תוכן', titleEn: 'Content Strategy',
    descriptionHe: 'איזה סוגי תוכן תפיק ותפרסם?',
    descriptionEn: 'What types of content will you create and publish?',
    promptsHe: ['סרטונים, מאמרים, או קורסים?', 'מה תדירות הפרסום?', 'מי כותב/מפיק את התוכן?'],
    promptsEn: ['Videos, articles, or courses?', 'How often will you publish?', 'Who creates the content?'],
    fieldKey: 'content_text',
  },
  6: {
    icon: '🌐', titleHe: 'דפי נחיתה', titleEn: 'Landing Pages',
    descriptionHe: 'אילו עמודים מרכזיים צריכים להיות?',
    descriptionEn: 'What key pages does your platform need?',
    promptsHe: ['עמוד בית, דף מוצר, דף אודות?', 'מה המסר המרכזי בעמוד הבית?', 'מה ה-CTA הראשי?'],
    promptsEn: ['Homepage, product page, about page?', 'What\'s your homepage headline?', 'What\'s the main CTA?'],
    fieldKey: 'landing_text',
  },
  7: {
    icon: '📣', titleHe: 'שיווק', titleEn: 'Marketing Setup',
    descriptionHe: 'איך תגיע ללקוחות חדשים?',
    descriptionEn: 'How will you reach new customers?',
    promptsHe: ['ניוזלטר, שותפים, רשתות חברתיות?', 'מה התקציב לשיווק?', 'מי הקהל העיקרי?'],
    promptsEn: ['Newsletter, affiliates, social media?', 'What\'s the marketing budget?', 'Who\'s the primary audience?'],
    fieldKey: 'marketing_text',
  },
  8: {
    icon: '⚙️', titleHe: 'תפעול', titleEn: 'Operations',
    descriptionHe: 'הגדרות מערכת, התראות ואנליטיקס',
    descriptionEn: 'System settings, notifications, and analytics',
    promptsHe: ['אילו התראות חשובות לך?', 'מה תרצה לעקוב אחריו?', 'יש שירותים חיצוניים לחבר?'],
    promptsEn: ['What notifications matter to you?', 'What do you want to track?', 'Any external services to connect?'],
    fieldKey: 'operations_text',
  },
};
