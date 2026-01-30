import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles } from 'lucide-react';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { LaunchpadFlow } from '@/components/launchpad';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AuroraChatArea from './AuroraChatArea';

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

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
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
    <DashboardLayout
      currentConversationId={activeConversationId}
      onNewChat={handleNewChat}
      onSelectConversation={handleSelectConversation}
    >
      <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Aurora Header */}
        <div className="flex items-center gap-3 mb-4">
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

        {/* Chat Area */}
        <div className="flex-1 min-h-0 rounded-xl border bg-card/30 backdrop-blur-sm overflow-hidden">
          <AuroraChatArea conversationId={activeConversationId} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuroraLayout;
