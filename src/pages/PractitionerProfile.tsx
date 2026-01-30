import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslation } from '@/hooks/useTranslation';
import { usePractitioner } from '@/hooks/usePractitioners';
import { useSEO } from '@/hooks/useSEO';
import {
  PractitionerHero,
  PractitionerAbout,
  PractitionerSpecialties,
  PractitionerServices,
  PractitionerTestimonials,
  PractitionerCTA,
} from '@/components/practitioner-landing';

const PractitionerProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, isRTL, language } = useTranslation();
  const { data: practitioner, isLoading, error } = usePractitioner(slug);

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const displayName = practitioner 
    ? (language === 'en' && practitioner.display_name_en ? practitioner.display_name_en : practitioner.display_name)
    : '';

  useSEO({
    title: practitioner ? `${displayName} | Mind Hacker` : t('practitioners.loading'),
    description: practitioner?.bio || '',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="pt-20 px-4 py-12">
          <div className="container mx-auto max-w-5xl">
            <Skeleton className="h-[400px] rounded-2xl mb-8" />
            <Skeleton className="h-40 rounded-2xl mb-6" />
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
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
      
      <main className="pt-16">
        <PractitionerHero practitioner={practitioner} />
        <PractitionerAbout practitioner={practitioner} />
        <PractitionerSpecialties practitioner={practitioner} />
        <PractitionerServices practitioner={practitioner} />
        <PractitionerTestimonials practitioner={practitioner} />
        <PractitionerCTA practitioner={practitioner} />
      </main>

      <Footer />
    </div>
  );
};

export default PractitionerProfile;
