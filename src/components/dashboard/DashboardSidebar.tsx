import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  MessageSquare,
  Users,
  Sparkles,
  Compass,
  Menu,
  Plus,
  Trash2
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import AuroraAccountDropdown from '@/components/aurora/AuroraAccountDropdown';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

interface DashboardSidebarProps {
  onNavigate?: () => void;
  currentConversationId?: string | null;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
}

interface Conversation {
  id: string;
  title: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
}

const DashboardSidebar = ({ 
  onNavigate,
  currentConversationId,
  onNewChat,
  onSelectConversation,
}: DashboardSidebarProps) => {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebar = useSidebar();
  const queryClient = useQueryClient();
  const isCollapsed = sidebar?.state === 'collapsed';
  const isAuroraPage = location.pathname === '/aurora';

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  // Fetch Aurora conversations only when on Aurora page
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
        title: conv.last_message_preview?.slice(0, 30) || `${language === 'he' ? 'שיחה חדשה' : 'New Chat'} ${index + 1}`,
      })) as Conversation[];
    },
    enabled: !!user?.id && isAuroraPage,
  });

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    
    await supabase.from('messages').delete().eq('conversation_id', conversationId);
    await supabase.from('conversations').delete().eq('id', conversationId);
    
    queryClient.invalidateQueries({ queryKey: ['aurora-conversations'] });
    
    if (conversationId === currentConversationId) {
      onNewChat?.();
    }
  };

  // Navigation items
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: language === 'he' ? 'דאשבורד' : 'Dashboard' },
    { path: '/messages', icon: MessageSquare, label: language === 'he' ? 'הודעות' : 'Messages' },
    { path: '/aurora', icon: Sparkles, label: language === 'he' ? 'אורורה' : 'Aurora' },
    { path: '/community', icon: Users, label: language === 'he' ? 'קהילה' : 'Community' },
    { path: '/hypnosis', icon: Compass, label: language === 'he' ? 'היפנוזה' : 'Hypnosis' },
  ];

  return (
    <Sidebar 
      className={cn(
        "border-border bg-background !z-50 pt-16",
        isRTL && "order-last"
      )}
      collapsible="offcanvas"
      side={isRTL ? "right" : "left"}
    >
      <SidebarContent className="p-2 flex flex-col h-full">
        {/* Hamburger toggle at top */}
        <div className="flex justify-end mb-2">
          <SidebarTrigger className="shrink-0 p-2 hover:bg-muted rounded-lg">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>

        {/* New Chat Button - ChatGPT style (only on Aurora page) */}
        {isAuroraPage && !isCollapsed && onNewChat && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2 mb-4 h-10"
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4" />
            <span>{language === 'he' ? 'שיחה חדשה' : 'New Chat'}</span>
          </Button>
        )}

        {isAuroraPage && isCollapsed && onNewChat && (
          <Button
            variant="outline"
            size="icon"
            className="w-full mb-4"
            onClick={onNewChat}
            title={language === 'he' ? 'שיחה חדשה' : 'New Chat'}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Navigation Section */}
        <div className="mb-4">
          {!isCollapsed && (
            <p className="text-xs text-muted-foreground px-3 mb-2 uppercase tracking-wider">
              {language === 'he' ? 'ניווט' : 'Navigate'}
            </p>
          )}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacer to push conversations to bottom */}
        <div className="flex-1" />

        {/* Divider */}
        {isAuroraPage && !isCollapsed && conversations.length > 0 && (
          <div className="border-t border-border mb-3" />
        )}

        {/* Recent Conversations - ChatGPT style at BOTTOM (only on Aurora page) */}
        {isAuroraPage && !isCollapsed && conversations.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground px-3 mb-2 uppercase tracking-wider">
              {language === 'he' ? 'שיחות אחרונות' : 'Recent Chats'}
            </p>
            <ScrollArea className="max-h-[250px]">
              <div className="space-y-1">
                {conversations.slice(0, 10).map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation?.(conv.id)}
                    className={cn(
                      "w-full text-start px-3 py-2 rounded-lg text-sm transition-colors group flex items-center justify-between gap-2",
                      "hover:bg-muted",
                      conv.id === currentConversationId && "bg-primary/10 text-primary"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="truncate block text-sm">{conv.title}</span>
                      {conv.last_message_at && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(conv.last_message_at), 'dd/MM', {
                            locale: language === 'he' ? he : enUS,
                          })}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border">
        <AuroraAccountDropdown
          isCollapsed={isCollapsed}
          onOpenDashboard={() => handleNavigation('/dashboard')}
          onOpenSettings={() => handleNavigation('/launchpad/settings')}
          onOpenChecklists={() => handleNavigation('/aurora')}
        />
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
