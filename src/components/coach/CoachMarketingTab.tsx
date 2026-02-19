import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, ThumbsUp, Clock, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const CoachMarketingTab = () => {
  const { t, language } = useTranslation();
  const isHebrew = language === 'he';
  const { data: myProfile, isLoading: profileLoading } = useMyPractitionerProfile();

  interface ReviewWithName {
    created_at: string; id: string; is_approved: boolean;
    rating: number; review_text: string; user_id: string;
    reviewer_name: string | null;
  }

  const { data: practitionerReviews, isLoading: reviewsLoading } = useQuery<ReviewWithName[]>({
    queryKey: ['coach-practitioner-reviews', myProfile?.id],
    queryFn: async (): Promise<ReviewWithName[]> => {
      if (!myProfile?.id) return [];
      const { data, error } = await supabase
        .from('practitioner_reviews')
        .select('id, rating, review_text, is_approved, created_at, user_id')
        .eq('practitioner_id', myProfile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return data.map(review => ({
        ...review,
        reviewer_name: profileMap.get(review.user_id) ?? null,
      }));
    },
    enabled: !!myProfile?.id,
  });

  const isLoading = profileLoading || reviewsLoading;
  const reviews = practitionerReviews || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Star className="h-5 w-5" />
          {isHebrew ? 'שיווק וביקורות' : 'Marketing & Reviews'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isHebrew ? 'ביקורות, המלצות ושיווק' : 'Reviews, testimonials and marketing'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-muted-foreground pb-2">
            {isHebrew ? 'סה"כ ביקורות' : 'Total Reviews'}
          </p>
          {isLoading ? <Skeleton className="h-8 w-12" /> : (
            <div className="text-2xl font-bold">{reviews.length}</div>
          )}
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-muted-foreground pb-2">
            {isHebrew ? 'דירוג ממוצע' : 'Avg Rating'}
          </p>
          {isLoading ? <Skeleton className="h-8 w-12" /> : (
            <div className="text-2xl font-bold flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              {averageRating.toFixed(1)}
            </div>
          )}
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-muted-foreground pb-2">
            {isHebrew ? 'ממתין לאישור' : 'Pending'}
          </p>
          {isLoading ? <Skeleton className="h-8 w-12" /> : (
            <div className="text-2xl font-bold text-yellow-500">
              {reviews.filter(r => !r.is_approved).length}
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold mb-4">{isHebrew ? 'כל הביקורות' : 'All Reviews'}</h3>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {isHebrew ? 'אין ביקורות עדיין' : 'No reviews yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {review.reviewer_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.reviewer_name || (isHebrew ? 'אנונימי' : 'Anonymous')}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {renderStars(review.rating || 0)}
                          <span>
                            {format(new Date(review.created_at || ''), 'PP', {
                              locale: isHebrew ? he : undefined,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.is_approved ? (
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                        <CheckCircle className="h-3 w-3 me-1" />
                        {isHebrew ? 'מאושר' : 'Approved'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 text-xs">
                        <Clock className="h-3 w-3 me-1" />
                        {isHebrew ? 'ממתין' : 'Pending'}
                      </Badge>
                    )}
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default CoachMarketingTab;
