import { Navigate } from 'react-router-dom';
import { usePractitioner } from '@/contexts/PractitionerContext';
import { usePractitionerAuth } from '@/contexts/PractitionerAuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Calendar, Trophy, Clock, ArrowRight, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageSkeleton } from '@/components/ui/skeleton';

const StorefrontClientDashboard = () => {
  const { practitioner, settings, practitionerSlug } = usePractitioner();
  const { user, clientProfile, isLoading: authLoading, isAuthenticated } = usePractitionerAuth();
  const { t, isRTL } = useTranslation();
  
  const baseUrl = `/p/${practitionerSlug}`;
  const brandColor = settings?.brand_color || '#e91e63';
  
  // Fetch client's enrolled courses
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['client-enrollments', user?.id, practitioner?.id],
    queryFn: async () => {
      if (!user || !practitioner) return [];
      const { data } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          product:product_id(id, title, slug, thumbnail_url, description)
        `)
        .eq('user_id', user.id);
      
      // Filter by practitioner's products
      const practitionerProducts = await supabase
        .from('content_products')
        .select('id')
        .eq('practitioner_id', practitioner.id);
      
      const productIds = practitionerProducts.data?.map(p => p.id) || [];
      return (data || []).filter(e => productIds.includes(e.product_id));
    },
    enabled: !!user && !!practitioner,
  });
  
  // Fetch client's purchases
  const { data: purchases = [] } = useQuery({
    queryKey: ['client-purchases', user?.id, practitioner?.id],
    queryFn: async () => {
      if (!user || !practitioner) return [];
      const { data } = await supabase
        .from('content_purchases')
        .select(`
          *,
          product:product_id(id, title, slug, thumbnail_url, practitioner_id)
        `)
        .eq('user_id', user.id);
      
      return (data || []).filter(p => (p.product as any)?.practitioner_id === practitioner.id);
    },
    enabled: !!user && !!practitioner,
  });
  
  if (!isAuthenticated && !authLoading) {
    return <Navigate to={`${baseUrl}/login`} replace />;
  }
  
  if (authLoading || enrollmentsLoading) {
    return <PageSkeleton />;
  }
  
  if (!practitioner) return null;
  
  const inProgressCourses = enrollments.filter(e => !e.is_completed);
  const completedCourses = enrollments.filter(e => e.is_completed);
  
  return (
    <div className="container py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('welcomeBack')}, {clientProfile?.display_name || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-muted-foreground">
          {t('hereIsYourProgress')}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <BookOpen className="h-6 w-6" style={{ color: brandColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrollments.length}</p>
                <p className="text-sm text-muted-foreground">{t('enrolledCourses')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <Trophy className="h-6 w-6" style={{ color: brandColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCourses.length}</p>
                <p className="text-sm text-muted-foreground">{t('completed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <Calendar className="h-6 w-6" style={{ color: brandColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{clientProfile?.total_sessions || 0}</p>
                <p className="text-sm text-muted-foreground">{t('sessions')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <Clock className="h-6 w-6" style={{ color: brandColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{purchases.length}</p>
                <p className="text-sm text-muted-foreground">{t('purchases')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('continueWatching')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressCourses.map((enrollment) => (
              <Card key={enrollment.id} className="overflow-hidden">
                {(enrollment.product as any)?.thumbnail_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={(enrollment.product as any).thumbnail_url}
                      alt={(enrollment.product as any).title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-2">{(enrollment.product as any)?.title}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('progress')}</span>
                      <span className="font-medium">{enrollment.progress_percentage || 0}%</span>
                    </div>
                    <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    asChild
                    style={{ backgroundColor: brandColor }}
                  >
                    <Link to={`${baseUrl}/courses/${(enrollment.product as any)?.slug}`}>
                      {t('continue')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('quickActions')}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link to={`${baseUrl}/courses`}>
              <CardContent className="pt-6">
                <BookOpen className="h-8 w-8 mb-3" style={{ color: brandColor }} />
                <h3 className="font-semibold">{t('browseCourses')}</h3>
                <p className="text-sm text-muted-foreground">{t('exploreNewCourses')}</p>
              </CardContent>
            </Link>
          </Card>
          
          {settings?.enable_services !== false && (
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link to={`${baseUrl}/services`}>
                <CardContent className="pt-6">
                  <Calendar className="h-8 w-8 mb-3" style={{ color: brandColor }} />
                  <h3 className="font-semibold">{t('bookSession')}</h3>
                  <p className="text-sm text-muted-foreground">{t('scheduleWithCoach')}</p>
                </CardContent>
              </Link>
            </Card>
          )}
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link to={`${baseUrl}/messages`}>
              <CardContent className="pt-6">
                <MessageCircle className="h-8 w-8 mb-3" style={{ color: brandColor }} />
                <h3 className="font-semibold">{t('messages')}</h3>
                <p className="text-sm text-muted-foreground">{t('contactCoach')}</p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </section>
      
      {/* Empty State */}
      {enrollments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">{t('noCoursesYet')}</CardTitle>
            <CardDescription className="mb-6">
              {t('startYourJourney')}
            </CardDescription>
            <Button asChild style={{ backgroundColor: brandColor }}>
              <Link to={`${baseUrl}/courses`}>
                {t('exploreCourses')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StorefrontClientDashboard;
