import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/useTranslation';
import { PractitionerWithDetails } from '@/hooks/usePractitioners';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  name: string;
  name_en: string | null;
  initials: string | null;
  role: string | null;
  role_en: string | null;
  quote: string;
  quote_en: string | null;
  avatar_url: string | null;
  order_index: number;
}

interface Props {
  practitioner: PractitionerWithDetails;
}

const PractitionerReviewsList = ({ practitioner }: Props) => {
  const { language } = useTranslation();

  const { data: testimonials = [] } = useQuery({
    queryKey: ['practitioner-testimonials', practitioner.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) return [];
      return data as Testimonial[];
    },
  });

  // Combine practitioner_reviews + testimonials
  const reviews = practitioner.reviews || [];

  if (testimonials.length === 0 && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Star className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">{language === 'he' ? 'אין ביקורות עדיין' : 'No reviews yet'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Practitioner reviews */}
      {reviews.map((review) => (
        <div key={review.id} className="bg-card border border-border rounded-2xl p-4 relative">
          <Quote className="absolute top-3 end-3 h-6 w-6 text-primary/15" />
          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
          {review.review_text && (
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">"{review.review_text}"</p>
          )}
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={review.reviewer_avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {review.reviewer_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{review.reviewer_name || (language === 'he' ? 'לקוח' : 'Client')}</span>
          </div>
        </div>
      ))}

      {/* General testimonials */}
      {testimonials.map((t) => {
        const name = language === 'en' && t.name_en ? t.name_en : t.name;
        const quote = language === 'en' && t.quote_en ? t.quote_en : t.quote;
        const role = language === 'en' && t.role_en ? t.role_en : t.role;

        return (
          <div key={t.id} className="bg-card border border-border rounded-2xl p-4 relative">
            <Quote className="absolute top-3 end-3 h-6 w-6 text-primary/15" />
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">"{quote}"</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={t.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {t.initials || name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-medium">{name}</span>
                {role && <span className="text-xs text-muted-foreground ms-1">· {role}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PractitionerReviewsList;
