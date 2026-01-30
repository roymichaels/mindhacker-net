import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { LaunchpadFlow } from '@/components/launchpad';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AuroraChatArea from './AuroraChatArea';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

interface Conversation {
  id: string;
  title: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
}

const AuroraLayout = () => {
  const { user } = useAuth();
  const { t, isRTL, language } = useTranslation();
  const { isLaunchpadComplete, isLoading: launchpadLoading } = useLaunchpadProgress();
  const queryClient = useQueryClient();
  
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showLaunchpad, setShowLaunchpad] = useState(true);

  // Get or create the default AI conversation
  const { data: defaultConversationId, isLoading } = useQuery({
    queryKey: ['aurora-default-conversation', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_or_create_ai_conversation', { user_id: user.id });
      
      if (error) {
        console.error('Failed to get/create AI conversation:', error);
        throw error;
      }
      
      return data as string;
    },
    enabled: !!user?.id,
  });

  // Fetch user's AI conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['aurora-conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select('id, last_message_at, last_message_preview')
        .eq('participant_1', user.id)
        .eq('type', 'ai')
        .order('last_message_at', { ascending: false, nullsFirst: false });
      
      if (error) {
        console.error('Failed to fetch conversations:', error);
        return [];
      }
      
      return (data || []).map((conv, index) => ({
        ...conv,
        title: conv.last_message_preview?.slice(0, 40) || `${t('aurora.newChat')} ${index + 1}`,
      })) as Conversation[];
    },
    enabled: !!user?.id,
  });

  const activeConversationId = currentConversationId || defaultConversationId;

  const handleNewChat = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: user.id,
        participant_2: null,
        type: 'ai',
      })
      .select('id')
      .single();
    
    if (!error && data) {
      setCurrentConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['aurora-conversations'] });
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    
    await supabase.from('messages').delete().eq('conversation_id', conversationId);
    await supabase.from('conversations').delete().eq('id', conversationId);
    
    queryClient.invalidateQueries({ queryKey: ['aurora-conversations'] });
    
    if (conversationId === currentConversationId) {
      setCurrentConversationId(null);
    }
  };

  if (isLoading || launchpadLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Show Launchpad if not complete
  if (!isLaunchpadComplete && showLaunchpad) {
    return (
      <LaunchpadFlow 
        onComplete={() => setShowLaunchpad(false)}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Aurora Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{t('aurora.name')}</h1>
              <p className="text-sm text-muted-foreground">
                {language === 'he' ? 'העוזרת האישית שלך' : 'Your Personal Assistant'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            {language === 'he' ? 'שיחה חדשה' : 'New Chat'}
          </Button>
        </div>

        {/* Conversation History Bar */}
        {conversations.length > 0 && (
          <div className="mb-4">
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {conversations.slice(0, 5).map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setCurrentConversationId(conv.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors group",
                      "border bg-card/50 hover:bg-card",
                      conv.id === activeConversationId && "border-primary bg-primary/5"
                    )}
                  >
                    <span className="truncate max-w-[120px]">{conv.title}</span>
                    {conv.last_message_at && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(conv.last_message_at), 'dd/MM', {
                          locale: language === 'he' ? he : enUS,
                        })}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 min-h-0 rounded-xl border bg-card/30 backdrop-blur-sm overflow-hidden">
          <AuroraChatArea conversationId={activeConversationId} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuroraLayout;
