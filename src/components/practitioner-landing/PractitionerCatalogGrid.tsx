import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import OfferCard from '@/components/courses/OfferCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface Props {
  practitionerId: string;
}

const PractitionerCatalogGrid = ({ practitionerId }: Props) => {
  const { language } = useTranslation();

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
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ShoppingBag className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">{language === 'he' ? 'אין מוצרים עדיין' : 'No products yet'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
};

export default PractitionerCatalogGrid;
