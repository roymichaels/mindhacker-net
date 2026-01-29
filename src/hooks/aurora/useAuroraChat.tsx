import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useChecklistsData } from './useChecklistsData';

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
  content: string;
}

export const useAuroraChat = (conversationId: string | null) => {
  const { user } = useAuth();
  const { language } = useTranslation();
  const queryClient = useQueryClient();
  const { createChecklist, addChecklistItem, completeChecklistItem } = useChecklistsData(user);

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
            // Avoid duplicates
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

  // Process action tags from Aurora's response
  const processActionTags = useCallback(async (content: string) => {
    // Silent action tags (removed from display)
    const actionMatches = [...content.matchAll(/\[action:(\w+)\]/g)];
    for (const match of actionMatches) {
      if (match[1] === 'analyze' && user?.id) {
        // Trigger background analysis
        triggerBackgroundAnalysis();
      }
    }

    // Checklist creation
    const checklistCreateMatches = [...content.matchAll(/\[checklist:create:(.+?)\]/g)];
    for (const match of checklistCreateMatches) {
      const title = match[1].trim();
      if (title) {
        await createChecklist(title, 'aurora');
      }
    }

    // Checklist item addition
    const checklistAddMatches = [...content.matchAll(/\[checklist:add:(.+?):(.+?)\]/g)];
    for (const match of checklistAddMatches) {
      const checklistTitle = match[1].trim();
      const itemContent = match[2].trim();
      if (checklistTitle && itemContent) {
        await addChecklistItem(checklistTitle, itemContent);
      }
    }

    // Checklist item completion
    const checklistCompleteMatches = [...content.matchAll(/\[checklist:complete:(.+?):(.+?)\]/g)];
    for (const match of checklistCompleteMatches) {
      const checklistTitle = match[1].trim();
      const itemContent = match[2].trim();
      if (checklistTitle && itemContent) {
        await completeChecklistItem(checklistTitle, itemContent);
      }
    }

    // Return cleaned content (without silent action tags, but keep CTAs)
    return content.replace(/\[action:\w+\]/g, '').replace(/\[checklist:[^\]]+\]/g, '').trim();
  }, [user?.id, createChecklist, addChecklistItem, completeChecklistItem]);

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

      // Invalidate Life Model queries
      queryClient.invalidateQueries({ queryKey: ['aurora-life-model'] });
      queryClient.invalidateQueries({ queryKey: ['aurora-dashboard'] });
    } catch (err) {
      console.error('Background analysis failed:', err);
    }
  }, [user?.id, conversationId, messages, queryClient]);

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
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !conversationId || isStreaming) return;

    setError(null);
    setIsStreaming(true);
    setStreamingContent('');

    // Save user message
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        is_ai_message: false,
      });

    if (insertError) {
      console.error('Failed to save message:', insertError);
      setError('Failed to send message');
      setIsStreaming(false);
      return;
    }

    // Award XP for sending message through unified system
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
      { role: 'user' as const, content },
    ];

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
            // Partial JSON, put back in buffer
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Process action tags and clean content
      const cleanedContent = await processActionTags(fullContent);

      // Save Aurora's response
      if (cleanedContent) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: null,
          content: cleanedContent,
          is_ai_message: true,
        });
      }

      // Generate title after first exchange (2 messages: user + assistant)
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
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Aurora chat error:', err);
        setError('Failed to get response from Aurora');
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
      
      // Refresh messages
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }
  }, [user?.id, conversationId, isStreaming, messages, language, processActionTags, generateTitle, triggerBackgroundAnalysis, queryClient]);

  // Cancel streaming
  const cancelStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Regenerate last response
  const regenerateLastResponse = useCallback(async () => {
    if (!conversationId || messages.length < 2) return;

    // Find the last user message (iterate backwards)
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].is_ai_message) {
        lastUserMessageIndex = i;
        break;
      }
    }
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    
    // Delete the last AI message if it exists after the user message
    const lastAiMessage = messages[messages.length - 1];
    if (lastAiMessage.is_ai_message) {
      await supabase.from('messages').delete().eq('id', lastAiMessage.id);
      setMessages((prev) => prev.slice(0, -1));
    }

    // Re-send the last user message
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
  };
};
