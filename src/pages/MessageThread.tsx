import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bot, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MessageBubble from '@/components/messages/MessageBubble';
import { cn } from '@/lib/utils';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { AuroraMessageThread } from '@/components/aurora';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string;
  is_ai_message: boolean;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  type: 'direct' | 'ai';
  participant_1: string;
  participant_2: string | null;
}

const MessageThread = () => {
  const { conversationId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useThemeSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  // Check if this is Aurora - either by param OR by route path
  const isAI = conversationId === 'ai' || location.pathname === '/messages/ai';

  // If this is an AI conversation, render Aurora instead
  if (isAI) {
    return <AuroraMessageThread conversationId="ai" />;
  }

  const logoUrl = theme.logo_url || "/logo.png?v=9";

  // Get conversation details
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (isAI) {
        // Get or create AI conversation
        const { data } = await supabase
          .rpc('get_or_create_ai_conversation', { user_id: user?.id });
        return { id: data, type: 'ai' as const, participant_1: user?.id || '', participant_2: null };
      }
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (error) throw error;
      return data as Conversation;
    },
    enabled: !!user?.id,
  });

  // Get other participant's profile for direct messages
  const otherId = conversation?.type === 'direct' 
    ? (conversation.participant_1 === user?.id ? conversation.participant_2 : conversation.participant_1)
    : null;

  const { data: otherProfile } = useQuery({
    queryKey: ['profile', otherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', otherId!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!otherId,
  });

  // Get messages
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: async () => {
      if (!conversation?.id) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversation?.id,
  });

  // Mark messages as read
  useEffect(() => {
    if (!conversation?.id || !user?.id) return;
    
    supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversation.id)
      .neq('sender_id', user.id)
      .eq('is_read', false)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
      });
  }, [conversation?.id, user?.id, messages.length]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversation?.id) return;
    
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        () => {
          refetchMessages();
        }
      )
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [conversation?.id, refetchMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversation?.id || !user?.id) throw new Error('No conversation');
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content,
          is_ai_message: false,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Send AI message
  const sendAIMessage = async (userMessage: string) => {
    if (!conversation?.id || !user?.id) return;
    
    // Save user message
    await sendMutation.mutateAsync(userMessage);
    
    setIsStreaming(true);
    setStreamingContent('');

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-chat`;
    
    try {
      // Build message history for AI
      const history = messages.map(m => ({
        role: m.is_ai_message ? 'assistant' : 'user',
        content: m.content,
      }));
      history.push({ role: 'user', content: userMessage });

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history, mode: 'widget' }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
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
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setStreamingContent(fullContent);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save AI response to database
      if (fullContent) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: null,
            content: fullContent,
            is_ai_message: true,
          });
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setStreamingContent(t('messages.errorSending'));
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      refetchMessages();
    }
  };

  // Send direct message
  const sendDirectMessage = async (content: string) => {
    await sendMutation.mutateAsync(content);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    const message = input.trim();
    setInput('');
    
    if (isAI || conversation?.type === 'ai') {
      await sendAIMessage(message);
    } else {
      await sendDirectMessage(message);
    }
  };

  // Check if this is an AI conversation
  const isAIConversation = isAI || conversation?.type === 'ai';

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 p-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/messages')}
          >
            <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
          </Button>
          
          {/* Avatar */}
          <Avatar className="h-10 w-10">
            {isAIConversation ? (
              <div className="h-full w-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                {otherProfile?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">
              {isAIConversation 
                ? t('messages.aiAssistant')
                : otherProfile?.full_name || t('messages.unknownUser')
              }
            </h1>
            {isAIConversation && (
              <p className="text-xs text-muted-foreground">{t('messages.aiSubtitle')}</p>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-40">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center py-8 text-muted-foreground">
            {t('messages.startTyping')}
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            isOwn={message.sender_id === user?.id}
            isAI={message.is_ai_message}
            timestamp={message.created_at}
          />
        ))}
        
        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <MessageBubble
            content={streamingContent}
            isOwn={false}
            isAI
            isStreaming
            avatarUrl={logoUrl}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - positioned above bottom nav */}
      <form 
        onSubmit={handleSubmit} 
        className="fixed bottom-14 left-0 right-0 p-4 bg-background border-t"
      >
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('messages.typePlaceholder')}
            disabled={isStreaming}
            className="flex-1 bg-muted border border-border rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isStreaming || !input.trim()}
            className="rounded-full w-12 h-12 shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageThread;
