import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Lock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSubscriptionsModal } from "@/contexts/SubscriptionsModalContext";
import { TIER_CONFIGS } from "@/lib/subscriptionTiers";

interface UpgradePromptModalProps {
  feature: string | null;
  onDismiss: () => void;
}

interface FeatureMessage {
  he: string;
  en: string;
  targetTier?: "plus" | "pro";
}

const featureMessages: Record<string, FeatureMessage> = {
  aurora_limit: {
    he: "ניצלת את 5 ההודעות היומיות שלך לאורורה",
    en: "You've used your 5 daily Aurora messages",
    targetTier: "plus",
  },
  hypnosis: {
    he: "היפנוזה AI מותאמת אישית היא פיצ'ר Plus",
    en: "Personalized AI hypnosis is a Plus feature",
    targetTier: "plus",
  },
  habits: {
    he: "הגעת למקסימום ההרגלים בתוכנית החינמית",
    en: "You've reached the max habits on the free plan",
    targetTier: "plus",
  },
  nudges: {
    he: "נאדג'ים פרואקטיביים הם פיצ'ר Plus",
    en: "Proactive nudges are a Plus feature",
    targetTier: "plus",
  },
  core: {
    he: "הליבה זמינה למנויי Pro",
    en: "The Core hub requires a Pro subscription",
    targetTier: "pro",
  },
  arena: {
    he: "הזירה זמינה למנויי Pro",
    en: "The Arena hub requires a Pro subscription",
    targetTier: "pro",
  },
  projects: {
    he: "מודול הפרויקטים זמין למנויי Pro",
    en: "The Projects module requires a Pro subscription",
    targetTier: "pro",
  },
  default: {
    he: "פיצ'ר זה זמין למנויים בתשלום",
    en: "This feature is available for paid subscribers",
    targetTier: "plus",
  },
};

const UpgradePromptModal = ({ feature, onDismiss }: UpgradePromptModalProps) => {
  const { openSubscriptions } = useSubscriptionsModal();
  const { language } = useTranslation();
  const isRTL = language === "he";

  if (!feature) return null;

  const config = featureMessages[feature] || featureMessages.default;
  const message = isRTL ? config.he : config.en;
  const target = config.targetTier || "plus";
  const tierConfig = TIER_CONFIGS[target];
  const pricing = isRTL ? `₪${tierConfig.priceILS}/חודש` : `$${tierConfig.priceUSD}/month`;
  const label = tierConfig.label;

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
            {isRTL ? `שדרג עכשיו — ${pricing}` : `Upgrade now — ${pricing}`}
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
