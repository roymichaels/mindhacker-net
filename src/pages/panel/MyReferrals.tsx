import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, DollarSign, TrendingUp } from 'lucide-react';

const MyReferrals = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserPlus className="h-6 w-6" />
          {t('panel.referrals')}
        </h1>
        <p className="text-muted-foreground">{t('panel.referralsPageDescription')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('panel.totalReferrals')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('panel.conversions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('panel.commissionEarned')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₪0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('panel.referralsList')}</CardTitle>
          <CardDescription>{t('panel.noReferralsYet')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('panel.referralsWillAppearHere')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyReferrals;
