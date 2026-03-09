import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useLearnPillarAction } from '@/hooks/useLearnPillarAction';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouteTheme } from '@/hooks/useRouteTheme';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useTheme } from 'next-themes';
import { FMTopNav } from '@/components/fm/FMTopNav';

import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';
import { AuroraDock } from '@/components/aurora/AuroraDock';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { SettingsModal } from '@/components/settings';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AuroraActionsProvider } from '@/contexts/AuroraActionsContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isRTL, language } = useTranslation();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const theme = useRouteTheme();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const isFM = theme.id === 'fm';
  const headerBg = isDark ? theme.headerBgDark : theme.headerBg;
  const swipeHandlers = useSwipeNavigation();
  useLearnPillarAction();

  return (
    <AuroraActionsProvider>
      <SidebarProvider>
        <div className="h-screen flex flex-col bg-background w-full overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          {isMobile ? (
            isFM ? (
              <FMTopNav onOpenSettings={() => setSettingsOpen(true)} />
            ) : (
              <header
                className="sticky top-0 z-50 w-full border-b backdrop-blur-xl"
                style={{
                  borderBottomColor: theme.borderColor,
                  background: headerBg,
                }}
                data-theme-header
              >
                <div className="flex h-14 items-center justify-between px-3">
                  <div className="flex items-center gap-1">
                    <AppNameDropdown compact onOpenSettings={() => setSettingsOpen(true)} />
                  </div>
                  <HeaderActions compact />
                </div>
              </header>
            )
          ) : isFM ? (
            <FMTopNav onOpenSettings={() => setSettingsOpen(true)} />
          ) : (
            <header
              className="sticky top-0 z-50 w-full border-b backdrop-blur-xl"
              style={{
                borderBottomColor: theme.borderColor,
                background: headerBg,
              }}
              dir={isRTL ? 'rtl' : 'ltr'}
              data-theme-header
            >
              <div className="flex h-14 items-center justify-between px-4 lg:px-6 max-w-screen-2xl mx-auto">
                <AppNameDropdown onOpenSettings={() => setSettingsOpen(true)} />
                <div className="flex items-center gap-1">
                  <HeaderActions />
                </div>
              </div>
            </header>
          )}

          <div className="flex-1 min-h-0 flex !flex-row" dir="ltr" {...(isMobile ? swipeHandlers : {})}>
            <main className={`flex-1 min-h-0 min-w-0 overflow-y-auto scrollbar-hide px-2 lg:px-3 pt-0 flex flex-col transition-all duration-300 relative ${isFM ? 'pb-16 md:pb-4' : 'pb-20 md:pb-4'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Route-colored ambient glow */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: isDark ? theme.ambientGlowDark : theme.ambientGlow }} />
              <div className="relative z-10 flex flex-col flex-1">
                {children}
              </div>
            </main>
          </div>

          <AuroraDock />
          <BottomTabBar />
          <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div>
      </SidebarProvider>
    </AuroraActionsProvider>
  );
};

export default DashboardLayout;
