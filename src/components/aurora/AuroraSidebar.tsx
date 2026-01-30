import { Plus, Sparkles, Trash2, Menu, LayoutDashboard, MessageSquare, BookOpen, Users, Compass, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { useNavigate, useLocation } from 'react-router-dom';
import AuroraAccountDropdown from './AuroraAccountDropdown';

interface AuroraSidebarProps {
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
  onOpenChecklists: () => void;
}

interface Conversation {
  id: string;
  title: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
}

const AuroraSidebar = ({
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onOpenDashboard,
  onOpenSettings,
  onOpenChecklists,
}: AuroraSidebarProps) => {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isCollapsed = state === 'collapsed';

  // Navigation items that match the bottom nav
  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: language === 'he' ? 'דשבורד' : 'Dashboard', 
      path: '/dashboard' 
    },
    { 
      icon: MessageSquare, 
      label: language === 'he' ? 'הודעות' : 'Messages', 
      path: '/messages' 
    },
    { 
      icon: UserCog, 
      label: language === 'he' ? 'הפרופיל שלי' : 'My Profile', 
      path: '/launchpad/settings' 
    },
    { 
      icon: BookOpen, 
      label: language === 'he' ? 'קטלוג' : 'Catalog', 
      path: '/courses' 
    },
    { 
      icon: Users, 
      label: language === 'he' ? 'קהילה' : 'Community', 
      path: '/community' 
    },
    { 
      icon: Compass, 
      label: language === 'he' ? 'היפנוזה' : 'Hypnosis', 
      path: '/hypnosis' 
    },
  ];

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
      
      // Map to include title from last_message_preview or generate default
      return (data || []).map((conv, index) => ({
        ...conv,
        title: conv.last_message_preview?.slice(0, 40) || `${t('aurora.newChat')} ${index + 1}`,
      })) as Conversation[];
    },
    enabled: !!user?.id,
  });

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    
    // Delete messages first
    await supabase.from('messages').delete().eq('conversation_id', conversationId);
    // Then delete conversation
    await supabase.from('conversations').delete().eq('id', conversationId);
    
    queryClient.invalidateQueries({ queryKey: ['aurora-conversations'] });
    
    // If deleted current conversation, create new one
    if (conversationId === currentConversationId) {
      onNewChat();
    }
  };

  return (
    <Sidebar 
      className={cn(
        "border-border bg-background !z-50",
        isRTL && "order-last"
      )}
      collapsible="offcanvas"
      side={isRTL ? "right" : "left"}
    >
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3", isCollapsed && "hidden")}>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-foreground" />
            </div>
            <span className="font-semibold text-lg">{t('aurora.name')}</span>
          </div>
          <SidebarTrigger className="shrink-0">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Navigation Section */}
        {!isCollapsed && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground px-2 mb-2 uppercase tracking-wider">
              {language === 'he' ? 'ניווט' : 'Navigate'}
            </p>
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      "hover:bg-muted",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Collapsed navigation icons */}
        {isCollapsed && (
          <div className="space-y-2 mb-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full",
                    isActive && "bg-primary/10 text-primary"
                  )}
                  title={item.label}
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        )}

        <div className="border-t border-border pt-3 mb-2" />

        {/* New Chat Button */}
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 mb-4",
            isCollapsed && "justify-center px-2"
          )}
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>{t('aurora.newChat')}</span>}
        </Button>

        {/* Conversations List */}
        {!isCollapsed && (
          <>
            <p className="text-xs text-muted-foreground px-2 mb-2 uppercase tracking-wider">
              {t('aurora.recentConversations')}
            </p>
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={cn(
                      "w-full text-start px-3 py-2.5 rounded-lg text-sm transition-colors group",
                      "hover:bg-muted",
                      conv.id === currentConversationId && "bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate flex-1">{conv.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                    {conv.last_message_at && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(conv.last_message_at), 'MMM d', {
                          locale: language === 'he' ? he : enUS,
                        })}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border">
        <AuroraAccountDropdown
          isCollapsed={isCollapsed}
          onOpenDashboard={onOpenDashboard}
          onOpenSettings={onOpenSettings}
          onOpenChecklists={onOpenChecklists}
        />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AuroraSidebar;
