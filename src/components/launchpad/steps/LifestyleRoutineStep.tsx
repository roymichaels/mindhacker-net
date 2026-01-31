import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MobileTimePicker } from '@/components/ui/mobile-time-picker';
import { Clock, Sun, Moon, Briefcase, Utensils, Battery, Check, Sparkles } from 'lucide-react';

interface LifestyleRoutineStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting?: boolean;
  rewards?: { xp: number; tokens: number; unlock: string };
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

interface LifestyleData {
  wake_time: string;
  sleep_time: string;
  sleep_quality: string;
  shift_work: string;
  work_hours: string;
  work_flexibility: string;
  breakfast_time: string;
  lunch_time: string;
  dinner_time: string;
  peak_productivity: string;
  low_energy_time: string;
  family_commitments: string[];
  special_constraints: string[];
}

const STORAGE_KEY = 'launchpad_lifestyle_routine';

type CategoryKey = keyof typeof CATEGORIES;
type MultiSelectCategory = 'family_commitments' | 'special_constraints';

// Categories that use time picker instead of options
const TIME_PICKER_CATEGORIES = ['wake_time', 'sleep_time'];

const CATEGORIES = {
  // === SLEEP ===
  wake_time: {
    section: 'sleep',
    title: 'באיזו שעה אתה קם בדרך כלל?',
    titleEn: 'What time do you usually wake up?',
    icon: '🌅',
    multiSelect: false,
    isTimePicker: true,
    minHour: 3,
    maxHour: 12,
    options: [], // Not used for time picker
  },
  sleep_time: {
    section: 'sleep',
    title: 'באיזו שעה אתה הולך לישון?',
    titleEn: 'What time do you go to sleep?',
    icon: '🌙',
    multiSelect: false,
    isTimePicker: true,
    minHour: 18,
    maxHour: 3, // Wraps around midnight
    options: [],
  },
  sleep_quality: {
    section: 'sleep',
    title: 'איך איכות השינה שלך?',
    titleEn: 'How is your sleep quality?',
    icon: '😴',
    multiSelect: false,
    options: [
      { value: 'excellent', label: 'מצוינת - נרדם מהר ומתעורר רענן', labelEn: 'Excellent - Fall asleep fast, wake refreshed' },
      { value: 'good', label: 'טובה - בדרך כלל ישן טוב', labelEn: 'Good - Usually sleep well' },
      { value: 'fair', label: 'סבירה - לפעמים יש בעיות', labelEn: 'Fair - Sometimes have issues' },
      { value: 'poor', label: 'גרועה - קושי להירדם או להישאר ישן', labelEn: 'Poor - Trouble falling/staying asleep' },
      { value: 'very-poor', label: 'גרועה מאוד - נדודי שינה משמעותיים', labelEn: 'Very poor - Significant insomnia' },
    ],
  },

  // === WORK ===
  shift_work: {
    section: 'work',
    title: 'האם אתה עובד במשמרות?',
    titleEn: 'Do you work shifts?',
    icon: '🔄',
    multiSelect: false,
    options: [
      { value: 'no', label: 'לא - שעות קבועות', labelEn: 'No - Fixed hours' },
      { value: 'fixed-shifts', label: 'כן - משמרות קבועות', labelEn: 'Yes - Fixed shifts' },
      { value: 'rotating-shifts', label: 'כן - משמרות מתחלפות', labelEn: 'Yes - Rotating shifts' },
      { value: 'night-shifts', label: 'כן - משמרות לילה', labelEn: 'Yes - Night shifts' },
      { value: 'flexible', label: 'עבודה גמישה', labelEn: 'Flexible work' },
      { value: 'not-working', label: 'לא עובד כרגע', labelEn: 'Not currently working' },
    ],
  },
  work_hours: {
    section: 'work',
    title: 'מה שעות העבודה שלך?',
    titleEn: 'What are your work hours?',
    icon: '⏰',
    multiSelect: false,
    options: [
      { value: 'early-morning', label: 'בוקר מוקדם (עד 06:00-14:00)', labelEn: 'Early morning (6 AM-2 PM)' },
      { value: 'morning', label: 'בוקר רגיל (08:00-17:00)', labelEn: 'Regular morning (8 AM-5 PM)' },
      { value: 'afternoon', label: 'אחר הצהריים (12:00-20:00)', labelEn: 'Afternoon (12-8 PM)' },
      { value: 'evening', label: 'ערב (16:00-00:00)', labelEn: 'Evening (4 PM-12 AM)' },
      { value: 'night', label: 'לילה (22:00-06:00)', labelEn: 'Night (10 PM-6 AM)' },
      { value: 'flexible', label: 'גמיש', labelEn: 'Flexible' },
      { value: 'varies', label: 'משתנה', labelEn: 'Varies' },
      { value: 'not-applicable', label: 'לא רלוונטי', labelEn: 'Not applicable' },
    ],
  },
  work_flexibility: {
    section: 'work',
    title: 'כמה גמישות יש לך בעבודה?',
    titleEn: 'How flexible is your work?',
    icon: '🏠',
    multiSelect: false,
    options: [
      { value: 'very-flexible', label: 'גמיש מאוד - עובד מתי שרוצה', labelEn: 'Very flexible - Work whenever' },
      { value: 'somewhat-flexible', label: 'גמישות מסוימת', labelEn: 'Somewhat flexible' },
      { value: 'hybrid', label: 'היברידי - חלק בבית חלק במשרד', labelEn: 'Hybrid - Part home, part office' },
      { value: 'fixed', label: 'קבוע - שעות וימים קבועים', labelEn: 'Fixed - Set hours and days' },
      { value: 'demanding', label: 'תובעני - הרבה שעות', labelEn: 'Demanding - Many hours' },
      { value: 'not-applicable', label: 'לא רלוונטי', labelEn: 'Not applicable' },
    ],
  },

  // === MEALS ===
  breakfast_time: {
    section: 'meals',
    title: 'מתי אתה אוכל ארוחת בוקר?',
    titleEn: 'When do you eat breakfast?',
    icon: '🍳',
    multiSelect: false,
    options: [
      { value: 'very-early', label: 'מוקדם מאוד (04:00-06:00)', labelEn: 'Very early (4-6 AM)' },
      { value: 'early', label: 'מוקדם (06:00-08:00)', labelEn: 'Early (6-8 AM)' },
      { value: 'regular', label: 'רגיל (08:00-10:00)', labelEn: 'Regular (8-10 AM)' },
      { value: 'late', label: 'מאוחר (10:00-12:00)', labelEn: 'Late (10 AM-12 PM)' },
      { value: 'skip', label: 'לא אוכל ארוחת בוקר', labelEn: 'Skip breakfast' },
      { value: 'intermittent-fasting', label: 'צום לסירוגין', labelEn: 'Intermittent fasting' },
    ],
  },
  lunch_time: {
    section: 'meals',
    title: 'מתי אתה אוכל ארוחת צהריים?',
    titleEn: 'When do you eat lunch?',
    icon: '🥗',
    multiSelect: false,
    options: [
      { value: 'early', label: 'מוקדם (11:00-12:00)', labelEn: 'Early (11 AM-12 PM)' },
      { value: 'regular', label: 'רגיל (12:00-14:00)', labelEn: 'Regular (12-2 PM)' },
      { value: 'late', label: 'מאוחר (14:00-16:00)', labelEn: 'Late (2-4 PM)' },
      { value: 'skip', label: 'לא אוכל צהריים', labelEn: 'Skip lunch' },
      { value: 'varies', label: 'משתנה', labelEn: 'Varies' },
    ],
  },
  dinner_time: {
    section: 'meals',
    title: 'מתי אתה אוכל ארוחת ערב?',
    titleEn: 'When do you eat dinner?',
    icon: '🍽️',
    multiSelect: false,
    options: [
      { value: 'early', label: 'מוקדם (16:00-18:00)', labelEn: 'Early (4-6 PM)' },
      { value: 'regular', label: 'רגיל (18:00-20:00)', labelEn: 'Regular (6-8 PM)' },
      { value: 'late', label: 'מאוחר (20:00-22:00)', labelEn: 'Late (8-10 PM)' },
      { value: 'very-late', label: 'מאוחר מאוד (אחרי 22:00)', labelEn: 'Very late (after 10 PM)' },
      { value: 'skip', label: 'לא אוכל ערב', labelEn: 'Skip dinner' },
      { value: 'varies', label: 'משתנה', labelEn: 'Varies' },
    ],
  },

  // === ENERGY ===
  peak_productivity: {
    section: 'energy',
    title: 'מתי אתה הכי פרודוקטיבי?',
    titleEn: 'When are you most productive?',
    icon: '⚡',
    multiSelect: false,
    options: [
      { value: 'very-early-morning', label: 'בוקר מוקדם מאוד (03:00-06:00)', labelEn: 'Very early morning (3-6 AM)' },
      { value: 'early-morning', label: 'בוקר מוקדם (05:00-08:00)', labelEn: 'Early morning (5-8 AM)' },
      { value: 'morning', label: 'בוקר (08:00-12:00)', labelEn: 'Morning (8 AM-12 PM)' },
      { value: 'midday', label: 'צהריים (12:00-16:00)', labelEn: 'Midday (12-4 PM)' },
      { value: 'afternoon', label: 'אחר הצהריים (16:00-20:00)', labelEn: 'Afternoon (4-8 PM)' },
      { value: 'evening', label: 'ערב (20:00-00:00)', labelEn: 'Evening (8 PM-12 AM)' },
      { value: 'late-night', label: 'לילה מאוחר (אחרי חצות)', labelEn: 'Late night (after midnight)' },
    ],
  },
  low_energy_time: {
    section: 'energy',
    title: 'מתי אתה הכי עייף?',
    titleEn: 'When do you feel most tired?',
    icon: '🔋',
    multiSelect: false,
    options: [
      { value: 'morning', label: 'בוקר - קשה לי לקום', labelEn: 'Morning - Hard to wake up' },
      { value: 'mid-morning', label: 'אמצע הבוקר (09:00-11:00)', labelEn: 'Mid-morning (9-11 AM)' },
      { value: 'after-lunch', label: 'אחרי הצהריים (13:00-15:00)', labelEn: 'After lunch (1-3 PM)' },
      { value: 'late-afternoon', label: 'סוף היום (16:00-18:00)', labelEn: 'Late afternoon (4-6 PM)' },
      { value: 'evening', label: 'ערב (20:00+)', labelEn: 'Evening (8 PM+)' },
      { value: 'consistent', label: 'אנרגיה יציבה לאורך היום', labelEn: 'Consistent energy throughout' },
    ],
  },

  // === CONSTRAINTS ===
  family_commitments: {
    section: 'constraints',
    title: 'מחויבויות משפחתיות',
    titleEn: 'Family Commitments',
    icon: '👨‍👩‍👧‍👦',
    multiSelect: true,
    options: [
      { value: 'none', label: 'אין מחויבויות מיוחדות', labelEn: 'No special commitments' },
      { value: 'young-children', label: 'ילדים קטנים', labelEn: 'Young children' },
      { value: 'school-age-children', label: 'ילדים בגיל בית ספר', labelEn: 'School-age children' },
      { value: 'elderly-care', label: 'טיפול בהורים מבוגרים', labelEn: 'Elderly parent care' },
      { value: 'shared-custody', label: 'משמורת משותפת', labelEn: 'Shared custody' },
      { value: 'partner-needs', label: 'צרכים מיוחדים של בן/ת זוג', labelEn: 'Partner special needs' },
      { value: 'pet-care', label: 'טיפול בחיות מחמד', labelEn: 'Pet care' },
    ],
  },
  special_constraints: {
    section: 'constraints',
    title: 'הגבלות או מצבים מיוחדים',
    titleEn: 'Special Constraints',
    icon: '⚠️',
    multiSelect: true,
    options: [
      { value: 'none', label: 'אין הגבלות מיוחדות', labelEn: 'No special constraints' },
      { value: 'health-condition', label: 'מצב בריאותי', labelEn: 'Health condition' },
      { value: 'disability', label: 'מוגבלות', labelEn: 'Disability' },
      { value: 'mental-health', label: 'אתגר נפשי', labelEn: 'Mental health challenge' },
      { value: 'limited-mobility', label: 'ניידות מוגבלת', labelEn: 'Limited mobility' },
      { value: 'chronic-fatigue', label: 'עייפות כרונית', labelEn: 'Chronic fatigue' },
      { value: 'irregular-schedule', label: 'לוח זמנים לא סדיר', labelEn: 'Irregular schedule' },
      { value: 'financial-constraints', label: 'מגבלות כלכליות', labelEn: 'Financial constraints' },
      { value: 'living-situation', label: 'מצב מגורים מאתגר', labelEn: 'Challenging living situation' },
    ],
  },
};

const SECTIONS = [
  { key: 'sleep', title: 'שינה', titleEn: 'Sleep', icon: Moon },
  { key: 'work', title: 'עבודה', titleEn: 'Work', icon: Briefcase },
  { key: 'meals', title: 'ארוחות', titleEn: 'Meals', icon: Utensils },
  { key: 'energy', title: 'אנרגיה', titleEn: 'Energy', icon: Battery },
  { key: 'constraints', title: 'מחויבויות', titleEn: 'Commitments', icon: Clock },
];

export function LifestyleRoutineStep({ 
  onComplete, 
  isCompleting, 
  rewards, 
  savedData,
  onAutoSave 
}: LifestyleRoutineStepProps) {
  const { language, isRTL } = useTranslation();
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selections, setSelections] = useState<Partial<LifestyleData>>(() => {
    // First try savedData from DB, then localStorage
    if (savedData && Object.keys(savedData).length > 0) {
      return savedData as Partial<LifestyleData>;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    return {};
  });

  // Auto-save on changes
  useEffect(() => {
    if (Object.keys(selections).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      onAutoSave?.(selections);
    }
  }, [selections, onAutoSave]);

  const currentSection = SECTIONS[currentSectionIndex];
  const sectionCategories = Object.entries(CATEGORIES).filter(
    ([, cat]) => cat.section === currentSection.key
  ) as [CategoryKey, typeof CATEGORIES[CategoryKey]][];

  const handleSelect = (category: CategoryKey, value: string) => {
    const categoryConfig = CATEGORIES[category];
    const isMulti = categoryConfig.multiSelect;
    
    setSelections(prev => {
      if (isMulti) {
        const current = (prev[category] as string[]) || [];
        // Handle "none" option - if selecting "none", clear others. If selecting other, remove "none"
        if (value === 'none') {
          return { ...prev, [category]: ['none'] };
        }
        const withoutNone = current.filter(v => v !== 'none');
        if (withoutNone.includes(value)) {
          return { ...prev, [category]: withoutNone.filter(v => v !== value) };
        }
        return { ...prev, [category]: [...withoutNone, value] };
      } else {
        return { ...prev, [category]: value };
      }
    });
  };

  const isSelected = (category: CategoryKey, value: string): boolean => {
    const selection = selections[category];
    if (Array.isArray(selection)) {
      return selection.includes(value);
    }
    return selection === value;
  };

  const isSectionComplete = (sectionKey: string): boolean => {
    const sectionCats = Object.entries(CATEGORIES).filter(
      ([, cat]) => cat.section === sectionKey
    );
    return sectionCats.every(([key]) => {
      const val = selections[key as CategoryKey];
      if (Array.isArray(val)) return val.length > 0;
      return !!val;
    });
  };

  const isCurrentSectionComplete = isSectionComplete(currentSection.key);

  const handleNext = () => {
    if (currentSectionIndex < SECTIONS.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      // Complete step
      onComplete(selections);
    }
  };

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const completedSections = SECTIONS.filter(s => isSectionComplete(s.key)).length;
  const progress = Math.round((completedSections / SECTIONS.length) * 100);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-4xl mb-3">⏰</div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'שגרת החיים שלך' : 'Your Daily Routine'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' 
            ? 'כדי שנוכל להתאים את התוכנית ללוח הזמנים שלך' 
            : 'So we can tailor the plan to your schedule'}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{language === 'he' ? `סקשן ${currentSectionIndex + 1}/${SECTIONS.length}` : `Section ${currentSectionIndex + 1}/${SECTIONS.length}`}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {SECTIONS.map((section, idx) => {
          const Icon = section.icon;
          const isComplete = isSectionComplete(section.key);
          const isCurrent = idx === currentSectionIndex;
          return (
            <button
              key={section.key}
              onClick={() => setCurrentSectionIndex(idx)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all",
                isCurrent && "bg-primary text-primary-foreground",
                !isCurrent && isComplete && "bg-primary/20 text-primary",
                !isCurrent && !isComplete && "bg-muted text-muted-foreground"
              )}
            >
              {isComplete ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
              {language === 'he' ? section.title : section.titleEn}
            </button>
          );
        })}
      </div>

      {/* Current section questions */}
      <div className="space-y-6">
        {sectionCategories.map(([key, category]) => {
          const isMulti = category.multiSelect;
          const isTimePicker = TIME_PICKER_CATEGORIES.includes(key);
          const currentValue = selections[key];
          
          // Time picker for wake/sleep times
          if (isTimePicker) {
            const isVaries = currentValue === 'varies';
            return (
              <Card key={key} className="p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{category.icon}</span>
                  <h3 className="font-medium">
                    {language === 'he' ? category.title : category.titleEn}
                  </h3>
                </div>
                
                <MobileTimePicker
                  value={typeof currentValue === 'string' ? currentValue : undefined}
                  onChange={(time) => handleSelect(key, time)}
                  label={language === 'he' ? category.title : category.titleEn}
                  placeholder={language === 'he' ? 'בחר שעה' : 'Select time'}
                  minHour={key === 'wake_time' ? 3 : 18}
                  maxHour={key === 'wake_time' ? 12 : 23}
                  showVaries
                  variesLabel={language === 'he' ? 'משתנה (משמרות)' : 'Varies (shifts)'}
                  isVaries={isVaries}
                  onVariesChange={(v) => {
                    if (v) handleSelect(key, 'varies');
                  }}
                />
              </Card>
            );
          }
          
          // Regular option buttons
          return (
            <Card key={key} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <h3 className="font-medium">
                  {language === 'he' ? category.title : category.titleEn}
                </h3>
                {isMulti && (
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                    {language === 'he' ? 'בחירה מרובה' : 'Multi-select'}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {category.options.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(key, option.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-all",
                      isSelected(key, option.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    {language === 'he' ? option.label : option.labelEn}
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentSectionIndex === 0}
        >
          {language === 'he' ? 'הקודם' : 'Previous'}
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isCurrentSectionComplete || isCompleting}
          className="gap-2"
        >
          {currentSectionIndex === SECTIONS.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4" />
              {isCompleting 
                ? (language === 'he' ? 'שומר...' : 'Saving...') 
                : (language === 'he' ? 'המשך' : 'Continue')}
            </>
          ) : (
            language === 'he' ? 'הבא' : 'Next'
          )}
        </Button>
      </div>

      {/* Rewards preview */}
      {rewards && currentSectionIndex === SECTIONS.length - 1 && (
        <div className="text-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
            <Sparkles className="w-3 h-3 text-primary" />
            +{rewards.xp} XP
            {rewards.tokens > 0 && ` • +${rewards.tokens} ${language === 'he' ? 'טוקנים' : 'Tokens'}`}
          </span>
        </div>
      )}
    </div>
  );
}

export default LifestyleRoutineStep;
