/**
 * CoachDashboardOverview - Default main content for the Coach Hub when no tab or client is selected.
 * Shows a welcome overview with key stats and quick-start guidance.
 */
import { useTranslation } from '@/hooks/useTranslation';
import { useCoachClientStats } from '@/hooks/useCoachClients';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { Users, Star, Calendar, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CoachDashboardOverview = () => {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { stats } = useCoachClientStats();
  const { data: myProfile } = useMyPractitionerProfile();

  const { data: reviewStats } = useQuery({
    queryKey: ['coach-overview-reviews', myProfile?.id],
    queryFn: async () => {
      if (!myProfile?.id) return { avg: 0, count: 0 };
      const { data } = await supabase
        .from('practitioner_reviews')
        .select('rating')
        .eq('practitioner_id', myProfile.id);
      const reviews = data || [];
      const avg = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      return { avg: Math.round(avg * 10) / 10, count: reviews.length };
    },
    enabled: !!myProfile?.id,
  });

  const overviewStats = [
    { icon: Users, value: stats.active, label: isHe ? 'מתאמנים פעילים' : 'Active Clients', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: Star, value: reviewStats?.avg || 0, label: isHe ? 'דירוג ממוצע' : 'Avg Rating', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Calendar, value: stats.total, label: isHe ? 'סה"כ מתאמנים' : 'Total Clients', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: TrendingUp, value: reviewStats?.count || 0, label: isHe ? 'ביקורות' : 'Reviews', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-purple-500/5 border border-purple-500/20 p-6 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
          {isHe ? `שלום${myProfile?.display_name ? `, ${myProfile.display_name}` : ''}` : `Welcome${myProfile?.display_name ? `, ${myProfile.display_name}` : ''}`}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isHe ? 'ברוכים הבאים למרכז השליטה שלכם' : 'Welcome to your Coach Hub'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {overviewStats.map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.bg} p-4 flex flex-col items-center gap-2`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <span className="text-2xl font-bold">{s.value}</span>
            <span className="text-xs text-muted-foreground text-center">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {isHe ? 'מה אפשר לעשות?' : 'Quick Start'}
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>{isHe ? 'בחרו מתאמן מהסרגל הצדדי כדי לצפות בפרופיל שלו' : 'Select a client from the sidebar to view their profile'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>{isHe ? 'השתמשו בכפתור "הוסף" כדי להוסיף מתאמנים חדשים' : 'Use the "Add" button to onboard new clients'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>{isHe ? 'נווטו ל"שיווק" או "הגדרות" בסרגל השמאלי' : 'Navigate to Marketing or Settings in the left sidebar'}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CoachDashboardOverview;
