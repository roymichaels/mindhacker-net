import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, Zap, Crown } from "lucide-react";

interface PromoUpgradeModalProps {
  open: boolean;
  onDismiss: () => void;
}

const PromoUpgradeModal = ({ open, onDismiss }: PromoUpgradeModalProps) => {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const isHe = language === "he";

  const handleClaim = () => {
    onDismiss();
    navigate("/subscriptions");
  };

  const features = isHe
    ? [
        "בונה תוכניות AI למתאמנים",
        "ניהול מתאמנים מלא",
        "חנות דיגיטלית למכירת שירותים",
        "הודעות ללא הגבלה לאורורה",
        "היפנוזה AI מותאמת אישית יומית",
        "נאדג׳ים פרואקטיביים",
        "הרגלים ורשימות ללא הגבלה",
        "תוכנית 90 יום מלאה",
      ]
    : [
        "AI Plan Builder for clients",
        "Full client management",
        "Digital storefront for services",
        "Unlimited Aurora messages",
        "Daily personalized AI hypnosis",
        "Proactive coaching nudges",
        "Unlimited habits & checklists",
        "Full 90-day transformation plan",
      ];

  const freeLimit = isHe
    ? ["5 הודעות ביום", "3 הרגלים בלבד", "ללא כלי מאמן"]
    : ["5 messages/day", "Only 3 habits", "No coach tools"];

  const originalPrice = isHe ? "₪347" : "$97";
  const salePrice = isHe ? "₪179" : "$49";

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={(v) => !v && onDismiss()}>
          <DialogContent
            className="max-w-md w-[95vw] p-0 border-0 overflow-hidden rounded-3xl bg-transparent shadow-2xl [&>button]:hidden"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden"
            >
              {/* Glow effects */}
              <div className="absolute -top-20 -end-20 w-60 h-60 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -start-20 w-60 h-60 rounded-full bg-[hsl(var(--primary-glow))]/20 blur-3xl pointer-events-none" />

              {/* Floating sparkles */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute top-6 end-8 text-yellow-400/70"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0], rotate: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-16 start-6 text-primary/60"
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>

              <div className="relative z-10 p-6 pt-8 flex flex-col items-center text-center gap-5">
                {/* Badge */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-950 font-extrabold text-sm px-5 py-2 rounded-full shadow-lg shadow-yellow-500/30"
                >
                  <Zap className="w-4 h-4" />
                  {isHe ? "50% הנחה — לזמן מוגבל" : "50% OFF — LIMITED TIME"}
                  <Zap className="w-4 h-4" />
                </motion.div>

                {/* Crown icon */}
                <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30">
                  <Crown className="w-8 h-8 text-primary" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold leading-tight">
                  {isHe ? "הפכו למאמנים מקצועיים" : "Become a Pro Coach"}
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-muted-foreground/60 line-through text-lg">
                    {originalPrice}
                    <span className="text-xs">/{isHe ? "חודש" : "mo"}</span>
                  </span>
                  <span className="text-4xl font-black bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">
                    {salePrice}
                  </span>
                  <span className="text-muted-foreground text-sm">/{isHe ? "חודש" : "mo"}</span>
                </div>

                {/* Features */}
                <div className="w-full space-y-2 text-start">
                  {features.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.25 + i * 0.07 }}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      {f}
                    </motion.div>
                  ))}

                  <div className="border-t border-white/10 my-2" />

                  {freeLimit.map((f, i) => (
                    <div key={`free-${i}`} className="flex items-center gap-2.5 text-sm text-muted-foreground/60">
                      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 text-red-400" />
                      </div>
                      <span className="line-through">{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="w-full space-y-2.5 pt-1">
                  <Button
                    onClick={handleClaim}
                    className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-primary via-primary to-[hsl(var(--primary-glow))] shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                  >
                    <Sparkles className="w-4 h-4 me-1.5" />
                    {isHe ? "לקבל את ההנחה" : "Claim My Discount"}
                  </Button>
                  <button
                    onClick={onDismiss}
                    className="w-full text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors py-2"
                  >
                    {isHe ? "אולי אחר כך" : "Maybe Later"}
                  </button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default PromoUpgradeModal;
