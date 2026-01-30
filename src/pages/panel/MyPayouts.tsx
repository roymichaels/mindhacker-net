import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Clock, CheckCircle } from 'lucide-react';

const MyPayouts = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          {t('panel.payouts')}
        </h1>
        <p className="text-muted-foreground">{t('panel.payoutsPageDescription')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {t('panel.availableBalance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₪0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('panel.pending')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₪0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {t('panel.totalPaid')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₪0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('panel.payoutHistory')}</CardTitle>
          <CardDescription>{t('panel.noPayoutsYet')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('panel.payoutsWillAppearHere')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyPayouts;
