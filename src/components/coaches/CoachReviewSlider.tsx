/**
 * @tab Coaches
 * @purpose Review slider for coach detail view — shows testimonials + reviews
 * @data practitioner_reviews, testimonials
 */
import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import type { CoachReview } from '@/domain/coaches';
import { cn } from '@/lib/utils';

interface Testimonial {
  id: string;
  name: string;
  name_en: string | null;
  quote: string;
  quote_en: string | null;
  role: string | null;
  role_en: string | null;
  avatar_url: string | null;
  initials: string | null;
}

interface CoachReviewSliderProps {
  reviews: CoachReview[];
  testimonials?: Testimonial[];
}

const CoachReviewSlider = ({ reviews, testimonials = [] }: CoachReviewSliderProps) => {
  const { isRTL, language } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (isRTL) {
      setCanScrollStart(el.scrollLeft < -1);
      setCanScrollEnd(el.scrollLeft > -(el.scrollWidth - el.clientWidth - 1));
    } else {
      setCanScrollStart(el.scrollLeft > 1);
      setCanScrollEnd(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  };

  const cards = (() => {
    const items: Array<{
      id: string;
      name: string;
      initials: string;
      avatarUrl?: string;
      rating: number;
      text: string | null;
      role?: string;
    }> = [];

    for (const t of testimonials) {
      const name = language === 'en' && t.name_en ? t.name_en : t.name;
      const text = language === 'en' && t.quote_en ? t.quote_en : t.quote;
      const role = language === 'en' && t.role_en ? t.role_en : t.role;
      items.push({
        id: `t-${t.id}`,
        name,
        initials: t.initials || name.split(' ').map(n => n[0]).join('').slice(0, 2),
        avatarUrl: t.avatar_url || undefined,
        rating: 5,
        text,
        role: role || undefined,
      });
    }

    for (const review of reviews) {
      const name = review.reviewer_name || review.profiles?.full_name || (language === 'he' ? 'משתמש/ת' : 'User');
      items.push({
        id: `r-${review.id}`,
        name,
        initials: name.split(' ').map(n => n[0]).join('').slice(0, 2),
        avatarUrl: review.reviewer_avatar_url || undefined,
        rating: review.rating,
        text: review.review_text,
      });
    }

    return items;
  })();

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    return () => el?.removeEventListener('scroll', checkScroll);
  }, [cards.length]);

  const scroll = (direction: 'start' | 'end') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 260;
    const scrollAmount = direction === 'end' ? amount : -amount;
    el.scrollBy({ left: isRTL ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    if (cards.length <= 1) return;
    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const atEnd = isRTL
        ? el.scrollLeft <= -(el.scrollWidth - el.clientWidth - 5)
        : el.scrollLeft >= el.scrollWidth - el.clientWidth - 5;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scroll('end');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [cards.length, isRTL]);

  if (!cards.length) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
        {language === 'he' ? 'אין ביקורות עדיין' : 'No reviews yet'}
      </div>
    );
  }

  return (
    <div className="relative group/slider">
      {canScrollStart && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute start-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover/slider:opacity-100 transition-opacity"
          onClick={() => scroll('start')}
        >
          {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      )}
      {canScrollEnd && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute end-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover/slider:opacity-100 transition-opacity"
          onClick={() => scroll('end')}
        >
          {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      )}

      {canScrollStart && (
        <div className={cn(
          "absolute top-0 bottom-0 w-8 z-[5] pointer-events-none",
          isRTL ? "end-0 bg-gradient-to-l" : "start-0 bg-gradient-to-r",
          "from-background to-transparent"
        )} />
      )}
      {canScrollEnd && (
        <div className={cn(
          "absolute top-0 bottom-0 w-8 z-[5] pointer-events-none",
          isRTL ? "start-0 bg-gradient-to-r" : "end-0 bg-gradient-to-l",
          "from-background to-transparent"
        )} />
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-1 py-1"
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "w-[240px] flex-shrink-0 snap-start rounded-xl p-3",
              "bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm",
              "border border-border/50"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={card.avatarUrl} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {card.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{card.name}</p>
                {card.role && (
                  <p className="text-[10px] text-muted-foreground truncate">{card.role}</p>
                )}
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "h-3 w-3",
                        s <= card.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            {card.text && (
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {card.text}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoachReviewSlider;
/** @deprecated Use CoachReviewSlider */
export { CoachReviewSlider as PractitionerReviewSlider };
