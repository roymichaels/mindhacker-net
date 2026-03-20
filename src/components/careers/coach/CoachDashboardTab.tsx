import { useTranslation } from '@/hooks/useTranslation';
import { Users, Calendar, TrendingUp } from 'lucide-react';
import { useCoachClientStats } from '@/hooks/useCoachClients';
import { Skeleton } from '@/components/ui/skeleton';
import { MetricCard } from '@/components/aurora-ui/MetricCard';

const CoachDashboardTab = () => {
  const { t } = useTranslation();
  const { stats, isLoading } = useCoachClientStats();

  const statCards = [
    {
      label: t('coachDashboard.activeClients'),
      value: stats.active,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: t('coachDashboard.totalClients'),
      value: stats.total,
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: t('coachDashboard.completed'),
      value: stats.completed,
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((stat, i) => (
          isLoading ? (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ) : (
            <MetricCard
              key={i}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              gradient="from-purple-500 to-indigo-600"
            />
          )
        ))}
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">
            {t('coachDashboard.upcomingSessions')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('coachDashboard.noScheduledSessions')}
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">
            {t('coachDashboard.recentActivity')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('coachDashboard.noRecentActivity')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboardTab;
