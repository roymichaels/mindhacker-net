import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Compass,
  Plus,
  Trash2,
  Menu,
  Search
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import AuroraAccountDropdown from '@/components/aurora/AuroraAccountDropdown';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { DashboardModal } from './DashboardModal';
import { HypnosisModal } from './HypnosisModal';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';

const defaultLogo = "/aurora-icon.svg";

interface DashboardSidebarProps {
  onNavigate?: () => void;
  currentConversationId?: string | null;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  isMobileSheet?: boolean; // When true, render content directly without Sidebar wrapper
  onOpenSettings?: () => void;
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
  isMobileSheet = false,
  onOpenSettings,
}: DashboardSidebarProps) => {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebar = useSidebar();
  const queryClient = useQueryClient();
  const isCollapsed = !isMobileSheet && sidebar?.state === 'collapsed';
  const isAuroraPage = location.pathname === '/aurora';
  const { theme: brandTheme } = useThemeSettings();
  const logoUrl = brandTheme.logo_url || defaultLogo;

  // Modal states
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [hypnosisOpen, setHypnosisOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    e.preventDefault();
    
    try {
      // First delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);
      
      if (messagesError) {
        console.error('Failed to delete messages:', messagesError);
      }
      
      // Then delete the conversation itself
      const { error: convError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
      
      if (convError) {
        console.error('Failed to delete conversation:', convError);
        return;
      }
      
      // Refresh the conversations list
      queryClient.invalidateQueries({ queryKey: ['aurora-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['aurora-default-conversation'] });
      
      // If the deleted conversation was the current one, start a new chat
      if (conversationId === currentConversationId) {
        onNewChat?.();
      }
    } catch (error) {
      console.error('Delete conversation error:', error);
    }
  };

  // Navigation items - now open modals instead of navigating
  const navItems = [
    { id: 'aurora', icon: null, customIcon: AuroraOrbIcon, label: language === 'he' ? 'אורורה' : 'Aurora', highlight: 'purple' as const, onClick: () => { navigate('/aurora'); onNavigate?.(); } },
    { id: 'dashboard', icon: LayoutDashboard, customIcon: null, label: language === 'he' ? 'דאשבורד' : 'Dashboard', highlight: 'red' as const, onClick: () => setDashboardOpen(true) },
    { id: 'hypnosis', icon: Compass, customIcon: null, label: language === 'he' ? 'היפנוזה' : 'Hypnosis', highlight: 'blue' as const, onClick: () => setHypnosisOpen(true) },
  ];

  // Shared content component for desktop sidebar
  const SidebarInnerContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Mobile: Separate New Chat button and Search bar */}
      {isMobile && isAuroraPage && (
        <div className="px-3 py-2 mb-3 flex items-center gap-2">
          {/* New Chat Button - separate container */}
          <button
            onClick={() => {
              onNewChat?.();
              onNavigate?.();
            }}
            className="h-9 w-9 flex items-center justify-center bg-background/50 backdrop-blur-xl border border-border/50 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
            title={language === 'he' ? 'שיחה חדשה' : 'New Chat'}
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
          
          {/* Search Input - separate container */}
          <div className="flex-1 h-9 flex items-center gap-2 px-3 bg-background/50 backdrop-blur-xl border border-border/50 rounded-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'he' ? 'חיפוש...' : 'Search...'}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </div>
      )}

      {/* Desktop: Logo and Brand Name Header */}
      {!isMobile && !isCollapsed && (
        <div className="flex items-center justify-between px-3 py-4 mb-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="w-10 h-10 object-contain" 
              loading="eager"
            />
            <span className="font-bold text-base text-foreground">
              {language === 'he' ? brandTheme.brand_name : brandTheme.brand_name_en}
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => sidebar?.toggleSidebar()}
            title={language === 'he' ? 'כווץ תפריט' : 'Collapse Menu'}
          >
            <Menu className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}

      {/* Navigation Section */}
      <div className="mb-4">
        {!isCollapsed && !isMobile && (
          <p className="text-xs text-muted-foreground px-3 mb-2 uppercase tracking-wider">
            {language === 'he' ? 'ניווט' : 'Navigate'}
          </p>
        )}
        <div className="space-y-1">
          {navItems.map((item) => {
            const highlightColor = item.highlight;
            const isPurple = highlightColor === 'purple';
            const isBlue = highlightColor === 'blue';
            const isRed = highlightColor === 'red';
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  // Don't call onNavigate for modal items - it closes the sheet before modal opens
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                  isPurple && "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
                  isBlue && "bg-[#1d9bf0]/10 text-[#1d9bf0] hover:bg-[#1d9bf0]/20",
                  isRed && "bg-red-500/10 text-red-400 hover:bg-red-500/20",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {item.customIcon ? (
                  <item.customIcon className={cn(
                    "h-4 w-4 shrink-0", 
                    isPurple && "text-purple-400"
                  )} size={16} />
                ) : item.icon && (
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0", 
                    isRed && "text-red-400",
                    isBlue && "text-[#1d9bf0]"
                  )} />
                )}
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* New Chat Button - desktop only (mobile has it in header) */}
      {isAuroraPage && !isCollapsed && !isMobile && onNewChat && (
        <Button
          variant="outline"
          className="w-full justify-start gap-2 mb-3 h-10"
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
          className="w-full mb-3"
          onClick={onNewChat}
          title={language === 'he' ? 'שיחה חדשה' : 'New Chat'}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}

      {/* Recent Conversations - right below New Chat button (only on Aurora page) */}
      {isAuroraPage && !isCollapsed && conversations.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-muted-foreground px-3 mb-2 uppercase tracking-wider">
            {language === 'he' ? 'שיחות אחרונות' : 'Recent Chats'}
          </p>
          <ScrollArea className="max-h-[250px]">
            <div className="space-y-1">
              {conversations
                .filter((conv) => 
                  !searchQuery || 
                  conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, 10)
                .map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation?.(conv.id);
                    if (isMobile) onNavigate?.();
                  }}
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
                  <div
                    role="button"
                    tabIndex={0}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center justify-center rounded-md hover:bg-accent cursor-pointer"
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleDeleteConversation(e as unknown as React.MouseEvent, conv.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Spacer to push footer to bottom */}
      <div className="flex-1" />
    </>
  );

  // Mobile Sheet mode - render content directly without Sidebar wrapper
  if (isMobileSheet) {
    return (
      <>
        <div className="flex flex-col h-full bg-sidebar border-sidebar-border">
          <div className="p-2 flex flex-col flex-1">
            <SidebarInnerContent isMobile={true} />
          </div>
          <div className="p-2 border-t border-border">
            <AuroraAccountDropdown
              isCollapsed={false}
              onOpenSettings={onOpenSettings}
            />
          </div>
        </div>
        {/* Modals */}
        <DashboardModal open={dashboardOpen} onOpenChange={setDashboardOpen} />
        <HypnosisModal open={hypnosisOpen} onOpenChange={setHypnosisOpen} />
      </>
    );
  }

  // Desktop mode - render with Sidebar wrapper
  return (
    <>
      <Sidebar 
        className={cn(
          "border-border bg-background !z-50 h-screen top-0",
          isRTL && "order-last"
        )}
        collapsible="icon"
        side={isRTL ? "right" : "left"}
      >
        {/* Logo and hamburger toggle at top of collapsed sidebar */}
        {isCollapsed && (
          <SidebarHeader className="p-2 flex flex-col items-center gap-2">
            {/* Logo */}
            <Link to="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="w-8 h-8 object-contain" 
                loading="eager"
              />
            </Link>
            {/* Menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => sidebar?.toggleSidebar()}
              title={language === 'he' ? 'הרחב תפריט' : 'Expand Menu'}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SidebarHeader>
        )}

        <SidebarContent className="p-2 flex flex-col h-full">
          <SidebarInnerContent />
        </SidebarContent>

        <SidebarFooter className="p-2 border-t border-border">
          <AuroraAccountDropdown
            isCollapsed={isCollapsed}
            onOpenSettings={onOpenSettings}
          />
        </SidebarFooter>
      </Sidebar>
      
      {/* Modals */}
      <DashboardModal open={dashboardOpen} onOpenChange={setDashboardOpen} />
      <HypnosisModal open={hypnosisOpen} onOpenChange={setHypnosisOpen} />
    </>
  );
};

export default DashboardSidebar;
