import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { usePractitioners } from '@/hooks/usePractitioners';
import PractitionerCard from './PractitionerCard';

const FeaturedPractitioners = () => {
  const { t, isRTL } = useTranslation();
  const { data: practitioners, isLoading } = usePractitioners({ featured: true });

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">{t('practitioners.ourExperts')}</span>
            </div>
            <h2 className="text-3xl font-bold">{t('practitioners.featuredTitle')}</h2>
            <p className="text-muted-foreground mt-2">{t('practitioners.featuredSubtitle')}</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link to="/practitioners">
              {t('practitioners.viewAll')}
              <ArrowIcon className="h-4 w-4 ms-2" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : practitioners && practitioners.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practitioners.slice(0, 6).map((practitioner) => (
              <PractitionerCard key={practitioner.id} practitioner={practitioner} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('practitioners.comingSoon')}</p>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link to="/practitioners">
              {t('practitioners.viewAll')}
              <ArrowIcon className="h-4 w-4 ms-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPractitioners;
