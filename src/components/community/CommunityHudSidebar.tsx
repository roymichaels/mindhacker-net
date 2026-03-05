/**
 * CommunityHudSidebar - Left sidebar for community pillar navigation + topic boards.
 * Includes the Player Card HUD at the top.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { PanelRightClose, PanelRightOpen, MessageSquare } from 'lucide-react';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import { PILLAR_SUBCATEGORIES } from '@/lib/communityHelpers';
import CommunityPlayerCard from '@/components/community/CommunityPlayerCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
};

export function CommunityHudSidebar({ selectedPillar, onPillarSelect, selectedTopic = null, onSelectTopic, onCreateThread }: CommunityHudSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();

  const isAll = selectedPillar === 'all';
  const subcategories = PILLAR_SUBCATEGORIES[selectedPillar] || [];

  // Fetch thread counts per subcategory
  const { data: topicCounts } = useQuery({
    queryKey: ['topic-thread-counts-hud', selectedPillar],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_posts')
        .select('category_id')
        .eq('pillar', selectedPillar)
        .eq('status', 'approved');
      if (!data) return {};
      const counts: Record<string, number> = {};
      for (const post of data) {
        if (post.category_id) {
          counts[post.category_id] = (counts[post.category_id] || 0) + 1;
        }
      }
      return counts;
    },
    enabled: !isAll && subcategories.length > 0,
    staleTime: 60_000,
  });

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

          {/* ── Topic boards for selected pillar ── */}
          {!isAll && subcategories.length > 0 && (
            <>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                📋 {isHe ? 'נושאים' : 'Topics'}
              </span>
              <div className="flex flex-col gap-1 w-full">
                <button
                  onClick={() => onSelectTopic?.(null)}
                  className={cn(
                    "w-full rounded-xl p-2 flex items-center gap-2 text-start transition-all border text-xs font-medium",
                    selectedTopic === null
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted/20 border-border/20 text-foreground hover:bg-accent/10"
                  )}
                >
                  🌐 {isHe ? 'כל השרשורים' : 'All threads'}
                </button>
                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => onSelectTopic?.(sub.id)}
                    className={cn(
                      "w-full rounded-xl p-2 flex items-center gap-2 text-start transition-all border",
                      selectedTopic === sub.id
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/20 border-border/20 hover:bg-accent/10"
                    )}
                  >
                    <span className="text-sm flex-shrink-0">{sub.icon}</span>
                    <span className={cn(
                      "text-xs font-medium flex-1 truncate",
                      selectedTopic === sub.id ? "text-primary" : "text-foreground"
                    )}>
                      {isHe ? sub.he : sub.en}
                    </span>
                    <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground flex-shrink-0">
                      <MessageSquare className="h-2.5 w-2.5" />
                      <span>{topicCounts?.[sub.id] || 0}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        </div>
      )}
    </aside>
  );
}
