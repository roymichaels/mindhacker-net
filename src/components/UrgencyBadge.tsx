import { useState, useEffect } from "react";
import { Clock, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

interface UrgencyBadgeProps {
  spotsLeft?: number;
  variant?: "inline" | "floating";
}

const UrgencyBadge = ({ spotsLeft: initialSpots, variant = "inline" }: UrgencyBadgeProps) => {
  const [spotsLeft, setSpotsLeft] = useState(initialSpots ?? 3);
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    if (initialSpots !== undefined) return; // Use prop if provided

    const fetchSpots = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "spots_available")
        .maybeSingle();

      if (data?.setting_value) {
        setSpotsLeft(parseInt(data.setting_value) || 3);
      }
    };

    fetchSpots();
  }, [initialSpots]);

  if (variant === "floating") {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/20 border border-destructive/40 text-destructive text-sm animate-attention-pulse">
        <Flame className="w-4 h-4" />
        <span className="font-semibold">{t('urgencyBadge.spotsAvailableThisWeek').replace('{count}', String(spotsLeft))}</span>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="inline-flex items-center gap-2 text-accent text-sm mt-4 animate-fade-in-up group">
      <Clock className="w-4 h-4 transition-transform group-hover:rotate-12" />
      <span className="font-medium relative">
        {t('urgencyBadge.spotsAvailableOnly').replace('{count}', String(spotsLeft))}
      </span>
    </div>
  );
};

export default UrgencyBadge;
