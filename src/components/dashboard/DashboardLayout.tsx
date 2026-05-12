import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useLearnPillarAction } from '@/hooks/useLearnPillarAction';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouteTheme } from '@/hooks/useRouteTheme';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useTheme } from 'next-themes';
import { FMTopNav } from '@/components/fm/FMTopNav';
import { useChromeVisibility } from '@/contexts/ChromeVisibilityContext';
import { featureFlags } from '@/lib/featureFlags';
import { StoryWorldShell } from '@/components/story/StoryWorldShell';
import { StorySurfaceHost } from '@/components/story/StorySurfaceHost';

import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AppSideMenu } from '@/components/navigation/AppSideMenu';
import { AuroraDock } from '@/components/aurora/AuroraDock';
import { HubModalHost } from '@/components/navigation/HubModalHost';
import { HubModalProvider, useHubModalSafe } from '@/contexts/HubModalContext';
import { SettingsModal } from '@/components/settings';
import { ChromeGate } from '@/orchestration';

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
  const { headerHidden } = useChromeVisibility();

  return (
    <AuroraActionsProvider>
      <SidebarProvider>
        <HubModalProvider>
          <DashboardLayoutInner
            isMobile={isMobile}
            isRTL={isRTL}
            theme={theme}
            isDark={isDark}
            headerBg={headerBg}
            headerHidden={headerHidden}
            settingsOpen={settingsOpen}
            setSettingsOpen={setSettingsOpen}
          >
            {children}
          </DashboardLayoutInner>
        </HubModalProvider>
      </SidebarProvider>
    </AuroraActionsProvider>
  );
};

interface InnerProps {
  isMobile: boolean;
  isRTL: boolean;
  theme: ReturnType<typeof useRouteTheme>;
  isDark: boolean;
  headerBg: string;
  headerHidden: boolean;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  children: ReactNode;
}

function DashboardLayoutInner({
  isMobile,
  isRTL,
  theme,
  isDark,
  headerBg,
  headerHidden,
  settingsOpen,
  setSettingsOpen,
  children,
}: InnerProps) {
  const hubModal = useHubModalSafe();
  const hubActive = !!hubModal?.activeHub;
  const showHeader = !headerHidden && !hubActive;

  return (
    <>
        <div className="h-screen flex flex-col bg-background w-full overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          {showHeader && (
            isMobile ? (
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
                    <AppSideMenu onOpenSettings={() => setSettingsOpen(true)} />
                  </div>
                  <HeaderActions compact />
                </div>
              </header>
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
                  <AppSideMenu onOpenSettings={() => setSettingsOpen(true)} />
                  <div className="flex items-center gap-1">
                    <HeaderActions />
                  </div>
                </div>
              </header>
            )
          )}

          <div className="flex-1 min-h-0 flex !flex-row" dir="ltr">
            <main className={`flex-1 min-h-0 min-w-0 overflow-y-auto scrollbar-hide px-2 lg:px-3 pt-0 flex flex-col transition-all duration-300 relative ${headerHidden ? 'pb-0' : 'pb-3'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Route-colored ambient glow */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: isDark ? theme.ambientGlowDark : theme.ambientGlow }} />
              {featureFlags.enableStoryWorld ? <StoryWorldShell compact={false} /> : null}
              <div className="relative z-10 flex flex-col flex-1">
                <StorySurfaceHost>{children}</StorySurfaceHost>
              </div>
            </main>
          </div>

          {!headerHidden && !hubActive && (
            <ChromeGate id="aurora-dock">
              <AuroraDock />
            </ChromeGate>
          )}
          <HubModalHost />
          <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div>
    </>
  );
}

export default DashboardLayout;
