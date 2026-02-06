import { ArrowLeft, ArrowRight, Star, MapPin, CheckCircle, Languages, Calendar, MessageCircle, Globe, Instagram, Play, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { usePractitioner, type Practitioner } from '@/hooks/usePractitioners';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import OfferCard from '@/components/courses/OfferCard';
import type { Tables } from '@/integrations/supabase/types';

interface PractitionerDetailViewProps {
  practitioner: Practitioner;
  onBack: () => void;
}

const PractitionerDetailView = ({ practitioner: basicPractitioner, onBack }: PractitionerDetailViewProps) => {
  const { t, isRTL, language } = useTranslation();
  const { data: practitioner, isLoading } = usePractitioner(basicPractitioner.slug);
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const displayName = language === 'en' && basicPractitioner.display_name_en
    ? basicPractitioner.display_name_en
    : basicPractitioner.display_name;

  const title = language === 'en' && basicPractitioner.title_en
    ? basicPractitioner.title_en
    : basicPractitioner.title;

  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2);

  const bio = practitioner
    ? (language === 'en' && practitioner.bio_en ? practitioner.bio_en : practitioner.bio)
    : null;

  // Fetch offers
  const { data: offers } = useQuery({
    queryKey: ['practitioner-offers', basicPractitioner.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('practitioner_id', basicPractitioner.id)
        .eq('status', 'active')
        .eq('landing_page_enabled', true)
        .order('homepage_order', { ascending: true });
      if (error) throw error;
      return data as Tables<'offers'>[];
    },
    enabled: !!basicPractitioner.id,
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowIcon className="h-4 w-4 me-1" />
        {t('practitionerLanding.backToDirectory')}
      </button>

      {/* Hero section */}
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-primary/30 shadow-lg">
            <AvatarImage src={basicPractitioner.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {basicPractitioner.is_verified && (
            <div className="absolute -bottom-1 -end-1 bg-primary text-primary-foreground rounded-full p-1 shadow">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="text-center sm:text-start flex-1">
          <h2 className="text-xl font-bold">{displayName}</h2>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>

          {basicPractitioner.reviews_count > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= Math.round(basicPractitioner.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <span className="text-sm font-medium">{basicPractitioner.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({basicPractitioner.reviews_count})</span>
            </div>
          )}

          <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
            {basicPractitioner.country && (
              <Badge variant="secondary" className="text-xs">
                <MapPin className="h-3 w-3 me-1" />
                {basicPractitioner.country}
              </Badge>
            )}
            {basicPractitioner.languages?.map((lang) => (
              <Badge key={lang} variant="outline" className="text-xs">
                <Languages className="h-3 w-3 me-1" />
                {lang === 'he' ? 'עברית' : lang === 'en' ? 'English' : lang}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {basicPractitioner.calendly_url && (
          <Button size="sm" asChild>
            <a href={basicPractitioner.calendly_url} target="_blank" rel="noopener noreferrer">
              <Calendar className="h-4 w-4 me-1.5" />
              {t('practitionerLanding.bookNow')}
            </a>
          </Button>
        )}
        {basicPractitioner.whatsapp && (
          <Button size="sm" variant="outline" asChild>
            <a href={`https://wa.me/${basicPractitioner.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 me-1.5" />
              WhatsApp
            </a>
          </Button>
        )}
        {basicPractitioner.intro_video_url && (
          <Button size="sm" variant="outline" asChild>
            <a href={basicPractitioner.intro_video_url} target="_blank" rel="noopener noreferrer">
              <Play className="h-4 w-4 me-1.5" />
              {t('practitionerLanding.watchIntro')}
            </a>
          </Button>
        )}
        {basicPractitioner.instagram_url && (
          <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
            <a href={basicPractitioner.instagram_url} target="_blank" rel="noopener noreferrer">
              <Instagram className="h-4 w-4" />
            </a>
          </Button>
        )}
        {basicPractitioner.website_url && (
          <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
            <a href={basicPractitioner.website_url} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>

      {/* Bio */}
      {isLoading ? (
        <Skeleton className="h-24 rounded-lg" />
      ) : bio ? (
        <div className="bg-muted/30 rounded-xl p-4 border border-border">
          <h3 className="font-semibold mb-2">{t('practitionerLanding.aboutTitle')}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{bio}</p>
        </div>
      ) : null}

      {/* Offers / Catalog */}
      {offers && offers.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            {language === 'he' ? 'הקורסים והמוצרים' : 'Courses & Products'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PractitionerDetailView;
