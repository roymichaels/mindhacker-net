/**
 * OnboardingChat — Aurora-powered conversational onboarding.
 * Uses the same Aurora chat UI as the main chat and domain assessments.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence } from 'framer-motion';
import AuroraChatMessage from '@/components/aurora/AuroraChatMessage';
import AuroraTypingIndicator from '@/components/aurora/AuroraTypingIndicator';
import AuroraChatInput from '@/components/aurora/AuroraChatInput';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FRICTION_PILLAR_MAP } from '@/flows/onboardingFlowSpec';
import type { Json } from '@/integrations/supabase/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboarding-chat`;

interface Props {
  onComplete?: () => void;
  onClose?: () => void;
}

export default function OnboardingChat({ onComplete, onClose }: Props) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const isHe = language === 'he';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCounter = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleToolCall = useCallback(async (toolArgs: any) => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const step1Data: Record<string, unknown> = {
        entry_context: toolArgs.entry_context,
        pressure_zone: toolArgs.pressure_zone,
        functional_signals: toolArgs.functional_signals,
        failure_moment: toolArgs.failure_moment,
        target_90_days: toolArgs.target_90_days,
        urgency_scale: toolArgs.urgency_scale,
        restructure_willingness: toolArgs.restructure_willingness,
        non_negotiable_constraint: toolArgs.non_negotiable_constraint,
        final_notes: toolArgs.final_notes,
        diagnostic_scores: toolArgs.diagnostic_scores,
        selected_pillar: toolArgs.selected_pillar ?? 
          (toolArgs.pressure_zone ? FRICTION_PILLAR_MAP[toolArgs.pressure_zone] : 'mind'),
      };

      const step2Data: Record<string, unknown> = {
        age_bracket: toolArgs.age_bracket,
        gender: toolArgs.gender,
        body_fat_estimate: toolArgs.body_fat_estimate,
        activity_level: toolArgs.activity_level,
        wake_time: toolArgs.wake_time,
        sleep_time: toolArgs.sleep_time,
        sleep_duration_avg: toolArgs.sleep_duration_avg,
        sleep_quality: toolArgs.sleep_quality,
        screen_before_bed: toolArgs.screen_before_bed,
        wake_during_night: toolArgs.wake_during_night,
        sunlight_after_waking: toolArgs.sunlight_after_waking,
        desired_wake_time: toolArgs.desired_wake_time,
        morning_routine_desire: toolArgs.morning_routine_desire,
        caffeine_intake: toolArgs.caffeine_intake,
        first_caffeine_timing: toolArgs.first_caffeine_timing,
        alcohol_frequency: toolArgs.alcohol_frequency,
        nicotine: toolArgs.nicotine,
        weed_thc: toolArgs.weed_thc,
        daily_screen_time: toolArgs.daily_screen_time,
        shorts_reels: toolArgs.shorts_reels,
        gaming: toolArgs.gaming,
        porn_frequency: toolArgs.porn_frequency,
        late_night_scrolling: toolArgs.late_night_scrolling,
        diet_type: toolArgs.diet_type,
        protein_awareness: toolArgs.protein_awareness,
        meals_per_day: toolArgs.meals_per_day,
        daily_fluid_volume: toolArgs.daily_fluid_volume,
        fluid_sources: toolArgs.fluid_sources,
        nutrition_weak_point: toolArgs.nutrition_weak_point,
        work_type: toolArgs.work_type,
        active_work_hours: toolArgs.active_work_hours,
        availability_hours: toolArgs.availability_hours,
        side_projects: toolArgs.side_projects,
        work_start_time: toolArgs.work_start_time,
        work_end_time: toolArgs.work_end_time,
        commute_duration: toolArgs.commute_duration,
        energy_peak_time: toolArgs.energy_peak_time,
        relationship_status: toolArgs.relationship_status,
        dependents: toolArgs.dependents,
        social_energy_level: toolArgs.social_energy_level,
        exercise_types: toolArgs.exercise_types,
        training_frequency: toolArgs.training_frequency,
        training_consistency: toolArgs.training_consistency,
        previous_change_attempts: toolArgs.previous_change_attempts,
        friction_trigger: toolArgs.friction_trigger,
        stress_default_behavior: toolArgs.stress_default_behavior,
        motivation_driver: toolArgs.motivation_driver,
        preferred_session_length: toolArgs.preferred_session_length,
        preferred_reminders: toolArgs.preferred_reminders,
      };

      const now = new Date().toISOString();
      await supabase
        .from('launchpad_progress')
        .update({
          step_1_intention: JSON.stringify(step1Data),
          step_1_welcome: true,
          step_1_completed_at: now,
          step_2_profile: true,
          step_2_profile_data: step2Data as unknown as Json,
          step_2_profile_completed_at: now,
          step_2_summary: toolArgs.aurora_summary ?? '',
          step_7_dashboard_activated: true,
          step_7_completed_at: now,
          launchpad_complete: true,
          completed_at: now,
          current_step: 11,
          updated_at: now,
        })
        .eq('user_id', user.id);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.functions.invoke('generate-launchpad-summary', {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
      } catch (e) {
        console.error('Summary generation error (non-blocking):', e);
      }

      toast.success(isHe ? 'הכיול הושלם! 🎉' : 'Calibration complete! 🎉');

      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to save onboarding:', err);
      toast.error(isHe ? 'שגיאה בשמירת הנתונים' : 'Error saving data');
      setSaving(false);
    }
  }, [user?.id, navigate, onComplete, isHe]);

  async function streamChat(
    msgs: { role: string; content: string }[],
    onDelta: (t: string) => void,
    onDone: () => void,
    onToolCall: (args: any) => void,
  ) {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: msgs, language }),
    });

    if (!resp.ok || !resp.body) {
      if (resp.status === 429) {
        toast.error(isHe ? 'יותר מדי בקשות, נסה שוב בעוד רגע' : 'Too many requests, try again shortly');
        throw new Error('Rate limited');
      }
      if (resp.status === 402) {
        toast.error(isHe ? 'נגמרו הקרדיטים' : 'Credits exhausted');
        throw new Error('Credits exhausted');
      }
      throw new Error(`Stream failed: ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let toolCallArgs = '';
    let isToolCallFlag = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const choice = parsed.choices?.[0];

          if (choice?.delta?.tool_calls) {
            isToolCallFlag = true;
            for (const tc of choice.delta.tool_calls) {
              if (tc.function?.arguments) toolCallArgs += tc.function.arguments;
            }
          }

          const content = choice?.delta?.content as string | undefined;
          if (content) onDelta(content);

          if (choice?.finish_reason === 'tool_calls' && toolCallArgs) {
            try { onToolCall(JSON.parse(toolCallArgs)); } catch {}
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    if (toolCallArgs && isToolCallFlag) {
      try { onToolCall(JSON.parse(toolCallArgs)); } catch {}
    }
    onDone();
  }

  const addAssistantMessage = useCallback((content: string) => {
    msgCounter.current += 1;
    setMessages(prev => [...prev, {
      id: `onboard-ai-${msgCounter.current}`,
      role: 'assistant',
      content,
      created_at: new Date().toISOString(),
    }]);
  }, []);

  const startConversation = useCallback(async () => {
    if (started) return;
    setStarted(true);
    setIsStreaming(true);
    setStreamingContent('');
    let assistantSoFar = '';
    const updateAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setStreamingContent(assistantSoFar);
    };
    try {
      await streamChat([], updateAssistant, () => {
        setIsStreaming(false);
        if (assistantSoFar) addAssistantMessage(assistantSoFar);
        setStreamingContent('');
      }, handleToolCall);
    } catch (e) {
      console.error(e);
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [language, handleToolCall, started, addAssistantMessage]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    msgCounter.current += 1;
    const userMsg: ChatMessage = {
      id: `onboard-user-${msgCounter.current}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsStreaming(true);
    setStreamingContent('');

    let assistantSoFar = '';
    const updateAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setStreamingContent(assistantSoFar);
    };
    try {
      await streamChat(
        updated.map(m => ({ role: m.role, content: m.content })),
        updateAssistant,
        () => {
          setIsStreaming(false);
          if (assistantSoFar) addAssistantMessage(assistantSoFar);
          setStreamingContent('');
        },
        handleToolCall
      );
    } catch (e) {
      console.error(e);
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [messages, isStreaming, handleToolCall, addAssistantMessage]);

  // Auto-start
  useEffect(() => { startConversation(); }, []);

  if (saving) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-semibold text-foreground">
          {isHe ? 'בונה את הארכיטקטורה שלך...' : 'Building your architecture...'}
        </p>
        <p className="text-sm text-muted-foreground">
          {isHe ? 'מעבד ~59 משתנים מהשיחה שלנו' : 'Processing ~59 variables from our conversation'}
        </p>
        <Loader2 className="w-5 h-5 animate-spin text-primary mt-2" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-80px)]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header — Aurora style */}
      <div className="flex items-center gap-3 py-3 px-4 shrink-0 border-b border-border/30">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shrink-0">
          <AuroraOrbIcon size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">
            {isHe ? 'אורורה' : 'Aurora'}
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {isHe ? 'כיול מערכת' : 'System Calibration'}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Chat messages — Aurora style */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
          <div className="space-y-6">
            {messages.map((message) => (
              <AuroraChatMessage
                key={message.id}
                id={message.id}
                content={message.content}
                isOwn={message.role === 'user'}
                isAI={message.role === 'assistant'}
                timestamp={message.created_at}
              />
            ))}

            {/* Streaming message */}
            {isStreaming && streamingContent && (
              <AuroraChatMessage
                id="streaming"
                content={streamingContent}
                isOwn={false}
                isAI
                isStreaming
              />
            )}

            {/* Typing indicator */}
            {isStreaming && !streamingContent && (
              <AuroraTypingIndicator />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Input — Aurora style */}
      <AuroraChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
