import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  CheckCircle, 
  Languages, 
  Clock, 
  Calendar,
  MessageCircle,
  Globe,
  Instagram,
  ArrowLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslation } from '@/hooks/useTranslation';
import { usePractitioner } from '@/hooks/usePractitioners';
import { useSEO } from '@/hooks/useSEO';
import { formatCurrency } from '@/lib/currency';

const PractitionerProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, isRTL, language } = useTranslation();
  const { data: practitioner, isLoading, error } = usePractitioner(slug);

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  useSEO({
    title: practitioner ? `${practitioner.display_name} | Mind Hacker` : t('practitioners.loading'),
    description: practitioner?.bio || '',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="pt-20 px-4 py-12">
          <div className="container mx-auto max-w-4xl">
            <Skeleton className="h-64 rounded-lg mb-6" />
            <Skeleton className="h-40 rounded-lg mb-6" />
            <Skeleton className="h-40 rounded-lg" />
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
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-2xl font-bold mb-4">{t('practitioners.notFound')}</h1>
            <Button asChild>
              <Link to="/practitioners">
                <ArrowIcon className="h-4 w-4 me-2" />
                {t('practitioners.backToDirectory')}
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const displayName = language === 'en' && practitioner.display_name_en 
    ? practitioner.display_name_en 
    : practitioner.display_name;
    
  const title = language === 'en' && practitioner.title_en 
    ? practitioner.title_en 
    : practitioner.title;

  const bio = language === 'en' && practitioner.bio_en 
    ? practitioner.bio_en 
    : practitioner.bio;

  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="pt-20">
        {/* Back link */}
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <Link 
            to="/practitioners" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowIcon className="h-4 w-4 me-1" />
            {t('practitioners.backToDirectory')}
          </Link>
        </div>

        {/* Profile Header */}
        <section className="px-4 pb-8">
          <div className="container mx-auto max-w-4xl">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Avatar */}
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/20">
                    <AvatarImage src={practitioner.avatar_url || undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
                      {practitioner.is_verified && (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      )}
                    </div>

                    <p className="text-lg text-muted-foreground mb-4">{title}</p>

                    {/* Rating */}
                    {practitioner.reviews_count > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= Math.round(practitioner.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{practitioner.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">
                          ({practitioner.reviews_count} {t('practitioners.reviews')})
                        </span>
                      </div>
                    )}

                    {/* Meta badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {practitioner.country && (
                        <Badge variant="secondary">
                          <MapPin className="h-3 w-3 me-1" />
                          {practitioner.country}
                        </Badge>
                      )}
                      {practitioner.languages?.map((lang) => (
                        <Badge key={lang} variant="outline">
                          <Languages className="h-3 w-3 me-1" />
                          {lang === 'he' ? 'עברית' : lang === 'en' ? 'English' : lang}
                        </Badge>
                      ))}
                      {practitioner.is_featured && (
                        <Badge>
                          <Sparkles className="h-3 w-3 me-1" />
                          {t('practitioners.featured')}
                        </Badge>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">
                      {practitioner.calendly_url && (
                        <Button asChild>
                          <a href={practitioner.calendly_url} target="_blank" rel="noopener noreferrer">
                            <Calendar className="h-4 w-4 me-2" />
                            {t('practitioners.bookSession')}
                          </a>
                        </Button>
                      )}
                      {practitioner.whatsapp && (
                        <Button variant="outline" asChild>
                          <a href={`https://wa.me/${practitioner.whatsapp}`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4 me-2" />
                            WhatsApp
                          </a>
                        </Button>
                      )}
                      {practitioner.instagram_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={practitioner.instagram_url} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-5 w-5" />
                          </a>
                        </Button>
                      )}
                      {practitioner.website_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={practitioner.website_url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-5 w-5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Bio */}
        {bio && (
          <section className="px-4 pb-8">
            <div className="container mx-auto max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>{t('practitioners.about')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{bio}</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Specialties */}
        {practitioner.specialties && practitioner.specialties.length > 0 && (
          <section className="px-4 pb-8">
            <div className="container mx-auto max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>{t('practitioners.specialties')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {practitioner.specialties.map((specialty) => (
                      <div key={specialty.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {language === 'en' && specialty.specialty_label_en 
                              ? specialty.specialty_label_en 
                              : specialty.specialty_label}
                          </p>
                          {specialty.years_experience > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {specialty.years_experience} {t('practitioners.yearsExperience')}
                            </p>
                          )}
                          {specialty.certification_name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {specialty.certification_name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Services */}
        {practitioner.services && practitioner.services.length > 0 && (
          <section className="px-4 pb-8">
            <div className="container mx-auto max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>{t('practitioners.services')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {practitioner.services.map((service, index) => (
                    <div key={service.id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {language === 'en' && service.title_en ? service.title_en : service.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {language === 'en' && service.description_en 
                              ? service.description_en 
                              : service.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {service.duration_minutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {service.duration_minutes} {t('common.minutes')}
                              </span>
                            )}
                            {service.sessions_count && (
                              <span>
                                {service.sessions_count} {t('practitioners.sessions')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-end">
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(service.price, service.price_currency)}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {service.service_type === 'session' 
                              ? t('practitioners.singleSession')
                              : service.service_type === 'package'
                              ? t('practitioners.package')
                              : t('practitioners.product')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Reviews */}
        {practitioner.reviews && practitioner.reviews.length > 0 && (
          <section className="px-4 pb-12">
            <div className="container mx-auto max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>{t('practitioners.reviews')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {practitioner.reviews.map((review, index) => (
                    <div key={review.id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {review.profiles?.full_name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{review.profiles?.full_name || t('practitioners.anonymous')}</p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-muted-foreground">{review.review_text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PractitionerProfile;
