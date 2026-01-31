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
  savedData?: Record<string, string | string[]>;
  onAutoSave?: (data: Record<string, string | string[]>) => void;
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

// All quiz questions with branching logic - ALL QUESTIONS ARE MULTI-SELECT
const WELCOME_QUIZ: QuizQuestion[] = [
  // Question 1: Life Areas - What are you dealing with
  {
    id: 'main_area',
    question: 'במה אתה מתעסק כרגע בחיים?',
    questionEn: 'What are you currently dealing with in life?',
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
    multiSelect: true,
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
  // Business sub-questions
  {
    id: 'business_specific',
    question: 'מה בדיוק בעסק/יזמות?',
    questionEn: 'What specifically about business/entrepreneurship?',
    multiSelect: true,
    dependsOn: { questionId: 'main_area', values: ['business'] },
    options: [
      { value: 'start', label: 'רוצה להקים עסק', labelEn: 'Want to start a business', icon: '🚀' },
      { value: 'grow', label: 'רוצה להגדיל את העסק', labelEn: 'Want to grow the business', icon: '📈' },
      { value: 'struggle', label: 'העסק מתקשה', labelEn: 'Business is struggling', icon: '😟' },
      { value: 'marketing', label: 'צריך עזרה בשיווק', labelEn: 'Need help with marketing', icon: '📣' },
      { value: 'team', label: 'ניהול צוות', labelEn: 'Team management', icon: '👥' },
      { value: 'pivot', label: 'רוצה לשנות כיוון', labelEn: 'Want to pivot', icon: '🔄' },
    ],
  },
  // Relationships sub-questions
  {
    id: 'relationships_specific',
    question: 'מה בדיוק במערכות יחסים?',
    questionEn: 'What specifically about relationships?',
    multiSelect: true,
    dependsOn: { questionId: 'main_area', values: ['relationships'] },
    options: [
      { value: 'find_partner', label: 'רוצה למצוא בן/בת זוג', labelEn: 'Want to find a partner', icon: '💕' },
      { value: 'current_relationship', label: 'בעיות בזוגיות הנוכחית', labelEn: 'Issues in current relationship', icon: '💔' },
      { value: 'healing', label: 'ריפוי מפרידה', labelEn: 'Healing from separation', icon: '🩹' },
      { value: 'communication', label: 'רוצה לשפר תקשורת', labelEn: 'Want to improve communication', icon: '💬' },
      { value: 'intimacy', label: 'קרבה ואינטימיות', labelEn: 'Closeness and intimacy', icon: '🔥' },
      { value: 'commitment', label: 'פחד מהתחייבות', labelEn: 'Fear of commitment', icon: '🔐' },
    ],
  },
  // Family sub-questions
  {
    id: 'family_specific',
    question: 'מה בדיוק במשפחה?',
    questionEn: 'What specifically about family?',
    multiSelect: true,
    dependsOn: { questionId: 'main_area', values: ['family'] },
    options: [
      { value: 'parenting', label: 'אתגרי הורות', labelEn: 'Parenting challenges', icon: '👶' },
      { value: 'teenagers', label: 'התמודדות עם מתבגרים', labelEn: 'Dealing with teenagers', icon: '🧒' },
      { value: 'parents', label: 'יחסים עם הורים', labelEn: 'Relationship with parents', icon: '👴' },
      { value: 'siblings', label: 'יחסים עם אחים', labelEn: 'Relationship with siblings', icon: '👫' },
      { value: 'balance', label: 'איזון משפחה-עבודה', labelEn: 'Family-work balance', icon: '⚖️' },
      { value: 'conflict', label: 'קונפליקטים משפחתיים', labelEn: 'Family conflicts', icon: '⚡' },
    ],
  },
  // Health sub-questions
  {
    id: 'health_specific',
    question: 'מה בדיוק בבריאות?',
    questionEn: 'What specifically about health?',
    multiSelect: true,
    dependsOn: { questionId: 'main_area', values: ['health'] },
    options: [
      { value: 'weight', label: 'רוצה לרדת במשקל', labelEn: 'Want to lose weight', icon: '⚖️' },
      { value: 'exercise', label: 'רוצה להתחיל להתאמן', labelEn: 'Want to start exercising', icon: '🏃' },
      { value: 'nutrition', label: 'לשפר תזונה', labelEn: 'Improve nutrition', icon: '🥗' },
      { value: 'pain', label: 'כאבים כרוניים', labelEn: 'Chronic pain', icon: '🩹' },
      { value: 'condition', label: 'מצב רפואי מתמשך', labelEn: 'Ongoing medical condition', icon: '🏥' },
      { value: 'habits', label: 'הרגלים לא בריאים', labelEn: 'Unhealthy habits', icon: '🚭' },
    ],
  },
  // Energy sub-questions
  {
    id: 'energy_specific',
    question: 'מה בדיוק באנרגיה/שינה?',
    questionEn: 'What specifically about energy/sleep?',
    multiSelect: true,
    dependsOn: { questionId: 'main_area', values: ['energy'] },
    options: [
      { value: 'tired', label: 'עייפות כרונית', labelEn: 'Chronic fatigue', icon: '😫' },
      { value: 'sleep_quality', label: 'איכות שינה ירודה', labelEn: 'Poor sleep quality', icon: '😴' },
      { value: 'insomnia', label: 'קשיי הירדמות', labelEn: 'Difficulty falling asleep', icon: '🌙' },
      { value: 'morning', label: 'קושי להתעורר בבוקר', labelEn: 'Difficulty waking up', icon: '⏰' },
      { value: 'focus', label: 'חוסר ריכוז', labelEn: 'Lack of focus', icon: '🎯' },
      { value: 'burnout', label: 'שחיקה', labelEn: 'Burnout', icon: '🔥' },
    ],
  },
  // Finance sub-questions
  {
    id: 'finance_specific',
    question: 'מה בדיוק בכסף/פיננסים?',
    questionEn: 'What specifically about money/finances?',
    multiSelect: true,
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
    multiSelect: true,
    dependsOn: { questionId: 'main_area', values: ['purpose'] },
    options: [
      { value: 'dont_know', label: 'לא יודע מה אני רוצה', labelEn: "Don't know what I want", icon: '❓' },
      { value: 'lost', label: 'מרגיש אבוד', labelEn: 'Feeling lost', icon: '🧭' },
      { value: 'passion', label: 'רוצה למצוא תשוקה', labelEn: 'Want to find passion', icon: '🔥' },
      { value: 'meaning', label: 'מחפש משמעות', labelEn: 'Seeking meaning', icon: '✨' },
      { value: 'big_change', label: 'רוצה לעשות שינוי גדול', labelEn: 'Want to make a big change', icon: '🦋' },
      { value: 'legacy', label: 'רוצה להשאיר חותם', labelEn: 'Want to leave a legacy', icon: '🏆' },
    ],
  },
  // Emotional sub-questions
  {
    id: 'emotional_specific',
    question: 'מה בדיוק ברגשות/מנטלי?',
    questionEn: 'What specifically about emotions/mental health?',
    multiSelect: true,
    dependsOn: { questionId: 'main_area', values: ['emotional'] },
    options: [
      { value: 'anxiety', label: 'חרדה', labelEn: 'Anxiety', icon: '😟' },
      { value: 'depression', label: 'דיכאון', labelEn: 'Depression', icon: '😢' },
      { value: 'confidence', label: 'ביטחון עצמי', labelEn: 'Self-confidence', icon: '💪' },
      { value: 'regulation', label: 'ויסות רגשי', labelEn: 'Emotional regulation', icon: '🎭' },
      { value: 'anger', label: 'ניהול כעסים', labelEn: 'Anger management', icon: '😤' },
      { value: 'trauma', label: 'טראומה מהעבר', labelEn: 'Past trauma', icon: '🩹' },
    ],
  },
  // Social sub-questions
  {
    id: 'social_specific',
    question: 'מה בדיוק בחברתי?',
    questionEn: 'What specifically about social life?',
    multiSelect: true,
    dependsOn: { questionId: 'main_area', values: ['social'] },
    options: [
      { value: 'lonely', label: 'בדידות', labelEn: 'Loneliness', icon: '😔' },
      { value: 'friends', label: 'רוצה יותר חברים', labelEn: 'Want more friends', icon: '👋' },
      { value: 'social_anxiety', label: 'חרדה חברתית', labelEn: 'Social anxiety', icon: '😰' },
      { value: 'boundaries', label: 'הצבת גבולות', labelEn: 'Setting boundaries', icon: '🚧' },
      { value: 'networking', label: 'נטוורקינג', labelEn: 'Networking', icon: '🤝' },
      { value: 'community', label: 'רוצה קהילה', labelEn: 'Want community', icon: '🏘️' },
    ],
  },
  // Learning sub-questions
  {
    id: 'learning_specific',
    question: 'מה בדיוק בלימודים/התפתחות?',
    questionEn: 'What specifically about learning/growth?',
    multiSelect: true,
    dependsOn: { questionId: 'main_area', values: ['learning'] },
    options: [
      { value: 'new_skill', label: 'רוצה ללמוד מיומנות חדשה', labelEn: 'Want to learn a new skill', icon: '🎯' },
      { value: 'degree', label: 'תואר/הסמכה', labelEn: 'Degree/certification', icon: '🎓' },
      { value: 'focus', label: 'קושי להתמקד בלימודים', labelEn: 'Difficulty focusing on studies', icon: '📚' },
      { value: 'motivation', label: 'חוסר מוטיבציה', labelEn: 'Lack of motivation', icon: '🔋' },
      { value: 'time', label: 'אין לי זמן', labelEn: 'No time', icon: '⏰' },
      { value: 'direction', label: 'לא יודע מה ללמוד', labelEn: "Don't know what to learn", icon: '🧭' },
    ],
  },
  // Spirituality sub-questions
  {
    id: 'spirituality_specific',
    question: 'מה בדיוק ברוחניות/משמעות?',
    questionEn: 'What specifically about spirituality/meaning?',
    multiSelect: true,
    dependsOn: { questionId: 'main_area', values: ['spirituality'] },
    options: [
      { value: 'connection', label: 'רוצה חיבור רוחני', labelEn: 'Want spiritual connection', icon: '🙏' },
      { value: 'meditation', label: 'רוצה להתחיל למדיטציה', labelEn: 'Want to start meditating', icon: '🧘' },
      { value: 'faith', label: 'שאלות על אמונה', labelEn: 'Questions about faith', icon: '✨' },
      { value: 'purpose', label: 'מחפש תכלית', labelEn: 'Seeking purpose', icon: '🌟' },
      { value: 'peace', label: 'רוצה שקט פנימי', labelEn: 'Want inner peace', icon: '☮️' },
      { value: 'growth', label: 'צמיחה אישית', labelEn: 'Personal growth', icon: '🌱' },
    ],
  },
  // Final questions - Emotional state
  {
    id: 'emotional_state',
    question: 'איך אתה מרגיש לגבי המצב?',
    questionEn: 'How do you feel about the situation?',
    multiSelect: true,
    options: [
      { value: 'frustrated', label: 'מתוסכל', labelEn: 'Frustrated', icon: '😤' },
      { value: 'hopeful', label: 'מלא תקווה', labelEn: 'Hopeful', icon: '🌟' },
      { value: 'confused', label: 'מבולבל', labelEn: 'Confused', icon: '😵‍💫' },
      { value: 'motivated', label: 'מוטיבציה', labelEn: 'Motivated', icon: '🚀' },
      { value: 'anxious', label: 'חרד', labelEn: 'Anxious', icon: '😰' },
      { value: 'determined', label: 'נחוש', labelEn: 'Determined', icon: '💪' },
    ],
  },
  // What have you tried
  {
    id: 'tried_before',
    question: 'מה כבר ניסית?',
    questionEn: 'What have you already tried?',
    multiSelect: true,
    options: [
      { value: 'reading', label: 'ספרים/מאמרים', labelEn: 'Books/articles', icon: '📚' },
      { value: 'courses', label: 'קורסים', labelEn: 'Courses', icon: '🎓' },
      { value: 'coaching', label: 'אימון/ייעוץ', labelEn: 'Coaching/counseling', icon: '👨‍💼' },
      { value: 'therapy', label: 'טיפול', labelEn: 'Therapy', icon: '🛋️' },
      { value: 'apps', label: 'אפליקציות', labelEn: 'Apps', icon: '📱' },
      { value: 'nothing', label: 'לא הרבה', labelEn: 'Not much', icon: '🆕' },
    ],
  },
  // Help style preference
  {
    id: 'help_style',
    question: 'מה יעזור לך הכי הרבה?',
    questionEn: 'What would help you the most?',
    multiSelect: true,
    options: [
      { value: 'practical', label: 'פתרונות מעשיים', labelEn: 'Practical solutions', icon: '🔧' },
      { value: 'listening', label: 'הקשבה', labelEn: 'Being heard', icon: '👂' },
      { value: 'plan', label: 'תוכנית ברורה', labelEn: 'Clear plan', icon: '📋' },
      { value: 'push', label: 'דחיפה לפעולה', labelEn: 'Push to action', icon: '🚀' },
      { value: 'understanding', label: 'הבנה עצמית', labelEn: 'Self-understanding', icon: '🔮' },
      { value: 'accountability', label: 'אחריותיות', labelEn: 'Accountability', icon: '✅' },
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
  
  // Finally, add the remaining general questions (emotional_state, tried_before, help_style, etc.)
  const generalQuestions = WELCOME_QUIZ.filter(q => !q.dependsOn && q.id !== 'main_area');
  result.push(...generalQuestions);
  
  return result;
}

// Get summary text based on answers - handles multi-select for all questions
function getSummaryText(answers: Record<string, string | string[]>, language: string): string {
  const mainAreaValue = answers.main_area;
  const mainAreas = Array.isArray(mainAreaValue) ? mainAreaValue : (mainAreaValue ? [mainAreaValue] : []);
  const mainAreaLabels = mainAreas
    .map(val => WELCOME_QUIZ[0].options.find(o => o.value === val))
    .filter(Boolean);
  
  // Handle multi-select for emotional_state
  const emotionalStateValue = answers.emotional_state;
  const emotionalStates = Array.isArray(emotionalStateValue) ? emotionalStateValue : (emotionalStateValue ? [emotionalStateValue] : []);
  const emotionalStateLabels = emotionalStates
    .map(val => WELCOME_QUIZ.find(q => q.id === 'emotional_state')?.options.find(o => o.value === val))
    .filter(Boolean);
  
  if (mainAreaLabels.length === 0) return '';
  
  if (language === 'he') {
    const areasText = mainAreaLabels.map(a => a?.label).join(', ');
    const emotionalText = emotionalStateLabels.length > 0 
      ? emotionalStateLabels.map(e => e?.label).join(' ו')
      : 'במסע שלך';
    return `אני רואה שאתה מתמקד ב${areasText}. אתה מרגיש ${emotionalText}. יחד נמצא את הדרך הנכונה בשבילך.`;
  }
  
  const areasTextEn = mainAreaLabels.map(a => a?.labelEn).join(', ');
  const emotionalTextEn = emotionalStateLabels.length > 0 
    ? emotionalStateLabels.map(e => e?.labelEn).join(' and ')
    : 'on your journey';
  return `I see that you're focused on ${areasTextEn}. You feel ${emotionalTextEn}. Together we'll find the right path for you.`;
}

export function WelcomeStep({ onComplete, isCompleting, rewards, savedData, onAutoSave }: WelcomeStepProps) {
  const { language, isRTL } = useTranslation();
  
  // Initialize from savedData (DB) - component will remount on step change due to key
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    savedData && Object.keys(savedData).length > 0 ? savedData : {}
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    // If we have saved data, start at the summary or calculate the right question
    if (savedData && Object.keys(savedData).length > 0) {
      const visibleQs = getVisibleQuestions(savedData);
      // Check if all visible questions have answers
      const allAnswered = visibleQs.every(q => {
        const answer = savedData[q.id];
        return answer && (Array.isArray(answer) ? answer.length > 0 : answer);
      });
      return allAnswered ? visibleQs.length : 0;
    }
    return 0;
  });
  const [showSummary, setShowSummary] = useState(() => {
    if (savedData && Object.keys(savedData).length > 0) {
      const visibleQs = getVisibleQuestions(savedData);
      return visibleQs.every(q => {
        const answer = savedData[q.id];
        return answer && (Array.isArray(answer) ? answer.length > 0 : answer);
      });
    }
    return false;
  });
  
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
  
  // Auto-save helper
  const triggerAutoSave = (newAnswers: Record<string, string | string[]>) => {
    if (onAutoSave) {
      onAutoSave(newAnswers);
    }
  };

  const handleOptionSelect = (value: string) => {
    if (currentQuestion.multiSelect) {
      // Multi-select: toggle the value in the array
      const currentValues = (answers[currentQuestion.id] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      const newAnswers = { ...answers, [currentQuestion.id]: newValues };
      setAnswers(newAnswers);
      triggerAutoSave(newAnswers); // Auto-save on every selection
      // Don't auto-advance for multi-select
    } else {
      // Single select: set value and auto-advance
      const newAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(newAnswers);
      triggerAutoSave(newAnswers); // Auto-save on every selection
      
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
                className={cn(
                  "mt-6 min-w-[200px] h-14 text-lg font-bold transition-all duration-300",
                  canContinueMultiSelect()
                    ? "bg-gradient-to-r from-primary via-accent to-primary hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
                    : "bg-muted text-muted-foreground opacity-60"
                )}
                size="lg"
              >
                {language === 'he' ? '✨ המשך' : '✨ Continue'}
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
              className={cn(
                "min-w-[220px] h-14 text-lg font-bold transition-all duration-300",
                "bg-gradient-to-r from-primary via-accent to-primary",
                "hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
              )}
            >
              {isCompleting 
                ? (language === 'he' ? 'שומר...' : 'Saving...') 
                : (language === 'he' ? '🚀 המשך' : '🚀 Continue')
              }
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default WelcomeStep;
