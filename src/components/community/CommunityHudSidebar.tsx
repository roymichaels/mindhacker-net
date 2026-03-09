/**
 * CommunityHudSidebar - Left sidebar for community pillar navigation.
 * Includes the Player Card HUD at the top. Per-pillar color theming.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import CommunityPlayerCard from '@/components/community/CommunityPlayerCard';

interface CommunityHudSidebarProps {
  selectedPillar: string;
  onPillarSelect: (id: string) => void;
  selectedTopic?: string | null;
  onSelectTopic?: (id: string | null) => void;
  onCreateThread?: () => void;
}

const PILLAR_ICONS: Record<string, string> = {
  consciousness: '🔮', presence: '👁️', power: '💪', vitality: '☀️',
  focus: '🎯', combat: '⚔️', expansion: '🧠', wealth: '📈',
  influence: '👑', relationships: '🤝', business: '💼', projects: '📋', play: '🎮',
  order: '✨', romantics: '💋',
};

/** Color maps keyed by the domain.color field */
const activeBgMap: Record<string, string> = {
  violet: 'bg-violet-500/20 border-violet-500/40',
  fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/40',
  red: 'bg-red-500/20 border-red-500/40',
  amber: 'bg-amber-500/20 border-amber-500/40',
  cyan: 'bg-cyan-500/20 border-cyan-500/40',
  slate: 'bg-slate-500/20 border-slate-500/40',
  indigo: 'bg-indigo-500/20 border-indigo-500/40',
  emerald: 'bg-emerald-500/20 border-emerald-500/40',
  purple: 'bg-purple-500/20 border-purple-500/40',
  sky: 'bg-sky-500/20 border-sky-500/40',
  orange: 'bg-orange-500/20 border-orange-500/40',
  blue: 'bg-blue-500/20 border-blue-500/40',
  lime: 'bg-lime-500/20 border-lime-500/40',
  teal: 'bg-teal-500/20 border-teal-500/40',
  rose: 'bg-rose-500/20 border-rose-500/40',
};

const activeTextMap: Record<string, string> = {
  violet: 'text-violet-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', orange: 'text-orange-400', blue: 'text-blue-400',
  lime: 'text-lime-400', teal: 'text-teal-400', rose: 'text-rose-400',
};

export function CommunityHudSidebar({ selectedPillar, onPillarSelect, onCreateThread }: CommunityHudSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();

  // Find the color for the currently selected pillar
  const selectedDomain = LIFE_DOMAINS.find(d => d.id === selectedPillar);
  const selectedColor = selectedDomain?.color || 'violet';

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-violet-500/15",
      collapsed ? "w-16 min-w-[64px]" : "w-full md:w-[280px] md:min-w-[220px] xl:w-[300px] fixed md:relative right-0 md:right-auto top-14 bottom-0 z-[55] md:z-auto md:top-auto bg-background md:bg-transparent"
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
                  ? `${activeBgMap[domain.color] || 'bg-violet-500/20 border-violet-500/40'} border`
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
          {user && <CommunityPlayerCard userId={user.id} />}

          <div className="h-px w-full bg-gradient-to-r from-transparent via-border/30 to-transparent" />

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
                    ? `${activeBgMap[domain.color]?.replace('border-', 'border-').replace('/40', '/30') || 'bg-violet-500/15 border-violet-500/30'} shadow-sm`
                    : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                )}
              >
                <span className="text-sm">{PILLAR_ICONS[domain.id] || '⚡'}</span>
                <span className={cn(
                  "text-xs font-medium flex-1",
                  selectedPillar === domain.id ? (activeTextMap[domain.color] || 'text-violet-400') : 'text-foreground'
                )}>
                  {isHe ? domain.labelHe : domain.labelEn}
                </span>
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-border/30 to-transparent" />
        </div>
      )}
    </aside>
  );
}
