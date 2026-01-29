import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import AuroraSidebar from './AuroraSidebar';
import AuroraChatArea from './AuroraChatArea';
import AuroraDashboardModal from './AuroraDashboardModal';
import AuroraSettingsModal from './AuroraSettingsModal';
import AuroraChecklistModal from './AuroraChecklistModal';

const AuroraLayout = () => {
  const { user } = useAuth();
  const { isRTL } = useTranslation();
  
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChecklists, setShowChecklists] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

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

  // Set current conversation when default is loaded
  const activeConversationId = currentConversationId || defaultConversationId;

  const handleNewChat = async () => {
    if (!user?.id) return;
    
    // Create a new AI conversation
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
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <AuroraSidebar
          currentConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onOpenDashboard={() => setShowDashboard(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenChecklists={() => setShowChecklists(true)}
        />
        
        <main className="flex-1 flex flex-col min-h-screen">
          <AuroraChatArea conversationId={activeConversationId} />
        </main>
      </div>

      {/* Modals */}
      <AuroraDashboardModal
        open={showDashboard}
        onOpenChange={setShowDashboard}
      />
      <AuroraSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />
      <AuroraChecklistModal
        open={showChecklists}
        onOpenChange={setShowChecklists}
      />
    </SidebarProvider>
  );
};

export default AuroraLayout;
