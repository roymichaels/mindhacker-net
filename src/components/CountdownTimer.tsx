import { useState, useEffect } from "react";
import { Gift, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

const CountdownTimer = () => {
  const { t, isRTL } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [promoText, setPromoText] = useState("");
  const [promoSubtext, setPromoSubtext] = useState("");

  useEffect(() => {
    const fetchPromoSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["promo_enabled", "promo_text", "promo_subtext"]);

      if (data) {
        const settings = data.reduce((acc: any, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {});

        const isEnabled = settings.promo_enabled !== "false";
        setEnabled(isEnabled);
        
        if (settings.promo_text) {
          setPromoText(settings.promo_text);
        }
        if (settings.promo_subtext) {
          setPromoSubtext(settings.promo_subtext);
        }
      }
      setLoading(false);
    };

    fetchPromoSettings();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-4 md:p-6 mb-8 text-center animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  if (!enabled) {
    return null;
  }

  return (
    <div className="glass-panel p-4 md:p-6 mb-8 text-center animate-fade-in border-accent/40" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-center gap-2 mb-3">
        <Gift className="w-6 h-6 text-accent animate-pulse" />
        <h3 className="text-xl md:text-2xl font-bold text-foreground cyber-glow">
          {promoText}
        </h3>
        <Sparkles className="w-5 h-5 text-accent animate-pulse" />
      </div>
      
      <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
        {promoSubtext}
      </p>
      
      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1 bg-accent/20 text-accent font-medium px-3 py-1 rounded-full">
          ✨ {t('countdown.noCatchBadge')}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
