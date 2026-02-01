import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Star, Eye, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { Skeleton } from '@/components/ui/skeleton';

const CoachContent = () => {
  const { language } = useTranslation();
  const isHebrew = language === 'he';
  const { data: myProfile, isLoading: profileLoading } = useMyPractitionerProfile();

  // Fetch coach's content products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['coach-content-products', myProfile?.id],
    queryFn: async () => {
      if (!myProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('content_products')
        .select(`
          *,
          content_series(count),
          content_episodes(count),
          content_reviews(count, rating)
        `)
        .eq('practitioner_id', myProfile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!myProfile?.id,
  });

  const isLoading = profileLoading || productsLoading;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">{isHebrew ? 'פורסם' : 'Published'}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{isHebrew ? 'טיוטה' : 'Draft'}</Badge>;
      case 'archived':
        return <Badge variant="outline">{isHebrew ? 'בארכיון' : 'Archived'}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          {isHebrew ? 'התכנים שלי' : 'My Content'}
        </h1>
        <p className="text-muted-foreground">
          {isHebrew ? 'נהל את הקורסים והתכנים שלך' : 'Manage your courses and content'}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'סה"כ קורסים' : 'Total Courses'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-16" /> : products?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'סה"כ נרשמים' : 'Total Enrollments'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                products?.reduce((sum, p) => sum + (p.enrollment_count || 0), 0) || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'צפיות' : 'Total Views'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                products?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'דירוג ממוצע' : 'Average Rating'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-1">
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <>
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  {products?.length
                    ? (
                        products.reduce((sum, p) => sum + (p.average_rating || 0), 0) /
                        products.filter((p) => p.average_rating).length
                      ).toFixed(1) || '—'
                    : '—'}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle>{isHebrew ? 'הקורסים שלי' : 'My Courses'}</CardTitle>
          <CardDescription>
            {isHebrew ? 'כל הקורסים והתכנים שיצרת' : 'All your courses and content'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {isHebrew ? 'עדיין אין לך תכנים' : 'No content yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isHebrew
                  ? 'צור קשר עם האדמין כדי להוסיף קורסים'
                  : 'Contact admin to add courses'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {products?.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{product.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {product.enrollment_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {product.view_count || 0}
                        </span>
                        {product.average_rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {product.average_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(product.status)}
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 me-2" />
                      {isHebrew ? 'סטטיסטיקות' : 'Stats'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachContent;
