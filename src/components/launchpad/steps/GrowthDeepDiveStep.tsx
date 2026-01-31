import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GrowthDeepDiveStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting?: boolean;
  rewards?: { xp: number; tokens: number; unlock: string };
  previousAnswers?: Record<string, unknown>;
  savedData?: { answers?: Record<string, string[]>; currentAreaIndex?: number };
  onAutoSave?: (data: { answers: Record<string, string[]>; currentAreaIndex: number }) => void;
}

// Follow-up questions for each growth area
const FOLLOW_UP_QUESTIONS: Record<string, {
  question: string;
  questionEn: string;
  options: Array<{ value: string; label: string; labelEn: string }>;
}> = {
  // ביטחון עצמי
  confidence: {
    question: 'באיזה מצבים הכי קשה לך עם ביטחון עצמי?',
    questionEn: 'In which situations do you struggle most with self-confidence?',
    options: [
      { value: 'new-people', label: 'מול אנשים חדשים', labelEn: 'With new people' },
      { value: 'at-work', label: 'בעבודה', labelEn: 'At work' },
      { value: 'in-relationship', label: 'בזוגיות', labelEn: 'In relationships' },
      { value: 'decisions', label: 'בקבלת החלטות', labelEn: 'When making decisions' },
      { value: 'criticism', label: 'כשמבקרים אותי', labelEn: 'When criticized' },
      { value: 'public-speaking', label: 'מול קהל', labelEn: 'Public speaking' },
    ],
  },
  // מציאת בן/בת זוג
  'find-partner': {
    question: 'מה לדעתך מונע ממך למצוא זוגיות?',
    questionEn: 'What do you think prevents you from finding a partner?',
    options: [
      { value: 'not-meeting-people', label: 'לא פוגש מספיק אנשים', labelEn: 'Not meeting enough people' },
      { value: 'low-confidence', label: 'חוסר ביטחון', labelEn: 'Lack of confidence' },
      { value: 'fear-rejection', label: 'פחד מדחייה', labelEn: 'Fear of rejection' },
      { value: 'past-trauma', label: 'טראומה מהעבר', labelEn: 'Past trauma' },
      { value: 'dont-know-what-want', label: 'לא יודע מה אני רוצה', labelEn: 'Don\'t know what I want' },
      { value: 'trust-issues', label: 'קשיי אמון', labelEn: 'Trust issues' },
    ],
  },
  // שיפור הזוגיות
  'improve-relationship': {
    question: 'מה הכי משפיע על הזוגיות שלך?',
    questionEn: 'What affects your relationship the most?',
    options: [
      { value: 'communication', label: 'תקשורת לקויה', labelEn: 'Poor communication' },
      { value: 'intimacy', label: 'חוסר אינטימיות', labelEn: 'Lack of intimacy' },
      { value: 'trust', label: 'בעיות אמון', labelEn: 'Trust issues' },
      { value: 'conflicts', label: 'קונפליקטים חוזרים', labelEn: 'Recurring conflicts' },
      { value: 'routine', label: 'שגרה ושחיקה', labelEn: 'Routine and burnout' },
      { value: 'different-goals', label: 'מטרות שונות', labelEn: 'Different goals' },
    ],
  },
  // חרדה
  anxiety: {
    question: 'מה מעורר אצלך הכי הרבה חרדה?',
    questionEn: 'What triggers your anxiety the most?',
    options: [
      { value: 'future', label: 'דאגות לגבי העתיד', labelEn: 'Worries about the future' },
      { value: 'social', label: 'מצבים חברתיים', labelEn: 'Social situations' },
      { value: 'health', label: 'בריאות', labelEn: 'Health concerns' },
      { value: 'work', label: 'עבודה ולחצים', labelEn: 'Work and pressure' },
      { value: 'relationships', label: 'מערכות יחסים', labelEn: 'Relationships' },
      { value: 'uncertainty', label: 'אי-ודאות כללית', labelEn: 'General uncertainty' },
    ],
  },
  // ירידה במשקל
  'weight-loss': {
    question: 'מה הכי מקשה עליך לרדת במשקל?',
    questionEn: 'What makes it hardest for you to lose weight?',
    options: [
      { value: 'emotional-eating', label: 'אכילה רגשית', labelEn: 'Emotional eating' },
      { value: 'no-time', label: 'חוסר זמן לספורט', labelEn: 'No time for exercise' },
      { value: 'motivation', label: 'חוסר מוטיבציה', labelEn: 'Lack of motivation' },
      { value: 'cravings', label: 'תאוות מזון', labelEn: 'Food cravings' },
      { value: 'consistency', label: 'קושי בעקביות', labelEn: 'Difficulty with consistency' },
      { value: 'knowledge', label: 'חוסר ידע', labelEn: 'Lack of knowledge' },
    ],
  },
  // משמעת ועקביות
  discipline: {
    question: 'מה הכי מפריע לך לשמור על עקביות?',
    questionEn: 'What disrupts your consistency the most?',
    options: [
      { value: 'distractions', label: 'הסחות דעת', labelEn: 'Distractions' },
      { value: 'motivation-dips', label: 'ירידה במוטיבציה', labelEn: 'Motivation dips' },
      { value: 'perfectionism', label: 'פרפקציוניזם', labelEn: 'Perfectionism' },
      { value: 'overwhelm', label: 'הרגשת הצפה', labelEn: 'Feeling overwhelmed' },
      { value: 'no-structure', label: 'חוסר מבנה יומי', labelEn: 'Lack of daily structure' },
      { value: 'giving-up', label: 'נטייה לוותר מהר', labelEn: 'Tendency to give up quickly' },
    ],
  },
  // קריירה
  'career-purpose': {
    question: 'מה מונע ממך למצוא את הייעוד המקצועי?',
    questionEn: 'What prevents you from finding your professional purpose?',
    options: [
      { value: 'dont-know', label: 'לא יודע מה אני רוצה', labelEn: 'Don\'t know what I want' },
      { value: 'fear-change', label: 'פחד מלעזוב מה שמוכר', labelEn: 'Fear of leaving the familiar' },
      { value: 'financial', label: 'מגבלות כלכליות', labelEn: 'Financial constraints' },
      { value: 'too-many-options', label: 'יותר מדי אפשרויות', labelEn: 'Too many options' },
      { value: 'lack-skills', label: 'חוסר מיומנויות', labelEn: 'Lack of skills' },
      { value: 'self-doubt', label: 'ספקות עצמיים', labelEn: 'Self-doubt' },
    ],
  },
  // כסף
  'increase-income': {
    question: 'מה לדעתך מגביל את ההכנסה שלך?',
    questionEn: 'What do you think limits your income?',
    options: [
      { value: 'job-type', label: 'סוג העבודה הנוכחית', labelEn: 'Current job type' },
      { value: 'skills', label: 'חוסר מיומנויות', labelEn: 'Lack of skills' },
      { value: 'fear-ask', label: 'פחד לבקש העלאה', labelEn: 'Fear of asking for raise' },
      { value: 'mindset', label: 'חסמים מחשבתיים על כסף', labelEn: 'Money mindset blocks' },
      { value: 'no-opportunities', label: 'חוסר הזדמנויות', labelEn: 'Lack of opportunities' },
      { value: 'time-limits', label: 'מגבלות זמן', labelEn: 'Time limitations' },
    ],
  },
  // יחסים עם הורים
  'parents-relationship': {
    question: 'מה הכי משפיע על היחסים עם ההורים שלך?',
    questionEn: 'What affects your relationship with your parents the most?',
    options: [
      { value: 'old-patterns', label: 'דפוסים ישנים', labelEn: 'Old patterns' },
      { value: 'expectations', label: 'ציפיות שלהם ממני', labelEn: 'Their expectations of me' },
      { value: 'communication', label: 'קושי בתקשורת', labelEn: 'Communication difficulties' },
      { value: 'boundaries', label: 'חוסר גבולות', labelEn: 'Lack of boundaries' },
      { value: 'past-hurt', label: 'פגיעות מהעבר', labelEn: 'Past hurts' },
      { value: 'distance', label: 'ריחוק גאוגרפי/רגשי', labelEn: 'Geographic/emotional distance' },
    ],
  },
  // Default fallback for areas without specific follow-ups
  default: {
    question: 'מה הכי חשוב לך להשיג בתחום הזה?',
    questionEn: 'What\'s most important for you to achieve in this area?',
    options: [
      { value: 'quick-wins', label: 'הצלחות מהירות', labelEn: 'Quick wins' },
      { value: 'deep-change', label: 'שינוי עמוק ויסודי', labelEn: 'Deep, fundamental change' },
      { value: 'understanding', label: 'הבנה עצמית טובה יותר', labelEn: 'Better self-understanding' },
      { value: 'tools', label: 'כלים פרקטיים', labelEn: 'Practical tools' },
      { value: 'support', label: 'תמיכה והכוונה', labelEn: 'Support and guidance' },
      { value: 'accountability', label: 'מסגרת ואחריותיות', labelEn: 'Framework and accountability' },
    ],
  },
};

const GROWTH_AREA_LABELS: Record<string, { label: string; labelEn: string }> = {
  'career-purpose': { label: 'מציאת ייעוד מקצועי', labelEn: 'Finding Professional Purpose' },
  'career-advancement': { label: 'התקדמות בקריירה', labelEn: 'Career Advancement' },
  'entrepreneurship': { label: 'מעבר לעצמאות / יזמות', labelEn: 'Entrepreneurship' },
  'work-leadership': { label: 'מנהיגות בעבודה', labelEn: 'Leadership at Work' },
  'work-life-balance': { label: 'איזון עבודה-חיים', labelEn: 'Work-Life Balance' },
  'increase-income': { label: 'הגדלת הכנסה', labelEn: 'Increasing Income' },
  'money-management': { label: 'ניהול כספים', labelEn: 'Money Management' },
  'financial-blocks': { label: 'שחרור חסמים פיננסיים', labelEn: 'Releasing Financial Blocks' },
  'weight-loss': { label: 'ירידה במשקל', labelEn: 'Weight Loss' },
  'muscle-building': { label: 'בניית שרירים', labelEn: 'Muscle Building' },
  'energy-vitality': { label: 'אנרגיה וחיוניות', labelEn: 'Energy & Vitality' },
  'quality-sleep': { label: 'שינה איכותית', labelEn: 'Quality Sleep' },
  'confidence': { label: 'ביטחון עצמי', labelEn: 'Self-confidence' },
  'emotional-regulation': { label: 'ויסות רגשי', labelEn: 'Emotional Regulation' },
  'anxiety': { label: 'התמודדות עם חרדה', labelEn: 'Dealing with Anxiety' },
  'depression': { label: 'התמודדות עם דיכאון', labelEn: 'Dealing with Depression' },
  'trauma-healing': { label: 'ריפוי טראומה', labelEn: 'Trauma Healing' },
  'self-awareness': { label: 'מודעות עצמית', labelEn: 'Self-awareness' },
  'resilience': { label: 'חוסן נפשי', labelEn: 'Mental Resilience' },
  'find-partner': { label: 'מציאת בן/בת זוג', labelEn: 'Finding a Partner' },
  'improve-relationship': { label: 'שיפור הזוגיות', labelEn: 'Improving Relationship' },
  'communication-partner': { label: 'תקשורת בזוגיות', labelEn: 'Communication in Relationship' },
  'parents-relationship': { label: 'יחסים עם הורים', labelEn: 'Relationship with Parents' },
  'children-relationship': { label: 'יחסים עם ילדים', labelEn: 'Relationship with Children' },
  'friendships': { label: 'חברויות', labelEn: 'Friendships' },
  'boundaries': { label: 'גבולות בריאים', labelEn: 'Healthy Boundaries' },
  'forgiveness': { label: 'סליחה ושחרור', labelEn: 'Forgiveness & Letting Go' },
  'find-meaning': { label: 'מציאת משמעות', labelEn: 'Finding Meaning' },
  'self-connection': { label: 'חיבור לעצמי', labelEn: 'Connecting with Myself' },
  'life-purpose': { label: 'מטרה בחיים', labelEn: 'Life Purpose' },
  'discipline': { label: 'משמעת ועקביות', labelEn: 'Discipline & Consistency' },
  'time-management': { label: 'ניהול זמן', labelEn: 'Time Management' },
  'communication': { label: 'תקשורת בינאישית', labelEn: 'Interpersonal Communication' },
  'assertiveness': { label: 'אסרטיביות', labelEn: 'Assertiveness' },
  'creativity': { label: 'יצירתיות', labelEn: 'Creativity' },
  'focus': { label: 'ריכוז ופוקוס', labelEn: 'Focus & Concentration' },
  'patience': { label: 'סבלנות', labelEn: 'Patience' },
};

export function GrowthDeepDiveStep({ 
  onComplete, 
  isCompleting, 
  rewards,
  previousAnswers,
  savedData,
  onAutoSave,
}: GrowthDeepDiveStepProps) {
  const { language, isRTL } = useTranslation();
  const isHebrew = language === 'he';
  
  const [selectedGrowthAreas, setSelectedGrowthAreas] = useState<string[]>([]);
  const [currentAreaIndex, setCurrentAreaIndex] = useState(savedData?.currentAreaIndex || 0);
  const [answers, setAnswers] = useState<Record<string, string[]>>(savedData?.answers || {});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Extract growth_focus from previous answers
  useEffect(() => {
    if (previousAnswers?.growth_focus) {
      const areas = previousAnswers.growth_focus as string[];
      // Filter to only areas that have follow-up questions or use default
      setSelectedGrowthAreas(areas.filter(a => a !== 'other').slice(0, 5)); // Max 5 areas for deep dive
    }
  }, [previousAnswers]);

  // Auto-save when answers or currentAreaIndex change
  useEffect(() => {
    if (Object.keys(answers).length > 0 && onAutoSave) {
      onAutoSave({ answers, currentAreaIndex });
    }
  }, [answers, currentAreaIndex, onAutoSave]);

  const currentArea = selectedGrowthAreas[currentAreaIndex];
  const followUp = FOLLOW_UP_QUESTIONS[currentArea] || FOLLOW_UP_QUESTIONS.default;
  const areaLabel = GROWTH_AREA_LABELS[currentArea] || { label: currentArea, labelEn: currentArea };
  
  const isLastArea = currentAreaIndex === selectedGrowthAreas.length - 1;
  const hasAnsweredCurrent = answers[currentArea]?.length > 0;

  const handleSelectOption = (value: string) => {
    setAnswers(prev => {
      const current = prev[currentArea] || [];
      if (current.includes(value)) {
        return { ...prev, [currentArea]: current.filter(v => v !== value) };
      }
      return { ...prev, [currentArea]: [...current, value] };
    });
  };

  const handleNext = async () => {
    if (isLastArea) {
      // All areas answered, analyze with AI
      setIsAnalyzing(true);
      try {
        const { data, error } = await supabase.functions.invoke('aurora-analyze', {
          body: {
            type: 'growth_deep_dive',
            data: {
              growth_areas: selectedGrowthAreas,
              answers,
              profile: previousAnswers,
            },
          },
        });
        
        if (!error && data?.insight) {
          setAiInsight(data.insight);
        }
      } catch (err) {
        console.error('AI analysis failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
      
      // Complete even if AI fails
      onComplete({ 
        growth_deep_dive: answers,
        growth_areas_selected: selectedGrowthAreas,
      });
    } else {
      setCurrentAreaIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentAreaIndex > 0) {
      setCurrentAreaIndex(prev => prev - 1);
    }
  };

  // Skip if no growth areas selected
  if (selectedGrowthAreas.length === 0) {
    return (
      <div className="space-y-6 text-center py-12">
        <p className="text-muted-foreground">
          {isHebrew ? 'לא נבחרו תחומי צמיחה' : 'No growth areas selected'}
        </p>
        <Button onClick={() => onComplete({})}>
          {isHebrew ? 'המשך' : 'Continue'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
          <Sparkles className="w-4 h-4" />
          {isHebrew ? 'העמקה אישית' : 'Personal Deep Dive'}
        </div>
        <h2 className="text-2xl font-bold">
          {isHebrew ? 'בואו נעמיק קצת' : "Let's Go Deeper"}
        </h2>
        <p className="text-muted-foreground">
          {isHebrew 
            ? 'כדי שנוכל לעזור לך בצורה מדויקת יותר' 
            : 'So we can help you more precisely'}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2">
        {selectedGrowthAreas.map((area, idx) => (
          <div 
            key={area}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              idx === currentAreaIndex 
                ? "bg-primary w-6" 
                : idx < currentAreaIndex 
                  ? "bg-primary" 
                  : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Current area card */}
      <Card className="p-6 space-y-6">
        {/* Area badge */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="font-medium text-lg">
            {isHebrew ? areaLabel.label : areaLabel.labelEn}
          </span>
        </div>

        {/* Question */}
        <div>
          <h3 className="text-lg font-medium mb-4">
            {isHebrew ? followUp.question : followUp.questionEn}
          </h3>
          
          {/* Options */}
          <div className="grid grid-cols-1 gap-2">
            {followUp.options.map((option) => {
              const isSelected = answers[currentArea]?.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelectOption(option.value)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-start",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className={cn(isSelected && "font-medium")}>
                    {isHebrew ? option.label : option.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        {currentAreaIndex > 0 && (
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1"
          >
            {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
            {isHebrew ? 'חזרה' : 'Back'}
          </Button>
        )}
        
        <Button
          onClick={handleNext}
          disabled={!hasAnsweredCurrent || isCompleting || isAnalyzing}
          className="flex-1"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              {isHebrew ? 'מנתח...' : 'Analyzing...'}
            </>
          ) : isLastArea ? (
            <>
              {isHebrew ? 'סיום' : 'Finish'}
              <Sparkles className="w-4 h-4 mr-2" />
            </>
          ) : (
            <>
              {isHebrew ? 'הבא' : 'Next'}
              {isRTL ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
            </>
          )}
        </Button>
      </div>

      {/* XP reward hint */}
      {rewards && rewards.xp > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {isHebrew 
            ? `בסיום תקבל ${rewards.xp} XP` 
            : `You'll earn ${rewards.xp} XP upon completion`}
        </div>
      )}
    </div>
  );
}

export default GrowthDeepDiveStep;
