import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

interface UpgradePromptModalProps {
  feature: string | null;
  onDismiss: () => void;
}

const featureMessages: Record<string, { he: string; en: string }> = {
  aurora_limit: {
    he: "ניצלת את 5 ההודעות היומיות שלך לאורורה",
    en: "You've used your 5 daily Aurora messages",
  },
  plan: {
    he: "מנוע התכנון ל-90 יום הוא פיצ'ר Pro",
    en: "The 90-day plan engine is a Pro feature",
  },
  hypnosis: {
    he: "ספריית ההיפנוזה היא פיצ'ר Pro",
    en: "The hypnosis library is a Pro feature",
  },
  habits: {
    he: "הגעת למקסימום ההרגלים בתוכנית החינמית",
    en: "You've reached the max habits on the free plan",
  },
  nudges: {
    he: "נאדג'ים פרואקטיביים הם פיצ'ר Pro",
    en: "Proactive nudges are a Pro feature",
  },
  default: {
    he: "פיצ'ר זה זמין למנויי Pro",
    en: "This feature is available for Pro subscribers",
  },
};

const UpgradePromptModal = ({ feature, onDismiss }: UpgradePromptModalProps) => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isRTL = language === "he";

  if (!feature) return null;

  const messages = featureMessages[feature] || featureMessages.default;
  const message = isRTL ? messages.he : messages.en;

  const handleUpgrade = () => {
    onDismiss();
    navigate("/subscriptions");
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
            {isRTL ? "שדרג ל-Pro" : "Upgrade to Pro"}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleUpgrade} className="w-full" size="lg">
            <Zap className="h-4 w-4 mr-2" />
            {isRTL ? "שדרג עכשיו — ₪97/חודש" : "Upgrade now — $27/month"}
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
