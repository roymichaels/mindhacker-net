import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FirstChatStepProps {
  onComplete: (data: { summary: string }) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
  savedData?: {
    messages?: Message[];
    questionIndex?: number;
    answers?: string[];
    isComplete?: boolean;
  };
  onAutoSave?: (data: { messages: Message[]; questionIndex: number; answers: string[]; isComplete: boolean }) => void;
}

const ONBOARDING_QUESTIONS_HE = [
  'מה הדבר הכי חשוב לך בחיים כרגע?',
  'מה המכשול הגדול ביותר שאתה מרגיש שעוצר אותך?',
  'איך נראה יום מושלם בשבילך?',
  'מה אתה מוכן לעשות כדי להשיג את השינוי הזה?',
  'מתי בפעם האחרונה הרגשת באמת מחובר לעצמך?',
];

const ONBOARDING_QUESTIONS_EN = [
  'What is the most important thing to you in life right now?',
  'What is the biggest obstacle you feel is holding you back?',
  'What does a perfect day look like for you?',
  'What are you willing to do to achieve this change?',
  'When was the last time you felt truly connected to yourself?',
];

export function FirstChatStep({ onComplete, isCompleting, rewards, savedData, onAutoSave }: FirstChatStepProps) {
  const { language, isRTL } = useTranslation();
  const hasInitialized = useRef(false);
  const hasAppliedSavedData = useRef(false);
  
  // Initialize state from savedData (check if savedData has messages)
  const hasSavedChat = savedData?.messages && savedData.messages.length > 0;
  
  const [messages, setMessages] = useState<Message[]>(hasSavedChat ? savedData.messages : []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(hasSavedChat ? (savedData.questionIndex ?? 0) : 0);
  const [answers, setAnswers] = useState<string[]>(hasSavedChat ? (savedData.answers ?? []) : []);
  
  const questions = language === 'he' ? ONBOARDING_QUESTIONS_HE : ONBOARDING_QUESTIONS_EN;
  const isComplete = questionIndex >= 5;

  // If savedData arrives after initial mount (async load), hydrate state once.
  useEffect(() => {
    if (hasAppliedSavedData.current) return;
    if (!savedData?.messages || savedData.messages.length === 0) return;

    // Only hydrate if we haven't started a new chat already.
    // (If the user has already typed, we don't want to overwrite their local state.)
    if (answers.length > 0) return;

    hasAppliedSavedData.current = true;
    setMessages(savedData.messages);
    setQuestionIndex(savedData.questionIndex ?? 0);
    setAnswers(savedData.answers ?? []);
  }, [savedData, answers.length]);

  // Auto-save whenever state changes
  useEffect(() => {
    if (messages.length > 0 && onAutoSave) {
      onAutoSave({
        messages,
        questionIndex,
        answers,
        isComplete: questionIndex >= 5,
      });
    }
  }, [messages, questionIndex, answers, onAutoSave]);

  // Initial greeting - only if no saved messages
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If we already have messages (from savedData initialization), don't create new greeting
    if (messages.length > 0) {
      return;
    }

    const greeting = language === 'he' 
      ? 'היי! אני אורורה. אשמח להכיר אותך קצת יותר. אשאל אותך 5 שאלות קצרות, ובסוף אתן לך סיכום קצר של מה שלמדתי עליך. מוכן?'
      : "Hi! I'm Aurora. I'd love to get to know you a bit better. I'll ask you 5 short questions, and at the end I'll give you a brief summary of what I learned about you. Ready?";
    
    setMessages([{ role: 'assistant', content: greeting }]);
    
    // Add first question after a delay
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: questions[0] }]);
    }, 1500);
  }, [language, questions, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAnswers(prev => [...prev, userMessage]);
    
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    
    if (nextIndex < 5) {
      // Show next question after a brief delay
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: questions[nextIndex] }]);
        setIsLoading(false);
      }, 800);
    } else if (nextIndex === 5) {
      // Generate summary
      setIsLoading(true);
      try {
        const summary = await generateSummary([...answers, userMessage]);
        setMessages(prev => [...prev, { role: 'assistant', content: summary }]);
      } catch (error) {
        const fallbackSummary = language === 'he'
          ? 'תודה ששיתפת! למדתי הרבה עליך. אתה מחפש שינוי משמעותי ומוכן להשקיע בזה. בוא נמשיך לשלב הבא.'
          : "Thanks for sharing! I learned a lot about you. You're looking for meaningful change and ready to invest in it. Let's continue to the next step.";
        setMessages(prev => [...prev, { role: 'assistant', content: fallbackSummary }]);
      }
      setIsLoading(false);
    }
  };

  const generateSummary = async (allAnswers: string[]): Promise<string> => {
    // Call Aurora chat to generate summary
    const { data, error } = await supabase.functions.invoke('aurora-chat', {
      body: {
        messages: [
          {
            role: 'system',
            content: `You are Aurora, a life coach AI. Based on these 5 answers from a new user, create a brief, warm summary (3-4 sentences) of what you learned about them. Be encouraging and mention 1-2 key themes you noticed. Respond in ${language === 'he' ? 'Hebrew' : 'English'}.`
          },
          {
            role: 'user',
            content: `User's answers to onboarding questions:\n${allAnswers.map((a, i) => `${i+1}. ${a}`).join('\n')}`
          }
        ]
      }
    });

    if (error) throw error;
    return data.content || data.message;
  };

  const handleComplete = () => {
    const summary = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '';
    onComplete({ summary });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <span className="text-3xl">💬</span>
        </div>
        <h1 className="text-2xl font-bold">
          {language === 'he' ? 'שיחה ראשונה עם אורורה' : 'First Chat with Aurora'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {language === 'he' 
            ? `שאלה ${Math.min(questionIndex + 1, 5)} מתוך 5`
            : `Question ${Math.min(questionIndex + 1, 5)} of 5`
          }
        </p>
      </div>

      {/* Chat area */}
      <div className="bg-muted/30 rounded-xl p-4 min-h-[300px] max-h-[400px] overflow-auto">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2",
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border'
              )}>
                <p className="text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card border rounded-2xl px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input or Complete */}
      {!isComplete ? (
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={language === 'he' ? 'כתוב את תשובתך...' : 'Type your answer...'}
            disabled={isLoading}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
              <span>+{rewards.xp} XP</span>
            </div>
          </div>
          
          <Button 
            size="lg" 
            onClick={handleComplete}
            disabled={isCompleting}
            className="min-w-[200px]"
          >
            {isCompleting 
              ? (language === 'he' ? 'שומר...' : 'Saving...') 
              : (language === 'he' ? 'המשך לשלב הבא' : 'Continue to Next Step')
            }
          </Button>
        </div>
      )}
    </div>
  );
}

export default FirstChatStep;
