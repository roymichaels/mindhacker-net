import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Gift, Video, Zap, Sparkles, Brain, Heart, Star, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useHomepageOffers, Offer } from "@/hooks/useOfferBranding";
import { getOfferColors, ProductColorClasses } from "@/lib/productColors";

interface StartChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Map icon names to components
const iconMap: Record<string, React.ElementType> = {
  gift: Gift,
  video: Video,
  zap: Zap,
  sparkles: Sparkles,
  brain: Brain,
  heart: Heart,
  star: Star,
};

// Get icon based on offer slug or default
const getOfferIcon = (slug: string): React.ElementType => {
  if (slug.includes('introspection') || slug.includes('journey')) return Gift;
  if (slug.includes('personal') || slug.includes('video')) return Video;
  if (slug.includes('consciousness') || slug.includes('leap')) return Zap;
  return Sparkles;
};

const StartChangeModal = ({ open, onOpenChange }: StartChangeModalProps) => {
  const navigate = useNavigate();
  const { t, isRTL, language } = useTranslation();
  const { data: offers, isLoading } = useHomepageOffers();

  const handleSelect = (route: string) => {
    onOpenChange(false);
    navigate(route);
  };

  // Get localized text from offer
  const getLocalizedText = (offer: Offer, field: 'title' | 'subtitle' | 'badge_text') => {
    if (language === 'en') {
      const enField = `${field}_en` as keyof Offer;
      return (offer[enField] as string) || offer[field] || '';
    }
    return offer[field] || '';
  };

  // Build route from offer
  const getOfferRoute = (offer: Offer): string => {
    if (offer.cta_link) return offer.cta_link;
    if (offer.landing_page_route) return offer.landing_page_route;
    return `/${offer.slug}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-lg md:max-w-2xl bg-card border-border"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {t("header.chooseYourPath")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("dialogs.pathSelectionDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : offers && offers.length > 0 ? (
            offers.map((offer) => {
              const colors = getOfferColors(offer.brand_color);
              const Icon = getOfferIcon(offer.slug);
              const title = getLocalizedText(offer, 'title');
              const subtitle = getLocalizedText(offer, 'subtitle');
              const badge = getLocalizedText(offer, 'badge_text');
              const route = getOfferRoute(offer);

              return (
                <button
                  key={offer.id}
                  onClick={() => handleSelect(route)}
                  className={`
                    relative flex items-center gap-4 p-4 rounded-xl
                    bg-gradient-to-r ${colors.gradient} to-transparent
                    border ${colors.border}/30 ${colors.borderHover}
                    transition-all duration-300
                    hover:scale-[1.02] hover:shadow-lg
                    text-${isRTL ? "right" : "left"}
                  `}
                >
                  <div className={`p-3 rounded-xl ${colors.bgMedium}`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      {badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bgMedium} ${colors.text} font-medium`}>
                          {badge}
                        </span>
                      )}
                    </div>
                    {subtitle && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-4">
              {t("common.noData")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartChangeModal;
