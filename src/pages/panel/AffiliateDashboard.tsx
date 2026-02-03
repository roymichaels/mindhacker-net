import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, UserPlus, DollarSign, TrendingUp } from 'lucide-react';

const AffiliateDashboard = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('panel.affiliateDashboard.monthlyClicks'),
      value: '234',
      icon: Link2,
      change: '+12%',
    },
    {
      title: t('panel.affiliateDashboard.referrals'),
      value: '18',
      icon: UserPlus,
      change: '+5',
    },
    {
      title: t('panel.affiliateDashboard.commissions'),
      value: '₪1,850',
      icon: DollarSign,
      change: '+22%',
    },
    {
      title: t('panel.affiliateDashboard.conversionRate'),
      value: '7.7%',
      icon: TrendingUp,
      change: '+0.8%',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t('panel.affiliateDashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('panel.affiliateDashboard.subtitle')}
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
            <CardTitle>{t('panel.affiliateDashboard.topLinks')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {t('panel.affiliateDashboard.noDataYet')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('panel.affiliateDashboard.recentReferrals')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {t('panel.affiliateDashboard.noRecentReferrals')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
