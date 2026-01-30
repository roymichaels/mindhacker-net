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
  energy_source: string[];
  relaxation_methods: string[];
  
  // Interests & Hobbies
  hobbies: string[];
  reading_habits: string;
  
  // Situational & Behavioral
  conflict_handling: string;
  problem_approach: string;
  decision_style: string;
  opportunity_response: string;
  failure_response: string;
  time_management: string;
  relationship_style: string;
  
  // Social & Lifestyle
  social_preference: string;
  morning_evening: string;
  learning_style: string;
  
  // Goals & Values
  life_priorities: string[];
  spiritual_practice: string;
  growth_focus: string[];
  obstacles: string[];
}

const STORAGE_KEY = 'launchpad_personal_profile';

type CategoryKey = keyof typeof CATEGORIES;
type MultiSelectCategory = 'exercise_types' | 'smoking' | 'supplements' | 'hydration' | 'hobbies' | 'life_priorities' | 'energy_source' | 'relaxation_methods' | 'growth_focus' | 'obstacles';

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
      { value: 'with-partner-and-child', label: 'עם בן/ת זוג וילד', labelEn: 'With partner and child' },
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
      { value: 'music', label: 'מוזיקה', labelEn: 'Music' },
      { value: 'movement', label: 'תנועה', labelEn: 'Movement' },
      { value: 'helping-others', label: 'עזרה לאחרים', labelEn: 'Helping others' },
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
      { value: 'sleep', label: 'שינה', labelEn: 'Sleep' },
      { value: 'screens', label: 'מסכים (טלוויזיה/נטפליקס)', labelEn: 'Screens (TV/Netflix)' },
      { value: 'food', label: 'אוכל', labelEn: 'Food' },
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
      // 🎨 יצירה ואמנות
      { value: 'painting', label: 'ציור / צביעה', labelEn: 'Painting / Drawing' },
      { value: 'photography', label: 'צילום', labelEn: 'Photography' },
      { value: 'sketching', label: 'סריטוט / איור', labelEn: 'Sketching / Illustration' },
      { value: 'graphic-design', label: 'עיצוב גרפי', labelEn: 'Graphic Design' },
      { value: 'interior-design', label: 'עיצוב פנים', labelEn: 'Interior Design' },
      { value: 'creative-writing', label: 'כתיבה יוצרת', labelEn: 'Creative Writing' },
      { value: 'poetry', label: 'שירה', labelEn: 'Poetry' },
      { value: 'calligraphy', label: 'קליגרפיה', labelEn: 'Calligraphy' },
      { value: 'collage', label: 'קולאז\'', labelEn: 'Collage' },
      { value: 'sculpting', label: 'פיסול', labelEn: 'Sculpting' },
      
      // 🎵 מוזיקה
      { value: 'playing-instrument', label: 'נגינה (גיטרה, פסנתר...)', labelEn: 'Playing Instrument' },
      { value: 'singing', label: 'שירה', labelEn: 'Singing' },
      { value: 'music-production', label: 'הפקת מוזיקה', labelEn: 'Music Production' },
      { value: 'djing', label: 'DJ', labelEn: 'DJing' },
      { value: 'active-listening', label: 'האזנה פעילה למוזיקה', labelEn: 'Active Music Listening' },
      { value: 'live-concerts', label: 'הופעות חיות', labelEn: 'Live Concerts' },
      
      // 🏃 ספורט ותנועה
      { value: 'running', label: 'ריצה / הליכה', labelEn: 'Running / Walking' },
      { value: 'soccer', label: 'כדורגל', labelEn: 'Soccer' },
      { value: 'basketball', label: 'כדורסל', labelEn: 'Basketball' },
      { value: 'tennis', label: 'טניס / פאדל', labelEn: 'Tennis / Padel' },
      { value: 'swimming', label: 'שחייה', labelEn: 'Swimming' },
      { value: 'cycling', label: 'רכיבה על אופניים', labelEn: 'Cycling' },
      { value: 'yoga-hobby', label: 'יוגה / פילאטיס', labelEn: 'Yoga / Pilates' },
      { value: 'gym', label: 'חדר כושר', labelEn: 'Gym / Fitness' },
      { value: 'martial-arts', label: 'אומנויות לחימה', labelEn: 'Martial Arts' },
      { value: 'climbing', label: 'טיפוס', labelEn: 'Climbing' },
      { value: 'skiing', label: 'סקי / סנובורד', labelEn: 'Skiing / Snowboarding' },
      { value: 'surfing', label: 'גלישה', labelEn: 'Surfing' },
      { value: 'dancing', label: 'ריקוד', labelEn: 'Dancing' },
      
      // 🌿 טבע ואאוטדור
      { value: 'hiking', label: 'טיולים וטרקים', labelEn: 'Hiking & Trekking' },
      { value: 'camping', label: 'קמפינג', labelEn: 'Camping' },
      { value: 'fishing', label: 'דיג', labelEn: 'Fishing' },
      { value: 'birdwatching', label: 'צפרות', labelEn: 'Birdwatching' },
      { value: 'gardening', label: 'גינון', labelEn: 'Gardening' },
      { value: 'pet-care', label: 'טיפול בחיות', labelEn: 'Pet Care' },
      
      // 🍳 אוכל ומשקאות
      { value: 'cooking', label: 'בישול', labelEn: 'Cooking' },
      { value: 'baking', label: 'אפייה', labelEn: 'Baking' },
      { value: 'wine', label: 'יין ואלכוהול', labelEn: 'Wine & Alcohol' },
      { value: 'coffee', label: 'קפה', labelEn: 'Coffee' },
      { value: 'home-chef', label: 'שף ביתי', labelEn: 'Home Chef' },
      { value: 'ethnic-food', label: 'אוכל אתני', labelEn: 'Ethnic Cuisine' },
      
      // 🎮 בידור וטכנולוגיה
      { value: 'gaming', label: 'גיימינג', labelEn: 'Gaming' },
      { value: 'board-games', label: 'משחקי לוח', labelEn: 'Board Games' },
      { value: 'card-games', label: 'משחקי קלפים', labelEn: 'Card Games' },
      { value: 'puzzles', label: 'פאזלים', labelEn: 'Puzzles' },
      { value: 'coding', label: 'קידוד ותכנות', labelEn: 'Coding & Programming' },
      { value: 'electronics-diy', label: 'אלקטרוניקה DIY', labelEn: 'Electronics DIY' },
      { value: 'drones', label: 'דרונים', labelEn: 'Drones' },
      { value: 'robotics', label: 'רובוטיקה', labelEn: 'Robotics' },
      { value: '3d-printing', label: 'הדפסת 3D', labelEn: '3D Printing' },
      
      // 📚 למידה והשכלה
      { value: 'reading', label: 'קריאה', labelEn: 'Reading' },
      { value: 'language-learning', label: 'לימוד שפות', labelEn: 'Language Learning' },
      { value: 'history', label: 'היסטוריה', labelEn: 'History' },
      { value: 'science', label: 'מדע', labelEn: 'Science' },
      { value: 'philosophy', label: 'פילוסופיה', labelEn: 'Philosophy' },
      { value: 'psychology', label: 'פסיכולוגיה', labelEn: 'Psychology' },
      
      // 🎭 תרבות ובידור
      { value: 'movies', label: 'סרטים וסדרות', labelEn: 'Movies & TV Shows' },
      { value: 'theater', label: 'תיאטרון', labelEn: 'Theater' },
      { value: 'standup', label: 'סטנדאפ', labelEn: 'Stand-up Comedy' },
      { value: 'podcasts', label: 'פודקאסטים', labelEn: 'Podcasts' },
      { value: 'anime-manga', label: 'אנימה / מנגה', labelEn: 'Anime / Manga' },
      { value: 'cosplay', label: 'קוספליי', labelEn: 'Cosplay' },
      
      // 🧶 מלאכת יד
      { value: 'knitting', label: 'סריגה / סרוגה', labelEn: 'Knitting / Crocheting' },
      { value: 'sewing', label: 'תפירה', labelEn: 'Sewing' },
      { value: 'woodworking', label: 'עבודות עץ', labelEn: 'Woodworking' },
      { value: 'ceramics', label: 'קרמיקה', labelEn: 'Ceramics' },
      { value: 'jewelry', label: 'תכשיטים', labelEn: 'Jewelry Making' },
      { value: 'miniatures', label: 'מיניאטורות', labelEn: 'Miniatures' },
      { value: 'leatherwork', label: 'עור', labelEn: 'Leatherwork' },
      
      // ✈️ נסיעות וחוויות
      { value: 'travel-abroad', label: 'טיולים בחו"ל', labelEn: 'Travel Abroad' },
      { value: 'travel-local', label: 'טיולים בארץ', labelEn: 'Local Travel' },
      { value: 'nightlife', label: 'מסיבות / חיי לילה', labelEn: 'Parties / Nightlife' },
      { value: 'cultural-events', label: 'אירועי תרבות', labelEn: 'Cultural Events' },
      { value: 'festivals', label: 'פסטיבלים', labelEn: 'Festivals' },
      
      // 🤝 חברתי וקהילתי
      { value: 'volunteering', label: 'התנדבות', labelEn: 'Volunteering' },
      { value: 'community', label: 'פעילות קהילתית', labelEn: 'Community Activity' },
      { value: 'mentoring', label: 'הדרכה / מנטורינג', labelEn: 'Mentoring / Coaching' },
      { value: 'clubs', label: 'מועדונים וקבוצות', labelEn: 'Clubs & Groups' },
      
      // 💡 אחר
      { value: 'collecting', label: 'אוסף (בולים, מטבעות...)', labelEn: 'Collecting (stamps, coins...)' },
      { value: 'astronomy', label: 'אסטרונומיה', labelEn: 'Astronomy' },
      { value: 'magic', label: 'קסמים', labelEn: 'Magic Tricks' },
      { value: 'feng-shui', label: 'פנג שואי', labelEn: 'Feng Shui' },
      { value: 'tarot', label: 'טארוט / מיסטיקה', labelEn: 'Tarot / Mysticism' },
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

  // === SITUATIONAL & BEHAVIORAL (New elegant questions) ===
  conflict_handling: {
    section: 'behavioral',
    title: 'כשיש לך דעה שונה מאחרים, אתה בדרך כלל...',
    titleEn: 'When you have a different opinion from others, you usually...',
    icon: '💬',
    multiSelect: false,
    options: [
      { value: 'direct', label: 'אומר ישר מה שאתה חושב', labelEn: 'Say exactly what you think' },
      { value: 'diplomatic', label: 'מנסה למצוא דרך עדינה לומר', labelEn: 'Try to find a gentle way to say it' },
      { value: 'thinks-first', label: 'חושב הרבה לפני שמגיב', labelEn: 'Think a lot before responding' },
      { value: 'avoids', label: 'מעדיף לא להיכנס לעימות', labelEn: 'Prefer not to engage in conflict' },
      { value: 'depends', label: 'תלוי במי מדובר', labelEn: 'Depends on who it is' },
    ],
  },
  problem_approach: {
    section: 'behavioral',
    title: 'כשאתה נתקל בבעיה בלתי צפויה...',
    titleEn: 'When you encounter an unexpected problem...',
    icon: '🔧',
    multiSelect: false,
    options: [
      { value: 'solve-immediately', label: 'מיד מתחיל לחפש פתרונות', labelEn: 'Immediately start looking for solutions' },
      { value: 'calm-first', label: 'קודם נרגע, אחר כך פותר', labelEn: 'First calm down, then solve' },
      { value: 'stressed', label: 'מרגיש לחץ עד שזה נפתר', labelEn: 'Feel stressed until it\'s resolved' },
      { value: 'opportunity', label: 'רואה בזה הזדמנות', labelEn: 'See it as an opportunity' },
      { value: 'seek-help', label: 'מחפש עזרה מאחרים', labelEn: 'Seek help from others' },
    ],
  },
  decision_style: {
    section: 'behavioral',
    title: 'כשיש לך החלטה גדולה לקבל, אתה...',
    titleEn: 'When you have a big decision to make, you...',
    icon: '🤔',
    multiSelect: false,
    options: [
      { value: 'gut', label: 'הולך עם הבטן', labelEn: 'Go with your gut' },
      { value: 'pros-cons', label: 'בונה רשימת יתרונות וחסרונות', labelEn: 'Make a pros and cons list' },
      { value: 'consult', label: 'שואל הרבה אנשים', labelEn: 'Ask many people' },
      { value: 'wait', label: 'מחכה שזה יתברר לבד', labelEn: 'Wait for it to become clear' },
      { value: 'procrastinate', label: 'דוחה עד הרגע האחרון', labelEn: 'Postpone until the last moment' },
    ],
  },
  opportunity_response: {
    section: 'behavioral',
    title: 'כשמציעים לך הזדמנות חדשה לא מתוכננת...',
    titleEn: 'When offered an unexpected new opportunity...',
    icon: '🚀',
    multiSelect: false,
    options: [
      { value: 'excited', label: 'נרגש ומתלהב מיד', labelEn: 'Get excited immediately' },
      { value: 'think-first', label: 'צריך זמן לחשוב על זה', labelEn: 'Need time to think about it' },
      { value: 'worried', label: 'חושש מהלא נודע', labelEn: 'Worried about the unknown' },
      { value: 'investigate', label: 'בודק את כל הפרטים קודם', labelEn: 'Check all the details first' },
      { value: 'consult', label: 'שואל לייעוץ מאנשים קרובים', labelEn: 'Ask close people for advice' },
    ],
  },
  failure_response: {
    section: 'behavioral',
    title: 'אחרי כישלון או אכזבה, אתה בדרך כלל...',
    titleEn: 'After a failure or disappointment, you usually...',
    icon: '💔',
    multiSelect: false,
    options: [
      { value: 'bounce-back', label: 'קם ומתחיל מחדש מהר', labelEn: 'Bounce back quickly' },
      { value: 'process', label: 'צריך זמן לעכל', labelEn: 'Need time to process' },
      { value: 'self-blame', label: 'מאשים את עצמך', labelEn: 'Blame yourself' },
      { value: 'learn', label: 'מחפש מה ללמוד מזה', labelEn: 'Look for what to learn from it' },
      { value: 'stuck', label: 'מתקשה להמשיך הלאה', labelEn: 'Struggle to move on' },
    ],
  },
  time_management: {
    section: 'behavioral',
    title: 'כשיש לך הרבה משימות...',
    titleEn: 'When you have many tasks...',
    icon: '⏰',
    multiSelect: false,
    options: [
      { value: 'organized', label: 'עושה רשימה ומסדר לפי חשיבות', labelEn: 'Make a list and prioritize' },
      { value: 'easy-first', label: 'מתחיל ממה שהכי קל', labelEn: 'Start with the easiest' },
      { value: 'overwhelmed', label: 'מרגיש מוצף', labelEn: 'Feel overwhelmed' },
      { value: 'last-minute', label: 'דוחה לרגע האחרון', labelEn: 'Postpone until the last moment' },
      { value: 'pressure-works', label: 'עובד טוב תחת לחץ', labelEn: 'Work well under pressure' },
    ],
  },
  relationship_style: {
    section: 'behavioral',
    title: 'ביחסים עם אנשים קרובים, אתה...',
    titleEn: 'In relationships with close people, you...',
    icon: '❤️',
    multiSelect: false,
    options: [
      { value: 'giver', label: 'נותן הרבה ומבקש מעט', labelEn: 'Give a lot and ask for little' },
      { value: 'needs-space', label: 'צריך הרבה זמן לבד', labelEn: 'Need a lot of alone time' },
      { value: 'deep-connection', label: 'מחפש חיבור עמוק', labelEn: 'Seek deep connection' },
      { value: 'cautious', label: 'נזהר להתקרב מדי', labelEn: 'Careful not to get too close' },
      { value: 'initiator', label: 'יוזם הרבה מפגשים', labelEn: 'Initiate many meetings' },
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

  // === GOALS & VALUES ===
  life_priorities: {
    section: 'values',
    title: 'עדיפויות בחיים',
    titleEn: 'Life Priorities',
    icon: '🎯',
    multiSelect: true,
    options: [
      { value: 'career', label: 'קריירה והצלחה מקצועית', labelEn: 'Career & Professional Success' },
      { value: 'family', label: 'משפחה וילדים', labelEn: 'Family & Children' },
      { value: 'health', label: 'בריאות ואורח חיים בריא', labelEn: 'Health & Healthy Lifestyle' },
      { value: 'wealth', label: 'ביטחון כלכלי ועושר', labelEn: 'Financial Security & Wealth' },
      { value: 'relationships', label: 'מערכות יחסים איכותיות', labelEn: 'Quality Relationships' },
      { value: 'personal-growth', label: 'צמיחה אישית והתפתחות', labelEn: 'Personal Growth & Development' },
      { value: 'freedom', label: 'חופש וגמישות', labelEn: 'Freedom & Flexibility' },
      { value: 'creativity', label: 'יצירתיות וביטוי עצמי', labelEn: 'Creativity & Self-expression' },
      { value: 'adventure', label: 'הרפתקאות וחוויות', labelEn: 'Adventure & Experiences' },
      { value: 'spirituality', label: 'רוחניות ומשמעות', labelEn: 'Spirituality & Meaning' },
      { value: 'contribution', label: 'תרומה לחברה ועזרה לאחרים', labelEn: 'Contribution & Helping Others' },
      { value: 'peace', label: 'שלווה נפשית ורוגע', labelEn: 'Peace of Mind & Calm' },
      { value: 'recognition', label: 'הכרה והערכה מאחרים', labelEn: 'Recognition & Appreciation' },
      { value: 'intimacy', label: 'אינטימיות וקרבה', labelEn: 'Intimacy & Closeness' },
      { value: 'independence', label: 'עצמאות', labelEn: 'Independence' },
      { value: 'legacy', label: 'מורשת והשארת חותם', labelEn: 'Legacy & Leaving a Mark' },
      { value: 'learning', label: 'למידה ידע והשכלה', labelEn: 'Learning & Education' },
      { value: 'leadership', label: 'השפעה ומנהיגות', labelEn: 'Influence & Leadership' },
      { value: 'pleasure', label: 'הנאה ותענוגות', labelEn: 'Pleasure & Enjoyment' },
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
    title: 'במה אתה רוצה לצמוח?',
    titleEn: 'Where do you want to grow?',
    icon: '🌱',
    multiSelect: true,
    options: [
      // 💼 קריירה ועבודה
      { value: 'career-purpose', label: 'מציאת ייעוד מקצועי', labelEn: 'Finding Professional Purpose' },
      { value: 'career-advancement', label: 'התקדמות בקריירה', labelEn: 'Career Advancement' },
      { value: 'entrepreneurship', label: 'מעבר לעצמאות / יזמות', labelEn: 'Becoming Self-employed / Entrepreneurship' },
      { value: 'work-leadership', label: 'מנהיגות בעבודה', labelEn: 'Leadership at Work' },
      { value: 'work-life-balance', label: 'איזון עבודה-חיים', labelEn: 'Work-Life Balance' },
      { value: 'job-situation', label: 'התמודדות עם מצב תעסוקתי', labelEn: 'Dealing with Employment Situation' },
      
      // 💰 כסף ושפע
      { value: 'increase-income', label: 'הגדלת הכנסה', labelEn: 'Increasing Income' },
      { value: 'money-management', label: 'ניהול כספים', labelEn: 'Money Management' },
      { value: 'savings-investments', label: 'חיסכון והשקעות', labelEn: 'Savings & Investments' },
      { value: 'financial-blocks', label: 'שחרור חסמים פיננסיים', labelEn: 'Releasing Financial Blocks' },
      { value: 'business', label: 'יזמות ועסקים', labelEn: 'Business & Entrepreneurship' },
      
      // 💪 גוף ובריאות
      { value: 'weight-loss', label: 'ירידה במשקל', labelEn: 'Weight Loss' },
      { value: 'muscle-building', label: 'בניית שרירים', labelEn: 'Muscle Building' },
      { value: 'energy-vitality', label: 'אנרגיה וחיוניות', labelEn: 'Energy & Vitality' },
      { value: 'quality-sleep', label: 'שינה איכותית', labelEn: 'Quality Sleep' },
      { value: 'nutrition', label: 'תזונה נכונה', labelEn: 'Proper Nutrition' },
      { value: 'chronic-pain', label: 'התמודדות עם כאב כרוני', labelEn: 'Dealing with Chronic Pain' },
      { value: 'quit-habits', label: 'הפסקת הרגלים מזיקים', labelEn: 'Quitting Bad Habits' },
      
      // 🧠 מנטלי ורגשי
      { value: 'confidence', label: 'ביטחון עצמי', labelEn: 'Self-confidence' },
      { value: 'emotional-regulation', label: 'ויסות רגשי', labelEn: 'Emotional Regulation' },
      { value: 'anxiety', label: 'התמודדות עם חרדה', labelEn: 'Dealing with Anxiety' },
      { value: 'depression', label: 'התמודדות עם דיכאון', labelEn: 'Dealing with Depression' },
      { value: 'trauma-healing', label: 'ריפוי טראומה', labelEn: 'Trauma Healing' },
      { value: 'anger-release', label: 'שחרור כעסים', labelEn: 'Releasing Anger' },
      { value: 'self-awareness', label: 'מודעות עצמית', labelEn: 'Self-awareness' },
      { value: 'resilience', label: 'חוסן נפשי', labelEn: 'Mental Resilience' },
      
      // ❤️ מערכות יחסים
      { value: 'find-partner', label: 'מציאת בן/בת זוג', labelEn: 'Finding a Partner' },
      { value: 'improve-relationship', label: 'שיפור הזוגיות', labelEn: 'Improving Relationship' },
      { value: 'communication-partner', label: 'תקשורת בזוגיות', labelEn: 'Communication in Relationship' },
      { value: 'parents-relationship', label: 'יחסים עם הורים', labelEn: 'Relationship with Parents' },
      { value: 'children-relationship', label: 'יחסים עם ילדים', labelEn: 'Relationship with Children' },
      { value: 'friendships', label: 'חברויות', labelEn: 'Friendships' },
      { value: 'boundaries', label: 'גבולות בריאים', labelEn: 'Healthy Boundaries' },
      { value: 'forgiveness', label: 'סליחה ושחרור', labelEn: 'Forgiveness & Letting Go' },
      
      // 🧘 רוחניות ומשמעות
      { value: 'find-meaning', label: 'מציאת משמעות', labelEn: 'Finding Meaning' },
      { value: 'self-connection', label: 'חיבור לעצמי', labelEn: 'Connecting with Myself' },
      { value: 'meditation-practice', label: 'מדיטציה ונוכחות', labelEn: 'Meditation & Presence' },
      { value: 'spiritual-practice', label: 'פרקטיקה רוחנית', labelEn: 'Spiritual Practice' },
      { value: 'values-ethics', label: 'ערכים ומוסר', labelEn: 'Values & Ethics' },
      { value: 'life-purpose', label: 'מטרה בחיים', labelEn: 'Life Purpose' },
      
      // ⚙️ יכולות ומיומנויות
      { value: 'discipline', label: 'משמעת ועקביות', labelEn: 'Discipline & Consistency' },
      { value: 'time-management', label: 'ניהול זמן', labelEn: 'Time Management' },
      { value: 'communication', label: 'תקשורת בינאישית', labelEn: 'Interpersonal Communication' },
      { value: 'assertiveness', label: 'אסרטיביות', labelEn: 'Assertiveness' },
      { value: 'creativity', label: 'יצירתיות', labelEn: 'Creativity' },
      { value: 'decision-making', label: 'קבלת החלטות', labelEn: 'Decision Making' },
      { value: 'problem-solving', label: 'פתרון בעיות', labelEn: 'Problem Solving' },
      { value: 'fast-learning', label: 'למידה מהירה', labelEn: 'Fast Learning' },
      { value: 'focus', label: 'ריכוז ופוקוס', labelEn: 'Focus & Concentration' },
      { value: 'patience', label: 'סבלנות', labelEn: 'Patience' },
      
      // 🌍 חיים ואורח חיים
      { value: 'home-organization', label: 'ארגון הבית והסביבה', labelEn: 'Home & Environment Organization' },
      { value: 'minimalism', label: 'מינימליזם', labelEn: 'Minimalism' },
      { value: 'find-hobbies', label: 'מציאת תחביבים', labelEn: 'Finding Hobbies' },
      { value: 'community-connection', label: 'חיבור לקהילה', labelEn: 'Connecting with Community' },
      { value: 'quality-of-life', label: 'איכות חיים', labelEn: 'Quality of Life' },
      { value: 'relocation', label: 'הגירה / מעבר דירה', labelEn: 'Relocation / Moving' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },
  obstacles: {
    section: 'values',
    title: 'מה הכי עוצר אותך מלהתקדם?',
    titleEn: 'What stops you most from progressing?',
    icon: '🚧',
    multiSelect: true,
    options: [
      { value: 'fear-of-failure', label: 'פחד מכישלון', labelEn: 'Fear of failure' },
      { value: 'low-confidence', label: 'חוסר ביטחון עצמי', labelEn: 'Low self-confidence' },
      { value: 'no-time', label: 'חוסר זמן', labelEn: 'Lack of time' },
      { value: 'dont-know-how', label: 'לא יודע מאיפה להתחיל', labelEn: 'Don\'t know where to start' },
      { value: 'external', label: 'משהו מבחוץ (כסף, אנשים, מצב)', labelEn: 'External factors (money, people, situation)' },
      { value: 'fear-of-change', label: 'פחד משינוי', labelEn: 'Fear of change' },
      { value: 'fatigue', label: 'עייפות/חוסר אנרגיה', labelEn: 'Fatigue/Lack of energy' },
      { value: 'procrastination', label: 'דחיינות', labelEn: 'Procrastination' },
      { value: 'perfectionism', label: 'פרפקציוניזם', labelEn: 'Perfectionism' },
      { value: 'self-doubt', label: 'ספקות עצמיים', labelEn: 'Self-doubt' },
      { value: 'fear-of-success', label: 'פחד מהצלחה', labelEn: 'Fear of success' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },
} as const;

const SECTIONS = [
  { key: 'demographics', title: 'פרטים אישיים', titleEn: 'Personal Details', icon: '👤' },
  { key: 'health', title: 'בריאות והרגלים', titleEn: 'Health & Habits', icon: '❤️' },
  { key: 'mental', title: 'נפש ורגש', titleEn: 'Mental & Emotional', icon: '🧠' },
  { key: 'interests', title: 'תחומי עניין', titleEn: 'Interests & Hobbies', icon: '🎨' },
  { key: 'behavioral', title: 'דפוסי התנהגות', titleEn: 'Behavioral Patterns', icon: '🧩' },
  { key: 'social', title: 'חברתי ואורח חיים', titleEn: 'Social & Lifestyle', icon: '🌍' },
  { key: 'values', title: 'ערכים ומטרות', titleEn: 'Values & Goals', icon: '⭐' },
];

const CATEGORY_ORDER: CategoryKey[] = [
  // Demographics
  'age_group', 'gender', 'relationship_status', 'children', 'living_situation', 'employment_status',
  // Health
  'diet', 'sleep_hours', 'exercise_frequency', 'exercise_types', 'smoking', 'alcohol', 'caffeine', 'hydration', 'supplements',
  // Mental
  'stress_level', 'meditation_practice', 'therapy_experience', 'energy_source', 'relaxation_methods',
  // Interests
  'hobbies', 'reading_habits',
  // Behavioral (new situational questions)
  'conflict_handling', 'problem_approach', 'decision_style', 'opportunity_response', 'failure_response', 'time_management', 'relationship_style',
  // Social
  'social_preference', 'morning_evening', 'learning_style',
  // Values
  'life_priorities', 'spiritual_practice', 'growth_focus', 'obstacles',
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
  energy_source: [],
  relaxation_methods: [],
  hobbies: [],
  reading_habits: '',
  conflict_handling: '',
  problem_approach: '',
  decision_style: '',
  opportunity_response: '',
  failure_response: '',
  time_management: '',
  relationship_style: '',
  social_preference: '',
  morning_evening: '',
  learning_style: '',
  life_priorities: [],
  spiritual_practice: '',
  growth_focus: [],
  obstacles: [],
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

  const handleMultiSelect = (category: MultiSelectCategory, value: string) => {
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
                  
                  return (
                    <div key={categoryKey} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <h4 className="font-medium text-sm">
                          {language === 'he' ? category.title : category.titleEn}
                        </h4>
                      </div>
                      
                      {/* Description if exists */}
                      {'description' in category && category.description && (
                        <p className="text-xs text-muted-foreground mr-7">
                          {language === 'he' ? category.description : (category as any).descriptionEn}
                        </p>
                      )}
                      
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
                                  handleMultiSelect(categoryKey as MultiSelectCategory, option.value);
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
          className="w-full py-6 text-lg relative overflow-hidden group"
          size="lg"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isCompleting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {language === 'he' ? 'שומר...' : 'Saving...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {language === 'he' ? 'שמור והמשך' : 'Save & Continue'}
              </>
            )}
          </span>
        </Button>
        
        {rewards && (
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>🏆 {rewards.xp} XP</span>
            {rewards.tokens > 0 && <span>🪙 {rewards.tokens} Tokens</span>}
          </div>
        )}
      </div>
    </div>
  );
}
