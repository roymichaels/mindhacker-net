import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Lock, Sparkles, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalProfileStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting?: boolean;
  rewards?: { xp: number; tokens: number; unlock: string };
}

interface ProfileData {
  age_group: string;
  gender: string;
  diet: string;
  sleep_hours: string;
  exercise_frequency: string;
  smoking: string[];
  alcohol: string;
  caffeine: string;
  water_intake: string;
  height_cm: number;
  weight_kg: number;
}

const STORAGE_KEY = 'launchpad_personal_profile';

const CATEGORIES = {
  age_group: {
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
  diet: {
    title: 'סוג תזונה',
    titleEn: 'Diet Type',
    icon: '🍽️',
    multiSelect: false,
    options: [
      { value: 'carnivore', label: 'קרניבור', labelEn: 'Carnivore' },
      { value: 'vegan', label: 'טבעוני', labelEn: 'Vegan' },
      { value: 'vegetarian', label: 'צמחוני', labelEn: 'Vegetarian' },
      { value: 'regular', label: 'רגיל', labelEn: 'Regular' },
      { value: 'other', label: 'אחר', labelEn: 'Other' },
    ],
  },
  sleep_hours: {
    title: 'שעות שינה',
    titleEn: 'Sleep Hours',
    icon: '😴',
    multiSelect: false,
    options: [
      { value: 'less-than-6', label: 'פחות מ-6', labelEn: 'Less than 6' },
      { value: '6-8', label: '6-8 שעות', labelEn: '6-8 hours' },
      { value: 'more-than-8', label: 'יותר מ-8', labelEn: 'More than 8' },
    ],
  },
  exercise_frequency: {
    title: 'פעילות גופנית',
    titleEn: 'Exercise',
    icon: '💪',
    multiSelect: false,
    options: [
      { value: 'never', label: 'אף פעם', labelEn: 'Never' },
      { value: '1-2/week', label: '1-2/שבוע', labelEn: '1-2/week' },
      { value: '3-4/week', label: '3-4/שבוע', labelEn: '3-4/week' },
      { value: 'daily', label: 'כל יום', labelEn: 'Daily' },
    ],
  },
  smoking: {
    title: 'עישון',
    titleEn: 'Smoking',
    icon: '🚬',
    multiSelect: true,
    options: [
      { value: 'none', label: 'לא מעשן', labelEn: 'None' },
      { value: 'cigarettes', label: 'סיגריות', labelEn: 'Cigarettes' },
      { value: 'vape', label: 'וייפ', labelEn: 'Vape' },
      { value: 'cannabis', label: 'קנאביס', labelEn: 'Cannabis' },
    ],
  },
  alcohol: {
    title: 'אלכוהול',
    titleEn: 'Alcohol',
    icon: '🍷',
    multiSelect: false,
    options: [
      { value: 'none', label: 'לא שותה', labelEn: 'None' },
      { value: 'sometimes', label: 'לפעמים', labelEn: 'Sometimes' },
      { value: 'weekends', label: 'סופ"ש', labelEn: 'Weekends' },
      { value: 'often', label: 'הרבה', labelEn: 'Often' },
    ],
  },
  caffeine: {
    title: 'קפאין',
    titleEn: 'Caffeine',
    icon: '☕',
    multiSelect: false,
    options: [
      { value: 'none', label: 'בלי', labelEn: 'None' },
      { value: '1-2/day', label: '1-2/יום', labelEn: '1-2/day' },
      { value: '3-5/day', label: '3-5/יום', labelEn: '3-5/day' },
      { value: 'more', label: 'יותר', labelEn: 'More' },
    ],
  },
  water_intake: {
    title: 'שתיית מים (כוסות)',
    titleEn: 'Water (glasses)',
    icon: '💧',
    multiSelect: false,
    options: [
      { value: 'less-than-4', label: 'פחות מ-4', labelEn: 'Less than 4' },
      { value: '4-8', label: '4-8', labelEn: '4-8' },
      { value: 'more-than-8', label: 'יותר מ-8', labelEn: 'More than 8' },
    ],
  },
};

const CATEGORY_ORDER = [
  'age_group',
  'gender', 
  'diet',
  'sleep_hours',
  'exercise_frequency',
  'smoking',
  'alcohol',
  'caffeine',
  'water_intake',
];

export function PersonalProfileStep({ onComplete, isCompleting, rewards }: PersonalProfileStepProps) {
  const { language, isRTL } = useTranslation();
  
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback to defaults
      }
    }
    return {
      age_group: '',
      gender: '',
      diet: '',
      sleep_hours: '',
      exercise_frequency: '',
      smoking: [],
      alcohol: '',
      caffeine: '',
      water_intake: '',
      height_cm: 170,
      weight_kg: 70,
    };
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
  }, [profileData]);

  const handleSingleSelect = (category: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [category]: value }));
  };

  const handleMultiSelect = (category: 'smoking', value: string) => {
    setProfileData(prev => {
      const current = prev[category];
      
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

  // Calculate completeness (at least 5 categories filled)
  const filledCategories = CATEGORY_ORDER.filter(key => {
    const value = profileData[key as keyof ProfileData];
    if (Array.isArray(value)) return value.length > 0;
    return value !== '';
  }).length;
  
  const canComplete = filledCategories >= 5;

  const handleComplete = () => {
    if (!canComplete) return;
    
    localStorage.removeItem(STORAGE_KEY);
    onComplete(profileData as unknown as Record<string, unknown>);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-3xl mb-2">
          👤
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'פרופיל אישי' : 'Personal Profile'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {language === 'he' 
            ? 'ספר לנו קצת על עצמך כדי שנוכל להתאים את החוויה'
            : 'Tell us a bit about yourself to personalize your experience'}
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

      {/* Categories */}
      <div className="space-y-6">
        {CATEGORY_ORDER.map((categoryKey) => {
          const category = CATEGORIES[categoryKey as keyof typeof CATEGORIES];
          const value = profileData[categoryKey as keyof ProfileData];
          
          return (
            <div key={categoryKey} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <h3 className="font-medium text-base">
                  {language === 'he' ? category.title : category.titleEn}
                </h3>
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
                          handleMultiSelect(categoryKey as 'smoking', option.value);
                        } else {
                          handleSingleSelect(categoryKey as keyof ProfileData, option.value);
                        }
                      }}
                      className={cn(
                        "relative flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all min-w-fit",
                        isSelected 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "bg-muted/50 hover:bg-muted border border-muted-foreground/20"
                      )}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {language === 'he' ? option.label : option.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Height & Weight Sliders */}
        <div className="space-y-6 pt-4 border-t">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📏</span>
                <h3 className="font-medium text-base">
                  {language === 'he' ? 'גובה' : 'Height'}
                </h3>
              </div>
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
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <h3 className="font-medium text-base">
                  {language === 'he' ? 'משקל' : 'Weight'}
                </h3>
              </div>
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

      {/* Progress & Complete Button */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {language === 'he' 
              ? `${filledCategories}/${CATEGORY_ORDER.length} קטגוריות`
              : `${filledCategories}/${CATEGORY_ORDER.length} categories`}
          </span>
          {!canComplete && (
            <span className="text-amber-500">
              {language === 'he' 
                ? 'מלא לפחות 5 קטגוריות'
                : 'Fill at least 5 categories'}
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
