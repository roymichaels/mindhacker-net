/**
 * CommunityActivitySidebar - Right sidebar with community stats and activity.
 * Violet/purple color scheme matching community identity.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelLeftClose, PanelLeftOpen, MessageSquare, Users, Heart, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function CommunityActivitySidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const { data: stats } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      const [postsRes, membersRes] = await Promise.all([
        supabase.from('community_posts').select('id', { count: 'exact', head: true }),
        supabase.from('community_members').select('id', { count: 'exact', head: true }),
      ]);
      return {
        posts: postsRes.count || 0,
        members: membersRes.count || 0,
      };
    },
  });

  const { data: recentPosts } = useQuery({
    queryKey: ['community-recent-posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_posts')
        .select('id, title, content, pillar, created_at, likes_count, comments_count')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const statItems = [
    { icon: Users, value: stats?.members || 0, label: isHe ? 'חברים' : 'Members', color: 'text-violet-400' },
    { icon: MessageSquare, value: stats?.posts || 0, label: isHe ? 'פוסטים' : 'Posts', color: 'text-purple-400' },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-e rtl:border-s border-border/50 dark:border-violet-500/15",
        collapsed ? "w-[54px] min-w-[54px]" : "fixed inset-0 z-50 w-full lg:relative lg:inset-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
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

      {/* ===== COLLAPSED MINI VIEW ===== */}
      {collapsed && (
        <div className="flex flex-col items-center justify-between h-full pt-8 pb-3 px-0.5 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-center gap-1 w-full">
            {statItems.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
                <m.icon className={cn("w-4 h-4", m.color)} />
                <span className="text-[10px] font-bold leading-none">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== EXPANDED FULL VIEW ===== */}
      {!collapsed && (
        <div className="flex flex-col h-full overflow-hidden p-3 pt-8">
          {/* Stats */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
            {isHe ? 'סטטיסטיקה' : 'Stats'}
          </span>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {statItems.map((m) => (
              <div key={m.label} className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                <m.icon className={cn("w-3.5 h-3.5", m.color)} />
                <span className="text-sm font-bold leading-none">{m.value}</span>
                <span className="text-[9px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent mb-3" />

          {/* Recent Activity */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
            {isHe ? 'פעילות אחרונה' : 'Recent Activity'}
          </span>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {(!recentPosts || recentPosts.length === 0) ? (
              <p className="text-xs text-muted-foreground text-center py-2">{isHe ? 'אין פוסטים עדיין' : 'No posts yet'}</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {recentPosts.map((post) => (
                  <div key={post.id} className="rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-2">
                    <p className="text-[11px] font-medium leading-tight truncate">
                      {post.title || (post.content?.slice(0, 40) + '...')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {post.pillar && (
                        <span className="text-[9px] bg-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded-full">
                          {post.pillar}
                        </span>
                      )}
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5" /> {post.likes_count || 0}
                      </span>
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <MessageSquare className="w-2.5 h-2.5" /> {post.comments_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
