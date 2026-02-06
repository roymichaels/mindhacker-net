import { ReactNode, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardSidebar from './DashboardSidebar';
import GlobalChatInput from './GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { SettingsModal } from '@/components/settings';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, Compass, Users } from 'lucide-react';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import AuroraChatQuickActions from '@/components/aurora/AuroraChatQuickActions';
import { UserNotificationBell } from '@/components/UserNotificationBell';
import { HypnosisModal } from './HypnosisModal';
import { ProfileDrawer } from './ProfileDrawer';
import { usePractitionersModal } from '@/contexts/PractitionersModalContext';

interface DashboardLayoutProps {
  children: ReactNode;
  currentConversationId?: string | null;
  onNewChat?: () => void | Promise<boolean>;
  onSelectConversation?: (id: string) => void;
}

interface DesktopLayoutContentProps {
  children: ReactNode;
  isRTL: boolean;
  language: string;
  currentConversationId?: string | null;
  onNewChat?: () => void | Promise<boolean>;
  onSelectConversation?: (id: string) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  handleOpenSettings: () => void;
  hypnosisOpen: boolean;
  setHypnosisOpen: (open: boolean) => void;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
}

const DesktopLayoutContent = ({
  children,
  isRTL,
  language,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  settingsOpen,
  setSettingsOpen,
  handleOpenSettings,
  hypnosisOpen,
  setHypnosisOpen,
  profileOpen,
  setProfileOpen,
}: DesktopLayoutContentProps) => {
  const sidebar = useSidebar();
  const { openPractitioners } = usePractitionersModal();
  const isExpanded = sidebar?.state === 'expanded';
  const sidebarWidth = isExpanded ? '16rem' : '3rem';

  return (
    <div className="min-h-screen flex bg-background w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Fixed notification icons */}
      <div className={`fixed top-4 z-50 flex items-center gap-1 ${isRTL ? 'left-4' : 'right-4'}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500"
          onClick={() => openPractitioners()}
          title={language === 'he' ? 'מאמנים' : 'Coaches'}
        >
          <Users className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 bg-[#1d9bf0]/10 hover:bg-[#1d9bf0]/20 text-[#1d9bf0]"
          onClick={() => setHypnosisOpen(true)}
          title={language === 'he' ? 'היפנוזה' : 'Hypnosis'}
        >
          <Compass className="h-5 w-5" />
        </Button>
        <AuroraChatQuickActions />
        <UserNotificationBell />
      </div>

      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        <DashboardSidebar 
          currentConversationId={currentConversationId}
          onNewChat={onNewChat}
          onSelectConversation={onSelectConversation}
          onOpenSettings={handleOpenSettings}
          onOpenProfile={() => setProfileOpen(true)}
        />

        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto p-4 lg:p-6 !pt-14 pb-32 flex flex-col bg-sidebar backdrop-blur-sm">
          {children}
        </main>
      </div>

      <div 
        className="fixed bottom-0 right-0 z-40 transition-all duration-200 flex flex-col items-center"
        style={{ 
          [isRTL ? 'right' : 'left']: sidebarWidth,
          [isRTL ? 'left' : 'right']: 0 
        }}
      >
        <AuroraChatBubbles />
        <GlobalChatInput />
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HypnosisModal open={hypnosisOpen} onOpenChange={setHypnosisOpen} />
      <ProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

const DashboardLayout = ({ 
  children,
  currentConversationId,
  onNewChat,
  onSelectConversation,
}: DashboardLayoutProps) => {
  const { language, isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const [leftSheetOpen, setLeftSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hypnosisOpen, setHypnosisOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { openPractitioners } = usePractitionersModal();

  const handleOpenSettings = () => {
    setLeftSheetOpen(false);
    setSettingsOpen(true);
  };

  const handleOpenProfile = () => {
    setLeftSheetOpen(false);
    setProfileOpen(true);
  };

  const { theme: brandTheme } = useThemeSettings();
  const logoUrl = brandTheme.logo_url || "/logo.png?v=9";

  if (isMobile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-sidebar w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-sidebar">
            <div className="flex h-14 items-center justify-between px-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setLeftSheetOpen(prev => !prev)}
                aria-label="Menu"
                className="h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500"
                  onClick={() => openPractitioners()}
                  title={language === 'he' ? 'מאמנים' : 'Coaches'}
                >
                  <Users className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-[#1d9bf0]/10 hover:bg-[#1d9bf0]/20 text-[#1d9bf0]"
                  onClick={() => setHypnosisOpen(true)}
                  title={language === 'he' ? 'היפנוזה' : 'Hypnosis'}
                >
                  <Compass className="h-5 w-5" />
                </Button>
                <AuroraChatQuickActions />
                <UserNotificationBell />
              </div>
            </div>
          </header>
          
          <Sheet open={leftSheetOpen} onOpenChange={setLeftSheetOpen}>
            <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0 bg-background border-border overflow-visible" hideClose>
              <DashboardSidebar 
                isMobileSheet={true}
                onNavigate={() => setLeftSheetOpen(false)}
                currentConversationId={currentConversationId}
                onNewChat={onNewChat}
                onSelectConversation={onSelectConversation}
                onOpenSettings={handleOpenSettings}
                onOpenProfile={handleOpenProfile}
              />
            </SheetContent>
          </Sheet>

          <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
          <HypnosisModal open={hypnosisOpen} onOpenChange={setHypnosisOpen} />
          <ProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />

          <main className="flex-1 flex flex-col px-0 min-h-0 overflow-y-auto">
            <div className="flex-1 min-h-0 flex flex-col px-3 pt-3 pb-32 bg-sidebar backdrop-blur-sm rounded-t-2xl mt-2 mx-1">
              {children}
            </div>
          </main>

          <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center px-4">
            <AuroraChatBubbles />
            <GlobalChatInput />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <DesktopLayoutContent
        isRTL={isRTL}
        language={language}
        currentConversationId={currentConversationId}
        onNewChat={onNewChat}
        onSelectConversation={onSelectConversation}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleOpenSettings={handleOpenSettings}
        hypnosisOpen={hypnosisOpen}
        setHypnosisOpen={setHypnosisOpen}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      >
        {children}
      </DesktopLayoutContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;
