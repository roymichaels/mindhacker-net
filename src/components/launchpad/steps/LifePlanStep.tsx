import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Gift, ChevronDown, ChevronUp, Loader2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/lib/errorHandling';

const LIFE_PLAN_FORM_ID = 'f2b4e2c6-40a8-4b8b-9a35-6a1e5c54a6f3';

interface LifePlanStepProps {
  onComplete: (data: { form_submission_id?: string }) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
  savedFormSubmissionId?: string;
}

interface Section {
  id: string;
  title: string;
  titleEn: string;
  question: string;
  questionEn: string;
  placeholder: string;
  placeholderEn: string;
}

const SECTIONS: Section[] = [
  {
    id: 'vision_3y',
    title: 'חזון 3 שנים',
    titleEn: '3-Year Vision',
    question: 'איך נראים החיים שלך בעוד 3 שנים?',
    questionEn: 'What does your life look like in 3 years?',
    placeholder: 'תאר את החיים שאתה רוצה - עבודה, מערכות יחסים, בריאות, מקום מגורים...',
    placeholderEn: 'Describe the life you want - work, relationships, health, living situation...',
  },
  {
    id: 'goals_12m',
    title: '12 חודשים',
    titleEn: '12 Months',
    question: 'מה חייב לקרות השנה כדי שתרגיש שהתקדמת?',
    questionEn: 'What must happen this year for you to feel you\'ve progressed?',
    placeholder: 'רשום 2-3 דברים קונקרטיים שאתה רוצה להשיג בשנה הקרובה...',
    placeholderEn: 'List 2-3 concrete things you want to achieve in the next year...',
  },
  {
    id: 'goals_90d',
    title: '90 ימים',
    titleEn: '90 Days',
    question: 'מה היעדים המדידים שלך ל-90 הימים הקרובים?',
    questionEn: 'What are your measurable goals for the next 90 days?',
    placeholder: 'יעדים ספציפיים ומדידים שתוכל לבדוק אם השגת...',
    placeholderEn: 'Specific, measurable goals you can check if achieved...',
  },
  {
    id: 'identity',
    title: 'זהות נדרשת',
    titleEn: 'Required Identity',
    question: 'מי אתה צריך להיות כדי שזה יקרה?',
    questionEn: 'Who do you need to be for this to happen?',
    placeholder: 'אילו תכונות, הרגלים, ואמונות אתה צריך לפתח...',
    placeholderEn: 'What traits, habits, and beliefs do you need to develop...',
  },
  {
    id: 'systems',
    title: 'מערכות חיים',
    titleEn: 'Life Systems',
    question: 'איך נראים השינה, התזונה, התנועה, והעבודה שלך?',
    questionEn: 'What does your sleep, nutrition, movement, and work look like?',
    placeholder: 'תאר את השגרה היומית האידיאלית שלך...',
    placeholderEn: 'Describe your ideal daily routine...',
  },
  {
    id: 'risks',
    title: 'אילוצים וסיכונים',
    titleEn: 'Constraints & Risks',
    question: 'מה עלול להפיל אותך ומה תעשה כשזה יקרה?',
    questionEn: 'What might derail you and what will you do when it happens?',
    placeholder: 'זהה מכשולים אפשריים ותכנן תגובה מראש...',
    placeholderEn: 'Identify possible obstacles and plan your response in advance...',
  },
];

interface LifePlanAnalysis {
  summary: string;
  vision_clarity: string;
  action_readiness: string;
  key_goals: string[];
  potential_blockers: string[];
  next_steps: string[];
}

const LIFE_PLAN_STORAGE_KEY = 'launchpad_life_plan_answers';

export function LifePlanStep({ onComplete, isCompleting, rewards, savedFormSubmissionId }: LifePlanStepProps) {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    // Load saved answers from localStorage on mount
    try {
      const saved = localStorage.getItem(LIFE_PLAN_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [openSections, setOpenSections] = useState<string[]>(['vision_3y']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<LifePlanAnalysis | null>(null);
  const [step, setStep] = useState<'questions' | 'analysis' | 'completed'>('questions');
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  // Check for existing submission when component mounts
  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (!user?.id) {
        setIsLoadingExisting(false);
        return;
      }

      try {
        let submissionToLoad = null;
        
        // Priority 1: If we have a saved form submission ID from launchpad_progress, load it directly
        if (savedFormSubmissionId) {
          console.log('[LifePlanStep] Loading from savedFormSubmissionId:', savedFormSubmissionId);
          const { data: submission } = await supabase
            .from('form_submissions')
            .select('*, form_analyses(*)')
            .eq('id', savedFormSubmissionId)
            .single();
          
          if (submission) {
            submissionToLoad = submission;
          }
        }
        
        // Priority 2: Fallback to searching by form_id
        if (!submissionToLoad) {
          const { data: submissions } = await supabase
            .from('form_submissions')
            .select('*, form_analyses(*)')
            .eq('form_id', LIFE_PLAN_FORM_ID)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (submissions && submissions.length > 0) {
            submissionToLoad = submissions[0];
          }
        }
        
        if (submissionToLoad) {
          const submission = submissionToLoad;
          setExistingSubmission(submission);
          setSubmissionId(submission.id);
          
          console.log('[LifePlanStep] Raw responses:', submission.responses);
          console.log('[LifePlanStep] Loaded submission ID:', submission.id);
          // Load answers from submission responses
          if (submission.responses) {
            const loadedAnswers: Record<string, string> = {};
            
            // Handle array format: [{question: "...", answer: "..."}, ...]
            if (Array.isArray(submission.responses)) {
              submission.responses.forEach((r: any, index: number) => {
                // Method 1: Match by index to SECTIONS array
                if (SECTIONS[index] && r.answer) {
                  loadedAnswers[SECTIONS[index].id] = r.answer;
                }
                
                // Method 2: Also try to match by question text as fallback
                if (r.question && r.answer) {
                  const matchedSection = SECTIONS.find(s => 
                    s.question === r.question || s.questionEn === r.question
                  );
                  if (matchedSection) {
                    loadedAnswers[matchedSection.id] = r.answer;
                  }
                }
              });
            } else if (typeof submission.responses === 'object') {
              // If responses is an object with section IDs as keys
              Object.entries(submission.responses).forEach(([key, value]) => {
                if (typeof value === 'string') {
                  loadedAnswers[key] = value;
                } else if (value && typeof value === 'object' && 'answer' in (value as any)) {
                  loadedAnswers[key] = (value as any).answer;
                }
              });
            }
            
            console.log('[LifePlanStep] Loaded answers:', loadedAnswers);
            console.log('[LifePlanStep] Answer count:', Object.keys(loadedAnswers).length);
            setAnswers(loadedAnswers);
          }

          // If there's an analysis, load it
          if (submission.form_analyses && submission.form_analyses.length > 0) {
            const analysisData = submission.form_analyses[0];
            setAnalysis({
              summary: analysisData.analysis_summary || '',
              vision_clarity: language === 'he' ? 'גבוהה' : 'High',
              action_readiness: language === 'he' ? 'מוכן לפעולה' : 'Ready for action',
              key_goals: analysisData.patterns ? (Array.isArray(analysisData.patterns) ? analysisData.patterns.map(String).slice(0, 3) : []) : [],
              potential_blockers: [],
              next_steps: analysisData.recommendation ? [analysisData.recommendation] : [],
            });
          }
          
          setStep('completed');
        }
      } catch (error) {
        console.error('Error checking existing submission:', error);
      } finally {
        setIsLoadingExisting(false);
      }
    };

    checkExistingSubmission();
  }, [user?.id, language, savedFormSubmissionId]);

  // Persist answers to localStorage on every change (only if not from existing submission)
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !existingSubmission) {
      localStorage.setItem(LIFE_PLAN_STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers, existingSubmission]);

  // Clear localStorage after successful submission
  const clearSavedAnswers = () => {
    localStorage.removeItem(LIFE_PLAN_STORAGE_KEY);
  };

  const handleSkip = () => {
    onComplete({});
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const completedCount = Object.values(answers).filter(a => a.trim().length >= 20).length;
  const isValid = completedCount >= 3; // At least 3 sections filled

  const handleSubmit = async () => {
    if (!user?.id) return;

    if (!isValid) {
      const missingTitles = SECTIONS
        .filter((s) => (answers[s.id] || '').trim().length < 20)
        .slice(0, 3)
        .map((s) => (language === 'he' ? s.title : s.titleEn));

      handleError(
        new Error('Validation: Life plan incomplete'),
        language === 'he'
          ? `כדי להמשיך מלא לפחות 3 סעיפים (20+ תווים). חסר עדיין: ${missingTitles.join(', ')}`
          : `To continue, fill at least 3 sections (20+ chars). Still missing: ${missingTitles.join(', ')}`,
        'LifePlanStep.handleSubmit',
        language === 'he' ? 'חסר מידע' : 'Missing info'
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      // Prepare responses for storage
      const responses = SECTIONS.map(s => ({
        question: language === 'he' ? s.question : s.questionEn,
        answer: answers[s.id] || '',
      }));

      // Generate ID client-side to avoid requiring SELECT permission after INSERT
      const newSubmissionId = crypto.randomUUID();

      // Save to form_submissions
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          id: newSubmissionId,
          form_id: LIFE_PLAN_FORM_ID,
          user_id: user.id,
          email: user.email,
          responses,
          status: 'new',
          metadata: { type: 'life_plan', source: 'launchpad' },
        });

      if (submissionError) {
        console.error('Failed to save submission:', submissionError);
        throw new Error('Failed to save your responses');
      }

      setSubmissionId(newSubmissionId);
      clearSavedAnswers(); // Clear localStorage after successful submission

      // Also save to aurora_life_visions for the dashboard
      const vision3y = answers.vision_3y?.trim();
      if (vision3y) {
        await supabase
          .from('aurora_life_visions')
          .upsert({
            user_id: user.id,
            timeframe: '5_year',
            title: vision3y.substring(0, 100),
            description: vision3y,
            focus_areas: Object.keys(answers).filter(k => answers[k]?.trim().length > 20),
          }, { onConflict: 'user_id,timeframe' });
      }

      // Call AI for life plan analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-life-plan',
        {
          body: {
            form_submission_id: newSubmissionId,
            responses,
            language,
          },
        }
      );

      if (analysisError) {
        console.error('AI analysis error:', analysisError);
        // Continue even if analysis fails - use fallback
      }

      if (analysisData?.analysis) {
        setAnalysis(analysisData.analysis);
        setStep('analysis');
      } else {
        // Fallback analysis
        setAnalysis({
          summary: language === 'he' 
            ? 'תודה על בניית תוכנית החיים שלך! יש לך חזון ברור ומטרות מוגדרות.'
            : 'Thank you for building your life plan! You have a clear vision and defined goals.',
          vision_clarity: language === 'he' ? 'גבוהה' : 'High',
          action_readiness: language === 'he' ? 'מוכן לפעולה' : 'Ready for action',
          key_goals: Object.values(answers).slice(0, 3).map(a => a.substring(0, 50) + '...'),
          potential_blockers: [
            language === 'he' ? 'חוסר עקביות' : 'Lack of consistency',
            language === 'he' ? 'הסחות דעת' : 'Distractions',
          ],
          next_steps: [
            language === 'he' ? 'הגדר 3 פעולות לשבוע הקרוב' : 'Define 3 actions for next week',
            language === 'he' ? 'בחר עוגן יומי' : 'Choose a daily anchor',
          ],
        });
        setStep('analysis');
      }
    } catch (error) {
      console.error('Life plan step error:', error);
      handleError(
        error,
        language === 'he' ? 'שגיאה בשמירת התוכנית' : 'Error saving plan',
        'LifePlanStep.handleSubmit',
        language === 'he' ? 'שגיאה' : 'Error'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinueAfterAnalysis = () => {
    onComplete(submissionId ? { form_submission_id: submissionId } : {});
  };

  // Loading state
  if (isLoadingExisting) {
    return (
      <div className="flex items-center justify-center py-20" dir={isRTL ? 'rtl' : 'ltr'}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Completed View - Show existing submission with answers
  if (step === 'completed' && existingSubmission) {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold">
            {language === 'he' ? 'כבר בנית את תוכנית החיים!' : 'You already built your life plan!'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === 'he' 
              ? 'הנה התשובות שלך מהפעם הקודמת'
              : 'Here are your previous answers'
            }
          </p>
        </motion.div>

        {/* Show previous answers */}
        <div className="space-y-3">
          {SECTIONS.map((section, index) => {
            const answer = answers[section.id];
            if (!answer?.trim()) return null;
            return (
              <motion.div 
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-muted/30 border space-y-2"
              >
                <h4 className="text-sm font-medium text-primary">
                  {language === 'he' ? section.title : section.titleEn}
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {answer}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Show analysis if available */}
        {analysis && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-3"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {language === 'he' ? 'סיכום התוכנית' : 'Plan Summary'}
            </h3>
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            {analysis.key_goals.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium">{language === 'he' ? 'מטרות:' : 'Goals:'}</p>
                <ul className="space-y-1">
                  {analysis.key_goals.map((goal, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span>•</span> {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Continue button */}
        <div className="text-center pt-4">
          <Button 
            size="lg" 
            onClick={handleContinueAfterAnalysis}
            disabled={isCompleting}
            className="min-w-[200px]"
          >
            {isCompleting 
              ? (language === 'he' ? 'שומר...' : 'Saving...') 
              : (language === 'he' ? 'המשך לשלב הבא' : 'Continue to Next Step')
            }
          </Button>
        </div>
      </div>
    );
  }

  // Analysis View
  if (step === 'analysis' && analysis) {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            {language === 'he' ? 'סיכום תוכנית החיים' : 'Life Plan Summary'}
          </h1>
        </motion.div>

        {/* Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl bg-primary/5 border border-primary/20"
        >
          <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
        </motion.div>

        {/* Vision Clarity & Action Readiness */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {language === 'he' ? 'בהירות חזון' : 'Vision Clarity'}
            </p>
            <p className="font-semibold text-primary">{analysis.vision_clarity}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {language === 'he' ? 'מוכנות לפעולה' : 'Action Readiness'}
            </p>
            <p className="font-semibold text-green-600">{analysis.action_readiness}</p>
          </div>
        </motion.div>

        {/* Key Goals */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <span>🎯</span>
            {language === 'he' ? 'מטרות מפתח' : 'Key Goals'}
          </h3>
          <ul className="space-y-2">
            {analysis.key_goals.map((goal, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                {goal}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Next Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🚀</span>
            {language === 'he' ? 'הצעדים הבאים' : 'Next Steps'}
          </h3>
          <ul className="space-y-2">
            {analysis.next_steps.map((step, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-xs">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Rewards & Continue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4 text-center pt-4"
        >
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
              <span>+{rewards.xp} XP</span>
            </div>
            {rewards.tokens > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600">
                <Gift className="w-4 h-4" />
                <span>+{rewards.tokens} {language === 'he' ? 'טוקנים' : 'Tokens'}</span>
              </div>
            )}
          </div>

          <Button 
            size="lg" 
            onClick={handleContinueAfterAnalysis}
            disabled={isCompleting}
            className="min-w-[200px]"
          >
            {isCompleting 
              ? (language === 'he' ? 'שומר...' : 'Saving...') 
              : (language === 'he' ? 'המשך לשלב הבא' : 'Continue to Next Step')
            }
          </Button>
        </motion.div>
      </div>
    );
  }

  // Questions View
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <span className="text-3xl">🎯</span>
        </div>
        <h1 className="text-2xl font-bold">
          {language === 'he' ? 'בניית תוכנית חיים' : 'Building Your Life Plan'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {language === 'he' 
            ? `${completedCount}/6 סעיפים הושלמו (מינימום 3)`
            : `${completedCount}/6 sections completed (minimum 3)`
          }
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section, index) => (
          <Collapsible 
            key={section.id} 
            open={openSections.includes(section.id)}
            onOpenChange={() => toggleSection(section.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between p-4 h-auto rounded-xl border",
                  "backdrop-blur-md bg-background/70 shadow-lg",
                  "hover:bg-background/80 transition-all duration-200",
                  answers[section.id]?.trim().length >= 20 && "border-primary/50 bg-primary/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-foreground">{index + 1}</span>
                  <span className="font-medium text-foreground">
                    {language === 'he' ? section.title : section.titleEn}
                  </span>
                  {answers[section.id]?.trim().length >= 20 && (
                    <span className="text-xs text-primary">✓</span>
                  )}
                </div>
                {openSections.includes(section.id) ? (
                  <ChevronUp className="w-4 h-4 text-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 space-y-3 backdrop-blur-md bg-background/70 rounded-b-xl border-x border-b shadow-inner"
              >
                <p className="text-sm font-medium text-foreground">
                  {language === 'he' ? section.question : section.questionEn}
                </p>
                <Textarea
                  value={answers[section.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [section.id]: e.target.value }))}
                  placeholder={language === 'he' ? section.placeholder : section.placeholderEn}
                  className="min-h-[100px] resize-none bg-background/80 backdrop-blur-sm border-border/50 text-foreground"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Rewards & Submit */}
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
            <span>+{rewards.xp} XP</span>
          </div>
          {rewards.tokens > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600">
              <Gift className="w-4 h-4" />
              <span>+{rewards.tokens} {language === 'he' ? 'טוקנים' : 'Tokens'}</span>
            </div>
          )}
        </div>
        
        <Button 
          size="lg" 
          onClick={handleSubmit}
          disabled={isAnalyzing}
          className="min-w-[200px] gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === 'he' ? 'מנתח...' : 'Analyzing...'}
            </>
          ) : (
            language === 'he' ? 'קבל סיכום' : 'Get Summary'
          )}
        </Button>
        
        {!isValid && (
          <p className="text-xs text-muted-foreground">
            {language === 'he' 
              ? 'מלא לפחות 3 סעיפים (20+ תווים בכל אחד)'
              : 'Fill at least 3 sections (20+ characters each)'
            }
          </p>
        )}

        {/* Skip Option */}
        <div className="pt-4 border-t border-border/50">
          {showSkipOption ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {language === 'he' 
                  ? 'מילאת תוכנית חיים בעבר? תוכל לדלג ולהמשיך.'
                  : 'Created a life plan before? You can skip and continue.'
                }
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSkipOption(false)}
                >
                  {language === 'he' ? 'ביטול' : 'Cancel'}
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleSkip}
                  disabled={isCompleting}
                >
                  {isCompleting 
                    ? (language === 'he' ? 'ממשיך...' : 'Continuing...')
                    : (language === 'he' ? 'דלג והמשך' : 'Skip & Continue')
                  }
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSkipOption(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              {language === 'he' ? 'כבר מילאתי תוכנית חיים' : 'I already have a life plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LifePlanStep;
