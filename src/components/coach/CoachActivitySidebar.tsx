/**
 * CoachActivitySidebar - Right sidebar for client pipeline & activity feed.
 * Mirrors RoadmapSidebar structure with purple/indigo coach theme.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelLeftClose, PanelLeftOpen, UserPlus, FileCheck, CalendarCheck, MessageSquare, Calendar } from 'lucide-react';
import { useCoachClients, useCoachClientStats } from '@/hooks/useCoachClients';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

interface ActivityEvent {
  id: string;
  type: 'new_client' | 'plan_completed' | 'review_received' | 'session_scheduled';
  label: string;
  time: string;
  icon: typeof UserPlus;
  color: string;
}

export function CoachActivitySidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { stats } = useCoachClientStats();
  const { data: clients } = useCoachClients();
  const { data: myProfile } = useMyPractitionerProfile();

  // Build activity feed from clients + reviews
  const { data: activityFeed = [] } = useQuery({
    queryKey: ['coach-activity-feed', myProfile?.id],
    queryFn: async (): Promise<ActivityEvent[]> => {
      if (!myProfile?.id) return [];
      const events: ActivityEvent[] = [];
      const locale = isHe ? he : enUS;

      // Recent clients
      const { data: recentClients } = await supabase
        .from('practitioner_clients')
        .select('id, created_at, client_user_id')
        .eq('practitioner_id', myProfile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      for (const c of recentClients || []) {
        events.push({
          id: `client-${c.id}`,
          type: 'new_client',
          label: isHe ? 'מתאמן חדש הצטרף' : 'New client joined',
          time: formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale }),
          icon: UserPlus,
          color: 'text-purple-400',
        });
      }

      // Recent reviews
      const { data: recentReviews } = await supabase
        .from('practitioner_reviews')
        .select('id, created_at, rating')
        .eq('practitioner_id', myProfile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      for (const r of recentReviews || []) {
        events.push({
          id: `review-${r.id}`,
          type: 'review_received',
          label: isHe ? `ביקורת חדשה (${r.rating}⭐)` : `Review received (${r.rating}⭐)`,
          time: formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale }),
          icon: MessageSquare,
          color: 'text-amber-400',
        });
      }

      // Sort by most recent
      return events.sort((a, b) => 0).slice(0, 8);
    },
    enabled: !!myProfile?.id,
  });

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <aside
      className={cn(
        "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-e rtl:border-s border-border/50 dark:border-purple-500/15",
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
            {/* Progress circle */}
            <div className="flex flex-col items-center gap-0.5 w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
              <div className="w-9 h-9 rounded-full border-2 border-purple-500/40 flex items-center justify-center bg-background/50">
                <span className="text-[9px] font-bold text-purple-400">{completionRate}%</span>
              </div>
              <span className="text-[8px] text-muted-foreground leading-none">{isHe ? 'השלמה' : 'Done'}</span>
            </div>

            <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

            {/* Event dots */}
            <div className="flex flex-col items-center gap-1.5">
              {activityFeed.slice(0, 5).map((event) => (
                <div key={event.id} className="w-3 h-3 rounded-full bg-purple-500/30 border border-purple-500/20" title={event.label} />
              ))}
              {activityFeed.length === 0 && (
                <span className="text-[8px] text-muted-foreground">{isHe ? 'אין' : 'None'}</span>
              )}
            </div>
          </div>

          {/* Calendar mini icon */}
          <button className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors" title={isHe ? 'פגישות' : 'Sessions'}>
            <Calendar className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      )}

      {/* ===== EXPANDED FULL VIEW ===== */}
      {!collapsed && (
        <div className="flex flex-col h-full overflow-hidden p-3 pt-8">
          {/* Clients Overview */}
          <div className="mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
              {isHe ? 'הלקוחות שלי' : 'My Clients'}
            </span>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <div className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                <span className="text-sm font-bold leading-none">{stats.total}</span>
                <span className="text-[9px] text-muted-foreground">{isHe ? 'סה"כ' : 'Total'}</span>
              </div>
              <div className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                <span className="text-sm font-bold leading-none text-emerald-400">{stats.active}</span>
                <span className="text-[9px] text-muted-foreground">{isHe ? 'פעילים' : 'Active'}</span>
              </div>
              <div className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                <span className="text-sm font-bold leading-none">{stats.completed}</span>
                <span className="text-[9px] text-muted-foreground">{isHe ? 'הושלמו' : 'Done'}</span>
              </div>
            </div>

            {/* Mini client avatars */}
            {clients && clients.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {clients.slice(0, 6).map((c) => (
                  <div key={c.id} className="w-7 h-7 rounded-full bg-primary/20 border border-border/30 flex items-center justify-center" title={c.profile?.full_name || ''}>
                    <span className="text-[10px] font-bold text-primary">
                      {c.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                ))}
                {clients.length > 6 && (
                  <div className="w-7 h-7 rounded-full bg-muted/40 border border-border/30 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-muted-foreground">+{clients.length - 6}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-2" />

          {/* Progress circle */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full border-2 border-purple-500/40 flex items-center justify-center bg-background/50 relative flex-shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--muted)/0.2)" strokeWidth="2.5" />
                <circle
                  cx="20" cy="20" r="16" fill="none"
                  stroke="rgb(168 85 247)" strokeWidth="2.5"
                  strokeDasharray={`${completionRate * 1.005} 100.5`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="text-[9px] font-bold text-purple-400">{completionRate}%</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{isHe ? 'שיעור השלמה' : 'Completion'}</span>
          </div>

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-2" />

          {/* Activity Feed */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
              {isHe ? 'פעילות אחרונה' : 'Recent Activity'}
            </span>

            {activityFeed.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">{isHe ? 'אין פעילות עדיין' : 'No activity yet'}</p>
              </div>
            ) : (
              <div className="relative flex flex-col gap-0 w-full">
                <div className="absolute top-0 bottom-0 w-[2px] bg-purple-500/10 rounded-full ltr:left-[7px] rtl:right-[7px]" />
                {activityFeed.map((event) => (
                  <div key={event.id} className="relative flex items-start gap-2.5 py-1.5 ltr:pl-5 rtl:pr-5">
                    <div className={cn(
                      "absolute ltr:left-0 rtl:right-0 top-2.5 w-[16px] h-[16px] rounded-full flex items-center justify-center",
                      "bg-muted/50 border border-purple-500/20"
                    )}>
                      <event.icon className={cn("w-2.5 h-2.5", event.color)} />
                    </div>
                    <div className="flex flex-col gap-0">
                      <span className="text-xs font-medium leading-tight">{event.label}</span>
                      <span className="text-[10px] text-muted-foreground">{event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-2" />

          {/* Upcoming Sessions */}
          <div className="pb-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
              {isHe ? 'פגישות קרובות' : 'Upcoming Sessions'}
            </span>
            <div className="rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-3 text-center">
              <Calendar className="w-5 h-5 text-muted-foreground/40 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{isHe ? 'אין פגישות מתוכננות' : 'No sessions scheduled'}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
