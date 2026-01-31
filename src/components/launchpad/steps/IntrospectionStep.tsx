import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Gift, ChevronDown, ChevronUp, Loader2, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/lib/errorHandling';

interface IntrospectionStepProps {
  onComplete: (data: { form_submission_id?: string }) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
  savedFormSubmissionId?: string;
}

interface Question {
  id: string;
  title: string;
  titleEn: string;
  question: string;
  questionEn: string;
  placeholder: string;
  placeholderEn: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'life_end',
    title: 'נקודת הסוף',
    titleEn: 'Life Endpoint',
    question: 'דמיין שזה סוף החיים שלך. מי היית האדם שחי את החיים האלה? האם חיית באמת או שרדת?',
    questionEn: 'Imagine this is the end of your life. Who was the person who lived this life? Did you truly live or just survive?',
    placeholder: 'כתוב בלי לייפות. האמת כאן חשובה יותר...',
    placeholderEn: 'Write without sugarcoating. Truth matters here...',
  },
  {
    id: 'ideal_self',
    title: 'האני האידיאלי',
    titleEn: 'Ideal Self',
    question: 'מי היית רוצה להיות כשאתה מסתכל אחורה? אדם שעמד מאחורי עצמו או אדם שוויתר?',
    questionEn: 'Who would you want to be looking back? Someone who stood by themselves or someone who gave up?',
    placeholder: 'תאר את האדם שהיית רוצה להיות...',
    placeholderEn: 'Describe the person you would want to be...',
  },
  {
    id: 'inner_traits',
    title: 'תכונות פנימיות',
    titleEn: 'Inner Traits',
    question: 'איך האדם שאתה רוצה להיות מתמודד עם פחד? איך הוא מגיב כשלא מבינים אותו?',
    questionEn: 'How does the person you want to be handle fear? How do they react when misunderstood?',
    placeholder: 'תאר את התכונות הפנימיות...',
    placeholderEn: 'Describe the inner traits...',
  },
  {
    id: 'current_reality',
    title: 'המציאות הנוכחית',
    titleEn: 'Current Reality',
    question: 'איפה אתה עכשיו בחיים? מה עובד ומה לא עובד? מה מרגיש תקוע?',
    questionEn: 'Where are you now in life? What works and what doesn\'t? What feels stuck?',
    placeholder: 'היה כנה עם עצמך...',
    placeholderEn: 'Be honest with yourself...',
  },
  {
    id: 'gap',
    title: 'הפער',
    titleEn: 'The Gap',
    question: 'מה הפער בין מי שאתה היום למי שאתה רוצה להיות? מה מונע ממך לסגור אותו?',
    questionEn: 'What\'s the gap between who you are today and who you want to be? What\'s stopping you from closing it?',
    placeholder: 'זהה את המכשולים הפנימיים...',
    placeholderEn: 'Identify your internal obstacles...',
  },
];

interface AnalysisResult {
  summary: string;
  patterns: string[];
  transformation_potential: string;
  recommendation: string;
}

const INTROSPECTION_STORAGE_KEY = 'launchpad_introspection_answers';

const INTROSPECTION_FORM_ID = '45dfc6a5-6f98-444b-a3dd-2c0dd1ca3308';

export function IntrospectionStep({ onComplete, isCompleting, rewards, savedFormSubmissionId }: IntrospectionStepProps) {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    // Load saved answers from localStorage on mount
    try {
      const saved = localStorage.getItem(INTROSPECTION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [openSections, setOpenSections] = useState<string[]>(['life_end']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
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
          console.log('[IntrospectionStep] Loading from savedFormSubmissionId:', savedFormSubmissionId);
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
            .eq('form_id', INTROSPECTION_FORM_ID)
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
          
          // Load answers from submission responses
          if (submission.responses) {
            const loadedAnswers: Record<string, string> = {};
            
            // Handle array format: [{question: "...", answer: "..."}, ...]
            if (Array.isArray(submission.responses)) {
              submission.responses.forEach((r: any, index: number) => {
                // Method 1: Match by index to QUESTIONS array
                if (QUESTIONS[index] && r.answer) {
                  loadedAnswers[QUESTIONS[index].id] = r.answer;
                }
                
                // Method 2: Also try to match by question text as fallback
                if (r.question && r.answer) {
                  const matchedQuestion = QUESTIONS.find(q => 
                    q.question === r.question || q.questionEn === r.question
                  );
                  if (matchedQuestion) {
                    loadedAnswers[matchedQuestion.id] = r.answer;
                  }
                }
              });
            } else if (typeof submission.responses === 'object') {
              // If responses is an object with question IDs as keys
              Object.entries(submission.responses).forEach(([key, value]) => {
                if (typeof value === 'string') {
                  loadedAnswers[key] = value;
                } else if (value && typeof value === 'object' && 'answer' in (value as any)) {
                  loadedAnswers[key] = (value as any).answer;
                }
              });
            }
            
            console.log('[IntrospectionStep] Raw responses:', submission.responses);
            console.log('[IntrospectionStep] Loaded answers:', loadedAnswers);
            console.log('[IntrospectionStep] Answer count:', Object.keys(loadedAnswers).length);
            setAnswers(loadedAnswers);
          }

          // If there's an analysis, load it
          if (submission.form_analyses && submission.form_analyses.length > 0) {
            const analysisData = submission.form_analyses[0];
            const patterns = analysisData.patterns;
            
            // Handle patterns that might be nested
            let patternsList: string[] = [];
            if (Array.isArray(patterns)) {
              patternsList = patterns.map(String);
            } else if (patterns && typeof patterns === 'object') {
              // If patterns is an object with arrays inside
              patternsList = Object.values(patterns).flat().map(String);
            }
            
            setAnalysis({
              summary: analysisData.analysis_summary || '',
              patterns: patternsList,
              transformation_potential: analysisData.transformation_potential || '',
              recommendation: analysisData.recommendation || '',
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
  }, [user?.id, savedFormSubmissionId]);

  // Persist answers to localStorage on every change (only if not from existing submission)
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !existingSubmission) {
      localStorage.setItem(INTROSPECTION_STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers, existingSubmission]);

  // Clear localStorage after successful submission
  const clearSavedAnswers = () => {
    localStorage.removeItem(INTROSPECTION_STORAGE_KEY);
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

  const completedCount = Object.values(answers).filter(a => a.trim().length >= 30).length;
  const isValid = completedCount >= 3;

  const handleSubmit = async () => {
    if (!user?.id) return;

    if (!isValid) {
      const missingTitles = QUESTIONS
        .filter((q) => (answers[q.id] || '').trim().length < 30)
        .slice(0, 3)
        .map((q) => (language === 'he' ? q.title : q.titleEn));

      handleError(
        new Error('Validation: Introspection incomplete'),
        language === 'he'
          ? `כדי להמשיך ענה על לפחות 3 שאלות (30+ תווים). חסר עדיין: ${missingTitles.join(', ')}`
          : `To continue, answer at least 3 questions (30+ chars). Still missing: ${missingTitles.join(', ')}`,
        'IntrospectionStep.handleSubmit',
        language === 'he' ? 'חסר מידע' : 'Missing info'
      );
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Prepare responses for form_submissions
      const responses = QUESTIONS.map(q => ({
        question: language === 'he' ? q.question : q.questionEn,
        answer: answers[q.id] || '',
      }));

      // Generate ID client-side to avoid requiring SELECT permission after INSERT
      const newSubmissionId = crypto.randomUUID();

      // Save to form_submissions
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          id: newSubmissionId,
          form_id: INTROSPECTION_FORM_ID,
          user_id: user.id,
          email: user.email,
          responses,
          status: 'new',
        });

      if (submissionError) {
        console.error('Failed to save submission:', submissionError);
        throw new Error('Failed to save your responses');
      }

      setSubmissionId(newSubmissionId);
      clearSavedAnswers(); // Clear localStorage after successful submission

      // Call AI analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-introspection-form',
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
        // Continue even if analysis fails
      }

      if (analysisData?.analysis) {
        setAnalysis(analysisData.analysis);
        setStep('analysis');
      } else {
        // If no analysis, complete the step directly
        onComplete({ form_submission_id: newSubmissionId });
      }
    } catch (error) {
      console.error('Introspection step error:', error);
      handleError(
        error,
        language === 'he' ? 'שגיאה בשמירת התשובות' : 'Error saving responses',
        'IntrospectionStep.handleSubmit',
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
            {language === 'he' ? 'כבר מילאת את השאלון הזה!' : 'You already completed this!'}
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
          {QUESTIONS.map((question, index) => {
            const answer = answers[question.id];
            if (!answer?.trim()) return null;
            return (
              <motion.div 
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-muted/30 border space-y-2"
              >
                <h4 className="text-sm font-medium text-primary">
                  {language === 'he' ? question.title : question.titleEn}
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
              <Brain className="w-5 h-5 text-primary" />
              {language === 'he' ? 'הניתוח שלך' : 'Your Analysis'}
            </h3>
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            {analysis.patterns.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {analysis.patterns.map((pattern, i) => (
                  <span key={i} className="px-2 py-1 rounded-full bg-muted text-xs">
                    {pattern}
                  </span>
                ))}
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
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            {language === 'he' ? 'ניתוח התודעה שלך' : 'Your Consciousness Analysis'}
          </h1>
        </motion.div>

        {/* Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl bg-primary/5 border border-primary/20"
        >
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>✨</span>
            {language === 'he' ? 'סיכום' : 'Summary'}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
        </motion.div>

        {/* Patterns */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <span>🔍</span>
            {language === 'he' ? 'דפוסים שזוהו' : 'Patterns Identified'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.patterns.map((pattern, i) => (
              <span 
                key={i}
                className="px-3 py-1.5 rounded-full bg-muted text-sm"
              >
                {pattern}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Transformation Potential */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20"
        >
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>🚀</span>
            {language === 'he' ? 'פוטנציאל הטרנספורמציה' : 'Transformation Potential'}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{analysis.transformation_potential}</p>
        </motion.div>

        {/* Recommendation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
        >
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>💡</span>
            {language === 'he' ? 'המלצה' : 'Recommendation'}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{analysis.recommendation}</p>
        </motion.div>

        {/* Rewards & Continue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
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
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold">
          {language === 'he' ? 'מסע התבוננות פנימית' : 'Introspection Journey'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {language === 'he' 
            ? `${completedCount}/5 שאלות הושלמו (מינימום 3)`
            : `${completedCount}/5 questions completed (minimum 3)`
          }
        </p>
      </div>

      {/* What you'll get */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-xl p-4 text-start space-y-2 backdrop-blur-md bg-background/70 border shadow-lg"
      >
        <h3 className="font-semibold text-sm text-foreground">
          {language === 'he' ? 'בסוף תקבל:' : "You'll receive:"}
        </h3>
        <ul className="space-y-1 text-xs text-foreground/80">
          <li className="flex items-center gap-2">
            <span>✨</span>
            {language === 'he' ? 'ניתוח AI של דפוסי החשיבה שלך' : 'AI analysis of your thought patterns'}
          </li>
          <li className="flex items-center gap-2">
            <span>💡</span>
            {language === 'he' ? 'תובנות ונקודות עיוורון' : 'Insights and blind spots'}
          </li>
          <li className="flex items-center gap-2">
            <span>🎯</span>
            {language === 'he' ? 'המלצות אישיות' : 'Personal recommendations'}
          </li>
        </ul>
      </motion.div>

      {/* Questions */}
      <div className="space-y-3">
        {QUESTIONS.map((question, index) => (
          <Collapsible 
            key={question.id} 
            open={openSections.includes(question.id)}
            onOpenChange={() => toggleSection(question.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between p-4 h-auto rounded-xl border backdrop-blur-md bg-background/70 shadow-lg",
                  answers[question.id]?.trim().length >= 30 && "border-primary/50 bg-primary/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{index + 1}</span>
                  <span className="font-medium text-start">
                    {language === 'he' ? question.title : question.titleEn}
                  </span>
                  {answers[question.id]?.trim().length >= 30 && (
                    <span className="text-xs text-primary">✓</span>
                  )}
                </div>
                {openSections.includes(question.id) ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 space-y-3 mx-1 mb-1 rounded-b-xl backdrop-blur-md bg-background/70 border border-t-0 shadow-lg"
              >
                <p className="text-sm text-foreground font-medium">
                  {language === 'he' ? question.question : question.questionEn}
                </p>
                <Textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                  placeholder={language === 'he' ? question.placeholder : question.placeholderEn}
                  className="min-h-[120px] resize-none bg-background/80 backdrop-blur-sm"
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
            language === 'he' ? 'קבל ניתוח AI' : 'Get AI Analysis'
          )}
        </Button>
        
        {!isValid && (
          <p className="text-xs text-muted-foreground">
            {language === 'he' 
              ? 'ענה על לפחות 3 שאלות (30+ תווים בכל אחת)'
              : 'Answer at least 3 questions (30+ characters each)'
            }
          </p>
        )}

        {/* Skip Option */}
        <div className="pt-4 border-t border-border/50">
          {showSkipOption ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {language === 'he' 
                  ? 'מילאת את השאלון הזה בעבר? תוכל לדלג ולהמשיך.'
                  : 'Filled this questionnaire before? You can skip and continue.'
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
              {language === 'he' ? 'כבר מילאתי את השאלון הזה' : 'I already filled this questionnaire'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default IntrospectionStep;
