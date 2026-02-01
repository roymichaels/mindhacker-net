import { usePractitioner } from '@/contexts/PractitionerContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Star, Users, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const StorefrontHome = () => {
  const { practitioner, settings, practitionerSlug } = usePractitioner();
  const { t, language, isRTL } = useTranslation();
  
  const baseUrl = `/p/${practitionerSlug}`;
  const brandColor = settings?.brand_color || '#e91e63';
  
  // Fetch practitioner's courses
  const { data: courses = [] } = useQuery({
    queryKey: ['storefront-courses', practitioner?.id],
    queryFn: async () => {
      if (!practitioner) return [];
      const { data } = await supabase
        .from('content_products')
        .select('*')
        .eq('practitioner_id', practitioner.id)
        .eq('status', 'published')
        .eq('content_type', 'course')
        .limit(3);
      return data || [];
    },
    enabled: !!practitioner,
  });
  
  // Fetch practitioner's services
  const { data: services = [] } = useQuery({
    queryKey: ['storefront-services', practitioner?.id],
    queryFn: async () => {
      if (!practitioner) return [];
      const { data } = await supabase
        .from('practitioner_services')
        .select('*')
        .eq('practitioner_id', practitioner.id)
        .eq('is_active', true)
        .limit(3);
      return data || [];
    },
    enabled: !!practitioner,
  });
  
  // Fetch reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['storefront-reviews', practitioner?.id],
    queryFn: async () => {
      if (!practitioner) return [];
      const { data } = await supabase
        .from('practitioner_reviews')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .eq('practitioner_id', practitioner.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6);
      return data || [];
    },
    enabled: !!practitioner,
  });
  
  if (!practitioner) return null;
  
  const heroHeading = language === 'he' 
    ? settings?.hero_heading_he 
    : settings?.hero_heading_en;
  const heroSubheading = language === 'he' 
    ? settings?.hero_subheading_he 
    : settings?.hero_subheading_en;
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section 
        className="relative py-20 lg:py-32 overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${brandColor}15 0%, transparent 50%)` 
        }}
      >
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                {heroHeading || practitioner.display_name}
              </h1>
              <p className="text-xl text-muted-foreground">
                {heroSubheading || practitioner.title || practitioner.bio}
              </p>
              <div className="flex flex-wrap gap-4">
                {settings?.enable_courses !== false && (
                  <Button size="lg" asChild style={{ backgroundColor: brandColor }}>
                    <Link to={`${baseUrl}/courses`}>
                      <BookOpen className="mr-2 h-5 w-5" />
                      {t('exploreCourses')}
                    </Link>
                  </Button>
                )}
                {settings?.enable_services !== false && (
                  <Button size="lg" variant="outline" asChild>
                    <Link to={`${baseUrl}/services`}>
                      <Calendar className="mr-2 h-5 w-5" />
                      {t('bookSession')}
                    </Link>
                  </Button>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 pt-6">
                <div>
                  <p className="text-3xl font-bold" style={{ color: brandColor }}>
                    {courses.length}+
                  </p>
                  <p className="text-sm text-muted-foreground">{t('courses')}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: brandColor }}>
                    {reviews.length}+
                  </p>
                  <p className="text-sm text-muted-foreground">{t('reviews')}</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {settings?.hero_image_url || practitioner.avatar_url ? (
                <img
                  src={settings?.hero_image_url || practitioner.avatar_url || ''}
                  alt={practitioner.display_name}
                  className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto"
                />
              ) : (
                <div 
                  className="aspect-square rounded-2xl flex items-center justify-center text-white text-8xl font-bold max-w-lg mx-auto"
                  style={{ backgroundColor: brandColor }}
                >
                  {practitioner.display_name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      {practitioner.bio && (
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">{t('aboutMe')}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {practitioner.bio}
            </p>
            {practitioner.specialties && practitioner.specialties.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {practitioner.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: `${brandColor}20`,
                      color: brandColor,
                    }}
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Courses Section */}
      {settings?.enable_courses !== false && courses.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">{t('featuredCourses')}</h2>
              <Button variant="ghost" asChild>
                <Link to={`${baseUrl}/courses`}>{t('viewAll')}</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`${baseUrl}/courses/${course.slug}`}
                  className="group bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition-shadow"
                >
                  {course.thumbnail_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    {course.price && (
                      <p className="mt-4 font-bold text-lg" style={{ color: brandColor }}>
                        ₪{course.price}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Services Section */}
      {settings?.enable_services !== false && services.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">{t('services')}</h2>
              <Button variant="ghost" asChild>
                <Link to={`${baseUrl}/services`}>{t('viewAll')}</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-card rounded-xl p-6 border shadow-sm"
                >
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg" style={{ color: brandColor }}>
                        ₪{service.price}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {service.duration_minutes} {t('minutes')}
                      </p>
                    </div>
                    <Button asChild style={{ backgroundColor: brandColor }}>
                      <Link to={`${baseUrl}/book/${service.id}`}>
                        {t('book')}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8 text-center">{t('whatClientsSay')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card rounded-xl p-6 border shadow-sm"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  {review.review_text && (
                    <p className="text-muted-foreground mb-4 line-clamp-4">
                      "{review.review_text}"
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: brandColor }}
                    >
                      {(review.profiles as any)?.full_name?.charAt(0) || 'U'}
                    </div>
                    <p className="font-medium">
                      {(review.profiles as any)?.full_name || t('anonymous')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section 
        className="py-20"
        style={{ backgroundColor: brandColor }}
      >
        <div className="container text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('readyToStart')}
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {t('joinMeOnThisJourney')}
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            asChild
          >
            <Link to={`${baseUrl}/signup`}>
              {t('getStarted')}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default StorefrontHome;
