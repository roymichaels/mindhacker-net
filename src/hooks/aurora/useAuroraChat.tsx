import { useState, useCallback, useRef, useEffect } from 'react';
import { debug } from '@/lib/debug';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { parseAllTags, stripAllTags } from '@/lib/commandBus';
import { useCommandBus } from './useCommandBus';
import { stripReasoning } from '@/lib/stripReasoning';
import { diagnosticsBus, detectLeaks } from '@/diagnostics/diagnosticsBus';
import { AION_CHAT_URL } from '@/lib/chat/canonicalChat';

const AURORA_CHAT_URL = AION_CHAT_URL;
const AION_FALLBACK_HE = 'אני מחובר, אבל הייתה תקלה בחשיבה שלי. נסה שוב רגע.';

// Freshness guard: remember the previous assistant text so we can flag when
// AION repeats itself (likely caused by deterministic context or a cached
// briefing being injected upstream). Module-scope so it survives re-renders.
let _lastAssistantText = '';
function _normalizeForCompare(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/[\d:.,]/g, '').trim().toLowerCase();
}
function _similarityRatio(a: string, b: string): number {
  if (!a || !b) return 0;
  const A = _normalizeForCompare(a);
  const B = _normalizeForCompare(b);
  if (!A || !B) return 0;
  const short = A.length < B.length ? A : B;
  const long = A.length < B.length ? B : A;
  if (long.includes(short) && short.length > 24) return short.length / long.length;
  // crude token overlap
  const ta = new Set(A.split(' '));
  const tb = new Set(B.split(' '));
  let hit = 0;
  ta.forEach((t) => { if (tb.has(t)) hit++; });
  return hit / Math.max(ta.size, tb.size, 1);
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string;
  is_ai_message: boolean;
  is_read: boolean;
  created_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export const useAuroraChat = (conversationId: string | null) => {
  const { user } = useAuth();
  const { language } = useTranslation();
  const queryClient = useQueryClient();
  const { dispatchCommands, pendingCommands } = useCommandBus();
  const chatContext = useAuroraChatContextSafe();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [failedMessageIds, setFailedMessageIds] = useState<Set<string>>(new Set());
  
  const messageCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track previous conversation for cleanup summarization
  const prevConversationRef = useRef<string | null>(null);
  const prevMessagesRef = useRef<Message[]>([]);

  // Summarize when switching away from a conversation
  useEffect(() => {
    const prevId = prevConversationRef.current;
    const prevMsgs = prevMessagesRef.current;

    if (prevId && prevId !== conversationId && prevMsgs.length >= 4 && user?.id) {
      // Fire-and-forget summarization of the conversation we're leaving
      const chatMsgs: ChatMessage[] = prevMsgs.slice(-10).map((m) => ({
        role: (m.is_ai_message ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.content,
      }));
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-summarize-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ userId: user.id, conversationId: prevId, messages: chatMsgs }),
      }).catch(() => {});
    }

    prevConversationRef.current = conversationId;
  }, [conversationId, user?.id]);

  // Keep prevMessagesRef in sync
  useEffect(() => {
    prevMessagesRef.current = messages;
  }, [messages]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch messages:', error);
        return;
      }

      setMessages(data || []);
      messageCountRef.current = data?.length || 0;
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`aurora-messages:${conversationId}:${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          messageCountRef.current++;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Trigger background analysis every 4 messages
  const triggerBackgroundAnalysis = useCallback(async () => {
    if (!user?.id || !conversationId) return;

    try {
      const chatMessages: ChatMessage[] = messages.map((m) => ({
        role: m.is_ai_message ? 'assistant' : 'user',
        content: m.content,
      }));

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          userId: user.id,
          messages: chatMessages,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ['aurora-life-model'] });
      queryClient.invalidateQueries({ queryKey: ['aurora-dashboard'] });
    } catch (err) {
      console.error('Background analysis failed:', err);
    }
  }, [user?.id, conversationId, messages, queryClient]);

  // Summarize conversation for memory
  const summarizeConversation = useCallback(async () => {
    if (!user?.id || !conversationId || messages.length < 6) return;

    try {
      const chatMessages: ChatMessage[] = messages.slice(-10).map((m) => ({
        role: m.is_ai_message ? 'assistant' : 'user',
        content: m.content,
      }));

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-summarize-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          userId: user.id,
          conversationId,
          messages: chatMessages,
        }),
      });
    } catch (err) {
      console.error('Conversation summarization failed:', err);
    }
  }, [user?.id, conversationId, messages]);

  // Generate title after first exchange
  const generateTitle = useCallback(async (convId: string, msgs: ChatMessage[]) => {
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-generate-title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          conversationId: convId,
          messages: msgs,
          language,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (err) {
      console.error('Title generation failed:', err);
    }
  }, [language, queryClient]);

  // Send message to Aurora
  const sendMessage = useCallback(async (content: string, imageBase64?: string) => {
    if (!user?.id || !conversationId || isStreaming) return;

    setError(null);
    setIsStreaming(true);
    setStreamingContent('');

    // Save user message (text only for DB)
    const displayContent = imageBase64 ? `${content}\n[📷 תמונה צורפה]` : content;
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: displayContent || content,
        is_ai_message: false,
      });

    if (insertError) {
      console.error('Failed to save message:', insertError);
      setError('Failed to send message');
      setIsStreaming(false);
      return;
    }

    // Award XP for sending message
    try {
      await supabase.rpc('award_unified_xp', {
        p_user_id: user.id,
        p_amount: 5,
        p_source: 'aurora',
        p_reason: 'Message sent to Aurora',
      });
    } catch (e) {
      console.warn('Failed to award XP:', e);
    }

    // AION orchestration micro-skills (fire-and-forget — must not block chat)
    try {
      const { classifyIntent, detectEmotion } = await import('@/services/aionSkills');
      const recentUserMsgs = messages
        .filter((m) => !m.is_ai_message)
        .slice(-2)
        .map((m) => m.content);
      classifyIntent(content, typeof window !== 'undefined' ? window.location.pathname : null);
      detectEmotion([...recentUserMsgs, content]);
    } catch (e) {
      console.warn('[aion-skills] dispatch failed', e);
    }

    // Build message history for AI
    const chatMessages: ChatMessage[] = [
      ...messages.map((m) => ({
        role: (m.is_ai_message ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Build the current user message - multimodal if image attached
    if (imageBase64) {
      const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
      if (content) {
        parts.push({ type: 'text', text: content });
      }
      parts.push({ type: 'image_url', image_url: { url: imageBase64 } });
      chatMessages.push({ role: 'user', content: parts });
    } else {
      chatMessages.push({ role: 'user', content });
    }

    try {
      abortControllerRef.current = new AbortController();

      // Detect client timezone for time-aware context
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

      // Get user session token for authenticated edge function calls
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        AURORA_CHAT_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            messages: chatMessages,
            userId: user.id,
            conversationId,
            sessionKey: `${user.id}:${conversationId}`,
            language,
            pillar: chatContext?.activePillar || null,
            hasImages: !!imageBase64,
            tier: 'from_db',
            timezone: clientTimezone,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok || !response.body) {
        let bodyPreview = '';
        try { bodyPreview = (await response.text()).slice(0, 500); } catch {}
        console.error('[aurora-chat] HTTP', response.status, AURORA_CHAT_URL, bodyPreview);
        throw new Error(`aurora-chat ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const contentDelta = parsed.choices?.[0]?.delta?.content;
            if (contentDelta) {
              fullContent += contentDelta;
              setStreamingContent(fullContent);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // ── Command Bus: parse tags, dispatch, and clean content ──
      const commands = parseAllTags(fullContent);
      // Defense in depth: server's sanitizeStream already strips chain-of-thought,
      // but apply stripReasoning here too so any leak never reaches the database.
      const cleanedContent = stripReasoning(stripAllTags(fullContent));

      // ── Dev diagnostics: report sanitizer outcome (no behavioural impact) ──
      try {
        const rawLen = fullContent.length;
        const cleanLen = cleanedContent.length;
        const matched = detectLeaks(fullContent);
        diagnosticsBus.emit('leak-guard', {
          at: Date.now(),
          rawLen,
          cleanLen,
          matched,
          status:
            !cleanLen && rawLen
              ? 'rejected'
              : matched.length || rawLen !== cleanLen
              ? 'sanitized'
              : 'clean',
          preview: cleanedContent.slice(0, 240),
        });
      } catch { /* never block chat */ }

      // ── Dev diagnostics: report response source + freshness ──
      try {
        const headerSource = (response.headers.get('x-aurora-source') || 'unknown').toLowerCase();
        const headerMode = response.headers.get('x-aurora-mode') || 'unknown';
        const headerGreeting = (response.headers.get('x-aurora-greeting') || '') === 'true';
        const degraded = (response.headers.get('x-aurora-degraded') || '') === 'true';
        const sim = _similarityRatio(cleanedContent, _lastAssistantText);
        const duplicate = sim >= 0.8 && cleanedContent.length > 40;
        diagnosticsBus.emit('response-source', {
          at: Date.now(),
          source: (headerSource === 'live' || headerSource === 'fallback') ? headerSource : 'unknown',
          mode: headerMode,
          greeting: headerGreeting,
          degraded,
          duplicateOfPrevious: duplicate,
          preview: cleanedContent.slice(0, 240),
        });
        if (duplicate) {
          console.warn('[aurora-chat] response is very similar to previous reply (sim=' + sim.toFixed(2) + ')');
        }
        _lastAssistantText = cleanedContent || _lastAssistantText;
      } catch { /* never block chat */ }

      // Dispatch commands through the bus (trust-gated) — fire-and-forget so
      // a single orchestration failure can never block the next reply.
      if (commands.length > 0) {
        const hasAnalysis = commands.some(c => c.type === 'triggerAnalysis');
        const nonAnalysisCommands = commands.filter(c => c.type !== 'triggerAnalysis');
        if (nonAnalysisCommands.length > 0) {
          void Promise.resolve()
            .then(() => dispatchCommands(nonAnalysisCommands))
            .catch((e) => console.warn('[aurora] dispatchCommands failed:', e));
        }
        if (hasAnalysis) {
          try { triggerBackgroundAnalysis(); } catch (e) { console.warn('[aurora] analysis failed:', e); }
        }
      }

      // If the stream produced nothing, surface the Hebrew fallback as an AION message.
      if (!cleanedContent) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: null,
          content: AION_FALLBACK_HE,
          is_ai_message: true,
        });
        console.warn('[aurora-chat] empty stream — inserted fallback message');
      }

      // Save the AION response
      if (cleanedContent) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: null,
          content: cleanedContent,
          is_ai_message: true,
        });

        // Emit event for voice mode auto-play
        window.dispatchEvent(new CustomEvent('aurora:response', { detail: { text: cleanedContent } }));

        // Phase B — silently grow the consciousness graph. Fire-and-forget;
        // never await, never surface errors to the user.
        try {
          const lastUser = [...chatMessages].reverse().find((m) => m.role === 'user');
          const startedAt = Date.now();
          diagnosticsBus.emit('memory-writer', { source: 'chat', status: 'pending', startedAt });
          void supabase.functions
            .invoke('memory-writer', {
              body: {
                source: 'chat',
                context: {
                  messages: [
                    ...(lastUser ? [{ role: 'user', content: lastUser.content }] : []),
                    { role: 'assistant', content: cleanedContent },
                  ],
                },
              },
            })
            .then((res) => {
              const data: any = (res as any)?.data;
              const error: any = (res as any)?.error;
              const writes = data?.writes?.graph as Array<{ action: string }> | undefined;
              diagnosticsBus.emit('memory-writer', {
                source: 'chat',
                status: error ? 'error' : 'ok',
                startedAt,
                durationMs: Date.now() - startedAt,
                inserted: writes?.filter((w) => w.action === 'inserted').length ?? 0,
                reinforced: writes?.filter((w) => w.action === 'reinforced').length ?? 0,
                skipped: writes?.filter((w) => w.action === 'skipped').length ?? 0,
                error: error?.message,
                raw: data,
              });
            })
            .catch((e) => {
              diagnosticsBus.emit('memory-writer', {
                source: 'chat',
                status: 'error',
                startedAt,
                durationMs: Date.now() - startedAt,
                error: String(e?.message ?? e),
              });
              console.warn('[memory-writer] invoke failed:', e);
            });
        } catch (e) {
          console.warn('[memory-writer] dispatch failed:', e);
        }
      }

      // Background side-effects — never awaited; failures must not block chat.
      if (messageCountRef.current <= 2 && cleanedContent) {
        try {
          generateTitle(conversationId, [
            ...chatMessages,
            { role: 'assistant', content: cleanedContent },
          ]);
        } catch (e) { console.warn('[aurora] generateTitle failed:', e); }
      }
      if (messageCountRef.current > 0 && messageCountRef.current % 4 === 0) {
        try { triggerBackgroundAnalysis(); } catch (e) { console.warn('[aurora] analysis failed:', e); }
      }
      if (messageCountRef.current > 0 && messageCountRef.current % 6 === 0) {
        try { summarizeConversation(); } catch (e) { console.warn('[aurora] summarize failed:', e); }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        debug.log('Request aborted');
      } else {
        console.error('AION chat error:', err);
        setError(AION_FALLBACK_HE);
        // Insert visible Hebrew fallback so the user sees AION respond.
        try {
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: null,
            content: AION_FALLBACK_HE,
            is_ai_message: true,
          });
        } catch (e) {
          console.warn('[aurora] failed to insert fallback message:', e);
        }
        // Mark the last user message as failed for retry
        const lastUserMsg = messages[messages.length - 1] || null;
        if (lastUserMsg && !lastUserMsg.is_ai_message) {
          setFailedMessageIds(prev => new Set(prev).add(lastUserMsg.id));
        }
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
      
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }
  }, [user?.id, conversationId, isStreaming, messages, language, dispatchCommands, generateTitle, triggerBackgroundAnalysis, summarizeConversation, queryClient]);

  // Cancel streaming
  const cancelStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Regenerate last response
  const regenerateLastResponse = useCallback(async () => {
    if (!conversationId || messages.length < 2) return;

    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].is_ai_message) {
        lastUserMessageIndex = i;
        break;
      }
    }
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    
    const lastAiMessage = messages[messages.length - 1];
    if (lastAiMessage.is_ai_message) {
      await supabase.from('messages').delete().eq('id', lastAiMessage.id);
      setMessages((prev) => prev.slice(0, -1));
    }

    await sendMessage(lastUserMessage.content);
  }, [conversationId, messages, sendMessage]);

  // Retry a failed message
  const retryMessage = useCallback(async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    setFailedMessageIds(prev => {
      const next = new Set(prev);
      next.delete(messageId);
      return next;
    });
    await sendMessage(msg.content);
  }, [messages, sendMessage]);

  return {
    messages,
    isStreaming,
    streamingContent,
    error,
    failedMessageIds,
    sendMessage,
    cancelStreaming,
    regenerateLastResponse,
    retryMessage,
    pendingCommands,
  };
};
