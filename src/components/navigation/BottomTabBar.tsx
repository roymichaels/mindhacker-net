/**
 * @module navigation/BottomTabBar
 * @tab Global
 * @purpose Mobile bottom navigation bar with floating center "Now" button
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { cn } from '@/lib/utils';
import { getVisibleTabs } from '@/navigation/osNav';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useXpProgress } from '@/hooks/useGameState';

export function BottomTabBar() {
  const { language } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole, loading } = useUserRoles();
  const { profile: userOrbProfile } = useOrbProfile();
  const xp = useXpProgress();

  if (location.pathname.startsWith('/fm') || location.pathname.startsWith('/coaches') || location.pathname.startsWith('/business')) return null;

  const tabs = loading ? [] : getVisibleTabs({ hasRole });

  const isActive = (path: string) => {
    if (path === '/now') return location.pathname === '/now' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          const isComingSoon = 'comingSoon' in tab && tab.comingSoon;

          // ── Floating center button for "Now" ──
          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="relative -mt-6 flex flex-col items-center gap-0.5"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all",
                    "bg-gradient-to-br from-primary to-accent",
                    active
                      ? "ring-2 ring-primary/40 shadow-primary/30"
                      : "shadow-primary/20"
                  )}
                >
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className={cn(
                  "text-[10px] font-semibold",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {language === 'he' ? tab.labelHe : tab.labelEn}
                </span>
              </button>
            );
          }

          // ── Regular tabs ──
          return (
            <button
              key={tab.id}
              onClick={() => !isComingSoon && navigate(tab.path)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
                isComingSoon
                  ? "text-muted-foreground/40 opacity-60 grayscale cursor-default"
                  : active
                    ? "text-primary"
                    : "text-muted-foreground"
              )}
            >
              {tab.useOrb ? (
                <div className={cn(
                  "w-6 h-6 rounded-full overflow-hidden transition-all",
                  active && "ring-1 ring-primary/50"
                )}>
                  <StandaloneMorphOrb
                    size={24}
                    profile={userOrbProfile}
                    geometryFamily={userOrbProfile.geometryFamily || 'sphere'}
                    level={xp.level}
                  />
                </div>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className="text-[10px] font-medium">{language === 'he' ? tab.labelHe : tab.labelEn}</span>
              {isComingSoon && (
                <span className="absolute -top-1 -right-1 text-[7px] font-bold px-1 py-px rounded-full leading-tight bg-destructive text-destructive-foreground">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
