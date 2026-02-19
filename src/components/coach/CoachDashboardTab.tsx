import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useCoachClientStats } from '@/hooks/useCoachClients';
import { Skeleton } from '@/components/ui/skeleton';

const CoachDashboardTab = () => {
  const { t, language } = useTranslation();
  const isHebrew = language === 'he';
  const { stats, isLoading } = useCoachClientStats();

  const statCards = [
    {
      title: isHebrew ? 'מתאמנים פעילים' : 'Active Clients',
      value: stats.active,
      icon: Users,
      color: 'text-emerald-500',
    },
    {
      title: isHebrew ? 'סה"כ מתאמנים' : 'Total Clients',
      value: stats.total,
      icon: Calendar,
      color: 'text-blue-500',
    },
    {
      title: isHebrew ? 'הושלמו' : 'Completed',
      value: stats.completed,
      icon: TrendingUp,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isHebrew ? 'פגישות קרובות' : 'Upcoming Sessions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {isHebrew ? 'אין פגישות מתוכננות' : 'No scheduled sessions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isHebrew ? 'פעילות אחרונה' : 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {isHebrew ? 'אין פעילות אחרונה' : 'No recent activity'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoachDashboardTab;
