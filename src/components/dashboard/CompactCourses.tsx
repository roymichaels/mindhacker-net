import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, PlayCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const CompactCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['compact-enrollments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`*, content_products (id, title, slug, thumbnail_url)`)
        .eq('user_id', user.id)
        .order('last_accessed_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('dashboard.myCourses')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('dashboard.myCourses')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('dashboard.noCourses')}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/courses')}
          >
            {t('dashboard.discoverProducts')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('dashboard.myCourses')}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-auto p-1"
            onClick={() => navigate('/courses')}
          >
            {t('dashboard.viewAll')}
            <ChevronIcon className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {enrollments.map((enrollment) => {
          const course = enrollment.content_products;
          if (!course) return null;
          const progress = enrollment.progress_percentage || 0;

          return (
            <div 
              key={enrollment.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate(`/courses/${course.slug}/watch`)}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{course.title}</p>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
              </div>
              <PlayCircle className="h-4 w-4 text-primary shrink-0" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default CompactCourses;
