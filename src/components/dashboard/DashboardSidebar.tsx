import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Menu,
  
  Briefcase,
  Compass,
  User,
  Heart,
  
  Users,
  Wallet,
  GraduationCap,
  Palette
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import AuroraAccountDropdown from '@/components/aurora/AuroraAccountDropdown';
import { DashboardModal } from './DashboardModal';
import { HypnosisModal } from './HypnosisModal';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { PersonalizedOrb } from '@/components/orb/PersonalizedOrb';

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

  // Modal states
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [hypnosisOpen, setHypnosisOpen] = useState(false);

  const highlightStyles: Record<string, { bg: string; text: string; icon: string; border: string; glow: string }> = {
    purple: {
      bg: 'from-purple-500/15 to-fuchsia-500/10 dark:from-purple-500/20 dark:to-fuchsia-500/10',
      text: 'from-purple-600 to-fuchsia-500 dark:from-purple-400 dark:to-fuchsia-300',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/20 dark:border-purple-500/30',
      glow: 'hover:shadow-purple-500/15 dark:hover:shadow-purple-500/25',
    },
    blue: {
      bg: 'from-blue-500/15 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/10',
      text: 'from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300',
      icon: 'text-blue-600 dark:text-cyan-400',
      border: 'border-blue-500/20 dark:border-blue-500/30',
      glow: 'hover:shadow-blue-500/15 dark:hover:shadow-blue-500/25',
    },
    gold: {
      bg: 'from-amber-500/15 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/10',
      text: 'from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300',
      icon: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20 dark:border-amber-500/30',
      glow: 'hover:shadow-amber-500/15 dark:hover:shadow-amber-500/25',
    },
    red: {
      bg: 'from-red-500/15 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/10',
      text: 'from-red-600 to-rose-500 dark:from-red-400 dark:to-rose-300',
      icon: 'text-red-600 dark:text-red-400',
      border: 'border-red-500/20 dark:border-red-500/30',
      glow: 'hover:shadow-red-500/15 dark:hover:shadow-red-500/25',
    },
    pink: {
      bg: 'from-pink-500/15 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/10',
      text: 'from-pink-600 to-rose-500 dark:from-pink-400 dark:to-rose-300',
      icon: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-500/20 dark:border-pink-500/30',
      glow: 'hover:shadow-pink-500/15 dark:hover:shadow-pink-500/25',
    },
    green: {
      bg: 'from-emerald-500/15 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/10',
      text: 'from-emerald-600 to-green-500 dark:from-emerald-400 dark:to-green-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20 dark:border-emerald-500/30',
      glow: 'hover:shadow-emerald-500/15 dark:hover:shadow-emerald-500/25',
    },
    indigo: {
      bg: 'from-indigo-500/15 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/10',
      text: 'from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-300',
      icon: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/20 dark:border-indigo-500/30',
      glow: 'hover:shadow-indigo-500/15 dark:hover:shadow-indigo-500/25',
    },
    fuchsia: {
      bg: 'from-fuchsia-500/15 to-purple-500/10 dark:from-fuchsia-500/20 dark:to-purple-500/10',
      text: 'from-fuchsia-600 to-purple-500 dark:from-fuchsia-400 dark:to-purple-300',
      icon: 'text-fuchsia-600 dark:text-fuchsia-400',
      border: 'border-fuchsia-500/20 dark:border-fuchsia-500/30',
      glow: 'hover:shadow-fuchsia-500/15 dark:hover:shadow-fuchsia-500/25',
    },
    teal: {
      bg: 'from-teal-500/15 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/10',
      text: 'from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300',
      icon: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-500/20 dark:border-teal-500/30',
      glow: 'hover:shadow-teal-500/15 dark:hover:shadow-teal-500/25',
    },
  };

  // Navigation items - Dashboard first as the main entry point
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: language === 'he' ? 'דאשבורד' : 'Dashboard', highlight: 'purple', path: '/dashboard' },
    { id: 'consciousness', icon: User, label: language === 'he' ? 'תודעה' : 'Consciousness', highlight: 'blue', path: '/consciousness' },
    { id: 'business', icon: Briefcase, label: language === 'he' ? 'עסקים' : 'Business', highlight: 'gold', path: '/business' },
    { id: 'health', icon: Heart, label: language === 'he' ? 'בריאות' : 'Health', highlight: 'red', path: '/health' },
    { id: 'relationships', icon: Users, label: language === 'he' ? 'קשרים' : 'Relationships', highlight: 'pink', path: '/relationships' },
    { id: 'finances', icon: Wallet, label: language === 'he' ? 'פיננסים' : 'Finances', highlight: 'green', path: '/finances' },
    { id: 'learning', icon: GraduationCap, label: language === 'he' ? 'למידה' : 'Learning', highlight: 'indigo', path: '/learning' },
    { id: 'purpose', icon: Compass, label: language === 'he' ? 'ייעוד' : 'Purpose', highlight: 'fuchsia', path: '/purpose' },
    { id: 'hobbies', icon: Palette, label: language === 'he' ? 'תחביבים' : 'Hobbies', highlight: 'teal', path: '/hobbies' },
  ];

  const location = useLocation();

  // Shared content component for desktop sidebar
  const SidebarInnerContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Desktop: Logo and Brand Name Header */}
      {!isMobile && !isCollapsed && (
        <div className="flex items-center justify-between px-3 py-4 mb-2 border-b border-border">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <AuroraOrbIcon className="w-[60px] h-[60px] text-black dark:text-white" size={60} />
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
      <div className={cn("mb-4 w-full pb-2", isMobile ? "px-0" : "")}>
        <div className="space-y-1.5 w-full">
          {navItems.map((item) => {
            const s = highlightStyles[item.highlight];
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;
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
                  "group w-full min-w-0 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border",
                  `bg-gradient-to-r ${s.bg} ${s.border} ${s.glow}`,
                  "hover:shadow-md hover:brightness-110",
                  isActive && "ring-1 ring-current/20 shadow-md brightness-110",
                  isCollapsed && "justify-center px-2 py-2.5 rounded-lg"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110", s.icon)} />
                {!isCollapsed && (
                  <span className={cn("bg-clip-text text-transparent bg-gradient-to-r font-bold", s.text)}>
                    {item.label}
                  </span>
                )}
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
        <div className="flex flex-col h-full w-full bg-sidebar border-sidebar-border">
          {/* Mobile: Logo and Brand Name Header - Full width */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border w-full">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1" onClick={onNavigate}>
              <AuroraOrbIcon className="w-[60px] h-[60px] text-black dark:text-white flex-shrink-0" size={60} />
              <span className="font-bold text-lg text-foreground">
                {language === 'he' ? brandTheme.brand_name : brandTheme.brand_name_en}
              </span>
            </Link>
          </div>
          <div className="px-3 py-3 flex flex-col flex-1 w-full overflow-y-auto overflow-x-visible">
            <SidebarInnerContent isMobile={true} />
          </div>
          <div className="px-4 py-3 border-t border-border w-full">
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
              <AuroraOrbIcon className="w-12 h-12 text-black dark:text-white" size={48} />
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

        <SidebarContent className="p-2 flex flex-col h-full overflow-y-auto overflow-x-visible">
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
