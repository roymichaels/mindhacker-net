import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Gift, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeStepProps {
  onComplete: (data: { quizAnswers: Record<string, string | string[]> }) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
}

interface QuizOption {
  value: string;
  label: string;
  labelEn: string;
  icon: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  questionEn: string;
  options: QuizOption[];
  multiSelect?: boolean; // Allow multiple selections
  dependsOn?: { questionId: string; values: string[] };
}

// All quiz questions with branching logic
const WELCOME_QUIZ: QuizQuestion[] = [
  // Question 1: Life Areas - MULTI-SELECT - What are you dealing with
  {
    id: 'main_area',
    question: 'במה אתה מתעסק כרגע בחיים? (בחר הכל שרלוונטי)',
    questionEn: 'What are you currently dealing with in life? (Select all that apply)',
    multiSelect: true,
    options: [
      { value: 'career', label: 'קריירה/עבודה', labelEn: 'Career/Work', icon: '💼' },
      { value: 'business', label: 'עסק/יזמות', labelEn: 'Business/Entrepreneurship', icon: '🚀' },
      { value: 'relationships', label: 'זוגיות/מערכות יחסים', labelEn: 'Relationships', icon: '❤️' },
      { value: 'family', label: 'משפחה/ילדים', labelEn: 'Family/Children', icon: '👨‍👩‍👧' },
      { value: 'health', label: 'בריאות/כושר', labelEn: 'Health/Fitness', icon: '💪' },
      { value: 'energy', label: 'אנרגיה/שינה', labelEn: 'Energy/Sleep', icon: '🔋' },
      { value: 'finance', label: 'כסף/פיננסים', labelEn: 'Money/Finances', icon: '💰' },
      { value: 'purpose', label: 'מטרה/כיוון בחיים', labelEn: 'Purpose/Direction', icon: '🎯' },
      { value: 'emotional', label: 'רגשות/בריאות נפשית', labelEn: 'Emotions/Mental Health', icon: '🧠' },
      { value: 'social', label: 'חברים/קהילה', labelEn: 'Friends/Community', icon: '👥' },
      { value: 'learning', label: 'לימודים/התפתחות', labelEn: 'Learning/Growth', icon: '📚' },
      { value: 'spirituality', label: 'רוחניות/משמעות', labelEn: 'Spirituality/Meaning', icon: '✨' },
    ],
  },
  // Career sub-questions
  {
    id: 'career_specific',
    question: 'מה בדיוק בקריירה?',
    questionEn: 'What specifically about your career?',
    dependsOn: { questionId: 'main_area', values: ['career'] },
    options: [
      { value: 'advance', label: 'רוצה להתקדם בתפקיד', labelEn: 'Want to advance in my role', icon: '📈' },
      { value: 'change', label: 'רוצה לשנות מקצוע', labelEn: 'Want to change profession', icon: '🔄' },
      { value: 'stuck', label: 'מרגיש תקוע ומשועמם', labelEn: 'Feeling stuck and bored', icon: '😔' },
      { value: 'searching', label: 'מחפש עבודה', labelEn: 'Looking for a job', icon: '🔍' },
      { value: 'independent', label: 'רוצה להפוך לעצמאי', labelEn: 'Want to become independent', icon: '🚀' },
      { value: 'balance', label: 'רוצה איזון עבודה-חיים', labelEn: 'Want work-life balance', icon: '⚖️' },
    ],
  },
  // Relationships sub-questions
  {
    id: 'relationships_specific',
    question: 'מה בדיוק במערכות יחסים?',
    questionEn: 'What specifically about relationships?',
    dependsOn: { questionId: 'main_area', values: ['relationships'] },
    options: [
      { value: 'find_partner', label: 'רוצה למצוא בן/בת זוג', labelEn: 'Want to find a partner', icon: '💕' },
      { value: 'current_relationship', label: 'בעיות בזוגיות הנוכחית', labelEn: 'Issues in current relationship', icon: '💔' },
      { value: 'family', label: 'קשיים עם ילדים/משפחה', labelEn: 'Difficulties with kids/family', icon: '👨‍👩‍👧' },
      { value: 'social', label: 'קשיים חברתיים', labelEn: 'Social difficulties', icon: '👥' },
      { value: 'healing', label: 'ריפוי מפרידה', labelEn: 'Healing from separation', icon: '🩹' },
      { value: 'communication', label: 'רוצה לשפר תקשורת', labelEn: 'Want to improve communication', icon: '💬' },
    ],
  },
  // Health sub-questions
  {
    id: 'health_specific',
    question: 'מה בדיוק בבריאות?',
    questionEn: 'What specifically about health?',
    dependsOn: { questionId: 'main_area', values: ['health'] },
    options: [
      { value: 'weight', label: 'רוצה לרדת במשקל', labelEn: 'Want to lose weight', icon: '⚖️' },
      { value: 'energy', label: 'חסר אנרגיה/עייפות', labelEn: 'Lacking energy/fatigue', icon: '🔋' },
      { value: 'sleep', label: 'בעיות שינה', labelEn: 'Sleep issues', icon: '😴' },
      { value: 'exercise', label: 'רוצה להתחיל להתאמן', labelEn: 'Want to start exercising', icon: '🏃' },
      { value: 'pain', label: 'להתמודד עם כאבים כרוניים', labelEn: 'Dealing with chronic pain', icon: '🩹' },
      { value: 'nutrition', label: 'לשפר תזונה', labelEn: 'Improve nutrition', icon: '🥗' },
    ],
  },
  // Finance sub-questions
  {
    id: 'finance_specific',
    question: 'מה בדיוק בכסף/פיננסים?',
    questionEn: 'What specifically about money/finances?',
    dependsOn: { questionId: 'main_area', values: ['finance'] },
    options: [
      { value: 'save', label: 'רוצה לחסוך יותר', labelEn: 'Want to save more', icon: '🐷' },
      { value: 'debt', label: 'חובות שמטרידים', labelEn: 'Troubling debts', icon: '📉' },
      { value: 'earn_more', label: 'רוצה להרוויח יותר', labelEn: 'Want to earn more', icon: '💵' },
      { value: 'budget', label: 'לא יודע לנהל תקציב', labelEn: "Don't know how to budget", icon: '📊' },
      { value: 'invest', label: 'רוצה להשקיע', labelEn: 'Want to invest', icon: '📈' },
      { value: 'anxiety', label: 'חרדות כלכליות', labelEn: 'Financial anxiety', icon: '😰' },
    ],
  },
  // Purpose sub-questions
  {
    id: 'purpose_specific',
    question: 'מה בדיוק במטרה/כיוון?',
    questionEn: 'What specifically about purpose/direction?',
    dependsOn: { questionId: 'main_area', values: ['purpose'] },
    options: [
      { value: 'dont_know', label: 'לא יודע מה אני רוצה בחיים', labelEn: "Don't know what I want in life", icon: '❓' },
      { value: 'lost', label: 'מרגיש אבוד', labelEn: 'Feeling lost', icon: '🧭' },
      { value: 'passion', label: 'רוצה למצוא תשוקה', labelEn: 'Want to find passion', icon: '🔥' },
      { value: 'meaning', label: 'מחפש משמעות', labelEn: 'Seeking meaning', icon: '✨' },
      { value: 'big_change', label: 'רוצה לעשות שינוי גדול', labelEn: 'Want to make a big change', icon: '🦋' },
    ],
  },
  // Emotional sub-questions
  {
    id: 'emotional_specific',
    question: 'מה בדיוק ברגשות/מנטלי?',
    questionEn: 'What specifically about emotions/mental?',
    dependsOn: { questionId: 'main_area', values: ['emotional'] },
    options: [
      { value: 'anxiety', label: 'התמודדות עם חרדה', labelEn: 'Dealing with anxiety', icon: '😟' },
      { value: 'depression', label: 'התמודדות עם דיכאון', labelEn: 'Dealing with depression', icon: '😢' },
      { value: 'confidence', label: 'בעיות ביטחון עצמי', labelEn: 'Self-confidence issues', icon: '💪' },
      { value: 'regulation', label: 'ויסות רגשי', labelEn: 'Emotional regulation', icon: '🎭' },
      { value: 'anger', label: 'ניהול כעסים', labelEn: 'Anger management', icon: '😤' },
      { value: 'trauma', label: 'טראומה מהעבר', labelEn: 'Past trauma', icon: '🩹' },
    ],
  },
  // Question 3: Emotional state (for all)
  {
    id: 'emotional_state',
    question: 'מה המצב הרגשי שלך לגבי זה?',
    questionEn: 'How do you feel about this emotionally?',
    options: [
      { value: 'frustrated', label: 'מתוסכל/מיואש', labelEn: 'Frustrated/Desperate', icon: '😤' },
      { value: 'curious', label: 'סקרן/מוטיבציה', labelEn: 'Curious/Motivated', icon: '🤔' },
      { value: 'confused', label: 'מבולבל/לא בטוח', labelEn: 'Confused/Uncertain', icon: '😵‍💫' },
      { value: 'worried', label: 'מודאג/חרד', labelEn: 'Worried/Anxious', icon: '😰' },
      { value: 'hopeful', label: 'מלא תקווה', labelEn: 'Hopeful', icon: '🌟' },
    ],
  },
  // Question 4: Duration
  {
    id: 'duration',
    question: 'כמה זמן זה מטריד אותך?',
    questionEn: 'How long has this been bothering you?',
    options: [
      { value: 'recent', label: 'התחיל לאחרונה (פחות מחודש)', labelEn: 'Recently started (less than a month)', icon: '📅' },
      { value: 'months', label: 'כבר כמה חודשים', labelEn: 'A few months already', icon: '📆' },
      { value: 'year_plus', label: 'שנה ויותר', labelEn: 'A year or more', icon: '📅' },
      { value: 'always', label: 'תמיד היה ככה', labelEn: 'It has always been like this', icon: '♾️' },
    ],
  },
  // Question 5: What have you tried
  {
    id: 'tried_before',
    question: 'מה ניסית עד עכשיו?',
    questionEn: 'What have you tried so far?',
    options: [
      { value: 'reading', label: 'קראתי ספרים/מאמרים', labelEn: 'Read books/articles', icon: '📚' },
      { value: 'talked', label: 'דיברתי עם חברים/משפחה', labelEn: 'Talked with friends/family', icon: '💬' },
      { value: 'professional', label: 'עבדתי עם מאמן/יועץ', labelEn: 'Worked with coach/counselor', icon: '👨‍💼' },
      { value: 'alone', label: 'ניסיתי לבד', labelEn: 'Tried on my own', icon: '🧘' },
      { value: 'nothing', label: 'לא הרבה, מחפש עזרה', labelEn: 'Not much, looking for help', icon: '🆕' },
    ],
  },
  // Question 6: Help preference
  {
    id: 'help_style',
    question: 'מה הכי חשוב לך כשאתה מקבל עזרה?',
    questionEn: 'What is most important to you when receiving help?',
    options: [
      { value: 'practical', label: 'פתרונות מעשיים', labelEn: 'Practical solutions', icon: '🔧' },
      { value: 'listening', label: 'הקשבה והבנה', labelEn: 'Listening and understanding', icon: '👂' },
      { value: 'plan', label: 'תוכנית מסודרת', labelEn: 'Organized plan', icon: '📋' },
      { value: 'push', label: 'דחיפה לפעולה', labelEn: 'Push to action', icon: '🚀' },
      { value: 'understanding', label: 'הבנה עמוקה של עצמי', labelEn: 'Deep self-understanding', icon: '🔮' },
    ],
  },
];

// Get visible questions based on current answers - now properly handles multi-select
function getVisibleQuestions(answers: Record<string, string | string[]>): QuizQuestion[] {
  const result: QuizQuestion[] = [];
  const mainAreaAnswer = answers.main_area;
  const selectedCategories = Array.isArray(mainAreaAnswer) ? mainAreaAnswer : (mainAreaAnswer ? [mainAreaAnswer] : []);
  
  // First, add the main question (no dependencies)
  const mainQuestions = WELCOME_QUIZ.filter(q => !q.dependsOn);
  result.push(...mainQuestions.slice(0, 1)); // Just the first main question (life areas)
  
  // Then, add sub-questions for each selected category IN ORDER
  for (const category of selectedCategories) {
    const subQuestion = WELCOME_QUIZ.find(q => 
      q.dependsOn?.questionId === 'main_area' && 
      q.dependsOn.values.includes(category)
    );
    if (subQuestion) {
      result.push(subQuestion);
    }
  }
  
  // Finally, add the remaining general questions (emotional_state, duration, etc.)
  const generalQuestions = WELCOME_QUIZ.filter(q => !q.dependsOn && q.id !== 'main_area');
  result.push(...generalQuestions);
  
  return result;
}

// Get summary text based on answers
function getSummaryText(answers: Record<string, string | string[]>, language: string): string {
  const mainAreaValue = answers.main_area;
  const mainAreas = Array.isArray(mainAreaValue) ? mainAreaValue : [mainAreaValue];
  const mainAreaLabels = mainAreas
    .map(val => WELCOME_QUIZ[0].options.find(o => o.value === val))
    .filter(Boolean);
  
  const emotionalState = WELCOME_QUIZ.find(q => q.id === 'emotional_state')?.options.find(o => o.value === answers.emotional_state);
  const duration = WELCOME_QUIZ.find(q => q.id === 'duration')?.options.find(o => o.value === answers.duration);
  
  if (mainAreaLabels.length === 0 || !emotionalState || !duration) return '';
  
  if (language === 'he') {
    const areasText = mainAreaLabels.map(a => a?.label).join(', ');
    return `אני רואה שאתה מתמקד ב${areasText}, מרגיש ${emotionalState.label}, וזה כבר ${duration.label}. יחד נמצא את הדרך הנכונה בשבילך.`;
  }
  
  const areasTextEn = mainAreaLabels.map(a => a?.labelEn).join(', ');
  return `I see that you're focused on ${areasTextEn}, feeling ${emotionalState.labelEn}, and it's been ${duration.labelEn}. Together we'll find the right path for you.`;
}

export function WelcomeStep({ onComplete, isCompleting, rewards }: WelcomeStepProps) {
  const { language, isRTL } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  // Calculate visible questions based on current answers
  const visibleQuestions = getVisibleQuestions(answers);
  const totalQuestions = visibleQuestions.length;
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;
  const isQuizComplete = currentQuestionIndex >= totalQuestions;

  // Check if quiz is complete
  useEffect(() => {
    if (isQuizComplete && !showSummary) {
      setShowSummary(true);
    }
  }, [isQuizComplete, showSummary]);

  const handleOptionSelect = (value: string) => {
    if (currentQuestion.multiSelect) {
      // Multi-select: toggle the value in the array
      const currentValues = (answers[currentQuestion.id] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setAnswers({ ...answers, [currentQuestion.id]: newValues });
      // Don't auto-advance for multi-select
    } else {
      // Single select: set value and auto-advance
      const newAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(newAnswers);
      
      // Auto-advance after short delay
      setTimeout(() => {
        const newVisibleQuestions = getVisibleQuestions(newAnswers);
        if (currentQuestionIndex + 1 < newVisibleQuestions.length) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setShowSummary(true);
        }
      }, 300);
    }
  };

  const handleMultiSelectContinue = () => {
    // After selecting categories, recalculate the visible questions
    const newVisibleQuestions = getVisibleQuestions(answers);
    if (currentQuestionIndex + 1 < newVisibleQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowSummary(true);
    }
  };

  const canContinueMultiSelect = () => {
    if (!currentQuestion?.multiSelect) return false;
    const currentValues = (answers[currentQuestion.id] as string[]) || [];
    return currentValues.length > 0;
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowSummary(false);
    }
  };

  const handleSubmit = () => {
    onComplete({ quizAnswers: answers });
  };

  return (
    <div className="space-y-6 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={showSummary ? 100 : progress} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {showSummary 
            ? (language === 'he' ? 'סיום' : 'Complete')
            : `${currentQuestionIndex + 1} / ${totalQuestions}`
          }
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!showSummary && currentQuestion ? (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Back button */}
            {currentQuestionIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className={cn("absolute top-4", isRTL ? "right-4" : "left-4")}
              >
                <ChevronLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
                {language === 'he' ? 'חזור' : 'Back'}
              </Button>
            )}

            {/* Question */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold mb-2">
                {language === 'he' ? currentQuestion.question : currentQuestion.questionEn}
              </h2>
            </div>

            {/* Options Grid - 3 columns for multi-select, 2 for single */}
            <div className={cn(
              "grid gap-3 mx-auto",
              currentQuestion.multiSelect 
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-w-3xl" 
                : "grid-cols-2 max-w-lg"
            )}>
              {currentQuestion.options.map((option) => {
                // Check if option is selected (handle both single and multi-select)
                const isSelected = currentQuestion.multiSelect
                  ? ((answers[currentQuestion.id] as string[]) || []).includes(option.value)
                  : answers[currentQuestion.id] === option.value;

                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                      "hover:border-primary hover:bg-primary/5",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    )}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-xs font-medium text-center leading-tight">
                      {language === 'he' ? option.label : option.labelEn}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Continue button for multi-select */}
            {currentQuestion.multiSelect && (
              <Button
                onClick={handleMultiSelectContinue}
                disabled={!canContinueMultiSelect()}
                className="mt-4"
                size="lg"
              >
                {language === 'he' ? 'המשך' : 'Continue'}
              </Button>
            )}
          </motion.div>
        ) : showSummary ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Summary Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-4xl">✨</span>
            </div>

            {/* Summary Title */}
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {language === 'he' ? 'מעולה! הכרתי אותך קצת' : 'Great! I got to know you a bit'}
            </h2>

            {/* Summary Text */}
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              {getSummaryText(answers, language)}
            </p>

            {/* Rewards preview */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                <Sparkles className="w-4 h-4" />
                <span>+{rewards.xp} XP</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent-foreground">
                <Gift className="w-4 h-4" />
                <span>
                  {language === 'he' ? 'נפתח: צ׳אט מלא' : 'Unlock: Full Chat'}
                </span>
              </div>
            </div>

            {/* Back button in summary */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSummary(false);
                setCurrentQuestionIndex(visibleQuestions.length - 1);
              }}
              className="text-muted-foreground"
            >
              <ChevronLeft className={cn("h-4 w-4 mr-1", isRTL && "rotate-180 ml-1 mr-0")} />
              {language === 'he' ? 'חזור לערוך' : 'Go back to edit'}
            </Button>

            {/* Submit Button */}
            <Button 
              size="lg" 
              onClick={handleSubmit}
              disabled={isCompleting}
              className="min-w-[200px]"
            >
              {isCompleting 
                ? (language === 'he' ? 'שומר...' : 'Saving...') 
                : (language === 'he' ? 'המשך' : 'Continue')
              }
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default WelcomeStep;
