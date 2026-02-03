import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const CoachDashboard = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('panel.coach.activeClients'),
      value: '12',
      icon: Users,
      change: '+2',
    },
    {
      title: t('panel.coach.sessionsThisWeek'),
      value: '8',
      icon: Calendar,
      change: '+3',
    },
    {
      title: t('panel.coach.monthlyEarnings'),
      value: '₪4,200',
      icon: DollarSign,
      change: '+15%',
    },
    {
      title: t('panel.coach.satisfactionRate'),
      value: '98%',
      icon: TrendingUp,
      change: '+2%',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t('panel.coach.dashboard')}
        </h1>
        <p className="text-muted-foreground">
          {t('panel.coach.dashboardSubtitle')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('panel.coach.upcomingSessions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {t('panel.coach.noScheduledSessions')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('panel.coach.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {t('panel.coach.noRecentActivity')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoachDashboard;
