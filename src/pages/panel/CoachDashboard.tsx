import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const CoachDashboard = () => {
  const { language } = useTranslation();
  const isHebrew = language === 'he';

  const stats = [
    {
      title: isHebrew ? 'לקוחות פעילים' : 'Active Clients',
      value: '12',
      icon: Users,
      change: '+2',
    },
    {
      title: isHebrew ? 'פגישות השבוע' : 'Sessions This Week',
      value: '8',
      icon: Calendar,
      change: '+3',
    },
    {
      title: isHebrew ? 'הכנסות החודש' : 'Monthly Earnings',
      value: '₪4,200',
      icon: DollarSign,
      change: '+15%',
    },
    {
      title: isHebrew ? 'שביעות רצון' : 'Satisfaction Rate',
      value: '98%',
      icon: TrendingUp,
      change: '+2%',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isHebrew ? 'דאשבורד הפרקטיקה' : 'Practice Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {isHebrew ? 'סקירה כללית של הפרקטיקה שלך' : 'Overview of your practice'}
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
            <CardTitle>{isHebrew ? 'פגישות קרובות' : 'Upcoming Sessions'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {isHebrew ? 'אין פגישות מתוכננות' : 'No scheduled sessions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isHebrew ? 'פעילות אחרונה' : 'Recent Activity'}</CardTitle>
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

export default CoachDashboard;
