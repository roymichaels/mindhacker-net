/**
 * CurriculumWizard — Chat-based wizard for creating intensive curricula.
 * Same UX pattern as AuroraLandingWizard.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { Sparkles, Send, Loader2, Flame, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-curriculum`;

interface Props {
  onComplete: (curriculumId: string) => void;
  onClose: () => void;
}

export default function CurriculumWizard({ onComplete, onClose }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [readyToBuild, setReadyToBuild] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: isHe
          ? '🔥 שלום! אני Aurora, ואני הולכת לבנות לך תוכנית לימודים אינטנסיבית.\n\nזה לא קורס רגיל — זה **Boot Camp**. אני אדחוף אותך מאפס למקצוען.\n\n**מה אתה רוצה ללמוד?**\n\nתהיה ספציפי — "Python לData Science", "גיטרה קלאסית", "שיווק דיגיטלי" — כל מה שתרצה.'
          : "🔥 Hey! I'm Aurora, and I'm about to build you an intensive learning curriculum.\n\nThis isn't a casual course — this is a **Boot Camp**. I'll push you from zero to pro.\n\n**What do you want to learn?**\n\nBe specific — \"Python for Data Science\", \"Classical Guitar\", \"Digital Marketing\" — anything you want to master.",
      }]);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Msg = { role: 'user', content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsStreaming(true);

    let assistantContent = '';
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length === allMessages.length + 1) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: allMessages.filter(m => m.role !== 'assistant' || allMessages.indexOf(m) > 0),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch { /* partial */ }
        }
      }

      if (assistantContent.includes('🔥')) {
        setReadyToBuild(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to get response');
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: 'generate',
          messages: messages,
        }),
      });

      if (!resp.ok) throw new Error('Generation failed');

      const data = await resp.json();
      if (!data.success || !data.curriculum_id) throw new Error('Invalid response');

      onComplete(data.curriculum_id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate curriculum');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh]" dir={isHe ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <h3 className="font-bold flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-400" />
          {isHe ? 'Aurora — בונה תוכניות לימוד' : 'Aurora — Curriculum Builder'}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {isHe ? 'תוכנית אינטנסיבית מאפס למקצוען' : 'Intensive boot camp from zero to pro'}
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4 max-w-xl mx-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm text-foreground ${
                msg.role === 'user'
                  ? 'bg-primary/20 border border-primary/40'
                  : 'bg-muted border border-border/40'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="bg-muted/30 rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t px-4 py-3 space-y-3">
        {readyToBuild && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isHe ? 'בונה תוכנית לימודים...' : 'Building curriculum...'}
              </>
            ) : (
              <>
                <GraduationCap className="h-4 w-4" />
                {isHe ? '🔥 בנה את תוכנית הלימודים!' : '🔥 Build the Curriculum!'}
              </>
            )}
          </Button>
        )}
        <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isHe ? 'ספר לי מה תרצה ללמוד...' : 'Tell me what you want to learn...'}
            disabled={isStreaming || isGenerating}
            className="rounded-xl"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isStreaming || isGenerating} className="rounded-xl shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
