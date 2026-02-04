import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Menu,
  Search,
  Briefcase,
  User,
  MessageSquare
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
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { SidebarCharacterHUD } from './unified/SidebarCharacterHUD';

const defaultLogo = "/aurora-icon.svg";

interface DashboardSidebarProps {
  onNavigate?: () => void;
  currentConversationId?: string | null;
  onNewChat?: () => void | Promise<boolean>;
  onSelectConversation?: (id: string) => void;
  isMobileSheet?: boolean;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
}

interface MessageSearchResult {
  id: string;
  content: string;
  conversation_id: string;
  created_at: string;
}

const DashboardSidebar = ({ 
  onNavigate,
  isMobileSheet = false,
  onOpenSettings,
  onOpenProfile,
}: DashboardSidebarProps) => {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const sidebar = useSidebar();
  const isCollapsed = !isMobileSheet && sidebar?.state === 'collapsed';
  const { theme: brandTheme } = useThemeSettings();
  const chatContext = useAuroraChatContextSafe();
  const dashboard = useUnifiedDashboard();
  const { isLaunchpadComplete } = useLaunchpadProgress();

  // Modal states
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [hypnosisOpen, setHypnosisOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search Aurora messages
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['aurora-message-search', user?.id, searchQuery],
    queryFn: async () => {
      if (!user?.id || !searchQuery.trim() || searchQuery.length < 2) return [];
      
      // Get user's AI conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('participant_1', user.id)
        .eq('type', 'ai');
      
      if (!conversations?.length) return [];
      
      const conversationIds = conversations.map(c => c.id);
      
      // Search messages in those conversations
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, conversation_id, created_at')
        .in('conversation_id', conversationIds)
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Failed to search messages:', error);
        return [];
      }
      
      return data as MessageSearchResult[];
    },
    enabled: !!user?.id && searchQuery.length >= 2,
  });

  // Show/hide search results dropdown
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const handleSearchResultClick = (result: MessageSearchResult) => {
    if (chatContext?.openChatAndScrollToMessage) {
      chatContext.openChatAndScrollToMessage(result.conversation_id, result.id);
    }
    setSearchQuery('');
    setShowSearchResults(false);
    onNavigate?.();
  };

  // Navigation items - Dashboard first as the main entry point
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, customIcon: null, label: language === 'he' ? 'דאשבורד' : 'Dashboard', highlight: 'red' as const, path: '/dashboard' },
    { id: 'personality', icon: User, customIcon: null, label: language === 'he' ? 'אישיות' : 'Personality', highlight: 'blue' as const, path: '/personality' },
    { id: 'business', icon: Briefcase, customIcon: null, label: language === 'he' ? 'עסקים' : 'Business', highlight: 'gold' as const, path: '/business' },
  ];

  // Search results component
  const SearchResultsDropdown = () => {
    if (!showSearchResults || searchQuery.length < 2) return null;
    
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
        {isSearching ? (
          <div className="p-3 text-center text-sm text-muted-foreground">
            {language === 'he' ? 'מחפש...' : 'Searching...'}
          </div>
        ) : searchResults.length === 0 ? (
          <div className="p-3 text-center text-sm text-muted-foreground">
            {language === 'he' ? 'לא נמצאו תוצאות' : 'No results found'}
          </div>
        ) : (
          <div className="py-1">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSearchResultClick(result)}
                className="w-full text-start px-3 py-2 hover:bg-muted flex items-start gap-2 transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{result.content.slice(0, 60)}...</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(result.created_at), 'dd/MM/yyyy', {
                      locale: language === 'he' ? he : enUS,
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Shared content component for desktop sidebar
  const SidebarInnerContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Desktop: Logo and Brand Name Header */}
      {!isMobile && !isCollapsed && (
        <div className="flex items-center justify-between px-3 py-4 mb-2 border-b border-border">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <AuroraOrbIcon className="w-10 h-10 text-black dark:text-white" size={40} />
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

      {/* Character HUD - Show above search when launchpad is complete */}
      {!dashboard.isLoading && !dashboard.isEmpty && isLaunchpadComplete && !isCollapsed && (
        <div className={cn("px-2 mb-3", isMobile && "px-3")}>
          <SidebarCharacterHUD
            identityTitle={dashboard.identityTitle}
            level={dashboard.level}
            xp={dashboard.xpProgress}
            streak={dashboard.streak}
            tokens={dashboard.tokens}
            onClick={() => {
              onOpenProfile?.();
              onNavigate?.();
            }}
          />
        </div>
      )}

      {/* Mobile: Search bar */}
      {isMobile && (
        <div className="px-3 py-2 mb-3 relative">
          <div className="h-9 flex items-center gap-2 px-3 bg-background/50 backdrop-blur-xl border border-border/50 rounded-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              placeholder={language === 'he' ? 'חיפוש בשיחות...' : 'Search chats...'}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <SearchResultsDropdown />
        </div>
      )}

      {/* Desktop: Search bar above navigation - shown on ALL pages */}
      {!isMobile && !isCollapsed && (
        <div className="px-3 mb-3 relative w-full min-w-0">
          <div className="h-9 flex items-center gap-2 px-3 bg-background/50 backdrop-blur-xl border border-border/50 rounded-lg overflow-hidden">
            <input
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              placeholder={language === 'he' ? 'חיפוש בשיחות...' : 'Search chats...'}
              className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <SearchResultsDropdown />
        </div>
      )}

      {/* Navigation Section */}
      <div className="mb-4">
        <div className="space-y-1">
        {navItems.map((item) => {
            const highlightColor = item.highlight;
            const isRed = highlightColor === 'red';
            const isGold = highlightColor === 'gold';
            const isBlue = highlightColor === 'blue';
              return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                    onNavigate?.();
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
                  isRed && "bg-gradient-to-r from-gray-900 to-gray-800 text-primary hover:from-gray-800 hover:to-gray-700 font-bold shadow-sm hover:shadow-md hover:shadow-primary/20 border border-primary/30",
                  isBlue && "bg-gradient-to-r from-blue-950 to-gray-900 text-yellow-400 hover:from-blue-900 hover:to-gray-800 font-bold shadow-sm hover:shadow-md hover:shadow-blue-900/30 border border-blue-800/50",
                  isGold && "bg-gradient-to-r from-amber-500 to-yellow-400 text-purple-900 hover:from-amber-400 hover:to-yellow-300 font-bold shadow-sm hover:shadow-md hover:shadow-amber-500/30",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {item.customIcon ? (
                  <item.customIcon className="h-4 w-4 shrink-0" size={16} />
                ) : item.icon && (
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0", 
                    isRed && "text-primary",
                    isBlue && "text-yellow-400",
                    isGold && "text-purple-900"
                  )} />
                )}
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer to push footer to bottom */}
      <div className="flex-1" />
    </>
  );

  // Mobile Sheet mode - render content directly without Sidebar wrapper
  if (isMobileSheet) {
    return (
      <>
        <div className="flex flex-col h-full bg-sidebar border-sidebar-border">
          {/* Mobile: Logo and Brand Name Header */}
          <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <AuroraOrbIcon className="w-10 h-10 text-black dark:text-white" size={40} />
              <span className="font-bold text-base text-foreground">
                {language === 'he' ? brandTheme.brand_name : brandTheme.brand_name_en}
              </span>
            </Link>
          </div>
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
              <AuroraOrbIcon className="w-8 h-8 text-black dark:text-white" size={32} />
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
