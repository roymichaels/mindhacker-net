/**
 * CommunityActivitySidebar - Right sidebar: Topics for selected pillar + Trending, Top Contributors.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelLeftClose, PanelLeftOpen, TrendingUp, Award, Crown, Users, MessageSquare } from 'lucide-react';
import { useTopContributors, useWeeklyHighlight, useActiveToday } from '@/hooks/useCommunityFeed';
import { getReputationTier, calculateReputation, PILLAR_SUBCATEGORIES, type PillarSubcategory } from '@/lib/communityHelpers';
import { Badge } from '@/components/ui/badge';
import CommunityOrb from './CommunityOrb';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CommunityActivitySidebarProps {
  selectedPillar?: string;
  selectedTopic?: string | null;
  onSelectTopic?: (topicId: string | null) => void;
}

export function CommunityActivitySidebar({ selectedPillar = 'all', selectedTopic = null, onSelectTopic }: CommunityActivitySidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const { data: topContributors } = useTopContributors(5);
  const { data: highlight } = useWeeklyHighlight();
  const { data: activeCount } = useActiveToday();

  const isAll = selectedPillar === 'all';
  const subcategories = PILLAR_SUBCATEGORIES[selectedPillar] || [];

  // Fetch thread counts per subcategory
  const { data: topicCounts } = useQuery({
    queryKey: ['topic-thread-counts', selectedPillar],
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
    <aside
      className={cn(
        "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-e rtl:border-s border-border/50 dark:border-violet-500/15",
        collapsed ? "w-[54px] min-w-[54px]" : "w-[280px] min-w-[220px] xl:w-[300px]"
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
          collapsed
            ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
            : "ltr:right-2 rtl:left-2"
        )}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed
          ? (isRTL ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />)
          : (isRTL ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />)
        }
      </button>

      {/* ===== COLLAPSED ===== */}
      {collapsed && (
        <div className="flex flex-col items-center gap-2 pt-8 px-0.5">
          <div className="w-10 h-10 rounded-lg bg-muted/30 border border-border/20 flex flex-col items-center justify-center">
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-muted/30 border border-border/20 flex flex-col items-center justify-center">
            <Crown className="w-4 h-4 text-violet-400" />
          </div>
          {activeCount !== undefined && activeCount > 0 && (
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[9px] font-bold text-emerald-400">{activeCount}</span>
            </div>
          )}
        </div>
      )}

      {/* ===== EXPANDED ===== */}
      {!collapsed && (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide p-3 pt-8 gap-4">

          {/* ── Topic boards for selected pillar ── */}
          {!isAll && subcategories.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
                📋 {isHe ? 'נושאים' : 'Topics'}
              </span>
              <div className="flex flex-col gap-1 mt-1.5">
                {/* "All threads" option */}
                <button
                  onClick={() => onSelectTopic?.(null)}
                  className={cn(
                    "w-full rounded-lg p-2 flex items-center gap-2 text-start transition-all border text-xs font-medium",
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
                      "w-full rounded-lg p-2 flex items-center gap-2 text-start transition-all border",
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
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent mt-3" />
            </div>
          )}

          {/* Active Now */}
          {activeCount !== undefined && activeCount > 0 && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">
                {activeCount} {isHe ? 'פעילים היום' : 'Active Today'}
              </span>
            </div>
          )}

          {/* Weekly Highlight */}
          {highlight && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                {isHe ? 'שרשור השבוע' : 'Thread of the Week'}
              </span>
              <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 p-3">
                <p className="text-xs font-semibold leading-tight line-clamp-2 mb-1.5">
                  {highlight.title || highlight.content?.slice(0, 50)}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span>@{(highlight.author as any)?.community_username || (highlight.author as any)?.full_name || '—'}</span>
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 border-amber-500/30 text-amber-500">
                    🏆 {isHe ? 'שרשור השבוע' : 'TOTW'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

          {/* Top Contributors */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
              <Crown className="w-3 h-3 text-violet-400" />
              {isHe ? 'מובילים' : 'Top Contributors'}
            </span>
            <div className="flex flex-col gap-1.5">
              {(!topContributors || topContributors.length === 0) ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  {isHe ? 'אין נתונים עדיין' : 'No data yet'}
                </p>
              ) : (
                topContributors.map((c, i) => {
                  const rep = calculateReputation(c.posts_count || 0, c.comments_count || 0, c.likes_received || 0);
                  const tier = getReputationTier(rep);
                  const username = (c.profile as any)?.community_username;

                  return (
                    <div key={c.user_id} className="flex items-center gap-2 rounded-lg bg-muted/20 border border-border/20 p-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <CommunityOrb userId={c.user_id} size={28} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium truncate">@{username}</p>
                        <div className="flex items-center gap-1">
                          <span className={cn("text-[9px] font-bold", tier.color)}>
                            {isHe ? tier.he : tier.en}
                          </span>
                          <span className="text-[9px] text-muted-foreground">• {rep} rep</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
