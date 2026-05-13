/**
 * AdminStatsBar — Inline stats + quick actions bar (replaces ActivitySidebar).
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Users, Bell, UserPlus, ShoppingBag, BarChart3, Package } from 'lucide-react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationBell } from '@/components/admin/NotificationBell';

interface AdminStatsBarProps {
  onNavigate?: (tab: string, sub?: string) => void;
}

export function AdminStatsBar({ onNavigate }: AdminStatsBarProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { unreadCount } = useAdminNotifications();

  const { data: stats } = useQuery({
    queryKey: ['admin-sidebar-stats'],
    queryFn: async () => {
      const safeCount = async (p: Promise<{ count: number | null }>) => {
        try {
          const r = await p;
          return r.count || 0;
        } catch {
          return 0;
        }
      };
      const [users, leads, orders] = await Promise.all([
        safeCount(supabase.from('profiles').select('id', { count: 'exact', head: true }) as any),
        safeCount(supabase.from('consciousness_leap_leads').select('id', { count: 'exact', head: true }) as any),
        safeCount(supabase.from('orders').select('id', { count: 'exact', head: true }) as any),
      ]);
      return { users, leads, orders };
    },
    retry: false,
    staleTime: 60_000,
  });

  const statItems = [
    { icon: Users, value: stats?.users || 0, label: isHe ? 'משתמשים' : 'Users', color: 'text-emerald-400', action: () => onNavigate?.('admin', 'users') },
    { icon: Bell, value: unreadCount, label: isHe ? 'התראות' : 'Alerts', color: 'text-amber-400', action: () => onNavigate?.('overview', 'notifications') },
    { icon: UserPlus, value: stats?.leads || 0, label: isHe ? 'לידים' : 'Leads', color: 'text-teal-400', action: () => onNavigate?.('admin', 'leads') },
    { icon: ShoppingBag, value: stats?.orders || 0, label: isHe ? 'הזמנות' : 'Orders', color: 'text-indigo-400', action: () => onNavigate?.('campaigns', 'purchases') },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Stats cards */}
      {statItems.map((m) => (
        <button
          key={m.label}
          onClick={m.action}
          className="flex items-center gap-2 rounded-xl bg-card/60 backdrop-blur-sm border border-border/40 px-3 py-2 hover:bg-accent/10 transition-all"
        >
          <m.icon className={cn("w-4 h-4", m.color)} />
          <span className="text-sm font-bold">{m.value}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">{m.label}</span>
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification bell */}
      <NotificationBell />
    </div>
  );
}
