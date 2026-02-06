import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Star, MapPin, CheckCircle, Languages, Calendar, MessageCircle, Globe, Instagram, Play, Package, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { usePractitioner, type Practitioner } from '@/hooks/usePractitioners';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PractitionerMiniItemCard, { type MiniItemCardData } from './PractitionerMiniItemCard';
import PractitionerReviewSlider from './PractitionerReviewSlider';
import PractitionerBookingView from './PractitionerBookingView';
import type { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

interface PractitionerDetailViewProps {
  practitioner: Practitioner;
  onBack: () => void;
}

const PractitionerDetailView = ({ practitioner: basicPractitioner, onBack }: PractitionerDetailViewProps) => {
  const { t, isRTL, language } = useTranslation();
  const { data: practitioner, isLoading } = usePractitioner(basicPractitioner.slug);
  const [showBooking, setShowBooking] = useState(false);
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | undefined>();
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

  // Unified items: offers + services
  const unifiedItems = useMemo(() => {
    const items: MiniItemCardData[] = [];

    // Map offers
    if (offers) {
      for (const offer of offers) {
        const offerTitle = language === 'en' && offer.title_en ? offer.title_en : offer.title;
        const offerSubtitle = language === 'en' && offer.subtitle_en ? offer.subtitle_en : offer.subtitle;
        items.push({
          id: `offer-${offer.id}`,
          title: offerTitle,
          subtitle: offerSubtitle || undefined,
          price: offer.price || undefined,
          isFree: offer.is_free || false,
          accentColor: offer.brand_color || undefined,
          type: 'offer',
        });
      }
    }

    // Map services
    if (practitioner?.services) {
      for (const service of practitioner.services) {
        const sTitle = language === 'en' && service.title_en ? service.title_en : service.title;
        const duration = service.duration_minutes
          ? `${service.duration_minutes} ${language === 'he' ? 'דק׳' : 'min'}`
          : undefined;
        items.push({
          id: `service-${service.id}`,
          title: sTitle,
          subtitle: duration,
          price: service.price || undefined,
          isFree: service.price === 0,
          type: 'service',
        });
      }
    }

    return items;
  }, [offers, practitioner?.services, language]);

  const handleItemClick = (item: MiniItemCardData) => {
    if (item.type === 'offer') {
      const offerId = item.id.replace('offer-', '');
      const offer = offers?.find(o => o.id === offerId);
      if (offer) {
        const route = offer.landing_page_route || `/offer/${offer.slug}`;
        window.open(route, '_blank');
      }
    } else {
      // Service clicked -> open booking
      const serviceId = item.id.replace('service-', '');
      setPreSelectedServiceId(serviceId);
      setShowBooking(true);
    }
  };

  // Show booking view
  if (showBooking && practitioner?.services) {
    return (
      <PractitionerBookingView
        practitionerId={basicPractitioner.id}
        services={practitioner.services}
        practitionerName={displayName}
        onBack={() => { setShowBooking(false); setPreSelectedServiceId(undefined); }}
        preSelectedServiceId={preSelectedServiceId}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Hero section */}
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-primary/30 shadow-lg">
            <AvatarImage src={basicPractitioner.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {basicPractitioner.is_verified && (
            <div className="absolute -bottom-1 -end-1 bg-primary text-primary-foreground rounded-full p-1 shadow">
              <CheckCircle className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        <div className="text-center sm:text-start flex-1">
          <h2 className="text-lg font-bold">{displayName}</h2>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>

          {basicPractitioner.reviews_count > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={cn("h-3.5 w-3.5", star <= Math.round(basicPractitioner.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30')} />
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
        {practitioner?.services && practitioner.services.length > 0 && (
          <Button size="sm" onClick={() => setShowBooking(true)}>
            <Calendar className="h-4 w-4 me-1.5" />
            {language === 'he' ? 'קביעת פגישה' : 'Book a Session'}
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

      {/* Specialties */}
      {practitioner?.specialties && practitioner.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {practitioner.specialties.map((s) => (
            <Badge key={s.id} variant="outline" className="text-xs bg-primary/5 border-primary/20">
              {language === 'en' && s.specialty_label_en ? s.specialty_label_en : s.specialty_label}
              {s.years_experience > 0 && (
                <span className="ms-1 text-muted-foreground">
                  ({s.years_experience}{language === 'he' ? ' שנים' : 'y'})
                </span>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Bio */}
      {isLoading ? (
        <Skeleton className="h-20 rounded-lg" />
      ) : bio ? (
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
          <h3 className="font-semibold text-sm mb-1.5">{t('practitionerLanding.aboutTitle')}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{bio}</p>
        </div>
      ) : null}

      {/* Unified Products & Services */}
      {unifiedItems.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-2.5 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            {language === 'he' ? 'מוצרים ושירותים' : 'Products & Services'}
          </h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {unifiedItems.map((item) => (
              <PractitionerMiniItemCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviews slider */}
      {practitioner && (
        <div>
          <h3 className="font-semibold text-sm mb-2.5 flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-primary" />
            {language === 'he' ? 'ביקורות' : 'Reviews'}
          </h3>
          <PractitionerReviewSlider reviews={practitioner.reviews || []} />
        </div>
      )}
    </div>
  );
};

export default PractitionerDetailView;
