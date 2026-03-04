/**
 * LessonViewer — Renders lesson content based on type (theory, practice, quiz, project).
 * Handles completion, quiz submission, and project evaluation.
 * RTL-optimized with logical properties.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, Target, Brain, Trophy, CheckCircle, XCircle, Loader2, Clock, Zap, AudioLines, VolumeX, Square, CheckSquare, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ReactMarkdown from 'react-markdown';
import { useLessonTTS } from '@/hooks/learn/useLessonTTS';

interface Lesson {
  id: string;
  title: string;
  lesson_type: string;
  content: any;
  status: string;
  score: number | null;
  xp_reward: number;
  time_estimate_minutes: number;
  completed_at: string | null;
  user_submission: any;
  feedback: any;
  module_id: string;
  curriculum_id: string;
}

interface Props {
  lesson: Lesson;
  onComplete: () => void;
  onClose: () => void;
}

export default function LessonViewer({ lesson, onComplete, onClose }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [compAnswers, setCompAnswers] = useState<Record<number, number>>({});
  const [compFeedback, setCompFeedback] = useState<Record<number, boolean> | null>(null);
  const [compPassed, setCompPassed] = useState(false);
  const [projectText, setProjectText] = useState('');
  const [feedback, setFeedback] = useState<any>(lesson.feedback);
  const [score, setScore] = useState<number | null>(lesson.score);
  const tts = useLessonTTS();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checkedExercises, setCheckedExercises] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Detect scroll-to-bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Check if scrolled within 40px of bottom
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (atBottom && !hasScrolledToBottom) setHasScrolledToBottom(true);
  }, [hasScrolledToBottom]);

  // Check after content renders (content might be shorter than viewport)
  useEffect(() => {
    setHasScrolledToBottom(false);
    const timer = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollHeight <= el.clientHeight + 40) {
        setHasScrolledToBottom(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [lesson.id]);

  // Stop TTS when component unmounts
  useEffect(() => {
    return () => { tts.stop(); window.speechSynthesis?.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const compQuestions = lesson.content?.comprehension_questions || [];
  const hasCompQuestions = compQuestions.length > 0 && lesson.lesson_type !== 'quiz';

  // Auto-extract steps from exercise description when no explicit steps exist
  const extractStepsFromDescription = useCallback((description: string): string[] => {
    if (!description) return [];
    // Split by Hebrew/English sentence patterns, numbered items, or line breaks
    const sentences = description
      .split(/(?:\.\s+|\n|;\s+|,\s*(?:ו?אז|ו?לאחר מכן|then|next|and then)\s+)/i)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Only meaningful sentences
    
    if (sentences.length >= 2) return sentences.map((s, i) => `${i + 1}. ${s}${s.endsWith('.') ? '' : '.'}`);
    
    // If single block, try to break by action verbs (Hebrew: הפעל, מצא, האזן, נסה, כתוב, זהה etc.)
    const actionSplits = description.split(/(?:\.)\s*(?=[א-ת])/);
    if (actionSplits.length >= 2) {
      return actionSplits.map(s => s.trim()).filter(s => s.length > 8).map((s, i) => `${i + 1}. ${s}${s.endsWith('.') ? '' : '.'}`);
    }
    
    return [];
  }, []);

  const checkComprehension = () => {
    if (Object.keys(compAnswers).length < compQuestions.length) {
      toast.error(isHe ? 'ענה על כל השאלות' : 'Answer all questions first');
      return false;
    }
    const results: Record<number, boolean> = {};
    let correct = 0;
    compQuestions.forEach((q: any, i: number) => {
      const isCorrect = compAnswers[i] === q.correct;
      results[i] = isCorrect;
      if (isCorrect) correct++;
    });
    setCompFeedback(results);
    const passed = correct === compQuestions.length;
    if (passed) {
      setCompPassed(true);
      toast.success(isHe ? '✅ כל התשובות נכונות!' : '✅ All answers correct!');
    } else {
      toast.error(isHe ? `${correct}/${compQuestions.length} נכון — תקן ונסה שוב` : `${correct}/${compQuestions.length} correct — fix and retry`);
    }
    return passed;
  };

  // Detect if exercise text implies recurring/daily action
  const isRecurringExercise = useCallback((text: string): string | null => {
    const patterns = [
      /כל (בוקר|יום|ערב|שבוע)/i, /every\s*(day|morning|evening|week)/i,
      /חזור על (כך|זה)/i, /repeat\s*(this|daily)/i,
      /באופן יומי/i, /daily/i, /יומית/i, /שגרת/i, /routine/i,
    ];
    for (const p of patterns) {
      if (p.test(text)) return 'daily';
    }
    if (/כל שבוע/i.test(text) || /weekly/i.test(text)) return 'weekly';
    return null;
  }, []);

  // Save practice exercises as action_items in the user's plan
  const saveExercisesToPlan = useCallback(async () => {
    if (!user?.id || lesson.lesson_type !== 'practice') return;
    const exercises = lesson.content?.exercises;
    if (!exercises?.length) return;

    try {
      const items = exercises.map((ex: any, i: number) => {
        const desc = ex.description || '';
        const steps: string[] = ex.steps || extractStepsFromDescription(desc);
        const recurrence = isRecurringExercise(desc + ' ' + (ex.title || '') + ' ' + steps.join(' '));

        return {
          user_id: user.id,
          type: recurrence ? 'habit' : 'task',
          source: 'learn',
          title: ex.title || `${lesson.title} — ${isHe ? 'תרגיל' : 'Exercise'} ${i + 1}`,
          description: desc,
          pillar: 'learn',
          status: 'todo',
          recurrence_rule: recurrence || null,
          metadata: {
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            curriculum_id: lesson.curriculum_id,
            exercise_index: i,
            steps: steps.length > 0 ? steps : undefined,
          },
        };
      });

      const { error } = await supabase.from('action_items').insert(items);
      if (error) {
        console.error('Failed to save exercises to plan:', error);
      } else {
        queryClient.invalidateQueries({ queryKey: ['unified-dashboard'] });
        const recurringCount = items.filter((it: any) => it.recurrence_rule).length;
        if (recurringCount > 0) {
          toast.success(
            isHe 
              ? `📋 ${items.length} משימות נוספו לתוכנית (${recurringCount} חוזרות יומית!)`
              : `📋 ${items.length} tasks added to plan (${recurringCount} recurring daily!)`
          );
        } else {
          toast.success(isHe ? `📋 ${items.length} משימות נוספו לתוכנית` : `📋 ${items.length} tasks added to plan`);
        }
      }
    } catch (err) {
      console.error('Error saving exercises to plan:', err);
    }
  }, [user?.id, lesson, isHe, queryClient, extractStepsFromDescription, isRecurringExercise]);

  const markComplete = async (submissionData?: any, scoreVal?: number, feedbackData?: any) => {
    setIsSubmitting(true);
    try {
      const updateData: any = {
        status: 'completed',
        completed_at: new Date().toISOString(),
      };
      if (submissionData) updateData.user_submission = submissionData;
      if (scoreVal !== undefined) updateData.score = scoreVal;
      if (feedbackData) updateData.feedback = feedbackData;

      const { error } = await supabase
        .from('learning_lessons')
        .update(updateData)
        .eq('id', lesson.id);

      if (error) throw error;

      // Save practice exercises to plan
      if (lesson.lesson_type === 'practice') {
        await saveExercisesToPlan();
      }

      toast.success(`+${lesson.xp_reward} XP! ${isHe ? 'שיעור הושלם!' : 'Lesson completed!'}`);
      onComplete();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitQuiz = async () => {
    const questions = lesson.content?.questions || [];
    if (Object.keys(quizAnswers).length < questions.length) {
      toast.error(isHe ? 'ענה על כל השאלות' : 'Answer all questions');
      return;
    }

    let correct = 0;
    const feedbackItems = questions.map((q: any, i: number) => {
      const isCorrect = quizAnswers[i] === q.correct;
      if (isCorrect) correct++;
      return { question_index: i, correct: isCorrect, explanation: q.explanation };
    });

    const quizScore = Math.round((correct / questions.length) * 100);
    setScore(quizScore);
    setFeedback(feedbackItems);

    if (quizScore >= 70) {
      await markComplete(quizAnswers, quizScore, feedbackItems);
    } else {
      toast.error(isHe ? `${quizScore}% — צריך 70% לפחות. נסה שוב!` : `${quizScore}% — Need 70% to pass. Try again!`);
      setQuizAnswers({});
    }
  };

  const submitProject = async () => {
    if (!projectText.trim()) {
      toast.error(isHe ? 'כתוב את התשובה שלך' : 'Write your submission');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-curriculum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: 'evaluate',
          lessonId: lesson.id,
          submission: projectText,
          lessonContent: lesson.content,
          lessonType: 'project',
        }),
      });

      if (!resp.ok) throw new Error('Evaluation failed');
      const data = await resp.json();
      const evalResult = data.evaluation;
      
      setScore(evalResult.score);
      setFeedback(evalResult);

      if (evalResult.pass !== false && evalResult.score >= 50) {
        await markComplete({ text: projectText }, evalResult.score, evalResult);
      } else {
        toast.error(isHe ? 'לא עברת — שפר ונסה שוב!' : "Didn't pass — improve and try again!");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlreadyDone = lesson.status === 'completed';

  return (
    <div className="flex flex-col h-full bg-background" dir={isHe ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-6 py-4 border-b space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => tts.isPlaying || tts.isLoading ? tts.stop() : tts.play(lesson)}
              title={tts.isPlaying ? (isHe ? 'עצור הקראה' : 'Stop reading') : (isHe ? 'Aurora תקריא לך' : 'Aurora reads aloud')}
            >
              {tts.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : tts.isPlaying ? (
                <VolumeX className="h-4 w-4 text-primary" />
              ) : (
                <AudioLines className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {lesson.time_estimate_minutes}{isHe ? ' דק\'' : ' min'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              +{lesson.xp_reward} XP
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lesson.lesson_type === 'theory' && <BookOpen className="h-5 w-5 text-primary shrink-0" />}
          {lesson.lesson_type === 'practice' && <Target className="h-5 w-5 text-primary shrink-0" />}
          {lesson.lesson_type === 'quiz' && <Brain className="h-5 w-5 text-primary shrink-0" />}
          {lesson.lesson_type === 'project' && <Trophy className="h-5 w-5 text-primary shrink-0" />}
          <h3 className="font-bold text-base text-start">{lesson.title}</h3>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-6 text-start">
          {/* ── THEORY ── */}
          {lesson.lesson_type === 'theory' && (
           <div className="prose prose-sm dark:prose-invert max-w-none [direction:inherit] [&>*]:text-start">
              <ReactMarkdown>{lesson.content?.body || ''}</ReactMarkdown>
              
              {lesson.content?.key_concepts?.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <h4 className="text-primary font-bold mb-2">{isHe ? 'מושגי מפתח' : 'Key Concepts'}</h4>
                  <ul className="space-y-1">
                    {lesson.content.key_concepts.map((c: string, i: number) => (
                      <li key={i} className="text-sm">{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lesson.content?.examples?.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-muted/50 border">
                  <h4 className="font-bold mb-2">{isHe ? 'דוגמאות' : 'Examples'}</h4>
                  {lesson.content.examples.map((ex: string, i: number) => (
                    <p key={i} className="text-sm mb-2">{ex}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PRACTICE ── */}
          {lesson.lesson_type === 'practice' && (
            <div className="space-y-5 text-start">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{lesson.content?.instructions || ''}</ReactMarkdown>
              </div>

              {/* Plan integration summary */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
                <div className="px-4 py-3 border-b border-primary/10 flex items-center gap-2">
                  <CalendarPlus className="h-4 w-4 text-primary" />
                  <h4 className="font-bold text-sm text-primary">
                    {isHe ? 'יתווסף לתוכנית היומית שלך' : 'Will be added to your daily plan'}
                  </h4>
                </div>

                <div className="divide-y divide-border/50">
                  {lesson.content?.exercises?.map((ex: any, i: number) => {
                    const desc = ex.description || '';
                    const recurrence = isRecurringExercise(desc + ' ' + (ex.title || ''));
                    const isHabit = !!recurrence;

                    return (
                      <div key={i} className="px-4 py-3 flex items-start gap-3">
                        <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          isHabit ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-foreground">
                              {ex.title || `${isHe ? 'תרגיל' : 'Exercise'} ${i + 1}`}
                            </span>
                            <Badge variant={isHabit ? 'default' : 'outline'} className="text-[10px] h-5">
                              {isHabit 
                                ? (isHe ? '🔄 הרגל יומי' : '🔄 Daily Habit')
                                : (isHe ? 'משימה' : 'Task')
                              }
                            </Badge>
                          </div>
                          {desc && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-4 py-2.5 bg-primary/10 text-center">
                  <p className="text-xs text-primary font-medium">
                    {(() => {
                      const exercises = lesson.content?.exercises || [];
                      const habitsCount = exercises.filter((ex: any) => 
                        isRecurringExercise((ex.description || '') + ' ' + (ex.title || ''))
                      ).length;
                      const tasksCount = exercises.length - habitsCount;
                      if (isHe) {
                        const parts = [];
                        if (tasksCount > 0) parts.push(`${tasksCount} משימות`);
                        if (habitsCount > 0) parts.push(`${habitsCount} הרגלים יומיים`);
                        return `📋 סה"כ: ${parts.join(' + ')} יתווספו בסיום השיעור`;
                      }
                      const parts = [];
                      if (tasksCount > 0) parts.push(`${tasksCount} task${tasksCount > 1 ? 's' : ''}`);
                      if (habitsCount > 0) parts.push(`${habitsCount} daily habit${habitsCount > 1 ? 's' : ''}`);
                      return `📋 Total: ${parts.join(' + ')} will sync on completion`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── QUIZ ── */}
          {lesson.lesson_type === 'quiz' && (
            <div className="space-y-6 text-start">
              {lesson.content?.questions?.map((q: any, qi: number) => {
                const fb = Array.isArray(feedback) ? feedback.find((f: any) => f.question_index === qi) : null;
                return (
                  <div key={qi} className={`p-4 rounded-xl border space-y-3 ${
                    fb ? (fb.correct ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/40 bg-red-500/5') : 'bg-card'
                  }`}>
                    <p className="font-medium text-sm">{qi + 1}. {q.q}</p>
                    <RadioGroup
                      value={quizAnswers[qi]?.toString()}
                      onValueChange={val => setQuizAnswers(prev => ({ ...prev, [qi]: parseInt(val) }))}
                      disabled={isAlreadyDone}
                      dir={isHe ? 'rtl' : 'ltr'}
                    >
                      {q.options?.map((opt: string, oi: number) => (
                        <div key={oi} className="flex items-center gap-2">
                          <RadioGroupItem value={oi.toString()} id={`q${qi}-o${oi}`} />
                          <Label htmlFor={`q${qi}-o${oi}`} className="text-sm cursor-pointer flex-1">{opt}</Label>
                          {fb && oi === q.correct && <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                          {fb && !fb.correct && oi === quizAnswers[qi] && <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                        </div>
                      ))}
                    </RadioGroup>
                    {fb && !fb.correct && (
                      <p className="text-xs text-muted-foreground italic">{fb.explanation}</p>
                    )}
                  </div>
                );
              })}
              
              {score !== null && (
                <div className={`text-center p-4 rounded-xl ${score >= 70 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  <p className="text-2xl font-bold">{score}%</p>
                  <p className="text-sm">{score >= 70 ? (isHe ? '🎉 עברת!' : '🎉 Passed!') : (isHe ? '❌ נכשלת — נסה שוב' : '❌ Failed — try again')}</p>
                </div>
              )}
            </div>
          )}

          {/* ── PROJECT ── */}
          {lesson.lesson_type === 'project' && (
            <div className="space-y-4 text-start">
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 space-y-2">
                <h4 className="font-bold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-accent-foreground" />
                  {isHe ? 'תיאור הפרויקט' : 'Project Brief'}
                </h4>
                <p className="text-sm">{lesson.content?.brief}</p>
              </div>

              {lesson.content?.requirements?.length > 0 && (
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">{isHe ? 'דרישות' : 'Requirements'}</h4>
                  <ul className="space-y-1">
                    {lesson.content.requirements.map((r: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!isAlreadyDone && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm">{isHe ? 'הגשת הפרויקט' : 'Submit Your Work'}</h4>
                  <Textarea
                    value={projectText}
                    onChange={e => setProjectText(e.target.value)}
                    placeholder={isHe ? 'כתוב את הפתרון שלך כאן...' : 'Write your solution here...'}
                    rows={8}
                    className="rounded-xl"
                    dir={isHe ? 'rtl' : 'ltr'}
                  />
                </div>
              )}

              {feedback && typeof feedback === 'object' && !Array.isArray(feedback) && (
                <div className={`p-4 rounded-xl space-y-2 ${(feedback.score || 0) >= 50 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'} border`}>
                  <p className="text-2xl font-bold text-center">{feedback.score}%</p>
                  <p className="text-sm">{feedback.feedback}</p>
                  {feedback.strengths?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-green-400">{isHe ? 'חוזקות:' : 'Strengths:'}</p>
                      <ul className="text-xs space-y-1">{feedback.strengths.map((s: string, i: number) => <li key={i}>✅ {s}</li>)}</ul>
                    </div>
                  )}
                  {feedback.improvements?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-orange-400">{isHe ? 'לשיפור:' : 'Improvements:'}</p>
                      <ul className="text-xs space-y-1">{feedback.improvements.map((s: string, i: number) => <li key={i}>⚡ {s}</li>)}</ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── COMPREHENSION QUESTIONS (for theory, practice, project) ── */}
          {hasCompQuestions && !isAlreadyDone && (
            <div className="space-y-4 mt-8 pt-6 border-t text-start">
              <h4 className="font-bold flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                {isHe ? 'שאלות הבנה — ענה לפני שתמשיך' : 'Comprehension Check — Answer before continuing'}
              </h4>
              {compQuestions.map((q: any, qi: number) => {
                const fb = compFeedback?.[qi];
                return (
                  <div key={qi} className={`p-4 rounded-xl border space-y-3 ${
                    fb !== undefined ? (fb ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/40 bg-red-500/5') : 'bg-card'
                  }`}>
                    <p className="font-medium text-sm">{qi + 1}. {q.q}</p>
                    <RadioGroup
                      value={compAnswers[qi]?.toString()}
                      onValueChange={val => { setCompAnswers(prev => ({ ...prev, [qi]: parseInt(val) })); setCompFeedback(null); setCompPassed(false); }}
                      dir={isHe ? 'rtl' : 'ltr'}
                    >
                      {q.options?.map((opt: string, oi: number) => (
                        <div key={oi} className="flex items-center gap-2">
                          <RadioGroupItem value={oi.toString()} id={`comp-q${qi}-o${oi}`} />
                          <Label htmlFor={`comp-q${qi}-o${oi}`} className="text-sm cursor-pointer flex-1">{opt}</Label>
                          {fb !== undefined && oi === q.correct && <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                          {fb === false && oi === compAnswers[qi] && oi !== q.correct && <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                        </div>
                      ))}
                    </RadioGroup>
                    {fb === false && q.explanation && (
                      <p className="text-xs text-muted-foreground italic">💡 {q.explanation}</p>
                    )}
                  </div>
                );
              })}
              {!compPassed && (
                <Button onClick={checkComprehension} variant="secondary" className="gap-2">
                  <Brain className="h-4 w-4" />
                  {isHe ? 'בדוק תשובות' : 'Check Answers'}
                </Button>
              )}
              {compPassed && (
                <p className="text-sm text-green-500 font-medium">✅ {isHe ? 'מצוין! עכשיו אפשר לסמן כהושלם.' : 'Great! You can now mark as complete.'}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions — no close button, only action buttons */}
      {!isAlreadyDone && (
        <div className="border-t border-border/30 px-6 py-4 flex justify-end gap-3 bg-background" dir={isHe ? 'rtl' : 'ltr'}>
          {lesson.lesson_type === 'theory' && (
            <Button
              onClick={() => markComplete()}
              disabled={isSubmitting || (hasCompQuestions && !compPassed) || !hasScrolledToBottom}
              className="gap-2 flex-1 sm:flex-initial"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {isHe ? 'סיימתי לקרוא' : 'Mark as Read'}
            </Button>
          )}
          {lesson.lesson_type === 'practice' && (() => {
            const totalExercises = lesson.content?.exercises?.length || 0;
            const checkedCount = Object.values(checkedExercises).filter(Boolean).length;
            const allChecked = totalExercises === 0 || checkedCount >= totalExercises;
            return (
              <Button
                onClick={() => markComplete()}
                disabled={isSubmitting || (hasCompQuestions && !compPassed) || !hasScrolledToBottom || !allChecked}
                className="gap-2 flex-1 sm:flex-initial"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                {isHe ? 'סיימתי לתרגל' : 'Mark as Done'}
              </Button>
            );
          })()}
          {lesson.lesson_type === 'quiz' && (
            <Button onClick={submitQuiz} disabled={isSubmitting} className="gap-2 flex-1 sm:flex-initial">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              {isHe ? 'בדוק תשובות' : 'Submit Quiz'}
            </Button>
          )}
          {lesson.lesson_type === 'project' && (
            <Button onClick={submitProject} disabled={isSubmitting || !projectText.trim() || (hasCompQuestions && !compPassed)} className="gap-2 flex-1 sm:flex-initial">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
              {isHe ? 'הגש פרויקט' : 'Submit Project'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
