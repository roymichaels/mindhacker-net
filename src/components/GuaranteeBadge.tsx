import { ShieldCheck } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const GuaranteeBadge = () => {
  const { t, isRTL } = useTranslation();
  const { settings } = useSiteSettings();
  
  // Use admin setting if available, otherwise fall back to translation
  const title = settings.guarantee_title || t('guarantee.title');
  const subtitle = settings.guarantee_subtitle || t('guarantee.subtitle');

  return (
    <div 
      className="flex items-center justify-center gap-3 mt-8 p-4 rounded-xl bg-primary/10 border border-primary/30 hover-lift hover-glow transition-all duration-300 group animate-fade-in-up" 
      style={{ animationDelay: '0.6s' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-primary transition-transform duration-300 group-hover:scale-110" />
      <div className={isRTL ? 'text-right' : 'text-left'}>
        <p className="font-bold text-foreground text-sm md:text-base">{title}</p>
        <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
};

export default GuaranteeBadge;
