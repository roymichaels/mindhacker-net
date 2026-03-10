/**
 * Structured questions per career path for the wizard's first phase.
 */
export interface WizardQuestion {
  id: string;
  titleHe: string;
  titleEn: string;
  type: 'single_select' | 'multi_select' | 'text';
  options?: { value: string; labelHe: string; labelEn: string; icon: string }[];
  validation?: { required?: boolean; minSelected?: number; maxSelected?: number };
}

export const CAREER_QUESTIONS: Record<string, WizardQuestion[]> = {
  coach: [
    {
      id: 'experience_level',
      titleHe: 'מה רמת הניסיון שלך כמאמן?',
      titleEn: 'What is your coaching experience level?',
      type: 'single_select',
      options: [
        { value: 'beginner', labelHe: 'מתחיל (0-1 שנים)', labelEn: 'Beginner (0-1 years)', icon: '🌱' },
        { value: 'intermediate', labelHe: 'בינוני (1-3 שנים)', labelEn: 'Intermediate (1-3 years)', icon: '📈' },
        { value: 'experienced', labelHe: 'מנוסה (3-5 שנים)', labelEn: 'Experienced (3-5 years)', icon: '⭐' },
        { value: 'expert', labelHe: 'מומחה (5+ שנים)', labelEn: 'Expert (5+ years)', icon: '👑' },
      ],
    },
    {
      id: 'coaching_niche',
      titleHe: 'באיזה תחום אימון אתה מתמחה?',
      titleEn: 'What is your coaching niche?',
      type: 'multi_select',
      validation: { required: true, minSelected: 1, maxSelected: 3 },
      options: [
        { value: 'life', labelHe: 'אימון חיים', labelEn: 'Life Coaching', icon: '🌟' },
        { value: 'business', labelHe: 'אימון עסקי', labelEn: 'Business Coaching', icon: '💼' },
        { value: 'health', labelHe: 'בריאות וכושר', labelEn: 'Health & Fitness', icon: '💪' },
        { value: 'mindset', labelHe: 'חשיבה ומנטליות', labelEn: 'Mindset', icon: '🧠' },
        { value: 'relationships', labelHe: 'זוגיות ומערכות יחסים', labelEn: 'Relationships', icon: '❤️' },
        { value: 'career', labelHe: 'קריירה', labelEn: 'Career', icon: '🚀' },
      ],
    },
    {
      id: 'certifications',
      titleHe: 'האם יש לך הסמכות?',
      titleEn: 'Do you have certifications?',
      type: 'single_select',
      options: [
        { value: 'certified', labelHe: 'כן, יש לי הסמכה', labelEn: 'Yes, I am certified', icon: '🎓' },
        { value: 'in_progress', labelHe: 'בתהליך הסמכה', labelEn: 'In progress', icon: '📚' },
        { value: 'none', labelHe: 'לא, אבל יש לי ניסיון', labelEn: 'No, but I have experience', icon: '💡' },
      ],
    },
    {
      id: 'client_goal',
      titleHe: 'כמה מתאמנים אתה רוצה לנהל?',
      titleEn: 'How many clients do you want to manage?',
      type: 'single_select',
      options: [
        { value: '1-5', labelHe: '1-5 מתאמנים', labelEn: '1-5 clients', icon: '👤' },
        { value: '5-15', labelHe: '5-15 מתאמנים', labelEn: '5-15 clients', icon: '👥' },
        { value: '15-30', labelHe: '15-30 מתאמנים', labelEn: '15-30 clients', icon: '🏢' },
        { value: '30+', labelHe: '30+ מתאמנים', labelEn: '30+ clients', icon: '🌍' },
      ],
    },
  ],

  therapist: [
    {
      id: 'therapy_type',
      titleHe: 'באיזה סוג טיפול אתה מתמחה?',
      titleEn: 'What type of therapy do you specialize in?',
      type: 'multi_select',
      validation: { required: true, minSelected: 1, maxSelected: 3 },
      options: [
        { value: 'cbt', labelHe: 'CBT — טיפול קוגניטיבי-התנהגותי', labelEn: 'CBT', icon: '🧠' },
        { value: 'psychodynamic', labelHe: 'פסיכודינמי', labelEn: 'Psychodynamic', icon: '🔍' },
        { value: 'mindfulness', labelHe: 'מיינדפולנס', labelEn: 'Mindfulness-based', icon: '🧘' },
        { value: 'emdr', labelHe: 'EMDR', labelEn: 'EMDR', icon: '👁️' },
        { value: 'art', labelHe: 'טיפול באומנות', labelEn: 'Art Therapy', icon: '🎨' },
        { value: 'family', labelHe: 'טיפול משפחתי/זוגי', labelEn: 'Family/Couples', icon: '👨‍👩‍👧' },
      ],
    },
    {
      id: 'license_status',
      titleHe: 'מה סטטוס הרישיון שלך?',
      titleEn: 'What is your license status?',
      type: 'single_select',
      options: [
        { value: 'licensed', labelHe: 'מוסמך ובעל רישיון', labelEn: 'Fully licensed', icon: '✅' },
        { value: 'supervised', labelHe: 'בהתמחות/תחת פיקוח', labelEn: 'Under supervision', icon: '📋' },
        { value: 'student', labelHe: 'סטודנט', labelEn: 'Student', icon: '📚' },
        { value: 'alternative', labelHe: 'מטפל אלטרנטיבי', labelEn: 'Alternative practitioner', icon: '🌿' },
      ],
    },
    {
      id: 'experience_years',
      titleHe: 'כמה שנות ניסיון יש לך?',
      titleEn: 'How many years of experience?',
      type: 'single_select',
      options: [
        { value: '0-2', labelHe: '0-2 שנים', labelEn: '0-2 years', icon: '🌱' },
        { value: '2-5', labelHe: '2-5 שנים', labelEn: '2-5 years', icon: '📈' },
        { value: '5-10', labelHe: '5-10 שנים', labelEn: '5-10 years', icon: '⭐' },
        { value: '10+', labelHe: '10+ שנים', labelEn: '10+ years', icon: '👑' },
      ],
    },
    {
      id: 'target_population',
      titleHe: 'עם מי אתה עובד בעיקר?',
      titleEn: 'Who do you primarily work with?',
      type: 'multi_select',
      validation: { required: true, minSelected: 1 },
      options: [
        { value: 'adults', labelHe: 'מבוגרים', labelEn: 'Adults', icon: '👤' },
        { value: 'teens', labelHe: 'נוער', labelEn: 'Teens', icon: '🧑' },
        { value: 'children', labelHe: 'ילדים', labelEn: 'Children', icon: '👶' },
        { value: 'couples', labelHe: 'זוגות', labelEn: 'Couples', icon: '💑' },
        { value: 'families', labelHe: 'משפחות', labelEn: 'Families', icon: '👨‍👩‍👧‍👦' },
      ],
    },
  ],

  freelancer: [
    {
      id: 'skill_area',
      titleHe: 'מה התחום המקצועי שלך?',
      titleEn: 'What is your professional area?',
      type: 'multi_select',
      validation: { required: true, minSelected: 1, maxSelected: 3 },
      options: [
        { value: 'development', labelHe: 'פיתוח תוכנה', labelEn: 'Software Development', icon: '💻' },
        { value: 'design', labelHe: 'עיצוב', labelEn: 'Design', icon: '🎨' },
        { value: 'writing', labelHe: 'כתיבה ותוכן', labelEn: 'Writing & Content', icon: '✍️' },
        { value: 'marketing', labelHe: 'שיווק דיגיטלי', labelEn: 'Digital Marketing', icon: '📱' },
        { value: 'video', labelHe: 'וידאו ואנימציה', labelEn: 'Video & Animation', icon: '🎬' },
        { value: 'consulting', labelHe: 'ייעוץ', labelEn: 'Consulting', icon: '💡' },
      ],
    },
    {
      id: 'experience_level',
      titleHe: 'מה רמת הניסיון שלך?',
      titleEn: 'What is your experience level?',
      type: 'single_select',
      options: [
        { value: 'junior', labelHe: 'ג׳וניור (0-2 שנים)', labelEn: 'Junior (0-2 years)', icon: '🌱' },
        { value: 'mid', labelHe: 'בינוני (2-5 שנים)', labelEn: 'Mid-level (2-5 years)', icon: '📈' },
        { value: 'senior', labelHe: 'סניור (5+ שנים)', labelEn: 'Senior (5+ years)', icon: '⭐' },
      ],
    },
    {
      id: 'availability',
      titleHe: 'מה הזמינות שלך?',
      titleEn: 'What is your availability?',
      type: 'single_select',
      options: [
        { value: 'full_time', labelHe: 'משרה מלאה', labelEn: 'Full-time', icon: '⏰' },
        { value: 'part_time', labelHe: 'חלקית', labelEn: 'Part-time', icon: '🕐' },
        { value: 'project', labelHe: 'לפי פרויקט', labelEn: 'Per project', icon: '📋' },
        { value: 'flexible', labelHe: 'גמיש', labelEn: 'Flexible', icon: '🔄' },
      ],
    },
    {
      id: 'has_portfolio',
      titleHe: 'יש לך תיק עבודות?',
      titleEn: 'Do you have a portfolio?',
      type: 'single_select',
      options: [
        { value: 'yes_online', labelHe: 'כן, אתר/קישור', labelEn: 'Yes, website/link', icon: '🌐' },
        { value: 'yes_samples', labelHe: 'כן, דוגמאות', labelEn: 'Yes, samples', icon: '📁' },
        { value: 'building', labelHe: 'בבנייה', labelEn: 'Building one', icon: '🔨' },
        { value: 'no', labelHe: 'עדיין לא', labelEn: 'Not yet', icon: '🆕' },
      ],
    },
  ],

  creator: [
    {
      id: 'content_type',
      titleHe: 'מה סוג התוכן שלך?',
      titleEn: 'What type of content do you create?',
      type: 'multi_select',
      validation: { required: true, minSelected: 1, maxSelected: 3 },
      options: [
        { value: 'courses', labelHe: 'קורסים', labelEn: 'Courses', icon: '🎓' },
        { value: 'videos', labelHe: 'סרטונים', labelEn: 'Videos', icon: '🎬' },
        { value: 'podcasts', labelHe: 'פודקאסטים', labelEn: 'Podcasts', icon: '🎙️' },
        { value: 'articles', labelHe: 'מאמרים/בלוגים', labelEn: 'Articles/Blogs', icon: '✍️' },
        { value: 'ebooks', labelHe: 'ספרים דיגיטליים', labelEn: 'E-books', icon: '📚' },
        { value: 'templates', labelHe: 'תבניות/כלים', labelEn: 'Templates/Tools', icon: '🧰' },
      ],
    },
    {
      id: 'audience_size',
      titleHe: 'מה גודל הקהל שלך?',
      titleEn: 'What is your current audience size?',
      type: 'single_select',
      options: [
        { value: 'starting', labelHe: 'מתחיל (0-100)', labelEn: 'Starting (0-100)', icon: '🌱' },
        { value: 'growing', labelHe: 'צומח (100-1K)', labelEn: 'Growing (100-1K)', icon: '📈' },
        { value: 'established', labelHe: 'מבוסס (1K-10K)', labelEn: 'Established (1K-10K)', icon: '⭐' },
        { value: 'large', labelHe: 'גדול (10K+)', labelEn: 'Large (10K+)', icon: '🌍' },
      ],
    },
    {
      id: 'expertise_area',
      titleHe: 'באיזה תחום את/ה מומחה?',
      titleEn: 'What is your area of expertise?',
      type: 'text',
      validation: { required: true },
    },
    {
      id: 'monetization',
      titleHe: 'איך את/ה רוצה למנף תוכן?',
      titleEn: 'How do you want to monetize?',
      type: 'multi_select',
      validation: { required: true, minSelected: 1 },
      options: [
        { value: 'paid_courses', labelHe: 'קורסים בתשלום', labelEn: 'Paid courses', icon: '💰' },
        { value: 'subscriptions', labelHe: 'מנויים', labelEn: 'Subscriptions', icon: '🔄' },
        { value: 'consulting', labelHe: 'ייעוץ', labelEn: 'Consulting', icon: '💡' },
        { value: 'sponsorships', labelHe: 'חסויות', labelEn: 'Sponsorships', icon: '🤝' },
      ],
    },
  ],

  business: [
    {
      id: 'business_stage',
      titleHe: 'באיזה שלב העסק שלך?',
      titleEn: 'What stage is your business?',
      type: 'single_select',
      options: [
        { value: 'idea', labelHe: 'רעיון', labelEn: 'Idea stage', icon: '💡' },
        { value: 'early', labelHe: 'התחלתי (0-6 חודשים)', labelEn: 'Early (0-6 months)', icon: '🌱' },
        { value: 'growing', labelHe: 'צומח (6-24 חודשים)', labelEn: 'Growing (6-24 months)', icon: '📈' },
        { value: 'established', labelHe: 'מבוסס (2+ שנים)', labelEn: 'Established (2+ years)', icon: '🏢' },
      ],
    },
    {
      id: 'business_type',
      titleHe: 'מה סוג העסק?',
      titleEn: 'What type of business?',
      type: 'single_select',
      options: [
        { value: 'product', labelHe: 'מוצר', labelEn: 'Product', icon: '📦' },
        { value: 'service', labelHe: 'שירות', labelEn: 'Service', icon: '🤝' },
        { value: 'saas', labelHe: 'SaaS / תוכנה', labelEn: 'SaaS / Software', icon: '💻' },
        { value: 'ecommerce', labelHe: 'מסחר אלקטרוני', labelEn: 'E-commerce', icon: '🛒' },
        { value: 'consulting', labelHe: 'ייעוץ', labelEn: 'Consulting', icon: '💼' },
      ],
    },
    {
      id: 'team_size',
      titleHe: 'כמה אנשים בצוות?',
      titleEn: 'Team size?',
      type: 'single_select',
      options: [
        { value: 'solo', labelHe: 'עצמאי', labelEn: 'Solo', icon: '👤' },
        { value: '2-5', labelHe: '2-5 אנשים', labelEn: '2-5 people', icon: '👥' },
        { value: '5-20', labelHe: '5-20 אנשים', labelEn: '5-20 people', icon: '🏢' },
        { value: '20+', labelHe: '20+ אנשים', labelEn: '20+ people', icon: '🌐' },
      ],
    },
    {
      id: 'revenue_range',
      titleHe: 'מה ההכנסה החודשית?',
      titleEn: 'Monthly revenue range?',
      type: 'single_select',
      options: [
        { value: 'pre_revenue', labelHe: 'עדיין ללא הכנסות', labelEn: 'Pre-revenue', icon: '🌱' },
        { value: '0-5k', labelHe: '0-5K ₪', labelEn: '0-5K', icon: '💵' },
        { value: '5k-20k', labelHe: '5K-20K ₪', labelEn: '5K-20K', icon: '💰' },
        { value: '20k-100k', labelHe: '20K-100K ₪', labelEn: '20K-100K', icon: '🤑' },
        { value: '100k+', labelHe: '100K+ ₪', labelEn: '100K+', icon: '🏆' },
      ],
    },
  ],
};
