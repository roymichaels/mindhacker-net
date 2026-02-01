import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  Users, 
  Package, 
  Bell,
  Mail,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Loader2,
  TrendingUp,
} from 'lucide-react';

const PanelDashboard = () => {
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Fetch stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [usersRes, notificationsRes, leadsRes, purchasesRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('admin_notifications').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('content_purchases').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: usersRes.count || 0,
        unreadNotifications: notificationsRes.count || 0,
        newLeads: leadsRes.count || 0,
        totalPurchases: purchasesRes.count || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('panel.welcomeBack')}</h1>
        <p className="text-muted-foreground">
          {t('panel.dashboardSubtitle')}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'משתמשים' : 'Total Users'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'התראות' : 'Notifications'}
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unreadNotifications || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'לא נקראו' : 'unread'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'לידים חדשים' : 'New Leads'}
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newLeads || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'רכישות' : 'Purchases'}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPurchases || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Admin Only */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t('panel.analytics')}
            </CardTitle>
            <CardDescription>{t('panel.analyticsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="p-0 h-auto">
              <Link to="/panel/analytics" className="flex items-center gap-1 text-primary">
                {t('panel.viewAnalytics')}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              {t('panel.users')}
            </CardTitle>
            <CardDescription>{t('panel.usersDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="p-0 h-auto">
              <Link to="/panel/users" className="flex items-center gap-1 text-primary">
                {t('panel.manageUsers')}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              {t('panel.products')}
            </CardTitle>
            <CardDescription>{t('panel.productsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="p-0 h-auto">
              <Link to="/panel/products" className="flex items-center gap-1 text-primary">
                {t('panel.manageProducts')}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-primary" />
              {isRTL ? 'לידים' : 'Leads'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'ניהול לידים ופניות' : 'Manage leads and inquiries'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="p-0 h-auto">
              <Link to="/panel/leads" className="flex items-center gap-1 text-primary">
                {isRTL ? 'צפה בלידים' : 'View Leads'}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              {isRTL ? 'התראות' : 'Notifications'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'צפה בהתראות מערכת' : 'View system notifications'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="p-0 h-auto">
              <Link to="/panel/notifications" className="flex items-center gap-1 text-primary">
                {isRTL ? 'צפה בהתראות' : 'View Notifications'}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              {isRTL ? 'קמפיינים' : 'Campaigns'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'ניהול קמפיינים וניוזלטר' : 'Manage campaigns and newsletter'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="p-0 h-auto">
              <Link to="/panel/newsletter" className="flex items-center gap-1 text-primary">
                {isRTL ? 'צפה בקמפיינים' : 'View Campaigns'}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PanelDashboard;
