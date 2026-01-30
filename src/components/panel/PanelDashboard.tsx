import { useUserRoles } from '@/hooks/useUserRoles';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Package, 
  Calendar, 
  Link2, 
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const PanelDashboard = () => {
  const { t, isRTL } = useTranslation();
  const { roles, loading, hasRole } = useUserRoles();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (loading) {
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

      {/* Role-specific quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Admin Cards */}
        {hasRole('admin') && (
          <>
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
          </>
        )}

        {/* Practitioner Cards */}
        {hasRole('practitioner') && (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  {t('panel.clients')}
                </CardTitle>
                <CardDescription>{t('panel.clientsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="p-0 h-auto">
                  <Link to="/panel/my-clients" className="flex items-center gap-1 text-primary">
                    {t('panel.viewClients')}
                    <ArrowIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  {t('panel.calendar')}
                </CardTitle>
                <CardDescription>{t('panel.calendarDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="p-0 h-auto">
                  <Link to="/panel/my-calendar" className="flex items-center gap-1 text-primary">
                    {t('panel.viewCalendar')}
                    <ArrowIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                  {t('panel.earnings')}
                </CardTitle>
                <CardDescription>{t('panel.earningsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="p-0 h-auto">
                  <Link to="/panel/my-earnings" className="flex items-center gap-1 text-primary">
                    {t('panel.viewEarnings')}
                    <ArrowIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Affiliate Cards */}
        {hasRole('affiliate') && (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Link2 className="h-5 w-5 text-primary" />
                  {t('panel.links')}
                </CardTitle>
                <CardDescription>{t('panel.linksDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="p-0 h-auto">
                  <Link to="/panel/my-links" className="flex items-center gap-1 text-primary">
                    {t('panel.viewLinks')}
                    <ArrowIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                  {t('panel.payouts')}
                </CardTitle>
                <CardDescription>{t('panel.payoutsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="p-0 h-auto">
                  <Link to="/panel/my-payouts" className="flex items-center gap-1 text-primary">
                    {t('panel.viewPayouts')}
                    <ArrowIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Role badges */}
      <Card>
        <CardHeader>
          <CardTitle>{t('panel.yourRoles')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
              >
                {role === 'admin' && '👑 '}
                {role === 'practitioner' && '🎓 '}
                {role === 'affiliate' && '🤝 '}
                {t(`panel.role.${role}`)}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PanelDashboard;
