import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { X, Gift, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "progressive_engagement_shown";

export const ProgressiveEngagement = () => {
  const { theme } = useThemeSettings();
  const { t, isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<"welcome" | "offer">("welcome");

  useEffect(() => {
    // Check if already shown this session
    const shown = sessionStorage.getItem(STORAGE_KEY);
    if (shown) return;

    // Show after 15 seconds of engagement
    const timer = setTimeout(() => {
      setIsVisible(true);
      sessionStorage.setItem(STORAGE_KEY, "true");
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleStartJourney = () => {
    setIsVisible(false);
    const formId = theme.introspection_form_id || "45dfc6a5-6f98-444b-a3dd-2c0dd1ca3308";
    navigate(`/form/${formId}`);
  };

  const handleNext = () => {
    setStep("offer");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="glass-panel p-6 sm:p-8 max-w-md w-full relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 end-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>

          <AnimatePresence mode="wait">
            {step === "welcome" ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                className="text-center relative z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center"
                >
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-4 cyber-glow">
                  {t('progressiveEngagement.welcomeTitle')}
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  {t('progressiveEngagement.welcomeMessage')}
                </p>

                <Button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 gap-2"
                >
                  {t('progressiveEngagement.discoverGift')}
                  <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
                
                <button
                  onClick={handleClose}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('progressiveEngagement.maybeLater')}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="offer"
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                className="text-center relative z-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center animate-gift-bounce"
                >
                  <Gift className="h-8 w-8 text-accent-foreground" />
                </motion.div>
                
                <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium mb-4">
                  {t('progressiveEngagement.freeGiftBadge')}
                </div>
                
                <h2 className="text-2xl font-bold mb-4 cyber-glow">
                  {t('progressiveEngagement.giftTitle')}
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  {t('progressiveEngagement.giftDescription')}
                </p>

                <div className="space-y-3 mb-6 text-start">
                  {['benefit1', 'benefit2', 'benefit3'].map((key, i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-muted-foreground">
                        {t(`progressiveEngagement.${key}`)}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <Button
                  onClick={handleStartJourney}
                  className="w-full bg-gradient-to-r from-accent to-yellow-500 text-accent-foreground hover:opacity-90 font-bold gap-2"
                  size="lg"
                >
                  <Gift className="h-5 w-5" />
                  {t('progressiveEngagement.claimGift')}
                </Button>
                
                <p className="mt-4 text-xs text-muted-foreground">
                  {t('progressiveEngagement.noSpam')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProgressiveEngagement;
