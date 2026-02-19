/**
 * CoachHudSidebar - Left sidebar for coach business stats & quick actions.
 * Mirrors HudSidebar structure with purple/indigo coach theme.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelRightClose, PanelRightOpen, Users, Star, DollarSign, MessageSquare, UserPlus, Brain, ExternalLink, Briefcase } from 'lucide-react';
import { useCoachClientStats } from '@/hooks/useCoachClients';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function CoachHudSidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const { stats, isLoading: statsLoading } = useCoachClientStats();
  const { data: myProfile } = useMyPractitionerProfile();
  const isHe = language === 'he';

  // Fetch average rating
  const { data: reviewStats } = useQuery({
    queryKey: ['coach-review-stats', myProfile?.id],
    queryFn: async () => {
      if (!myProfile?.id) return { avgRating: 0, pendingCount: 0 };
      const { data } = await supabase
        .from('practitioner_reviews')
        .select('rating')
        .eq('practitioner_id', myProfile.id);
      const reviews = data || [];
      const avg = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      return { avgRating: Math.round(avg * 10) / 10, pendingCount: 0 };
    },
    enabled: !!myProfile?.id,
  });

  const statItems = [
    { icon: Users, value: stats.active, label: isHe ? 'פעילים' : 'Active', color: 'text-purple-400' },
    { icon: Star, value: reviewStats?.avgRating || 0, label: isHe ? 'דירוג' : 'Rating', color: 'text-amber-400' },
    { icon: DollarSign, value: '—', label: isHe ? 'הכנסות' : 'Revenue', color: 'text-emerald-400' },
    { icon: MessageSquare, value: reviewStats?.pendingCount || 0, label: isHe ? 'ביקורות' : 'Reviews', color: 'text-indigo-400' },
  ];

  const quickActions = [
    { icon: UserPlus, label: isHe ? 'הוסף' : 'Add', color: 'text-purple-400' },
    { icon: Brain, label: isHe ? 'תוכנית' : 'Plan', color: 'text-indigo-400' },
    { icon: ExternalLink, label: isHe ? 'חנות' : 'Store', color: 'text-violet-400' },
  ];

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-purple-500/15",
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
        <div className="flex flex-col items-center gap-3 h-full pt-7 pb-4 px-0 overflow-hidden">
          {/* Coach Avatar */}
          <div className="flex flex-col items-center gap-1">
            <Avatar className="w-10 h-10 border-2 border-purple-500/30">
              <AvatarImage src={myProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-purple-500/20 text-purple-400">
                <Briefcase className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              Pro
            </span>
          </div>

          {/* Stats */}
          <div className="flex flex-col items-center gap-1 w-full px-0.5">
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-1" />
            {statItems.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
                <m.icon className={cn("w-4 h-4", m.color)} />
                <span className="text-[10px] font-bold leading-none">{m.value}</span>
              </div>
            ))}
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-1" />
          </div>

          {/* Quick action icons */}
          <div className="flex flex-col items-center gap-1 -mt-1">
            {quickActions.map((a, i) => (
              <button key={i} className="p-2 rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 hover:bg-accent/10 transition-colors">
                <a.icon className={cn("w-4 h-4", a.color)} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== EXPANDED FULL VIEW ===== */}
      {!collapsed && (
        <div className="flex flex-col items-center gap-3 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          {/* Coach Avatar & Name */}
          <Avatar className="w-20 h-20 border-2 border-purple-500/30">
            <AvatarImage src={myProfile?.avatar_url || ''} />
            <AvatarFallback className="bg-purple-500/20 text-purple-400 text-2xl">
              <Briefcase className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>

          {myProfile?.display_name && (
            <span className="text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              {myProfile.display_name}
            </span>
          )}

          <div className="flex items-center justify-center gap-1.5 w-full">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Briefcase className="h-2.5 w-2.5" /> Coach Pro
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Users className="h-2.5 w-2.5" />{stats.active}
            </span>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

          {/* Stats Grid */}
          <div className="flex flex-col gap-2 w-full">
            <div className="grid grid-cols-2 gap-1.5">
              {statItems.map((m) => (
                <div key={m.label} className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                  <m.icon className={cn("w-3.5 h-3.5", m.color)} />
                  <span className="text-sm font-bold leading-none">{m.value}</span>
                  <span className="text-[9px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((a) => (
                <button key={a.label} className="rounded-xl bg-muted/30 dark:bg-muted/15 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-accent/10 transition-all border border-border/20">
                  <a.icon className={cn("w-4 h-4", a.color)} />
                  <span className="text-xs font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

          {/* View Storefront CTA */}
          {myProfile?.slug && (
            <a
              href={`/p/${myProfile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-purple-400 text-sm font-semibold"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isHe ? 'צפה בחנות' : 'View Storefront'}</span>
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
