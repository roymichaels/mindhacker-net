import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Package, ExternalLink, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOfferColors } from '@/lib/productColors';
import { Link } from 'react-router-dom';

const MyProducts = () => {
  const { user } = useAuth();
  const { t, isRTL, language } = useTranslation();

  // First get the practitioner profile for this user
  const { data: practitionerProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['my-practitioner-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('practitioners')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch offers assigned to this practitioner
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

  // Fetch products assigned to this practitioner
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['my-products', practitionerProfile?.id],
    queryFn: async () => {
      if (!practitionerProfile?.id) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('practitioner_id', practitionerProfile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!practitionerProfile?.id,
  });

  const isLoading = loadingProfile || loadingOffers || loadingProducts;

  if (isLoading) {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!practitionerProfile) {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="glass-panel border-amber-500/30">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <h3 className="text-lg font-medium mb-2">
              {language === 'he' ? 'אין פרופיל מאמן' : 'No Practitioner Profile'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'he' 
                ? 'עליך ליצור פרופיל מאמן כדי לנהל מוצרים' 
                : 'You need a practitioner profile to manage products'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalOffers = offers?.length || 0;
  const totalProducts = products?.length || 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold cyber-glow">
          {language === 'he' ? 'המוצרים שלי' : 'My Products'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'צפה וניהול במוצרים והקורסים שלך' 
            : 'View and manage your products and courses'
          }
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardDescription>{language === 'he' ? 'הצעות' : 'Offers'}</CardDescription>
            <CardTitle className="text-2xl">{totalOffers}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardDescription>{language === 'he' ? 'מוצרים' : 'Products'}</CardDescription>
            <CardTitle className="text-2xl">{totalProducts}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Offers Grid */}
      {offers && offers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {language === 'he' ? 'ההצעות שלי' : 'My Offers'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const colors = getOfferColors(offer.brand_color);
              const title = language === 'he' ? offer.title : (offer.title_en || offer.title);
              
              return (
                <Card 
                  key={offer.id} 
                  className={cn(
                    "relative overflow-hidden transition-all hover:shadow-lg",
                    `border-2 ${colors.border}/30 hover:${colors.border}`
                  )}
                >
                  <div className={cn("absolute top-0 left-0 right-0 h-1", colors.bg)} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg truncate">{title}</CardTitle>
                      <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                        {offer.status === 'active' 
                          ? (language === 'he' ? 'פעיל' : 'Active')
                          : (language === 'he' ? 'טיוטה' : 'Draft')
                        }
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      {offer.is_free ? (
                        <span className={cn("text-lg font-bold", colors.text)}>
                          {language === 'he' ? 'חינם' : 'Free'}
                        </span>
                      ) : (
                        <span className={cn("text-lg font-bold", colors.text)}>
                          ₪{offer.price}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {offer.landing_page_route && (
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={offer.landing_page_route}>
                            <Eye className="h-4 w-4 me-1" />
                            {language === 'he' ? 'צפייה' : 'View'}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products && products.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {language === 'he' ? 'המוצרים שלי' : 'My Products'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const title = language === 'he' ? product.title : (product.title_en || product.title);
              
              return (
                <Card key={product.id} className="glass-panel">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg truncate">{title}</CardTitle>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status === 'active' 
                          ? (language === 'he' ? 'פעיל' : 'Active')
                          : (language === 'he' ? 'טיוטה' : 'Draft')
                        }
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">₪{product.price}</span>
                      {product.price_usd && (
                        <span className="text-sm text-muted-foreground">
                          (${product.price_usd})
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalOffers === 0 && totalProducts === 0 && (
        <Card className="glass-panel">
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">
              {language === 'he' ? 'אין מוצרים עדיין' : 'No Products Yet'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'he' 
                ? 'מוצרים שיוקצו אליך יופיעו כאן' 
                : 'Products assigned to you will appear here'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyProducts;
