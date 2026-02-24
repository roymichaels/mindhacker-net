/**
 * CommunityHudSidebar - Left sidebar for community pillar navigation.
 * Includes the Player Card HUD at the top.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { PanelRightClose, PanelRightOpen, Users } from 'lucide-react';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import CommunityPlayerCard from '@/components/community/CommunityPlayerCard';

interface CommunityHudSidebarProps {
  selectedPillar: string;
  onPillarSelect: (id: string) => void;
  onCreateThread?: () => void;
}

const PILLAR_ICONS: Record<string, string> = {
  consciousness: '🔮', presence: '👁️', power: '💪', vitality: '☀️',
  focus: '🎯', combat: '⚔️', expansion: '🧠', wealth: '📈',
  influence: '👑', relationships: '🤝', business: '💼', projects: '📋', play: '🎮',
};

export function CommunityHudSidebar({ selectedPillar, onPillarSelect, onCreateThread }: CommunityHudSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-violet-500/15",
      collapsed ? "w-16 min-w-[64px]" : "fixed top-14 bottom-14 inset-x-0 z-50 w-full lg:relative lg:top-auto lg:bottom-auto lg:inset-x-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
    )}>
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
          collapsed
            ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
            : "ltr:left-2 rtl:right-2"
        )}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed
          ? (isRTL ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />)
          : (isRTL ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />)
        }
      </button>

      {/* ===== COLLAPSED MINI VIEW ===== */}
      {collapsed && (
        <div className="flex flex-col items-center gap-1 h-full pt-7 pb-4 px-0.5 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-center gap-1 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="w-8 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent my-1" />

          <button
            onClick={() => onPillarSelect('all')}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-colors",
              selectedPillar === 'all'
                ? "bg-violet-500/20 border border-violet-500/40"
                : "bg-muted/30 dark:bg-muted/15 border border-border/20 hover:bg-accent/10"
            )}
            title={isHe ? 'הכל' : 'All'}
          >
            🌐
          </button>

          {LIFE_DOMAINS.map((domain) => (
            <button
              key={domain.id}
              onClick={() => onPillarSelect(domain.id)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-colors",
                selectedPillar === domain.id
                  ? "bg-violet-500/20 border border-violet-500/40"
                  : "bg-muted/30 dark:bg-muted/15 border border-border/20 hover:bg-accent/10"
              )}
              title={isHe ? domain.labelHe : domain.labelEn}
            >
              {PILLAR_ICONS[domain.id] || '⚡'}
            </button>
          ))}
        </div>
      )}

      {/* ===== EXPANDED FULL VIEW ===== */}
      {!collapsed && (
        <div className="flex flex-col gap-2 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          {/* Player Card HUD — same as dashboard */}
          {user && <CommunityPlayerCard userId={user.id} />}

          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

          {/* Pillar list */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {isHe ? 'עמודים' : 'Pillars'}
          </span>
          <div className="flex flex-col gap-1 w-full">
            <button
              onClick={() => onPillarSelect('all')}
              className={cn(
                "w-full rounded-xl p-2 flex items-center gap-2.5 transition-all border text-start",
                selectedPillar === 'all'
                  ? "bg-violet-500/15 border-violet-500/30 shadow-sm"
                  : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
              )}
            >
              <span className="text-sm">🌐</span>
              <span className={cn(
                "text-xs font-medium flex-1",
                selectedPillar === 'all' ? 'text-violet-400' : 'text-foreground'
              )}>
                {isHe ? 'הכל' : 'All'}
              </span>
            </button>
            {LIFE_DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => onPillarSelect(domain.id)}
                className={cn(
                  "w-full rounded-xl p-2 flex items-center gap-2.5 transition-all border text-start",
                  selectedPillar === domain.id
                    ? "bg-violet-500/15 border-violet-500/30 shadow-sm"
                    : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                )}
              >
                <span className="text-sm">{PILLAR_ICONS[domain.id] || '⚡'}</span>
                <span className={cn(
                  "text-xs font-medium flex-1",
                  selectedPillar === domain.id ? 'text-violet-400' : 'text-foreground'
                )}>
                  {isHe ? domain.labelHe : domain.labelEn}
                </span>
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        </div>
      )}
    </aside>
  );
}
