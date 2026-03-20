import { useTranslation } from '@/hooks/useTranslation';
import { useMyCoachProfile, useCoachReviewStats, useCoachUpcomingBookings, useCoachPlansCount } from '@/domain/coaches';
import { useCoachClientStats } from '@/hooks/useCoachClients';
import { useCoachLeadStats } from '@/hooks/useCoachLeads';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Users, Star, Calendar, TrendingUp, Target, DollarSign, UserCheck } from 'lucide-react';

const CoachAnalyticsTab = () => {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: myProfile } = useMyCoachProfile();
  const { stats: clientStats } = useCoachClientStats();
  const { stats: leadStats } = useCoachLeadStats();
  const { data: reviewStats } = useCoachReviewStats(myProfile?.id);
  const { data: upcomingBookings } = useCoachUpcomingBookings(myProfile?.id);
  const { data: plansCount } = useCoachPlansCount(myProfile?.id);

  // Revenue from completed bookings
  const { data: revenueData } = useQuery({
    queryKey: ['coach-revenue', myProfile?.id],
    queryFn: async () => {
      if (!myProfile?.id) return { total: 0, thisMonth: 0, bookingsCompleted: 0 };
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, status, created_at')
        .eq('practitioner_id', myProfile.id);
      
      const completed = bookings?.filter(b => b.status === 'completed') || [];
      const thisMonth = completed.filter(b => {
        const d = new Date(b.created_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      return { total: completed.length, thisMonth: thisMonth.length, bookingsCompleted: completed.length };
    },
    enabled: !!myProfile?.id,
  });

  const conversionRate = leadStats.total > 0 
    ? Math.round((leadStats.converted / leadStats.total) * 100) 
    : 0;

  const metrics = [
    { icon: Users, label: isHe ? 'לקוחות פעילים' : 'Active Clients', value: clientStats.active, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: Target, label: isHe ? 'סה"כ לידים' : 'Total Leads', value: leadStats.total, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: UserCheck, label: isHe ? 'שיעור המרה' : 'Conversion Rate', value: `${conversionRate}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: Star, label: isHe ? 'דירוג ממוצע' : 'Avg Rating', value: reviewStats?.avg || 0, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Calendar, label: isHe ? 'פגישות קרובות' : 'Upcoming Sessions', value: upcomingBookings || 0, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { icon: TrendingUp, label: isHe ? 'ביקורות' : 'Reviews', value: reviewStats?.count || 0, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { icon: BarChart3, label: isHe ? 'תוכניות פעילות' : 'Active Plans', value: plansCount || 0, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { icon: DollarSign, label: isHe ? 'פגישות שהושלמו' : 'Completed Sessions', value: revenueData?.bookingsCompleted || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {isHe ? 'אנליטיקס ודוחות' : 'Analytics & Reports'}
        </h2>
        <p className="text-sm text-muted-foreground">{isHe ? 'סקירת ביצועים ומדדים' : 'Performance overview and metrics'}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map(m => (
          <div key={m.label} className={`rounded-xl border ${m.bg} p-4 flex flex-col items-center gap-2`}>
            <m.icon className={`w-5 h-5 ${m.color}`} />
            <span className="text-2xl font-bold">{m.value}</span>
            <span className="text-xs text-muted-foreground text-center">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Lead Funnel */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5">
        <h3 className="text-lg font-semibold mb-4">{isHe ? 'משפך לידים' : 'Lead Funnel'}</h3>
        <div className="space-y-3">
          {[
            { label: isHe ? 'חדשים' : 'New', count: leadStats.new, pct: leadStats.total > 0 ? (leadStats.new / leadStats.total) * 100 : 0, color: 'bg-blue-500' },
            { label: isHe ? 'פנייה' : 'Contacted', count: leadStats.contacted, pct: leadStats.total > 0 ? (leadStats.contacted / leadStats.total) * 100 : 0, color: 'bg-amber-500' },
            { label: isHe ? 'הומרו' : 'Converted', count: leadStats.converted, pct: leadStats.total > 0 ? (leadStats.converted / leadStats.total) * 100 : 0, color: 'bg-emerald-500' },
            { label: isHe ? 'אבדו' : 'Lost', count: leadStats.lost, pct: leadStats.total > 0 ? (leadStats.lost / leadStats.total) * 100 : 0, color: 'bg-red-500' },
          ].map(stage => (
            <div key={stage.label} className="flex items-center gap-3">
              <span className="text-sm w-20 text-end">{stage.label}</span>
              <div className="flex-1 h-6 bg-muted/40 rounded-full overflow-hidden">
                <div className={`h-full ${stage.color} rounded-full transition-all`} style={{ width: `${Math.max(stage.pct, 2)}%` }} />
              </div>
              <span className="text-sm font-medium w-12">{stage.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Client Distribution */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5">
        <h3 className="text-lg font-semibold mb-4">{isHe ? 'סטטוס לקוחות' : 'Client Status'}</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: isHe ? 'פעילים' : 'Active', value: clientStats.active, color: 'text-emerald-500' },
            { label: isHe ? 'לא פעילים' : 'Inactive', value: clientStats.inactive, color: 'text-amber-500' },
            { label: isHe ? 'סיימו' : 'Completed', value: clientStats.completed, color: 'text-blue-500' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoachAnalyticsTab;
