/**
 * @module coach/CoachDashboardOverview
 * @purpose Coach Command Center — default main content for the Coach Hub
 * Shows key stats, next sessions, revenue snapshot, and quick action shortcuts.
 * All data flows through domain hooks — no direct DB calls.
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCoachClientStats } from '@/hooks/useCoachClients';
import { useMyCoachProfile, useCoachReviewStats, useCoachUpcomingBookings, useCoachPlansCount } from '@/domain/coaches';
import { Users, Star, Calendar, TrendingUp, Sparkles, DollarSign, FileText } from 'lucide-react';
import AutoPlanEngineModal from './AutoPlanEngineModal';

const CoachDashboardOverview = () => {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { stats } = useCoachClientStats();
  const { data: myProfile } = useMyCoachProfile();
  const [showPlanEngine, setShowPlanEngine] = useState(false);

  const { data: reviewStats } = useCoachReviewStats(myProfile?.id);
  const { data: upcomingCount } = useCoachUpcomingBookings(myProfile?.id);
  const { data: plansCount } = useCoachPlansCount(myProfile?.id);

  const overviewStats = [
    { icon: Users, value: stats.active, label: isHe ? 'מתאמנים פעילים' : 'Active Clients', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: Star, value: reviewStats?.avg || 0, label: isHe ? 'דירוג ממוצע' : 'Avg Rating', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Calendar, value: upcomingCount || 0, label: isHe ? 'פגישות קרובות' : 'Upcoming Sessions', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: TrendingUp, value: reviewStats?.count || 0, label: isHe ? 'ביקורות' : 'Reviews', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  ];

  const quickActions = [
    {
      icon: Sparkles,
      label: isHe ? 'צור תוכנית AI' : 'Generate AI Plan',
      desc: isHe ? 'תוכנית מותאמת שהופכת למשימות' : 'Custom plan that becomes playable tasks',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
      iconColor: 'text-purple-400',
      onClick: () => setShowPlanEngine(true),
    },
    {
      icon: FileText,
      label: isHe ? 'תוכניות פעילות' : 'Active Plans',
      desc: isHe ? `${plansCount || 0} תוכניות` : `${plansCount || 0} plans`,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      onClick: () => {},
    },
    {
      icon: DollarSign,
      label: isHe ? 'הכנסות' : 'Revenue',
      desc: isHe ? 'בקרוב' : 'Coming soon',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      iconColor: 'text-amber-400',
      onClick: () => {},
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-purple-500/5 border border-purple-500/20 p-6 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
          {isHe ? `שלום${myProfile?.display_name ? `, ${myProfile.display_name}` : ''}` : `Welcome${myProfile?.display_name ? `, ${myProfile.display_name}` : ''}`}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isHe ? 'מרכז הפיקוד שלך — Coach Command Center' : 'Your Coach Command Center'}
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

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {isHe ? 'פעולות מהירות' : 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`rounded-xl border bg-gradient-to-br ${action.color} p-4 text-start hover:scale-[1.02] transition-transform`}
            >
              <action.icon className={`w-6 h-6 ${action.iconColor} mb-2`} />
              <div className="font-medium text-sm">{action.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{action.desc}</div>
            </button>
          ))}
        </div>
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
            <span>{isHe ? 'צרו תוכנית AI שהופכת למשימות אוטומטיות' : 'Generate an AI plan that auto-converts to playable tasks'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>{isHe ? 'נווטו ל"שיווק" או "הגדרות" בסרגל השמאלי' : 'Navigate to Marketing or Settings in the left sidebar'}</span>
          </li>
        </ul>
      </div>

      <AutoPlanEngineModal open={showPlanEngine} onOpenChange={setShowPlanEngine} />
    </div>
  );
};

export default CoachDashboardOverview;
