/**
 * @module domainIntakeQuestions
 * Defines the structured intake questions for each Life domain.
 * Each domain has 7 steps that collect domain_config fields.
 */

export interface IntakeOption {
  value: string;
  labelEn: string;
  labelHe: string;
}

export interface IntakeStep {
  id: string;
  fieldKey: string;
  type: 'single' | 'multi' | 'text' | 'slider';
  titleEn: string;
  titleHe: string;
  subtitleEn?: string;
  subtitleHe?: string;
  options?: IntakeOption[];
  min?: number;
  max?: number;
  placeholder?: string;
}

const CURRENT_LEVEL_OPTIONS: IntakeOption[] = [
  { value: 'beginner', labelEn: 'Beginner — just starting', labelHe: 'מתחיל — רק מתחיל' },
  { value: 'intermediate', labelEn: 'Intermediate — some experience', labelHe: 'בינוני — קצת ניסיון' },
  { value: 'advanced', labelEn: 'Advanced — solid foundation', labelHe: 'מתקדם — בסיס חזק' },
  { value: 'elite', labelEn: 'Elite — high level', labelHe: 'עילית — רמה גבוהה' },
];

const TIME_OPTIONS: IntakeOption[] = [
  { value: '15', labelEn: '15 min / day', labelHe: '15 דקות ביום' },
  { value: '30', labelEn: '30 min / day', labelHe: '30 דקות ביום' },
  { value: '45', labelEn: '45 min / day', labelHe: '45 דקות ביום' },
  { value: '60', labelEn: '1 hour / day', labelHe: 'שעה ביום' },
  { value: '90', labelEn: '1.5 hours / day', labelHe: 'שעה וחצי ביום' },
  { value: '120', labelEn: '2+ hours / day', labelHe: '2+ שעות ביום' },
];

const INTENSITY_OPTIONS: IntakeOption[] = [
  { value: 'gentle', labelEn: 'Gentle — ease into it', labelHe: 'עדין — להיכנס בקלות' },
  { value: 'moderate', labelEn: 'Moderate — steady pace', labelHe: 'מתון — קצב יציב' },
  { value: 'intense', labelEn: 'Intense — push hard', labelHe: 'אינטנסיבי — לדחוף חזק' },
  { value: 'extreme', labelEn: 'Extreme — no mercy', labelHe: 'קיצוני — בלי רחמים' },
];

// Domain-specific tools/environment options
const TOOLS_MAP: Record<string, IntakeOption[]> = {
  presence: [
    { value: 'mirror', labelEn: 'Full-length mirror', labelHe: 'מראה בגובה מלא' },
    { value: 'skincare', labelEn: 'Skincare routine', labelHe: 'שגרת טיפוח' },
    { value: 'grooming_tools', labelEn: 'Grooming tools', labelHe: 'כלי טיפוח' },
    { value: 'camera', labelEn: 'Camera / phone camera', labelHe: 'מצלמה / טלפון' },
  ],
  power: [
    { value: 'gym', labelEn: 'Gym access', labelHe: 'גישה לחדר כושר' },
    { value: 'home_weights', labelEn: 'Home weights', labelHe: 'משקולות בבית' },
    { value: 'pull_up_bar', labelEn: 'Pull-up bar', labelHe: 'מתח' },
    { value: 'bodyweight', labelEn: 'Bodyweight only', labelHe: 'משקל גוף בלבד' },
    { value: 'resistance_bands', labelEn: 'Resistance bands', labelHe: 'גומיות התנגדות' },
  ],
  vitality: [
    { value: 'sleep_tracker', labelEn: 'Sleep tracker', labelHe: 'מעקב שינה' },
    { value: 'cold_shower', labelEn: 'Cold shower access', labelHe: 'גישה למקלחת קרה' },
    { value: 'kitchen', labelEn: 'Kitchen for meal prep', labelHe: 'מטבח להכנת אוכל' },
    { value: 'supplements', labelEn: 'Supplements', labelHe: 'תוספים' },
    { value: 'sunlight', labelEn: 'Outdoor sun access', labelHe: 'גישה לשמש' },
  ],
  focus: [
    { value: 'quiet_space', labelEn: 'Quiet workspace', labelHe: 'חלל עבודה שקט' },
    { value: 'meditation_app', labelEn: 'Meditation app', labelHe: 'אפליקציית מדיטציה' },
    { value: 'timer', labelEn: 'Focus timer', labelHe: 'טיימר מיקוד' },
    { value: 'phone_blocker', labelEn: 'Phone blocker app', labelHe: 'חוסם אפליקציות' },
  ],
  wealth: [
    { value: 'laptop', labelEn: 'Laptop / computer', labelHe: 'מחשב נייד' },
    { value: 'existing_business', labelEn: 'Existing business', labelHe: 'עסק קיים' },
    { value: 'skills', labelEn: 'Marketable skills', labelHe: 'כישורים שיווקיים' },
    { value: 'capital', labelEn: 'Starting capital', labelHe: 'הון התחלתי' },
    { value: 'network', labelEn: 'Professional network', labelHe: 'רשת מקצועית' },
  ],
  edge: [
    { value: 'martial_arts_gym', labelEn: 'Martial arts gym', labelHe: 'מכון אומנויות לחימה' },
    { value: 'heavy_bag', labelEn: 'Heavy bag', labelHe: 'שק איגרוף' },
    { value: 'open_space', labelEn: 'Open space for drills', labelHe: 'מרחב פתוח לתרגול' },
    { value: 'training_partner', labelEn: 'Training partner', labelHe: 'שותף אימון' },
  ],
  expansion: [
    { value: 'books', labelEn: 'Books / Kindle', labelHe: 'ספרים / קינדל' },
    { value: 'courses', labelEn: 'Online course access', labelHe: 'גישה לקורסים' },
    { value: 'journal', labelEn: 'Journal / notebook', labelHe: 'יומן / מחברת' },
    { value: 'language_app', labelEn: 'Language learning app', labelHe: 'אפליקציית שפות' },
  ],
  influence: [
    { value: 'social_situations', labelEn: 'Regular social situations', labelHe: 'מצבים חברתיים קבועים' },
    { value: 'team', labelEn: 'Team / people to lead', labelHe: 'צוות / אנשים להוביל' },
    { value: 'stage', labelEn: 'Public speaking opportunities', labelHe: 'הזדמנויות לדיבור מול קהל' },
    { value: 'content_platform', labelEn: 'Content platform (social media)', labelHe: 'פלטפורמת תוכן (רשתות)' },
  ],
};

// Domain-specific sub-focus areas
const SUB_FOCUS_MAP: Record<string, IntakeOption[]> = {
  presence: [
    { value: 'posture', labelEn: 'Posture correction', labelHe: 'תיקון יציבה' },
    { value: 'skin', labelEn: 'Skin care', labelHe: 'טיפוח עור' },
    { value: 'style', labelEn: 'Style & wardrobe', labelHe: 'סגנון וארון בגדים' },
    { value: 'grooming', labelEn: 'Grooming & hygiene', labelHe: 'טיפוח והיגיינה' },
    { value: 'body_composition', labelEn: 'Body composition', labelHe: 'הרכב גוף' },
  ],
  power: [
    { value: 'strength', labelEn: 'Raw strength', labelHe: 'כוח גולמי' },
    { value: 'calisthenics', labelEn: 'Calisthenics skills', labelHe: 'כישורי קליסטניקס' },
    { value: 'endurance', labelEn: 'Muscular endurance', labelHe: 'סיבולת שרירית' },
    { value: 'mobility', labelEn: 'Mobility & flexibility', labelHe: 'ניידות וגמישות' },
    { value: 'explosive', labelEn: 'Explosive power', labelHe: 'כוח נפיצות' },
  ],
  vitality: [
    { value: 'sleep', labelEn: 'Sleep optimization', labelHe: 'אופטימיזציית שינה' },
    { value: 'nutrition', labelEn: 'Nutrition & diet', labelHe: 'תזונה ודיאטה' },
    { value: 'hormones', labelEn: 'Hormone optimization', labelHe: 'אופטימיזציית הורמונים' },
    { value: 'recovery', labelEn: 'Recovery protocols', labelHe: 'פרוטוקולי התאוששות' },
    { value: 'cold_heat', labelEn: 'Cold/heat exposure', labelHe: 'חשיפה לקור/חום' },
  ],
  focus: [
    { value: 'deep_work', labelEn: 'Deep work blocks', labelHe: 'בלוקים של עבודה עמוקה' },
    { value: 'dopamine', labelEn: 'Dopamine control', labelHe: 'שליטה בדופמין' },
    { value: 'meditation', labelEn: 'Meditation practice', labelHe: 'תרגול מדיטציה' },
    { value: 'screen_discipline', labelEn: 'Screen discipline', labelHe: 'משמעת מסכים' },
    { value: 'flow_states', labelEn: 'Flow state training', labelHe: 'אימון מצבי זרימה' },
  ],
  wealth: [
    { value: 'income', labelEn: 'Income growth', labelHe: 'הגדלת הכנסה' },
    { value: 'business', labelEn: 'Business building', labelHe: 'בניית עסק' },
    { value: 'investing', labelEn: 'Investing', labelHe: 'השקעות' },
    { value: 'skills', labelEn: 'High-value skills', labelHe: 'כישורים בעלי ערך גבוה' },
    { value: 'networking', labelEn: 'Strategic networking', labelHe: 'רשת קשרים אסטרטגית' },
  ],
  edge: [
    { value: 'striking', labelEn: 'Striking / boxing', labelHe: 'אגרוף / מכות' },
    { value: 'grappling', labelEn: 'Grappling / BJJ', labelHe: 'היאבקות / ג\'יו ג\'יטסו' },
    { value: 'self_defense', labelEn: 'Self-defense scenarios', labelHe: 'תרחישי הגנה עצמית' },
    { value: 'stress_inoculation', labelEn: 'Stress inoculation', labelHe: 'חיסון ללחץ' },
    { value: 'situational_awareness', labelEn: 'Situational awareness', labelHe: 'מודעות מצבית' },
  ],
  expansion: [
    { value: 'reading', labelEn: 'Reading & synthesis', labelHe: 'קריאה וסינתזה' },
    { value: 'creativity', labelEn: 'Creative output', labelHe: 'יצירתיות' },
    { value: 'languages', labelEn: 'Language acquisition', labelHe: 'רכישת שפות' },
    { value: 'philosophy', labelEn: 'Philosophy & frameworks', labelHe: 'פילוסופיה ומסגרות' },
    { value: 'writing', labelEn: 'Writing & articulation', labelHe: 'כתיבה וניסוח' },
  ],
  influence: [
    { value: 'communication', labelEn: 'Communication mastery', labelHe: 'שליטה בתקשורת' },
    { value: 'leadership', labelEn: 'Leadership skills', labelHe: 'מנהיגות' },
    { value: 'charisma', labelEn: 'Charisma & presence', labelHe: 'כריזמה ונוכחות' },
    { value: 'persuasion', labelEn: 'Persuasion & negotiation', labelHe: 'שכנוע ומשא ומתן' },
    { value: 'relationships', labelEn: 'Relationship building', labelHe: 'בניית מערכות יחסים' },
  ],
};

export function getIntakeSteps(domainId: string): IntakeStep[] {
  const tools = TOOLS_MAP[domainId] ?? TOOLS_MAP.focus;
  const subFocus = SUB_FOCUS_MAP[domainId] ?? SUB_FOCUS_MAP.focus;

  return [
    {
      id: 'current_level',
      fieldKey: 'current_level',
      type: 'single',
      titleEn: 'What\'s your current level?',
      titleHe: 'מה הרמה הנוכחית שלך?',
      subtitleEn: 'Be honest — this determines your starting point.',
      subtitleHe: 'תהיה כנה — זה קובע את נקודת ההתחלה שלך.',
      options: CURRENT_LEVEL_OPTIONS,
    },
    {
      id: 'available_time',
      fieldKey: 'available_time_per_day',
      type: 'single',
      titleEn: 'How much time can you commit daily?',
      titleHe: 'כמה זמן אתה יכול להקדיש ביום?',
      subtitleEn: 'Consistency beats intensity. Pick what you can sustain.',
      subtitleHe: 'עקביות מנצחת עוצמה. בחר מה שתוכל לשמר.',
      options: TIME_OPTIONS,
    },
    {
      id: 'tools',
      fieldKey: 'tools_available',
      type: 'multi',
      titleEn: 'What tools do you have available?',
      titleHe: 'אילו כלים יש לך?',
      subtitleEn: 'Select all that apply.',
      subtitleHe: 'בחר את כל מה שרלוונטי.',
      options: tools,
    },
    {
      id: 'sub_focus',
      fieldKey: 'sub_focus_areas',
      type: 'multi',
      titleEn: 'What do you want to focus on?',
      titleHe: 'על מה אתה רוצה להתמקד?',
      subtitleEn: 'Pick 1-3 areas to prioritize.',
      subtitleHe: 'בחר 1-3 תחומים לתעדוף.',
      options: subFocus,
    },
    {
      id: 'intensity',
      fieldKey: 'intensity_preference',
      type: 'single',
      titleEn: 'What intensity level do you want?',
      titleHe: 'איזו רמת עוצמה אתה רוצה?',
      subtitleEn: 'This affects task difficulty and pace.',
      subtitleHe: 'זה משפיע על קושי המשימות והקצב.',
      options: INTENSITY_OPTIONS,
    },
    {
      id: 'goal',
      fieldKey: 'goal_description',
      type: 'text',
      titleEn: 'Describe your 90-day goal for this domain',
      titleHe: 'תאר את המטרה שלך ל-90 יום בתחום הזה',
      subtitleEn: 'What does success look like in 3 months?',
      subtitleHe: 'איך נראה הצלחה בעוד 3 חודשים?',
      placeholder: 'e.g. Lose 10kg, deadlift 2x bodyweight, clear skin...',
    },
    {
      id: 'constraints',
      fieldKey: 'constraints',
      type: 'text',
      titleEn: 'Any constraints or limitations?',
      titleHe: 'יש מגבלות או אילוצים?',
      subtitleEn: 'Injuries, schedule blocks, allergies, etc. Leave empty if none.',
      subtitleHe: 'פציעות, חסימות בזמן, אלרגיות וכו\'. השאר ריק אם אין.',
      placeholder: 'e.g. Bad knee, work 9-5, vegetarian...',
    },
  ];
}
