import { usePractitioner } from '@/contexts/PractitionerContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageSkeleton } from '@/components/ui/skeleton';
import { BookOpen, Clock, Users, Star } from 'lucide-react';

const StorefrontCourses = () => {
  const { practitioner, settings, practitionerSlug } = usePractitioner();
  const { t, isRTL } = useTranslation();
  
  const baseUrl = `/p/${practitionerSlug}`;
  const brandColor = settings?.brand_color || '#e91e63';
  
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['storefront-all-courses', practitioner?.id],
    queryFn: async () => {
      if (!practitioner) return [];
      const { data } = await supabase
        .from('content_products')
        .select('*')
        .eq('practitioner_id', practitioner.id)
        .eq('status', 'published')
        .eq('content_type', 'course')
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!practitioner,
  });
  
  if (isLoading) {
    return <PageSkeleton />;
  }
  
  if (!practitioner) return null;
  
  return (
    <div className="container py-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('courses')}</h1>
        <p className="text-muted-foreground">
          {t('exploreCoursesDescription')}
        </p>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">{t('noCoursesAvailable')}</h2>
          <p className="text-muted-foreground">{t('checkBackLater')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`${baseUrl}/courses/${course.slug}`}
              className="group bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition-all"
            >
              <div className="aspect-video overflow-hidden bg-muted">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {course.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  {course.duration_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.round(course.duration_minutes / 60)}h
                    </span>
                  )}
                  {course.enrollment_count && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrollment_count}
                    </span>
                  )}
                  {course.average_rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {course.average_rating.toFixed(1)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  {course.price ? (
                    <p className="font-bold text-xl" style={{ color: brandColor }}>
                      ₪{course.price}
                    </p>
                  ) : (
                    <p className="font-bold text-xl" style={{ color: brandColor }}>
                      {t('free')}
                    </p>
                  )}
                  {course.difficulty_level && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {course.difficulty_level}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StorefrontCourses;
