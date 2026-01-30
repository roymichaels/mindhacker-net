import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Lock, Sparkles, Check } from 'lucide-react';

interface PersonalProfileStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting?: boolean;
  rewards?: { xp: number; tokens: number; unlock: string };
}

interface ProfileData {
  // Demographics
  age_group: string;
  gender: string;
  relationship_status: string;
  children: string;
  living_situation: string;
  employment_status: string;
  
  // Physical
  height_cm: number;
  weight_kg: number;
  
  // Health & Habits
  diet: string;
  sleep_hours: string;
  exercise_frequency: string;
  exercise_types: string[];
  smoking: string[];
  alcohol: string;
  caffeine: string;
  hydration: string[];
  supplements: string[];
  
  // Mental & Emotional
  stress_level: string;
  meditation_practice: string;
  therapy_experience: string;
  challenge_response: string;
  energy_source: string[];
  relaxation_methods: string[];
  
  // Interests & Hobbies
  hobbies: string[];
  reading_habits: string;
  
  // Social & Lifestyle
  social_preference: string;
  morning_evening: string;
  learning_style: string;
  communication_style: string;
  life_approach: string;
  decision_making: string;
  change_attitude: string;
  
  // Goals & Values
  life_priorities: string[];
  spiritual_practice: string;
  growth_focus: string[];
}

const STORAGE_KEY = 'launchpad_personal_profile';

type CategoryKey = keyof typeof CATEGORIES;
type MultiSelectCategory = 'exercise_types' | 'smoking' | 'supplements' | 'hydration' | 'hobbies' | 'life_priorities' | 'energy_source' | 'relaxation_methods' | 'growth_focus';

const CATEGORIES = {
  // === DEMOGRAPHICS ===
  age_group: {
    section: 'demographics',
    title: 'קבוצת גיל',
    titleEn: 'Age Group',
    icon: '🎂',
    multiSelect: false,
    options: [
      { value: '18-24', label: '18-24', labelEn: '18-24' },
      { value: '25-34', label: '25-34', labelEn: '25-34' },
      { value: '35-44', label: '35-44', labelEn: '35-44' },
      { value: '45-54', label: '45-54', labelEn: '45-54' },
      { value: '55+', label: '55+', labelEn: '55+' },
    ],
  },
  gender: {
    section: 'demographics',
    title: 'מין',
    titleEn: 'Gender',
    icon: '👤',
    multiSelect: false,
    options: [
      { value: 'male', label: 'גבר', labelEn: 'Male' },
      { value: 'female', label: 'אישה', labelEn: 'Female' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },
  relationship_status: {
    section: 'demographics',
    title: 'מצב משפחתי',
    titleEn: 'Relationship Status',
    icon: '💑',
    multiSelect: false,
    options: [
      { value: 'single', label: 'רווק/ה', labelEn: 'Single' },
      { value: 'dating', label: 'בזוגיות', labelEn: 'Dating' },
      { value: 'married', label: 'נשוי/אה', labelEn: 'Married' },
      { value: 'divorced', label: 'גרוש/ה', labelEn: 'Divorced' },
      { value: 'complicated', label: 'מסובך', labelEn: 'Complicated' },
    ],
  },
  children: {
    section: 'demographics',
    title: 'ילדים',
    titleEn: 'Children',
    icon: '👶',
    multiSelect: false,
    options: [
      { value: 'none', label: 'אין', labelEn: 'None' },
      { value: '1', label: '1', labelEn: '1' },
      { value: '2', label: '2', labelEn: '2' },
      { value: '3+', label: '3+', labelEn: '3+' },
      { value: 'expecting', label: 'מצפה', labelEn: 'Expecting' },
    ],
  },
  living_situation: {
    section: 'demographics',
    title: 'מגורים',
    titleEn: 'Living Situation',
    icon: '🏠',
    multiSelect: false,
    options: [
      { value: 'alone', label: 'לבד', labelEn: 'Alone' },
      { value: 'with-partner', label: 'עם בן/ת זוג', labelEn: 'With partner' },
      { value: 'with-family', label: 'עם משפחה', labelEn: 'With family' },
      { value: 'with-roommates', label: 'עם שותפים', labelEn: 'With roommates' },
      { value: 'with-parents', label: 'עם הורים', labelEn: 'With parents' },
    ],
  },
  employment_status: {
    section: 'demographics',
    title: 'תעסוקה',
    titleEn: 'Employment',
    icon: '💼',
    multiSelect: false,
    options: [
      { value: 'employed', label: 'שכיר', labelEn: 'Employed' },
      { value: 'self-employed', label: 'עצמאי', labelEn: 'Self-employed' },
      { value: 'student', label: 'סטודנט', labelEn: 'Student' },
      { value: 'unemployed', label: 'לא עובד', labelEn: 'Unemployed' },
      { value: 'retired', label: 'פנסיונר', labelEn: 'Retired' },
    ],
  },

  // === HEALTH & HABITS ===
  diet: {
    section: 'health',
    title: 'סוג תזונה',
    titleEn: 'Diet Type',
    icon: '🍽️',
    multiSelect: false,
    options: [
      { value: 'regular', label: 'רגיל', labelEn: 'Regular' },
      { value: 'vegetarian', label: 'צמחוני', labelEn: 'Vegetarian' },
      { value: 'vegan', label: 'טבעוני', labelEn: 'Vegan' },
      { value: 'alkaline-vegan', label: 'טבעוני אלקלייני', labelEn: 'Alkaline Vegan' },
      { value: 'raw-vegan', label: 'גלם טבעוני', labelEn: 'Raw Vegan' },
      { value: 'keto', label: 'קטו', labelEn: 'Keto' },
      { value: 'carnivore', label: 'קרניבור', labelEn: 'Carnivore' },
      { value: 'paleo', label: 'פליאו', labelEn: 'Paleo' },
      { value: 'mediterranean', label: 'ים תיכוני', labelEn: 'Mediterranean' },
      { value: 'gluten-free', label: 'ללא גלוטן', labelEn: 'Gluten-Free' },
      { value: 'sugar-free', label: 'ללא סוכר', labelEn: 'Sugar-Free' },
      { value: 'intuitive', label: 'אינטואיטיבי', labelEn: 'Intuitive' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },
  sleep_hours: {
    section: 'health',
    title: 'שעות שינה',
    titleEn: 'Sleep Hours',
    icon: '😴',
    multiSelect: false,
    options: [
      { value: 'less-than-5', label: 'פחות מ-5', labelEn: 'Less than 5' },
      { value: '5-6', label: '5-6', labelEn: '5-6' },
      { value: '6-7', label: '6-7', labelEn: '6-7' },
      { value: '7-8', label: '7-8', labelEn: '7-8' },
      { value: 'more-than-8', label: 'יותר מ-8', labelEn: 'More than 8' },
    ],
  },
  exercise_frequency: {
    section: 'health',
    title: 'תדירות אימונים',
    titleEn: 'Exercise Frequency',
    icon: '💪',
    multiSelect: false,
    options: [
      { value: 'never', label: 'אף פעם', labelEn: 'Never' },
      { value: '1-2/week', label: '1-2/שבוע', labelEn: '1-2/week' },
      { value: '3-4/week', label: '3-4/שבוע', labelEn: '3-4/week' },
      { value: '5-6/week', label: '5-6/שבוע', labelEn: '5-6/week' },
      { value: 'daily', label: 'כל יום', labelEn: 'Daily' },
    ],
  },
  exercise_types: {
    section: 'health',
    title: 'סוגי אימונים',
    titleEn: 'Exercise Types',
    icon: '🏋️',
    multiSelect: true,
    options: [
      { value: 'gym', label: 'חדר כושר', labelEn: 'Gym' },
      { value: 'running', label: 'ריצה', labelEn: 'Running' },
      { value: 'swimming', label: 'שחייה', labelEn: 'Swimming' },
      { value: 'yoga', label: 'יוגה', labelEn: 'Yoga' },
      { value: 'pilates', label: 'פילאטיס', labelEn: 'Pilates' },
      { value: 'calisthenics', label: 'קליסטניקס', labelEn: 'Calisthenics' },
      { value: 'crossfit', label: 'קרוספיט', labelEn: 'CrossFit' },
      { value: 'martial-arts', label: 'אומנויות לחימה', labelEn: 'Martial Arts' },
      { value: 'cycling', label: 'רכיבה', labelEn: 'Cycling' },
      { value: 'hiking', label: 'טיולים', labelEn: 'Hiking' },
      { value: 'dancing', label: 'ריקוד', labelEn: 'Dancing' },
      { value: 'climbing', label: 'טיפוס', labelEn: 'Climbing' },
      { value: 'tai-chi', label: 'טאי צ\'י', labelEn: 'Tai Chi' },
      { value: 'power-walking', label: 'הליכה מהירה', labelEn: 'Power Walking' },
      { value: 'team-sports', label: 'ספורט קבוצתי', labelEn: 'Team Sports' },
      { value: 'none', label: 'לא מתאמן', labelEn: 'None' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },
  smoking: {
    section: 'health',
    title: 'עישון',
    titleEn: 'Smoking',
    icon: '🚬',
    multiSelect: true,
    options: [
      { value: 'none', label: 'לא מעשן', labelEn: 'None' },
      { value: 'cigarettes', label: 'סיגריות', labelEn: 'Cigarettes' },
      { value: 'vape', label: 'וייפ', labelEn: 'Vape' },
      { value: 'cannabis', label: 'קנאביס', labelEn: 'Cannabis' },
      { value: 'hookah', label: 'נרגילה', labelEn: 'Hookah' },
    ],
  },
  alcohol: {
    section: 'health',
    title: 'אלכוהול',
    titleEn: 'Alcohol',
    icon: '🍷',
    multiSelect: false,
    options: [
      { value: 'none', label: 'לא שותה', labelEn: 'None' },
      { value: 'rarely', label: 'נדיר', labelEn: 'Rarely' },
      { value: 'sometimes', label: 'לפעמים', labelEn: 'Sometimes' },
      { value: 'weekends', label: 'סופ"ש', labelEn: 'Weekends' },
      { value: 'often', label: 'הרבה', labelEn: 'Often' },
    ],
  },
  caffeine: {
    section: 'health',
    title: 'קפאין',
    titleEn: 'Caffeine',
    icon: '☕',
    multiSelect: false,
    options: [
      { value: 'none', label: 'בלי', labelEn: 'None' },
      { value: '1-2/day', label: '1-2/יום', labelEn: '1-2/day' },
      { value: '3-4/day', label: '3-4/יום', labelEn: '3-4/day' },
      { value: '5+/day', label: '5+/יום', labelEn: '5+/day' },
    ],
  },
  hydration: {
    section: 'health',
    title: 'שתייה יומית (הידרציה)',
    titleEn: 'Daily Hydration',
    icon: '💧',
    multiSelect: true,
    options: [
      { value: 'water', label: 'מים', labelEn: 'Water' },
      { value: 'natural-juice', label: 'מיצים טבעיים', labelEn: 'Natural Juices' },
      { value: 'coconut-water', label: 'מי קוקוס', labelEn: 'Coconut Water' },
      { value: 'herbal-tea', label: 'תה צמחים', labelEn: 'Herbal Tea' },
      { value: 'green-smoothies', label: 'שייקים ירוקים', labelEn: 'Green Smoothies' },
      { value: 'electrolytes', label: 'משקאות אלקטרוליטים', labelEn: 'Electrolyte Drinks' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },
  supplements: {
    section: 'health',
    title: 'תוספי תזונה',
    titleEn: 'Supplements',
    icon: '💊',
    multiSelect: true,
    options: [
      { value: 'none', label: 'לא לוקח', labelEn: 'None' },
      { value: 'vitamins', label: 'ויטמינים', labelEn: 'Vitamins' },
      { value: 'protein', label: 'חלבון', labelEn: 'Protein' },
      { value: 'creatine', label: 'קריאטין', labelEn: 'Creatine' },
      { value: 'omega3', label: 'אומגה 3', labelEn: 'Omega 3' },
      { value: 'probiotics', label: 'פרוביוטיקה', labelEn: 'Probiotics' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },

  // === MENTAL & EMOTIONAL ===
  stress_level: {
    section: 'mental',
    title: 'רמת סטרס',
    titleEn: 'Stress Level',
    icon: '😰',
    multiSelect: false,
    options: [
      { value: 'very-low', label: 'נמוכה מאוד', labelEn: 'Very Low' },
      { value: 'low', label: 'נמוכה', labelEn: 'Low' },
      { value: 'medium', label: 'בינונית', labelEn: 'Medium' },
      { value: 'high', label: 'גבוהה', labelEn: 'High' },
      { value: 'very-high', label: 'גבוהה מאוד', labelEn: 'Very High' },
    ],
  },
  meditation_practice: {
    section: 'mental',
    title: 'מדיטציה',
    titleEn: 'Meditation',
    icon: '🧘',
    multiSelect: false,
    options: [
      { value: 'never', label: 'אף פעם', labelEn: 'Never' },
      { value: 'tried', label: 'ניסיתי', labelEn: 'Tried before' },
      { value: 'sometimes', label: 'לפעמים', labelEn: 'Sometimes' },
      { value: 'regular', label: 'באופן קבוע', labelEn: 'Regularly' },
      { value: 'daily', label: 'כל יום', labelEn: 'Daily' },
    ],
  },
  therapy_experience: {
    section: 'mental',
    title: 'ניסיון בטיפול',
    titleEn: 'Therapy Experience',
    icon: '🛋️',
    multiSelect: false,
    options: [
      { value: 'never', label: 'אף פעם', labelEn: 'Never' },
      { value: 'past', label: 'בעבר', labelEn: 'In the past' },
      { value: 'current', label: 'כרגע', labelEn: 'Currently' },
      { value: 'interested', label: 'מתעניין', labelEn: 'Interested' },
    ],
  },

  // === MENTAL & EMOTIONAL (continued) ===
  challenge_response: {
    section: 'mental',
    title: 'איך אתה מגיב לאתגרים?',
    titleEn: 'How do you respond to challenges?',
    icon: '💪',
    multiSelect: false,
    options: [
      { value: 'head-on', label: 'ישר פונה לפתרון', labelEn: 'Head-on' },
      { value: 'reflect', label: 'קודם חושב', labelEn: 'Reflect first' },
      { value: 'avoid', label: 'נוטה להימנע', labelEn: 'Tend to avoid' },
      { value: 'seek-help', label: 'מבקש עזרה', labelEn: 'Seek help' },
      { value: 'adapt', label: 'מסתגל', labelEn: 'Adapt' },
    ],
  },
  energy_source: {
    section: 'mental',
    title: 'מה נותן לך אנרגיה?',
    titleEn: 'What gives you energy?',
    icon: '⚡',
    multiSelect: true,
    options: [
      { value: 'people', label: 'אנשים', labelEn: 'People' },
      { value: 'solitude', label: 'זמן לבד', labelEn: 'Solitude' },
      { value: 'nature', label: 'טבע', labelEn: 'Nature' },
      { value: 'creativity', label: 'יצירה', labelEn: 'Creativity' },
      { value: 'learning', label: 'למידה', labelEn: 'Learning' },
      { value: 'achievement', label: 'הישגים', labelEn: 'Achievement' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },
  relaxation_methods: {
    section: 'mental',
    title: 'מה מרגיע אותך?',
    titleEn: 'What relaxes you?',
    icon: '🌿',
    multiSelect: true,
    options: [
      { value: 'music', label: 'מוזיקה', labelEn: 'Music' },
      { value: 'nature', label: 'טבע', labelEn: 'Nature' },
      { value: 'exercise', label: 'פעילות גופנית', labelEn: 'Exercise' },
      { value: 'meditation', label: 'מדיטציה', labelEn: 'Meditation' },
      { value: 'social', label: 'חברים/משפחה', labelEn: 'Friends/Family' },
      { value: 'alone', label: 'זמן לבד', labelEn: 'Alone time' },
      { value: 'hobbies', label: 'תחביבים', labelEn: 'Hobbies' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },

  // === INTERESTS & HOBBIES ===
  hobbies: {
    section: 'interests',
    title: 'תחביבים',
    titleEn: 'Hobbies',
    icon: '🎨',
    multiSelect: true,
    options: [
      { value: 'reading', label: 'קריאה', labelEn: 'Reading' },
      { value: 'gaming', label: 'גיימינג', labelEn: 'Gaming' },
      { value: 'cooking', label: 'בישול', labelEn: 'Cooking' },
      { value: 'music', label: 'נגינה/האזנה', labelEn: 'Music' },
      { value: 'art', label: 'אמנות', labelEn: 'Art' },
      { value: 'photography', label: 'צילום', labelEn: 'Photography' },
      { value: 'travel', label: 'טיולים', labelEn: 'Travel' },
      { value: 'diy', label: 'עשה זאת בעצמך', labelEn: 'DIY' },
      { value: 'gardening', label: 'גינון', labelEn: 'Gardening' },
      { value: 'writing', label: 'כתיבה', labelEn: 'Writing' },
      { value: 'podcasts', label: 'פודקאסטים', labelEn: 'Podcasts' },
      { value: 'movies', label: 'סרטים/סדרות', labelEn: 'Movies/Shows' },
      { value: 'sports-watching', label: 'צפייה בספורט', labelEn: 'Watching Sports' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },
  reading_habits: {
    section: 'interests',
    title: 'קריאת ספרים (לא לימודי)',
    titleEn: 'Book Reading (non-academic)',
    description: 'ספרי פיתוח עצמי, בדיוני, ביוגרפיות וכו׳',
    descriptionEn: 'Self-help, fiction, biographies, etc.',
    icon: '📚',
    multiSelect: false,
    options: [
      { value: 'never', label: 'לא קורא', labelEn: 'Never read' },
      { value: 'rarely', label: 'נדיר', labelEn: 'Rarely' },
      { value: 'sometimes', label: 'לפעמים', labelEn: 'Sometimes' },
      { value: 'often', label: 'הרבה', labelEn: 'Often' },
      { value: 'daily', label: 'כל יום', labelEn: 'Daily' },
    ],
  },

  // === SOCIAL & LIFESTYLE ===
  social_preference: {
    section: 'social',
    title: 'העדפה חברתית',
    titleEn: 'Social Preference',
    icon: '👥',
    multiSelect: false,
    options: [
      { value: 'introvert', label: 'מופנם', labelEn: 'Introvert' },
      { value: 'ambivert', label: 'באמצע', labelEn: 'Ambivert' },
      { value: 'extrovert', label: 'מוחצן', labelEn: 'Extrovert' },
    ],
  },
  morning_evening: {
    section: 'social',
    title: 'בוקר או ערב',
    titleEn: 'Morning or Evening',
    icon: '🌅',
    multiSelect: false,
    options: [
      { value: 'early-bird', label: 'ציפור מוקדמת', labelEn: 'Early Bird' },
      { value: 'flexible', label: 'גמיש', labelEn: 'Flexible' },
      { value: 'night-owl', label: 'ינשוף לילה', labelEn: 'Night Owl' },
    ],
  },
  learning_style: {
    section: 'social',
    title: 'סגנון למידה',
    titleEn: 'Learning Style',
    icon: '📖',
    multiSelect: false,
    options: [
      { value: 'visual', label: 'ויזואלי', labelEn: 'Visual' },
      { value: 'auditory', label: 'שמיעתי', labelEn: 'Auditory' },
      { value: 'reading', label: 'קריאה', labelEn: 'Reading/Writing' },
      { value: 'kinesthetic', label: 'מעשי', labelEn: 'Kinesthetic' },
    ],
  },
  communication_style: {
    section: 'social',
    title: 'סגנון תקשורת',
    titleEn: 'Communication Style',
    icon: '💬',
    multiSelect: false,
    options: [
      { value: 'direct', label: 'ישיר', labelEn: 'Direct' },
      { value: 'diplomatic', label: 'דיפלומטי', labelEn: 'Diplomatic' },
      { value: 'analytical', label: 'אנליטי', labelEn: 'Analytical' },
      { value: 'emotional', label: 'רגשי', labelEn: 'Emotional' },
    ],
  },
  life_approach: {
    section: 'social',
    title: 'גישה לחיים',
    titleEn: 'Life Approach',
    icon: '🧭',
    multiSelect: false,
    options: [
      { value: 'optimistic', label: 'אופטימי', labelEn: 'Optimistic' },
      { value: 'realistic', label: 'ריאליסטי', labelEn: 'Realistic' },
      { value: 'cautious', label: 'זהיר', labelEn: 'Cautious' },
      { value: 'adventurous', label: 'הרפתקני', labelEn: 'Adventurous' },
      { value: 'philosophical', label: 'פילוסופי', labelEn: 'Philosophical' },
    ],
  },
  decision_making: {
    section: 'social',
    title: 'איך אתה מקבל החלטות?',
    titleEn: 'How do you make decisions?',
    icon: '🤔',
    multiSelect: false,
    options: [
      { value: 'intuition', label: 'אינטואיציה', labelEn: 'Intuition' },
      { value: 'analysis', label: 'ניתוח', labelEn: 'Analysis' },
      { value: 'feelings', label: 'רגשות', labelEn: 'Feelings' },
      { value: 'advice', label: 'עצות מאחרים', labelEn: 'Others\' advice' },
      { value: 'mixed', label: 'משולב', labelEn: 'Mixed' },
    ],
  },
  change_attitude: {
    section: 'social',
    title: 'יחס לשינויים',
    titleEn: 'Attitude to Change',
    icon: '🔄',
    multiSelect: false,
    options: [
      { value: 'embrace', label: 'מחבק שינויים', labelEn: 'Embrace change' },
      { value: 'cautious', label: 'זהיר עם שינויים', labelEn: 'Cautious about change' },
      { value: 'resist', label: 'מעדיף יציבות', labelEn: 'Prefer stability' },
      { value: 'depends', label: 'תלוי בסיטואציה', labelEn: 'Depends on situation' },
    ],
  },

  // === GOALS & VALUES ===
  life_priorities: {
    section: 'values',
    title: 'עדיפויות בחיים (בחר עד 3)',
    titleEn: 'Life Priorities (pick up to 3)',
    icon: '🎯',
    multiSelect: true,
    maxSelect: 3,
    options: [
      { value: 'career', label: 'קריירה', labelEn: 'Career' },
      { value: 'family', label: 'משפחה', labelEn: 'Family' },
      { value: 'health', label: 'בריאות', labelEn: 'Health' },
      { value: 'wealth', label: 'עושר', labelEn: 'Wealth' },
      { value: 'relationships', label: 'מערכות יחסים', labelEn: 'Relationships' },
      { value: 'personal-growth', label: 'צמיחה אישית', labelEn: 'Personal Growth' },
      { value: 'creativity', label: 'יצירתיות', labelEn: 'Creativity' },
      { value: 'adventure', label: 'הרפתקאות', labelEn: 'Adventure' },
      { value: 'spirituality', label: 'רוחניות', labelEn: 'Spirituality' },
      { value: 'contribution', label: 'תרומה לחברה', labelEn: 'Contribution' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },
  spiritual_practice: {
    section: 'values',
    title: 'פרקטיקה רוחנית',
    titleEn: 'Spiritual Practice',
    icon: '🙏',
    multiSelect: false,
    options: [
      { value: 'none', label: 'לא', labelEn: 'None' },
      { value: 'secular', label: 'חילוני', labelEn: 'Secular' },
      { value: 'traditional', label: 'מסורתי', labelEn: 'Traditional' },
      { value: 'religious', label: 'דתי', labelEn: 'Religious' },
      { value: 'spiritual', label: 'רוחני חופשי', labelEn: 'Spiritual' },
    ],
  },
  growth_focus: {
    section: 'values',
    title: 'במה אתה רוצה לצמוח? (בחר עד 3)',
    titleEn: 'Where do you want to grow? (pick up to 3)',
    icon: '🌱',
    multiSelect: true,
    maxSelect: 3,
    options: [
      { value: 'confidence', label: 'ביטחון עצמי', labelEn: 'Self-confidence' },
      { value: 'discipline', label: 'משמעת', labelEn: 'Discipline' },
      { value: 'emotional', label: 'אינטליגנציה רגשית', labelEn: 'Emotional intelligence' },
      { value: 'communication', label: 'תקשורת', labelEn: 'Communication' },
      { value: 'leadership', label: 'מנהיגות', labelEn: 'Leadership' },
      { value: 'creativity', label: 'יצירתיות', labelEn: 'Creativity' },
      { value: 'mindfulness', label: 'מודעות עצמית', labelEn: 'Mindfulness' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },
} as const;

const SECTIONS = [
  { key: 'demographics', title: 'פרטים אישיים', titleEn: 'Personal Details', icon: '👤' },
  { key: 'health', title: 'בריאות והרגלים', titleEn: 'Health & Habits', icon: '❤️' },
  { key: 'mental', title: 'נפש ורגש', titleEn: 'Mental & Emotional', icon: '🧠' },
  { key: 'interests', title: 'תחומי עניין', titleEn: 'Interests & Hobbies', icon: '🎨' },
  { key: 'social', title: 'חברתי ואורח חיים', titleEn: 'Social & Lifestyle', icon: '🌍' },
  { key: 'values', title: 'ערכים ומטרות', titleEn: 'Values & Goals', icon: '⭐' },
];

const CATEGORY_ORDER: CategoryKey[] = [
  // Demographics
  'age_group', 'gender', 'relationship_status', 'children', 'living_situation', 'employment_status',
  // Health
  'diet', 'sleep_hours', 'exercise_frequency', 'exercise_types', 'smoking', 'alcohol', 'caffeine', 'hydration', 'supplements',
  // Mental
  'stress_level', 'meditation_practice', 'therapy_experience', 'challenge_response', 'energy_source', 'relaxation_methods',
  // Interests
  'hobbies', 'reading_habits',
  // Social
  'social_preference', 'morning_evening', 'learning_style', 'communication_style', 'life_approach', 'decision_making', 'change_attitude',
  // Values
  'life_priorities', 'spiritual_practice', 'growth_focus',
];

const getDefaultProfileData = (): ProfileData => ({
  age_group: '',
  gender: '',
  relationship_status: '',
  children: '',
  living_situation: '',
  employment_status: '',
  height_cm: 170,
  weight_kg: 70,
  diet: '',
  sleep_hours: '',
  exercise_frequency: '',
  exercise_types: [],
  smoking: [],
  alcohol: '',
  caffeine: '',
  hydration: [],
  supplements: [],
  stress_level: '',
  meditation_practice: '',
  therapy_experience: '',
  challenge_response: '',
  energy_source: [],
  relaxation_methods: [],
  hobbies: [],
  reading_habits: '',
  social_preference: '',
  morning_evening: '',
  learning_style: '',
  communication_style: '',
  life_approach: '',
  decision_making: '',
  change_attitude: '',
  life_priorities: [],
  spiritual_practice: '',
  growth_focus: [],
});

export function PersonalProfileStep({ onComplete, isCompleting, rewards }: PersonalProfileStepProps) {
  const { language, isRTL } = useTranslation();
  
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...getDefaultProfileData(), ...parsed };
      } catch {
        // fallback to defaults
      }
    }
    return getDefaultProfileData();
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
  }, [profileData]);

  const handleSingleSelect = (category: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [category]: value }));
  };

  const handleMultiSelect = (category: MultiSelectCategory, value: string, maxSelect?: number) => {
    setProfileData(prev => {
      const current = prev[category] as string[];
      
      // If selecting "none", clear all others
      if (value === 'none') {
        return { ...prev, [category]: ['none'] };
      }
      
      // If selecting something else, remove "none"
      let newValues = current.filter(v => v !== 'none');
      
      if (newValues.includes(value)) {
        newValues = newValues.filter(v => v !== value);
      } else {
        // Check max select limit
        if (maxSelect && newValues.length >= maxSelect) {
          return prev; // Don't add more
        }
        newValues = [...newValues, value];
      }
      
      return { ...prev, [category]: newValues.length ? newValues : [] };
    });
  };

  const handleSlider = (key: 'height_cm' | 'weight_kg', value: number[]) => {
    setProfileData(prev => ({ ...prev, [key]: value[0] }));
  };

  // Calculate completeness (at least 10 categories filled)
  const filledCategories = CATEGORY_ORDER.filter(key => {
    const value = profileData[key];
    if (Array.isArray(value)) return value.length > 0;
    return value !== '';
  }).length;
  
  const minRequired = 10;
  const canComplete = filledCategories >= minRequired;

  const handleComplete = () => {
    if (!canComplete) return;
    
    localStorage.removeItem(STORAGE_KEY);
    onComplete(profileData as unknown as Record<string, unknown>);
  };

  // Group categories by section
  const getCategoriesBySection = (sectionKey: string) => {
    return CATEGORY_ORDER.filter(key => CATEGORIES[key].section === sectionKey);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-3xl mb-2">
          👤
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'פרופיל אישי מלא' : 'Complete Personal Profile'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {language === 'he' 
            ? 'ככל שנדע עליך יותר, נוכל להתאים לך את החוויה בצורה מדויקת יותר'
            : 'The more we know about you, the better we can personalize your experience'}
        </p>
      </div>

      {/* Privacy Notice */}
      <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">
            {language === 'he' 
              ? '🔒 המידע הזה נשאר רק בינינו. אנחנו לא משתפים עם אף אחד, כולל לא עם המשטרה. הכל כאן כדי שנוכל לעזור לך בצורה הכי מדויקת.'
              : '🔒 This information stays between us. We don\'t share with anyone, including law enforcement. Everything here is to help you in the most accurate way.'}
          </p>
        </div>
      </Card>

      {/* Sections */}
      <div className="space-y-8">
        {SECTIONS.map((section) => {
          const sectionCategories = getCategoriesBySection(section.key);
          if (sectionCategories.length === 0) return null;
          
          return (
            <div key={section.key} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-2 pb-2 border-b">
                <span className="text-2xl">{section.icon}</span>
                <h3 className="text-lg font-semibold">
                  {language === 'he' ? section.title : section.titleEn}
                </h3>
              </div>
              
              {/* Categories in this section */}
              <div className="space-y-5">
                {sectionCategories.map((categoryKey) => {
                  const category = CATEGORIES[categoryKey];
                  const value = profileData[categoryKey];
                  const maxSelect = 'maxSelect' in category ? category.maxSelect : undefined;
                  
                  return (
                    <div key={categoryKey} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <h4 className="font-medium text-sm">
                          {language === 'he' ? category.title : category.titleEn}
                        </h4>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {category.options.map((option) => {
                          const isSelected = category.multiSelect
                            ? (value as string[]).includes(option.value)
                            : value === option.value;
                          
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                if (category.multiSelect) {
                                  handleMultiSelect(categoryKey as MultiSelectCategory, option.value, maxSelect);
                                } else {
                                  handleSingleSelect(categoryKey, option.value);
                                }
                              }}
                              className={cn(
                                "relative flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all min-w-fit text-sm",
                                isSelected 
                                  ? "bg-primary text-primary-foreground shadow-md" 
                                  : "bg-muted/50 hover:bg-muted border border-muted-foreground/20"
                              )}
                            >
                              {isSelected && (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span className="font-medium">
                                {language === 'he' ? option.label : option.labelEn}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Height & Weight Sliders */}
        <div className="space-y-6 pt-4 border-t">
          <div className="flex items-center gap-2 pb-2">
            <span className="text-2xl">📏</span>
            <h3 className="text-lg font-semibold">
              {language === 'he' ? 'מידות גוף' : 'Body Measurements'}
            </h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {language === 'he' ? 'גובה' : 'Height'}
                </span>
                <span className="text-lg font-semibold text-primary">
                  {profileData.height_cm} {language === 'he' ? 'ס"מ' : 'cm'}
                </span>
              </div>
              <Slider
                value={[profileData.height_cm]}
                onValueChange={(v) => handleSlider('height_cm', v)}
                min={140}
                max={220}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {language === 'he' ? 'משקל' : 'Weight'}
                </span>
                <span className="text-lg font-semibold text-primary">
                  {profileData.weight_kg} {language === 'he' ? 'ק"ג' : 'kg'}
                </span>
              </div>
              <Slider
                value={[profileData.weight_kg]}
                onValueChange={(v) => handleSlider('weight_kg', v)}
                min={40}
                max={180}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Complete Button */}
      <div className="space-y-4 pt-4 sticky bottom-0 bg-background/95 backdrop-blur pb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {language === 'he' 
              ? `${filledCategories}/${CATEGORY_ORDER.length} קטגוריות`
              : `${filledCategories}/${CATEGORY_ORDER.length} categories`}
          </span>
          {!canComplete && (
            <span className="text-amber-500">
              {language === 'he' 
                ? `מלא לפחות ${minRequired} קטגוריות`
                : `Fill at least ${minRequired} categories`}
            </span>
          )}
        </div>

        <Button
          onClick={handleComplete}
          disabled={!canComplete || isCompleting}
          className="w-full h-12 text-base gap-2"
          size="lg"
        >
          {isCompleting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {language === 'he' ? 'המשך' : 'Continue'}
              {rewards && rewards.xp > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  +{rewards.xp} XP
                </span>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default PersonalProfileStep;
