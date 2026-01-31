import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronDown, FileText, User, Target, Zap } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface AnswersReviewProps {
  welcomeQuiz: Record<string, string | string[]>;
  personalProfile: Record<string, unknown>;
  focusAreas: string[];
  firstWeek: {
    habits_to_quit: string[];
    habits_to_build: string[];
    career_status: string;
    career_goal: string;
  };
}

// Category labels in Hebrew and English
const CATEGORY_LABELS: Record<string, { he: string; en: string }> = {
  career: { he: 'קריירה', en: 'Career' },
  business: { he: 'עסקים', en: 'Business' },
  relationships: { he: 'זוגיות', en: 'Relationships' },
  family: { he: 'משפחה', en: 'Family' },
  health: { he: 'בריאות', en: 'Health' },
  energy: { he: 'אנרגיה', en: 'Energy' },
  finance: { he: 'כספים', en: 'Finance' },
  purpose: { he: 'תכלית', en: 'Purpose' },
  emotions: { he: 'רגשות', en: 'Emotions' },
  social: { he: 'חברתי', en: 'Social' },
  learning: { he: 'למידה', en: 'Learning' },
  spirituality: { he: 'רוחניות', en: 'Spirituality' },
};

// Profile field labels
const PROFILE_LABELS: Record<string, { he: string; en: string }> = {
  sleep_hours: { he: 'שעות שינה', en: 'Sleep Hours' },
  exercise_frequency: { he: 'תדירות פעילות גופנית', en: 'Exercise Frequency' },
  smoking: { he: 'עישון', en: 'Smoking' },
  alcohol: { he: 'אלכוהול', en: 'Alcohol' },
  diet: { he: 'תזונה', en: 'Diet' },
  stress_level: { he: 'רמת לחץ', en: 'Stress Level' },
  age: { he: 'גיל', en: 'Age' },
  gender: { he: 'מגדר', en: 'Gender' },
  occupation: { he: 'עיסוק', en: 'Occupation' },
  marital_status: { he: 'מצב משפחתי', en: 'Marital Status' },
};

function AnswerSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  color = 'primary'
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  color?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { isRTL } = useTranslation();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={`flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50 hover:bg-card/70 transition-colors`}>
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 text-${color}`} />
            <span className="font-medium">{title}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-4 rounded-xl bg-card/30 border border-border/30 space-y-3"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {children}
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AnswersReview({ welcomeQuiz, personalProfile, focusAreas, firstWeek }: AnswersReviewProps) {
  const { language, isRTL } = useTranslation();

  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value || '-');
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-3"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        {language === 'he' ? '📋 התשובות שלי' : '📋 My Answers'}
      </h3>

      {/* Welcome Quiz - Life Context */}
      {Object.keys(welcomeQuiz).length > 0 && (
        <AnswerSection 
          title={language === 'he' ? 'הקשר חיים (12 קטגוריות)' : 'Life Context (12 Categories)'} 
          icon={FileText}
        >
          <div className="grid gap-2">
            {Object.entries(welcomeQuiz).map(([key, value]) => {
              const label = CATEGORY_LABELS[key] || { he: key, en: key };
              const displayLabel = language === 'he' ? label.he : label.en;
              
              return (
                <div key={key} className="flex flex-wrap items-start gap-2 py-2 border-b border-border/20 last:border-0">
                  <span className="font-medium text-sm text-muted-foreground min-w-[100px]">
                    {displayLabel}:
                  </span>
                  <span className="text-sm flex-1">
                    {Array.isArray(value) ? (
                      <div className="flex flex-wrap gap-1">
                        {value.map((v, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                            {v}
                          </span>
                        ))}
                      </div>
                    ) : (
                      formatValue(value)
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </AnswerSection>
      )}

      {/* Personal Profile */}
      {Object.keys(personalProfile).length > 0 && (
        <AnswerSection 
          title={language === 'he' ? 'פרופיל אישי' : 'Personal Profile'} 
          icon={User}
        >
          <div className="grid gap-2">
            {Object.entries(personalProfile).map(([key, value]) => {
              const label = PROFILE_LABELS[key] || { he: key, en: key };
              const displayLabel = language === 'he' ? label.he : label.en;
              
              return (
                <div key={key} className="flex items-center gap-2 py-2 border-b border-border/20 last:border-0">
                  <span className="font-medium text-sm text-muted-foreground min-w-[120px]">
                    {displayLabel}:
                  </span>
                  <span className="text-sm">{formatValue(value)}</span>
                </div>
              );
            })}
          </div>
        </AnswerSection>
      )}

      {/* Focus Areas */}
      {focusAreas.length > 0 && (
        <AnswerSection 
          title={language === 'he' ? 'תחומי התמקדות' : 'Focus Areas'} 
          icon={Target}
        >
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area, index) => (
              <span 
                key={index}
                className="px-3 py-1.5 rounded-full bg-accent/20 text-accent-foreground border border-accent/30 text-sm"
              >
                {area}
              </span>
            ))}
          </div>
        </AnswerSection>
      )}

      {/* First Week - Habits & Career */}
      {(firstWeek.habits_to_quit.length > 0 || firstWeek.habits_to_build.length > 0 || firstWeek.career_status) && (
        <AnswerSection 
          title={language === 'he' ? 'הרגלים ומטרות' : 'Habits & Goals'} 
          icon={Zap}
        >
          <div className="space-y-4">
            {firstWeek.habits_to_quit.length > 0 && (
              <div>
                <span className="text-sm font-medium text-red-400 block mb-2">
                  {language === 'he' ? '🚫 הרגלים לעזוב:' : '🚫 Habits to Quit:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {firstWeek.habits_to_quit.map((habit, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs">
                      {habit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {firstWeek.habits_to_build.length > 0 && (
              <div>
                <span className="text-sm font-medium text-green-400 block mb-2">
                  {language === 'he' ? '✅ הרגלים לבנות:' : '✅ Habits to Build:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {firstWeek.habits_to_build.map((habit, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs">
                      {habit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(firstWeek.career_status || firstWeek.career_goal) && (
              <div className="pt-2 border-t border-border/30">
                <span className="text-sm font-medium text-blue-400 block mb-2">
                  {language === 'he' ? '💼 קריירה:' : '💼 Career:'}
                </span>
                {firstWeek.career_status && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{language === 'he' ? 'סטטוס: ' : 'Status: '}</span>
                    {firstWeek.career_status}
                  </p>
                )}
                {firstWeek.career_goal && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">{language === 'he' ? 'מטרה: ' : 'Goal: '}</span>
                    {firstWeek.career_goal}
                  </p>
                )}
              </div>
            )}
          </div>
        </AnswerSection>
      )}
    </motion.div>
  );
}
