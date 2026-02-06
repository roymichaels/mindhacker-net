import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import type { PractitionerReview } from '@/hooks/usePractitioners';
import { cn } from '@/lib/utils';

interface PractitionerReviewSliderProps {
  reviews: PractitionerReview[];
}

const PractitionerReviewSlider = ({ reviews }: PractitionerReviewSliderProps) => {
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

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    return () => el?.removeEventListener('scroll', checkScroll);
  }, [reviews]);

  const scroll = (direction: 'start' | 'end') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 260;
    const scrollAmount = direction === 'end' ? amount : -amount;
    el.scrollBy({ left: isRTL ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  // Auto-advance every 5s
  useEffect(() => {
    if (reviews.length <= 1) return;
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
  }, [reviews.length, isRTL]);

  if (!reviews.length) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
        {language === 'he' ? 'אין ביקורות עדיין' : 'No reviews yet'}
      </div>
    );
  }

  return (
    <div className="relative group/slider">
      {/* Scroll buttons */}
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

      {/* Edge fades */}
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
        {reviews.map((review) => {
          const name = review.reviewer_name || review.profiles?.full_name || (language === 'he' ? 'משתמש/ת' : 'User');
          const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

          return (
            <div
              key={review.id}
              className={cn(
                "w-[240px] flex-shrink-0 snap-start rounded-xl p-3",
                "bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm",
                "border border-border/50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={review.reviewer_avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{name}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-3 w-3",
                          s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {review.review_text && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {review.review_text}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PractitionerReviewSlider;
