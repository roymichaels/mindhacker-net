/**
 * CareerWizard — Hybrid wizard with structured questions + AI chat.
 * Phase 1: Structured card-based questions per career path
 * Phase 2: AI conversational deep-dive
 * Submits application for admin approval.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChromeVisibility } from '@/contexts/ChromeVisibilityContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubmitCareerApplication } from '@/hooks/useCareerApplication';
import { supabase } from '@/integrations/supabase/client';
import { CAREER_QUESTIONS, type WizardQuestion } from './CareerWizardQuestions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WizardHeader } from '@/components/ui/WizardHeader';
import { toast } from 'sonner';
import {
  ChevronRight, ChevronLeft, Send, Sparkles, Loader2, CheckCircle2,
  Briefcase, GraduationCap, Heart, Palette, Code,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { CareerPath } from '@/pages/CareerHub';

interface CareerWizardProps {
  careerPath: CareerPath;
  onComplete?: () => void;
}

const PATH_META: Record<CareerPath, { icon: typeof Briefcase; gradient: string; border: string; titleHe: string; titleEn: string }> = {
  coach: { icon: GraduationCap, gradient: 'from-purple-500/20 to-indigo-500/10', border: 'border-purple-500/30', titleHe: 'הגשת מועמדות — מאמן', titleEn: 'Apply — Coach' },
  therapist: { icon: Heart, gradient: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/30', titleHe: 'הגשת מועמדות — מטפל', titleEn: 'Apply — Therapist' },
  freelancer: { icon: Code, gradient: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30', titleHe: 'הגשת מועמדות — פרילנסר', titleEn: 'Apply — Freelancer' },
  creator: { icon: Palette, gradient: 'from-sky-500/20 to-blue-500/10', border: 'border-sky-500/30', titleHe: 'הגשת מועמדות — יוצר תוכן', titleEn: 'Apply — Creator' },
  business: { icon: Briefcase, gradient: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', titleHe: 'הגשת מועמדות — בעל עסק', titleEn: 'Apply — Business' },
};

export default function CareerWizard({ careerPath, onComplete }: CareerWizardProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const navigate = useNavigate();
  const submitMutation = useSubmitCareerApplication();
  const { hideHeader, showHeader } = useChromeVisibility();

  useEffect(() => {
    hideHeader();
    return () => showHeader();
  }, [hideHeader, showHeader]);

  const questions = CAREER_QUESTIONS[careerPath] || [];
  const meta = PATH_META[careerPath];
  const Icon = meta.icon;

  // Phase 1: structured questions
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [phase, setPhase] = useState<'structured' | 'ai_chat' | 'submitted'>('structured');

  // Phase 2: AI chat
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiComplete, setAiComplete] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const q = questions[currentQ] as WizardQuestion | undefined;
  const totalSteps = questions.length + 1;
  const progress = phase === 'structured'
    ? ((currentQ) / totalSteps) * 100
    : phase === 'ai_chat'
      ? ((questions.length + 0.5) / totalSteps) * 100
      : 100;

  const handleSelect = (value: string) => {
    if (!q) return;
    if (q.type === 'multi_select') {
      const current = (answers[q.id] as string[]) || [];
      const max = q.validation?.maxSelected;
      if (current.includes(value)) {
        setAnswers({ ...answers, [q.id]: current.filter(v => v !== value) });
      } else if (!max || current.length < max) {
        setAnswers({ ...answers, [q.id]: [...current, value] });
      }
    } else {
      setAnswers({ ...answers, [q.id]: value });
    }
  };

  const canAdvance = () => {
    if (!q) return false;
    const ans = answers[q.id];
    if (q.type === 'text') return typeof ans === 'string' && ans.length > 0;
    if (q.type === 'multi_select') {
      const arr = (ans as string[]) || [];
      const min = q.validation?.minSelected || 1;
      return arr.length >= min;
    }
    return !!ans;
  };

  const goNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setPhase('ai_chat');
      startAiChat();
    }
  };

  const goBack = () => {
    if (phase === 'ai_chat' && messages.length === 0) {
      setPhase('structured');
      return;
    }
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const startAiChat = async () => {
    setAiLoading(true);
    try {
      const initMsg = isHe ? 'שלום, אני רוצה להגיש מועמדות.' : 'Hello, I want to apply.';
      const res = await supabase.functions.invoke('career-wizard', {
        body: {
          career_path: careerPath,
          structured_answers: answers,
          messages: [{ role: 'user', content: initMsg }],
          language,
        },
      });
      if (res.error) throw res.error;
      setMessages([
        { role: 'user', content: initMsg },
        { role: 'assistant', content: res.data.reply },
      ]);
      if (res.data.is_complete) {
        setAiComplete(true);
        setAiSummary(res.data.summary);
      }
    } catch (err) {
      console.error(err);
      toast.error(isHe ? 'שגיאה בהתחלת השיחה' : 'Error starting conversation');
    } finally {
      setAiLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || aiLoading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setAiLoading(true);

    try {
      const res = await supabase.functions.invoke('career-wizard', {
        body: {
          career_path: careerPath,
          structured_answers: answers,
          messages: newMessages,
          language,
        },
      });
      if (res.error) throw res.error;
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
      if (res.data.is_complete) {
        setAiComplete(true);
        setAiSummary(res.data.summary);
      }
    } catch (err) {
      console.error(err);
      toast.error(isHe ? 'שגיאה בשליחה' : 'Error sending message');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync({
        careerPath,
        structuredAnswers: answers,
        aiConversation: messages,
        aiSummary,
      });
      setPhase('submitted');
      toast.success(isHe ? 'הבקשה נשלחה בהצלחה!' : 'Application submitted successfully!');
      onComplete?.();
    } catch (err) {
      console.error(err);
      toast.error(isHe ? 'שגיאה בשליחה' : 'Error submitting application');
    }
  };

  if (phase === 'submitted') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-black text-foreground">{isHe ? 'הבקשה נשלחה!' : 'Application Submitted!'}</h2>
        <p className="text-muted-foreground max-w-sm">
          {isHe
            ? 'הבקשה שלך נמצאת בבדיקה. נעדכן אותך ברגע שהיא תאושר.'
            : 'Your application is under review. We\'ll notify you once it\'s approved.'}
        </p>
        <Button variant="outline" onClick={() => navigate('/fm/work')}>
          {isHe ? 'חזור לשוק החופשי' : 'Back to Free Market'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[80vh] max-w-lg mx-auto w-full">
      {/* Header — shared wizard header */}
      <WizardHeader
        label={isHe ? meta.titleHe : meta.titleEn}
        icon={<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>}
        segments={[...questions.map((_, idx) => ({
          fill: phase === 'ai_chat' || phase === 'submitted' ? 1
            : idx < currentQ ? 1
            : idx === currentQ ? 0.5
            : 0,
        })), {
          fill: phase === 'submitted' ? 1 : phase === 'ai_chat' ? 0.5 : 0,
        }]}
        onExit={() => navigate(-1)}
      />

      {/* Phase 1: Structured Questions */}
      {phase === 'structured' && q && (
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 30 : -30 }}
              className="flex-1 flex flex-col gap-4"
            >
              <h2 className="text-lg font-bold text-foreground px-1">
                {isHe ? q.titleHe : q.titleEn}
              </h2>

              {q.type === 'text' ? (
                <Textarea
                  value={(answers[q.id] as string) || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder={isHe ? 'כתוב כאן...' : 'Write here...'}
                  className="min-h-[120px] bg-card border-border/50"
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {q.options?.map((opt) => {
                    const selected = q.type === 'multi_select'
                      ? ((answers[q.id] as string[]) || []).includes(opt.value)
                      : answers[q.id] === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-xl border text-start transition-all',
                          selected
                            ? 'bg-primary/10 border-primary/40 text-foreground'
                            : 'bg-card border-border/50 text-muted-foreground hover:border-primary/20'
                        )}
                      >
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-sm font-semibold leading-tight">
                          {isHe ? opt.labelHe : opt.labelEn}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
            <Button variant="ghost" size="sm" onClick={goBack} disabled={currentQ === 0}>
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {isHe ? 'הקודם' : 'Previous'}
            </Button>
            <Button size="sm" onClick={goNext} disabled={!canAdvance()} className="gap-1.5">
              {currentQ === questions.length - 1
                ? (isHe ? 'המשך לשיחה' : 'Continue to Chat')
                : (isHe ? 'הבא' : 'Next')}
              <Sparkles className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Phase 2: AI Chat */}
      {phase === 'ai_chat' && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 px-1 mb-4 max-h-[50vh]">
            {messages.filter(m => m.role !== 'system').map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                  msg.role === 'user'
                    ? 'bg-primary/15 text-foreground ml-auto'
                    : 'bg-card border border-border/50 text-foreground'
                )}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </motion.div>
            ))}
            {aiLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isHe ? 'Aurora חושבת...' : 'Aurora is thinking...'}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {aiComplete && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-primary/30 bg-primary/10 p-4 mb-4 text-center"
            >
              <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground mb-3">
                {isHe ? 'השיחה הושלמה! מוכן לשלוח?' : 'Conversation complete! Ready to submit?'}
              </p>
              <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="gap-2">
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isHe ? 'שלח לאישור' : 'Submit for Approval'}
              </Button>
            </motion.div>
          )}

          {!aiComplete && (
            <div className="flex items-end gap-2 border-t border-border/30 pt-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={isHe ? 'כתוב תשובה...' : 'Type your answer...'}
                className="min-h-[44px] max-h-[120px] bg-card border-border/50 text-sm resize-none"
                rows={1}
              />
              <Button size="icon" onClick={sendMessage} disabled={!input.trim() || aiLoading} className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
