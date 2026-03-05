/**
 * CommunityActivitySidebar - Right sidebar: Topics for selected pillar.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelLeftClose, PanelLeftOpen, MessageSquare } from 'lucide-react';
import { PILLAR_SUBCATEGORIES } from '@/lib/communityHelpers';
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
        collapsed ? "w-[54px] min-w-[54px]" : "w-full md:w-[280px] md:min-w-[220px] xl:w-[300px] fixed md:relative left-0 md:left-auto top-14 bottom-0 z-[55] md:z-auto md:top-auto bg-background md:bg-transparent"
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
        <div className="flex flex-col items-center gap-1 pt-8 px-0.5 overflow-y-auto scrollbar-hide">
          {!isAll && subcategories.length > 0 && subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSelectTopic?.(sub.id)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-colors",
                selectedTopic === sub.id
                  ? "bg-primary/20 border border-primary/40"
                  : "bg-muted/30 dark:bg-muted/15 border border-border/20 hover:bg-accent/10"
              )}
              title={isHe ? sub.he : sub.en}
            >
              {sub.icon}
            </button>
          ))}
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
            </div>
          )}

          {isAll && (
            <p className="text-xs text-muted-foreground text-center py-4">
              {isHe ? 'בחר עמוד כדי לראות נושאים' : 'Select a pillar to see topics'}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
