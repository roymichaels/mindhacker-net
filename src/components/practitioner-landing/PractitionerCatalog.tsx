import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import OfferCard from '@/components/courses/OfferCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface PractitionerCatalogProps {
  practitionerId: string;
}

const PractitionerCatalog = ({ practitionerId }: PractitionerCatalogProps) => {
  const { t, isRTL, language } = useTranslation();

  const { data: offers, isLoading } = useQuery({
    queryKey: ['practitioner-offers', practitionerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('practitioner_id', practitionerId)
        .eq('status', 'active')
        .eq('landing_page_enabled', true)
        .order('homepage_order', { ascending: true });
      
      if (error) throw error;
      return data as Tables<'offers'>[];
    },
    enabled: !!practitionerId,
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!offers || offers.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <section className="py-16 bg-background/50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-3">
            {language === 'he' ? 'הקורסים והמוצרים' : 'Courses & Products'}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {language === 'he' 
              ? 'גישה מיידית לתוכן דיגיטלי שילווה אותך בתהליך' 
              : 'Instant access to digital content that will guide your journey'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PractitionerCatalog;
