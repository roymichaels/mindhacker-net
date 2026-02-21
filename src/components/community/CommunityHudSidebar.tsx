/**
 * CommunityHudSidebar - Left sidebar for community pillar navigation.
 * Violet/purple color scheme matching community identity.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelRightClose, PanelRightOpen, Users, Plus } from 'lucide-react';
import { LIFE_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';

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

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-violet-500/15",
      collapsed ? "w-16 min-w-[64px]" : "fixed inset-0 z-50 w-full lg:relative lg:inset-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
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

          {/* Global feed */}
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
          {/* Header badge */}
          <div className="w-full rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/15 border border-violet-500/20 p-3 flex items-center justify-between">
            <div className="text-center flex-1">
              <span className="text-sm font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {isHe ? 'קומיוניטי MindOS' : 'MindOS Community'}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isHe ? '13 עמודים. ציוויליזציה אחת.' : '13 pillars. One civilization.'}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

          {/* Pillar list */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {isHe ? 'עמודים' : 'Pillars'}
          </span>
          <div className="flex flex-col gap-1 w-full">
            {/* Global feed button */}
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
                {isHe ? 'כל הפילרים' : 'All Pillars'}
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
