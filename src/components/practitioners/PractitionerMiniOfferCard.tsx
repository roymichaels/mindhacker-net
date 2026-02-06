import { ExternalLink } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

interface PractitionerMiniOfferCardProps {
  offer: Tables<'offers'>;
}

const PractitionerMiniOfferCard = ({ offer }: PractitionerMiniOfferCardProps) => {
  const { language, isRTL } = useTranslation();

  const title = language === 'en' && offer.title_en ? offer.title_en : offer.title;
  const subtitle = language === 'en' && offer.subtitle_en ? offer.subtitle_en : offer.subtitle;

  const handleClick = () => {
    const route = offer.landing_page_route || `/offer/${offer.slug}`;
    window.open(route, '_blank');
  };

  const accentColor = offer.brand_color || 'hsl(var(--primary))';

  return (
    <div
      onClick={handleClick}
      className={cn(
        "w-[220px] flex-shrink-0 rounded-xl cursor-pointer transition-all duration-200",
        "bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm",
        "border border-border/50 hover:border-primary/40 hover:shadow-md",
        "overflow-hidden group"
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-full">
        {/* Accent bar */}
        <div
          className="w-1 flex-shrink-0 rounded-s"
          style={{ backgroundColor: accentColor }}
        />

        <div className="flex-1 p-3 flex flex-col justify-between min-h-[80px]">
          <div>
            <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold" style={{ color: accentColor }}>
              {offer.is_free
                ? (isRTL ? 'חינם' : 'Free')
                : offer.price
                  ? `₪${offer.price}`
                  : ''}
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PractitionerMiniOfferCard;
