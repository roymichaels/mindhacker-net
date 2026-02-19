import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Package, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOfferColors } from '@/lib/productColors';
import { Link } from 'react-router-dom';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';

const CoachProductsTab = () => {
  const { language, isRTL } = useTranslation();
  const isHebrew = language === 'he';
  const { data: practitionerProfile, isLoading: loadingProfile } = useMyPractitionerProfile();

  const { data: offers, isLoading: loadingOffers } = useQuery({
    queryKey: ['my-offers', practitionerProfile?.id],
    queryFn: async () => {
      if (!practitionerProfile?.id) return [];
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('practitioner_id', practitionerProfile.id)
        .order('homepage_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!practitionerProfile?.id,
  });

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['my-services', practitionerProfile?.id],
    queryFn: async () => {
      if (!practitionerProfile?.id) return [];
      const { data, error } = await supabase
        .from('practitioner_services')
        .select('*')
        .eq('practitioner_id', practitionerProfile.id)
        .order('order_index');
      if (error) throw error;
      return data || [];
    },
    enabled: !!practitionerProfile?.id,
  });

  const isLoading = loadingProfile || loadingOffers || loadingServices;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  const totalOffers = offers?.length || 0;
  const totalServices = services?.length || 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-xl font-bold">
          {isHebrew ? 'מוצרים ושירותים' : 'Products & Services'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isHebrew ? 'נהלו את ההצעות והשירותים שלכם' : 'Manage your offers and services'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground">{isHebrew ? 'הצעות' : 'Offers'}</p>
          <p className="text-2xl font-bold">{totalOffers}</p>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 hover:shadow-md transition-shadow">
          <p className="text-sm text-muted-foreground">{isHebrew ? 'שירותים' : 'Services'}</p>
          <p className="text-2xl font-bold">{totalServices}</p>
        </div>
      </div>

      {/* Services */}
      {services && services.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {isHebrew ? 'השירותים שלי' : 'My Services'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="bg-card/80 backdrop-blur-sm rounded-2xl border-border/50 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base truncate">
                      {isHebrew ? service.title : (service.title_en || service.title)}
                    </CardTitle>
                    <Badge variant={service.is_active ? 'default' : 'secondary'}>
                      {service.is_active ? (isHebrew ? 'פעיל' : 'Active') : (isHebrew ? 'לא פעיל' : 'Inactive')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold">₪{service.price}</span>
                    {service.duration_minutes && (
                      <span className="text-muted-foreground">• {service.duration_minutes} min</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Offers */}
      {offers && offers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {isHebrew ? 'ההצעות שלי' : 'My Offers'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const colors = getOfferColors(offer.brand_color);
              const title = isHebrew ? offer.title : (offer.title_en || offer.title);
              return (
                <Card key={offer.id} className={cn("relative overflow-hidden", `border-2 ${colors.border}/30`)}>
                  <div className={cn("absolute top-0 left-0 right-0 h-1", colors.bg)} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base truncate">{title}</CardTitle>
                      <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                        {offer.status === 'active' ? (isHebrew ? 'פעיל' : 'Active') : (isHebrew ? 'טיוטה' : 'Draft')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <span className={cn("text-lg font-bold", colors.text)}>
                      {offer.is_free ? (isHebrew ? 'חינם' : 'Free') : `₪${offer.price}`}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalOffers === 0 && totalServices === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {isHebrew ? 'אין מוצרים עדיין' : 'No Products Yet'}
            </h3>
            <p className="text-muted-foreground">
              {isHebrew ? 'מוצרים ושירותים שיוקצו אליכם יופיעו כאן' : 'Products and services assigned to you will appear here'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoachProductsTab;
