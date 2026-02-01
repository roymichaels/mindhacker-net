import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, ThumbsUp, Clock, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface ReviewProfile {
  full_name: string | null;
}

interface PractitionerReview {
  id: string;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  created_at: string | null;
  user_id: string;
  profile?: ReviewProfile;
}

interface ContentReview {
  id: string;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  created_at: string | null;
  helpful_count: number | null;
  user_id: string;
  profile?: ReviewProfile;
  content_products?: { title: string };
}

const CoachReviews = () => {
  const { language } = useTranslation();
  const isHebrew = language === 'he';
  const { data: myProfile, isLoading: profileLoading } = useMyPractitionerProfile();

  // Fetch practitioner reviews
  const { data: practitionerReviews, isLoading: practitionerReviewsLoading } = useQuery({
    queryKey: ['coach-practitioner-reviews', myProfile?.id],
    queryFn: async (): Promise<PractitionerReview[]> => {
      if (!myProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('practitioner_reviews')
        .select('id, rating, review_text, is_approved, created_at, user_id')
        .eq('practitioner_id', myProfile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = data?.map(r => r.user_id) || [];
      
      if (userIds.length === 0) return data || [];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, { full_name: p.full_name }]) || []);
      
      return (data || []).map(review => ({
        ...review,
        profile: profileMap.get(review.user_id),
      }));
    },
    enabled: !!myProfile?.id,
  });

  // Fetch content reviews for coach's products
  const { data: contentReviews, isLoading: contentReviewsLoading } = useQuery({
    queryKey: ['coach-content-reviews', myProfile?.id],
    queryFn: async (): Promise<ContentReview[]> => {
      if (!myProfile?.id) return [];
      
      // First get the coach's products
      const { data: products } = await supabase
        .from('content_products')
        .select('id, title')
        .eq('practitioner_id', myProfile.id);
      
      if (!products || products.length === 0) return [];
      
      const productIds = products.map(p => p.id);
      const productMap = new Map(products.map(p => [p.id, p]));
      
      const { data, error } = await supabase
        .from('content_reviews')
        .select('id, rating, review_text, is_approved, created_at, helpful_count, user_id, product_id')
        .in('product_id', productIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = data?.map(r => r.user_id) || [];
      
      if (userIds.length === 0) {
        return (data || []).map(review => ({
          ...review,
          content_products: productMap.get(review.product_id),
        }));
      }
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, { full_name: p.full_name }]) || []);
      
      return (data || []).map(review => ({
        ...review,
        profile: profileMap.get(review.user_id),
        content_products: productMap.get(review.product_id),
      }));
    },
    enabled: !!myProfile?.id,
  });

  const isLoading = profileLoading || practitionerReviewsLoading || contentReviewsLoading;

  type CombinedReview = 
    | (PractitionerReview & { type: 'practitioner'; helpful_count?: never; content_products?: never })
    | (ContentReview & { type: 'content' });

  const allReviews: CombinedReview[] = [
    ...(practitionerReviews?.map((r) => ({ ...r, type: 'practitioner' as const })) || []),
    ...(contentReviews?.map((r) => ({ ...r, type: 'content' as const })) || []),
  ].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

  const averageRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length
      : 0;

  const approvedCount = allReviews.filter((r) => r.is_approved).length;
  const pendingCount = allReviews.filter((r) => !r.is_approved).length;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const getInitial = (name: string | null | undefined): string => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6" />
          {isHebrew ? 'הביקורות שלי' : 'My Reviews'}
        </h1>
        <p className="text-muted-foreground">
          {isHebrew ? 'צפה בביקורות על הפרופיל והתכנים שלך' : 'View reviews on your profile and content'}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'סה"כ ביקורות' : 'Total Reviews'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-16" /> : allReviews.length}
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
                  {averageRating.toFixed(1)}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'מאושרות' : 'Approved'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {isLoading ? <Skeleton className="h-9 w-16" /> : approvedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'ממתינות' : 'Pending'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {isLoading ? <Skeleton className="h-9 w-16" /> : pendingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>{isHebrew ? 'כל הביקורות' : 'All Reviews'}</CardTitle>
          <CardDescription>
            {isHebrew ? 'ביקורות על הפרופיל והקורסים שלך' : 'Reviews on your profile and courses'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : allReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {isHebrew ? 'עדיין אין ביקורות' : 'No reviews yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {getInitial(review.profile?.full_name)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{review.profile?.full_name || (isHebrew ? 'אנונימי' : 'Anonymous')}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {renderStars(review.rating || 0)}
                          <span>•</span>
                          <span>
                            {format(
                              new Date(review.created_at || ''),
                              'PP',
                              { locale: isHebrew ? he : undefined }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={review.type === 'practitioner' ? 'default' : 'secondary'}>
                        {review.type === 'practitioner'
                          ? isHebrew ? 'פרופיל' : 'Profile'
                          : isHebrew ? 'קורס' : 'Course'}
                      </Badge>
                      {review.is_approved ? (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          <CheckCircle className="h-3 w-3 me-1" />
                          {isHebrew ? 'מאושר' : 'Approved'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                          <Clock className="h-3 w-3 me-1" />
                          {isHebrew ? 'ממתין' : 'Pending'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {review.review_text && (
                    <p className="text-muted-foreground">{review.review_text}</p>
                  )}

                  {review.type === 'content' && review.content_products && (
                    <p className="text-sm text-muted-foreground">
                      {isHebrew ? 'קורס: ' : 'Course: '}
                      <span className="font-medium">{review.content_products.title}</span>
                    </p>
                  )}

                  {review.type === 'content' && review.helpful_count && review.helpful_count > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ThumbsUp className="h-3 w-3" />
                      <span>
                        {review.helpful_count} {isHebrew ? 'מצאו שימושי' : 'found helpful'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachReviews;
