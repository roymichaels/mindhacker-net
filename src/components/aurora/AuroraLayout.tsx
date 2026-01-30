import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { LaunchpadFlow } from '@/components/launchpad';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AuroraChatArea from './AuroraChatArea';

const AuroraLayout = () => {
  const { user } = useAuth();
  const { isRTL } = useTranslation();
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
      hideRightPanel
    >
      {/* Chat Area - takes full height */}
      <div className="flex-1 min-h-0 rounded-xl border bg-card/30 backdrop-blur-sm overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <AuroraChatArea conversationId={activeConversationId} />
      </div>
    </DashboardLayout>
  );
};

export default AuroraLayout;
