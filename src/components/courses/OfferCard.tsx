import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface OfferCardProps {
  offer: Tables<"offers">;
  purchased?: boolean;
}

const OfferCard = ({ offer, purchased }: OfferCardProps) => {
  const navigate = useNavigate();
  const { t, isRTL, language } = useTranslation();

  const title = language === 'en' && offer.title_en ? offer.title_en : offer.title;
  const description = language === 'en' && offer.description_en ? offer.description_en : offer.description;
  const badgeText = language === 'en' && offer.badge_text_en ? offer.badge_text_en : offer.badge_text;

  const handleClick = () => {
    if (offer.landing_page_route) {
      navigate(offer.landing_page_route);
    } else {
      navigate(`/offer/${offer.slug}`);
    }
  };

  return (
    <Card 
      className={cn(
        "glass-panel hover:cyber-border transition-all duration-300 cursor-pointer overflow-hidden group",
        purchased && "ring-2 ring-green-500/50"
      )}
      onClick={handleClick}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header with gradient */}
      <div 
        className="relative h-32 overflow-hidden flex items-center justify-center"
        style={{ 
          background: offer.brand_color 
            ? `linear-gradient(135deg, ${offer.brand_color}20, ${offer.brand_color}40)` 
            : 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2))'
        }}
      >
        <span 
          className="text-4xl font-black opacity-30"
          style={{ color: offer.brand_color || 'hsl(var(--primary))' }}
        >
          {title?.slice(0, 2)}
        </span>
        
        {/* Badges */}
        <div className={cn("absolute top-3 flex gap-2", isRTL ? "right-3" : "left-3")}>
          {purchased && (
            <Badge className="bg-green-500 text-white flex items-center gap-1 shadow-lg">
              <CheckCircle className="h-3 w-3" />
              {t('courses.owned')}
            </Badge>
          )}
          {offer.is_free && !purchased && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {isRTL ? "חינם" : "Free"}
            </Badge>
          )}
          {badgeText && (
            <Badge 
              variant="default" 
              className="cyber-glow"
              style={{ backgroundColor: offer.brand_color || undefined }}
            >
              {badgeText}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <h3 className="text-xl font-bold leading-tight">
          {title}
        </h3>
        {offer.subtitle && (
          <p className="text-sm text-muted-foreground">
            {language === 'en' && offer.subtitle_en ? offer.subtitle_en : offer.subtitle}
          </p>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-border/30">
        <div>
          {purchased ? (
            <span className="text-lg font-medium text-green-500 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {t('courses.owned')}
            </span>
          ) : offer.price && offer.price > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold cyber-glow">₪{offer.price}</span>
              {offer.original_price && offer.original_price > offer.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₪{offer.original_price}
                </span>
              )}
            </div>
          ) : (
            <span className="text-2xl font-bold text-accent">{isRTL ? "חינם" : "Free"}</span>
          )}
        </div>
        <Button 
          variant={purchased ? "secondary" : "default"}
          style={!purchased && offer.brand_color ? { backgroundColor: offer.brand_color } : undefined}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          {purchased ? t('courses.continueWatching') : t('courses.viewProduct')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OfferCard;
