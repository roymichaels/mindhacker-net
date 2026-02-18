import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Lock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSubscriptionsModal } from "@/contexts/SubscriptionsModalContext";

interface UpgradePromptModalProps {
  feature: string | null;
  onDismiss: () => void;
}

interface FeatureMessage {
  he: string;
  en: string;
  /** Which tier is needed to unlock this feature */
  targetTier?: "pro" | "coach" | "business";
}

const featureMessages: Record<string, FeatureMessage> = {
  aurora_limit: {
    he: "ניצלת את 5 ההודעות היומיות שלך לאורורה",
    en: "You've used your 5 daily Aurora messages",
    targetTier: "pro",
  },
  plan: {
    he: "מנוע התכנון ל-90 יום הוא פיצ'ר Pro",
    en: "The 90-day plan engine is a Pro feature",
    targetTier: "pro",
  },
  hypnosis: {
    he: "היפנוזה AI מותאמת אישית היא פיצ'ר Pro",
    en: "Personalized AI hypnosis is a Pro feature",
    targetTier: "pro",
  },
  habits: {
    he: "הגעת למקסימום ההרגלים בתוכנית החינמית",
    en: "You've reached the max habits on the free plan",
    targetTier: "pro",
  },
  nudges: {
    he: "נאדג'ים פרואקטיביים הם פיצ'ר Pro",
    en: "Proactive nudges are a Pro feature",
    targetTier: "pro",
  },
  coach: {
    he: "כלי המאמן זמינים למנויי Coach ומעלה",
    en: "Coaching tools require a Coach subscription or higher",
    targetTier: "coach",
  },
  coaches: {
    he: "נוכחות בשוק המאמנים דורשת מנוי Coach",
    en: "Coach listing requires a Coach subscription",
    targetTier: "coach",
  },
  business: {
    he: "המרכז העסקי זמין למנויי Business",
    en: "The business hub requires a Business subscription",
    targetTier: "business",
  },
  website_builder: {
    he: "בונה האתרים זמין למנויי Business",
    en: "Website builder requires a Business subscription",
    targetTier: "business",
  },
  default: {
    he: "פיצ'ר זה זמין למנויים בתשלום",
    en: "This feature is available for paid subscribers",
    targetTier: "pro",
  },
};

const tierPricing: Record<string, { en: string; he: string }> = {
  pro: { en: "$49/month", he: "₪179/חודש" },
  coach: { en: "$79/month", he: "₪289/חודש" },
  business: { en: "$129/month", he: "₪469/חודש" },
};

const tierLabels: Record<string, { en: string; he: string }> = {
  pro: { en: "Pro", he: "Pro" },
  coach: { en: "Coach", he: "מאמן" },
  business: { en: "Business", he: "עסקי" },
};

const UpgradePromptModal = ({ feature, onDismiss }: UpgradePromptModalProps) => {
  const { openSubscriptions } = useSubscriptionsModal();
  const { language } = useTranslation();
  const isRTL = language === "he";

  if (!feature) return null;

  const config = featureMessages[feature] || featureMessages.default;
  const message = isRTL ? config.he : config.en;
  const target = config.targetTier || "pro";
  const pricing = tierPricing[target];
  const label = tierLabels[target];

  const handleUpgrade = () => {
    onDismiss();
    openSubscriptions();
  };

  return (
    <Dialog open={!!feature} onOpenChange={() => onDismiss()}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/20 p-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {isRTL ? `שדרג ל-${label.he}` : `Upgrade to ${label.en}`}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleUpgrade} className="w-full" size="lg">
            <Zap className="h-4 w-4 mr-2" />
            {isRTL
              ? `שדרג עכשיו — ${pricing.he}`
              : `Upgrade now — ${pricing.en}`}
          </Button>
          <Button variant="ghost" onClick={onDismiss} className="w-full">
            {isRTL ? "אחר כך" : "Maybe later"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePromptModal;
