import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, ArrowRight, Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import AuroraSidebar from './AuroraSidebar';
import AuroraChatArea from './AuroraChatArea';
import AuroraDashboardModal from './AuroraDashboardModal';
import AuroraSettingsModal from './AuroraSettingsModal';
import AuroraChecklistModal from './AuroraChecklistModal';

// Header component inside SidebarProvider to access sidebar state
const AuroraHeader = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { toggleSidebar, state } = useSidebar();
  const isMobile = useIsMobile();
  const isCollapsed = state === 'collapsed';

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 gap-3 shrink-0">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="shrink-0"
      >
        <BackArrow className="h-5 w-5" />
      </Button>

      {/* Toggle Sidebar (mobile or when collapsed) */}
      {(isMobile || isCollapsed) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Aurora Title */}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold">{t('aurora.name')}</span>
      </div>
    </header>
  );
};

const AuroraLayout = () => {
  const { user } = useAuth();
  const { isRTL } = useTranslation();
  const isMobile = useIsMobile();
  
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
      <div className="fixed inset-0 bg-background flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="fixed inset-0 flex w-full bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <AuroraSidebar
          currentConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onOpenDashboard={() => setShowDashboard(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenChecklists={() => setShowChecklists(true)}
        />
        
        <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-background overflow-hidden isolate">
          <AuroraHeader />
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
