import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslation } from '@/hooks/useTranslation';
import { usePractitioner } from '@/hooks/usePractitioners';
import { useSEO } from '@/hooks/useSEO';
import { supabase } from '@/integrations/supabase/client';
import {
  PractitionerProfileHeader,
  PractitionerFeedTabs,
} from '@/components/practitioner-landing';

const PractitionerProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, isRTL, language } = useTranslation();
  const { data: practitioner, isLoading, error } = usePractitioner(slug);

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  // Fetch posts count for the header stats
  const { data: postsCount = 0 } = useQuery({
    queryKey: ['practitioner-posts-count', practitioner?.user_id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('community_posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', practitioner!.user_id);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!practitioner?.user_id,
  });

  const displayName = practitioner
    ? (language === 'en' && practitioner.display_name_en ? practitioner.display_name_en : practitioner.display_name)
    : '';

  useSEO({
    title: practitioner ? `${displayName} | Mind OS` : t('practitioners.loading'),
    description: practitioner?.bio || '',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="pt-20 px-4 py-12">
          <div className="container mx-auto max-w-2xl">
            <div className="flex items-center gap-6 mb-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 flex justify-around">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
              </div>
            </div>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-60 mb-4" />
            <Skeleton className="h-9 w-full mb-6" />
            <Skeleton className="h-12 w-full mb-2" />
            <div className="grid grid-cols-3 gap-0.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-none" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !practitioner) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="pt-20 px-4 py-12">
          <div className="container mx-auto max-w-4xl text-center py-20">
            <h1 className="text-2xl font-bold mb-4">{t('practitioners.notFound')}</h1>
            <Button asChild>
              <Link to="/practitioners">
                <ArrowIcon className="h-4 w-4 me-2" />
                {t('practitionerLanding.backToDirectory')}
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />

      <main>
        <PractitionerProfileHeader practitioner={practitioner} postsCount={postsCount} />
        <PractitionerFeedTabs practitioner={practitioner} />
      </main>

      <Footer />
    </div>
  );
};

export default PractitionerProfile;
