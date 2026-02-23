import { useState } from 'react';
import { PenSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import ConversationItem from '@/components/messages/ConversationItem';
import NewMessageDialog from '@/components/messages/NewMessageDialog';
import { useSidebars } from '@/hooks/useSidebars';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  type: 'direct' | 'ai';
  participant_1: string;
  participant_2: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
}

const Messages = () => {
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);

  // Get or create AI conversation
  const { data: aiConversationId } = useQuery({
    queryKey: ['ai-conversation', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_or_create_ai_conversation', { user_id: user.id });
      
      if (error) throw error;
      return data as string;
    },
    enabled: !!user?.id,
  });

  // Fetch all conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user?.id,
  });

  // Fetch profiles for participants
  const participantIds = conversations
    .filter(c => c.type === 'direct')
    .map(c => c.participant_1 === user?.id ? c.participant_2 : c.participant_1)
    .filter(Boolean) as string[];

  const { data: profiles = {} } = useQuery({
    queryKey: ['conversation-profiles', participantIds],
    queryFn: async () => {
      if (participantIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', participantIds);
      
      if (error) throw error;
      
      const profileMap: Record<string, Profile> = {};
      data?.forEach(p => { profileMap[p.id] = p; });
      return profileMap;
    },
    enabled: participantIds.length > 0,
  });

  // Fetch unread counts
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ['unread-counts', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      
      const { data, error } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('is_read', false)
        .neq('sender_id', user.id);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(m => {
        counts[m.conversation_id] = (counts[m.conversation_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!user?.id,
  });

  // Separate AI and direct conversations
  const aiConversation = conversations.find(c => c.type === 'ai');
  const directConversations = conversations.filter(c => c.type === 'direct');

  // Filter by search
  const filteredConversations = directConversations.filter(c => {
    if (!searchQuery) return true;
    const otherId = c.participant_1 === user?.id ? c.participant_2 : c.participant_1;
    const profile = profiles[otherId || ''];
    return profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Hide sidebars for messages
  useSidebars(null, null);

  return (
    <div className="flex flex-col h-full" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">{t('messages.title')}</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowNewMessage(true)}
          >
            <PenSquare className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              placeholder={t('messages.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("h-10", isRTL ? "pr-10" : "pl-10")}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto -mx-4 px-4">
          {/* AI Assistant - Always First (Pinned) */}
          <ConversationItem
            isAI
            conversationId={aiConversationId || 'ai'}
            name={t('messages.aiAssistant')}
            subtitle={t('messages.aiSubtitle')}
            lastMessage={aiConversation?.last_message_preview || t('messages.aiGreeting')}
            lastMessageAt={aiConversation?.last_message_at}
            unreadCount={aiConversationId ? unreadCounts[aiConversationId] || 0 : 0}
            isPinned
          />

          {/* Separator */}
          {filteredConversations.length > 0 && (
            <div className="h-px bg-border my-1" />
          )}

          {/* Direct Conversations */}
          {filteredConversations.map(conversation => {
            const otherId = conversation.participant_1 === user?.id 
              ? conversation.participant_2 
              : conversation.participant_1;
            const profile = profiles[otherId || ''];
            
            return (
              <ConversationItem
                key={conversation.id}
                name={profile?.full_name || t('messages.unknownUser')}
                conversationId={conversation.id}
                lastMessage={conversation.last_message_preview || ''}
                lastMessageAt={conversation.last_message_at}
                unreadCount={unreadCounts[conversation.id] || 0}
              />
            );
          })}

        </div>

        {/* New Message Dialog */}
        <NewMessageDialog 
          open={showNewMessage} 
          onOpenChange={setShowNewMessage} 
        />
      </div>
    );
};

export default Messages;
