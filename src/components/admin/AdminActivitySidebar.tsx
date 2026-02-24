/**
 * AdminActivitySidebar - Right sidebar with stats, notifications, and quick actions.
 * Mirrors CoachActivitySidebar pattern with emerald/teal color scheme.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelLeftClose, PanelLeftOpen, Users, Bell, ShoppingBag, UserPlus, BarChart3, Package } from 'lucide-react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminActivitySidebarProps {
  onNavigate?: (tab: string, sub?: string) => void;
}

export function AdminActivitySidebar({ onNavigate }: AdminActivitySidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { notifications, unreadCount } = useAdminNotifications();

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['admin-sidebar-stats'],
    queryFn: async () => {
      const [usersRes, leadsRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('consciousness_leap_leads').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
      ]);
      return {
        users: usersRes.count || 0,
        leads: leadsRes.count || 0,
        orders: ordersRes.count || 0,
      };
    },
  });

  const statItems = [
    { icon: Users, value: stats?.users || 0, label: isHe ? 'משתמשים' : 'Users', color: 'text-emerald-400' },
    { icon: Bell, value: unreadCount, label: isHe ? 'התראות' : 'Alerts', color: 'text-amber-400' },
    { icon: UserPlus, value: stats?.leads || 0, label: isHe ? 'לידים' : 'Leads', color: 'text-teal-400' },
    { icon: ShoppingBag, value: stats?.orders || 0, label: isHe ? 'הזמנות' : 'Orders', color: 'text-indigo-400' },
  ];

  const quickActions = [
    { icon: Users, label: isHe ? 'משתמשים' : 'Users', onClick: () => onNavigate?.('admin', 'users') },
    { icon: Package, label: isHe ? 'מוצרים' : 'Products', onClick: () => onNavigate?.('content', 'products') },
    { icon: BarChart3, label: isHe ? 'אנליטיקס' : 'Analytics', onClick: () => onNavigate?.('overview', 'analytics') },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-e rtl:border-s border-border/50 dark:border-emerald-500/15",
        collapsed ? "w-[54px] min-w-[54px]" : "fixed top-14 bottom-14 inset-x-0 z-50 w-full lg:relative lg:top-auto lg:bottom-auto lg:inset-x-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
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

            <div className="w-8 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent my-1" />

            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                className="p-2 rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 hover:bg-accent/10 transition-colors"
                title={a.label}
              >
                <a.icon className="w-4 h-4 text-emerald-400" />
              </button>
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

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-3" />

          {/* Quick Actions */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
            {isHe ? 'פעולות מהירות' : 'Quick Actions'}
          </span>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                className="rounded-xl bg-muted/30 dark:bg-muted/15 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-emerald-500/10 transition-all border border-border/20"
              >
                <a.icon className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-medium">{a.label}</span>
              </button>
            ))}
          </div>

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-3" />

          {/* Recent Notifications */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
            {isHe ? 'התראות אחרונות' : 'Recent Alerts'}
          </span>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">{isHe ? 'אין התראות' : 'No alerts'}</p>
            ) : (
              <div className="relative flex flex-col gap-0 w-full">
                <div className="absolute top-0 bottom-0 w-[2px] bg-emerald-500/10 rounded-full ltr:left-[7px] rtl:right-[7px]" />
                {notifications.slice(0, 6).map((n) => (
                  <div key={n.id} className="relative flex items-start gap-2.5 py-1 ltr:pl-5 rtl:pr-5">
                    <div className={cn(
                      "absolute ltr:left-0 rtl:right-0 top-2 w-[14px] h-[14px] rounded-full flex items-center justify-center",
                      "bg-muted/50 border border-emerald-500/20"
                    )}>
                      <Bell className="w-2 h-2 text-emerald-400" />
                    </div>
                    <div className="flex flex-col gap-0">
                      <span className="text-[11px] font-medium leading-tight">{n.title}</span>
                      <span className="text-[9px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: isHe ? he : enUS })}
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
