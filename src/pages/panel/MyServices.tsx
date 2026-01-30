import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

const MyServices = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            {t('panel.services')}
          </h1>
          <p className="text-muted-foreground">{t('panel.servicesPageDescription')}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 me-2" />
          {t('panel.addService')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('panel.yourServices')}</CardTitle>
          <CardDescription>{t('panel.noServicesYet')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">{t('panel.servicesWillAppearHere')}</p>
          <Button variant="outline">
            <Plus className="h-4 w-4 me-2" />
            {t('panel.createFirstService')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyServices;
