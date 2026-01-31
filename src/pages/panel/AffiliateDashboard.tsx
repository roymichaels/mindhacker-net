import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, UserPlus, DollarSign, TrendingUp } from 'lucide-react';

const AffiliateDashboard = () => {
  const { language } = useTranslation();
  const isHebrew = language === 'he';

  const stats = [
    {
      title: isHebrew ? 'קליקים החודש' : 'Monthly Clicks',
      value: '234',
      icon: Link2,
      change: '+12%',
    },
    {
      title: isHebrew ? 'הפניות' : 'Referrals',
      value: '18',
      icon: UserPlus,
      change: '+5',
    },
    {
      title: isHebrew ? 'עמלות' : 'Commissions',
      value: '₪1,850',
      icon: DollarSign,
      change: '+22%',
    },
    {
      title: isHebrew ? 'המרה' : 'Conversion Rate',
      value: '7.7%',
      icon: TrendingUp,
      change: '+0.8%',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isHebrew ? 'דאשבורד שותפים' : 'Affiliate Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {isHebrew ? 'סקירת הביצועים שלך' : 'Your performance overview'}
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
            <CardTitle>{isHebrew ? 'הקישורים המובילים' : 'Top Performing Links'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {isHebrew ? 'אין נתונים עדיין' : 'No data yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isHebrew ? 'הפניות אחרונות' : 'Recent Referrals'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {isHebrew ? 'אין הפניות אחרונות' : 'No recent referrals'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
