import { useState, useCallback, useRef, useEffect } from 'react';
import { debug } from '@/lib/debug';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { parseAllTags, stripAllTags } from '@/lib/commandBus';
import { useCommandBus } from './useCommandBus';

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
  
  const messageCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      .channel(`aurora-messages:${conversationId}`)
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

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: chatMessages,
            userId: user.id,
            language,
            pillar: chatContext?.activePillar || null,
            hasImages: !!imageBase64,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response from Aurora');
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
      const cleanedContent = stripAllTags(fullContent);

      // Dispatch commands through the bus (trust-gated)
      if (commands.length > 0) {
        // Handle triggerAnalysis separately since it needs chat context
        const hasAnalysis = commands.some(c => c.type === 'triggerAnalysis');
        const nonAnalysisCommands = commands.filter(c => c.type !== 'triggerAnalysis');
        
        if (nonAnalysisCommands.length > 0) {
          await dispatchCommands(nonAnalysisCommands);
        }
        if (hasAnalysis) {
          triggerBackgroundAnalysis();
        }
      }

      // Save Aurora's response
      if (cleanedContent) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: null,
          content: cleanedContent,
          is_ai_message: true,
        });

        // Emit event for voice mode auto-play
        window.dispatchEvent(new CustomEvent('aurora:response', { detail: { text: cleanedContent } }));
      }

      // Generate title after first exchange
      if (messageCountRef.current <= 2) {
        generateTitle(conversationId, [
          ...chatMessages,
          { role: 'assistant', content: cleanedContent },
        ]);
      }

      // Trigger analysis every 4 messages
      if (messageCountRef.current > 0 && messageCountRef.current % 4 === 0) {
        triggerBackgroundAnalysis();
      }

      // Summarize conversation every 8 messages
      if (messageCountRef.current > 0 && messageCountRef.current % 8 === 0) {
        summarizeConversation();
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        debug.log('Request aborted');
      } else {
        console.error('Aurora chat error:', err);
        setError('Failed to get response from Aurora');
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

  return {
    messages,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    cancelStreaming,
    regenerateLastResponse,
    pendingCommands,
  };
};
