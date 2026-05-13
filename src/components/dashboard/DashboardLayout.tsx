import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useLearnPillarAction } from '@/hooks/useLearnPillarAction';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useTheme } from 'next-themes';
import { useChromeVisibility } from '@/contexts/ChromeVisibilityContext';
import { StorySurfaceHost } from '@/components/story/StorySurfaceHost';
import { withLegacyGuard } from '@/shellv2/LegacyMountGuard';

import { OSDrawer } from '@/components/shell/OSDrawer';
import { MindOSSheet } from '@/components/shell/MindOSSheet';
import { AIONPresenceButton } from '@/components/shell/AIONPresenceButton';
import { HubModalHost } from '@/components/navigation/HubModalHost';
import { HubModalProvider, useHubModalSafe } from '@/contexts/HubModalContext';
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
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
            isDark={isDark}
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
  isDark: boolean;
  headerHidden: boolean;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  children: ReactNode;
}

function DashboardLayoutInner({
  isMobile,
  isRTL,
  isDark,
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
            <header
              className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-background/80 backdrop-blur-xl pt-safe"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div
                className={cn(
                  'flex h-12 items-center justify-between',
                  isMobile ? 'px-3' : 'px-4 lg:px-6 max-w-screen-2xl mx-auto h-14',
                )}
              >
                <OSDrawer onOpenSettings={() => setSettingsOpen(true)} />
                <MindOSSheet compact={isMobile} />
                <AIONPresenceButton compact={isMobile} />
              </div>
            </header>
          )}

          <div className="flex-1 min-h-0 flex !flex-row" dir="ltr">
            <main
              className={cn(
                'flex-1 min-h-0 min-w-0 overflow-y-auto scrollbar-hide flex flex-col relative',
                headerHidden ? 'pb-0' : 'pb-0',
              )}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="relative z-10 flex flex-col flex-1">
                <StorySurfaceHost>{children}</StorySurfaceHost>
              </div>
            </main>
          </div>

          <HubModalHost />
          <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div>
    </>
  );
}

export default withLegacyGuard('DashboardLayout', DashboardLayout);
