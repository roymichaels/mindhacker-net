/**
 * Admin Work Monitor — view all users' work stats.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Clock, Brain, TrendingUp, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface UserWorkSummary {
  user_id: string;
  full_name: string | null;
  email: string | null;
  total_sessions: number;
  total_minutes: number;
  deep_work_minutes: number;
  last_session: string | null;
}

function useAdminWorkStats() {
  return useQuery({
    queryKey: ['admin', 'work-stats'],
    queryFn: async (): Promise<UserWorkSummary[]> => {
      // Get all work sessions grouped by user with profile info
      const { data, error } = await supabase
        .from('work_sessions' as any)
        .select('user_id, started_at, duration_seconds, is_deep_work, ended_at')
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(1000);
      
      if (error) throw error;
      
      const sessions = (data || []) as any[];
      const userMap = new Map<string, UserWorkSummary>();
      
      for (const s of sessions) {
        if (!userMap.has(s.user_id)) {
          userMap.set(s.user_id, {
            user_id: s.user_id,
            full_name: null,
            email: null,
            total_sessions: 0,
            total_minutes: 0,
            deep_work_minutes: 0,
            last_session: s.started_at,
          });
        }
        const u = userMap.get(s.user_id)!;
        u.total_sessions++;
        const mins = Math.floor((s.duration_seconds || 0) / 60);
        u.total_minutes += mins;
        if (s.is_deep_work) u.deep_work_minutes += mins;
      }

      // Fetch profile names
      const userIds = Array.from(userMap.keys());
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        for (const p of profiles || []) {
          const u = userMap.get(p.id);
          if (u) u.full_name = p.full_name;
        }
      }

      return Array.from(userMap.values()).sort((a, b) => b.total_minutes - a.total_minutes);
    },
  });
}

export default function WorkMonitor() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: stats = [], isLoading } = useAdminWorkStats();
  const [search, setSearch] = useState('');

  const filtered = stats.filter(u =>
    !search || (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totals = {
    users: stats.length,
    totalHours: Math.round(stats.reduce((s, u) => s + u.total_minutes, 0) / 60),
    deepHours: Math.round(stats.reduce((s, u) => s + u.deep_work_minutes, 0) / 60),
    sessions: stats.reduce((s, u) => s + u.total_sessions, 0),
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users, label: isHe ? 'משתמשים פעילים' : 'Active Users', value: totals.users, color: 'text-primary' },
          { icon: Clock, label: isHe ? 'שעות כוללות' : 'Total Hours', value: totals.totalHours, color: 'text-emerald-500' },
          { icon: Brain, label: isHe ? 'שעות עבודה עמוקה' : 'Deep Work Hours', value: totals.deepHours, color: 'text-violet-500' },
          { icon: TrendingUp, label: isHe ? 'סה"כ בלוקים' : 'Total Blocks', value: totals.sessions, color: 'text-orange-500' },
        ].map(card => (
          <div key={card.label} className="p-3 rounded-xl border border-border bg-card">
            <card.icon className={cn("w-4 h-4 mb-1", card.color)} />
            <p className="text-xl font-bold">{card.value}</p>
            <p className="text-[11px] text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={isHe ? 'חפש משתמש...' : 'Search user...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* User table */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">{isHe ? 'טוען...' : 'Loading...'}</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-start p-3 font-medium">{isHe ? 'שם' : 'Name'}</th>
                <th className="text-center p-3 font-medium">{isHe ? 'בלוקים' : 'Blocks'}</th>
                <th className="text-center p-3 font-medium">{isHe ? 'דקות' : 'Minutes'}</th>
                <th className="text-center p-3 font-medium hidden sm:table-cell">{isHe ? 'עמוק %' : 'Deep %'}</th>
                <th className="text-center p-3 font-medium hidden sm:table-cell">{isHe ? 'אחרון' : 'Last'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const deepPct = user.total_minutes > 0
                  ? Math.round((user.deep_work_minutes / user.total_minutes) * 100)
                  : 0;
                return (
                  <tr key={user.user_id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-medium">{user.full_name || 'Unknown'}</td>
                    <td className="p-3 text-center">{user.total_sessions}</td>
                    <td className="p-3 text-center">{user.total_minutes}</td>
                    <td className="p-3 text-center hidden sm:table-cell">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        deepPct >= 60 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {deepPct}%
                      </span>
                    </td>
                    <td className="p-3 text-center text-muted-foreground text-xs hidden sm:table-cell">
                      {user.last_session
                        ? new Date(user.last_session).toLocaleDateString(isHe ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    {isHe ? 'לא נמצאו נתונים' : 'No data found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
