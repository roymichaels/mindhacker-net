import { Lock, Zap, Crown, Check, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { useSubscriptionsModal } from '@/contexts/SubscriptionsModalContext';
import { TIER_FEATURES, TIER_CONFIGS } from '@/lib/subscriptionTiers';
import { motion } from 'framer-motion';

interface ProGateOverlayProps {
  feature: string;
  className?: string;
}

const ProGateOverlay = ({ feature, className }: ProGateOverlayProps) => {
  const { openSubscriptions } = useSubscriptionsModal();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const contextMessages: Record<string, { he: string; en: string }> = {
    projects: {
      he: 'מודול הפרויקטים הוא חלק מחבילת Pro',
      en: 'The Projects module is part of the Pro package',
    },
    core: {
      he: 'הליבה — מנוע הפיתוח הפנימי שלך',
      en: 'Core — Your internal development engine',
    },
    arena: {
      he: 'הזירה — מנוע ההשפעה החיצונית שלך',
      en: 'Arena — Your external impact engine',
    },
    hypnosis: {
      he: 'היפנוזה AI מותאמת אישית כל יום',
      en: 'Personalized AI hypnosis every day',
    },
    default: {
      he: 'שחרר את הפוטנציאל המלא של המערכת',
      en: 'Unlock the full potential of the system',
    },
  };

  const msg = contextMessages[feature] || contextMessages.default;
  const features = isHe ? TIER_FEATURES.pro.he : TIER_FEATURES.pro.en;
  const proFeatures = features.filter(f => f !== (isHe ? 'הכל מ-Free' : 'Everything in Free'));

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-0 p-0 rounded-2xl overflow-hidden',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Premium gradient card */}
      <div className="relative w-full rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(270 60% 12%) 0%, hsl(280 50% 8%) 30%, hsl(40 60% 10%) 70%, hsl(35 70% 14%) 100%)',
        }}
      >
        {/* Subtle glow overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full bg-purple-500/10 blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-[200px] h-[200px] rounded-full bg-amber-500/10 blur-[60px]" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(270 70% 50%), hsl(40 80% 55%))' }}
            >
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {isHe ? 'שדרג ל-Pro' : 'Upgrade to Pro'}
            </h2>
            <p className="text-sm text-white/60 max-w-xs mx-auto">
              {isHe ? msg.he : msg.en}
            </p>
          </motion.div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            {proFeatures.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isRTL ? 8 : -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, hsl(270 70% 50%), hsl(40 80% 55%))' }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-white/80 font-medium">{feat}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center space-y-1"
          >
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-3xl font-black text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, hsl(270 70% 65%), hsl(40 80% 65%))' }}
              >
                {isHe ? `₪${TIER_CONFIGS.pro.priceILS}` : `$${TIER_CONFIGS.pro.priceUSD}`}
              </span>
              <span className="text-sm text-white/40">/{isHe ? 'חודש' : 'mo'}</span>
            </div>
            {TIER_CONFIGS.pro.trial && (
              <p className="text-xs font-medium text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, hsl(270 70% 65%), hsl(40 80% 65%))' }}
              >
                {isHe ? `${TIER_CONFIGS.pro.trial} ימי ניסיון חינם` : `${TIER_CONFIGS.pro.trial}-day free trial`}
              </p>
            )}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={openSubscriptions}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, hsl(270 70% 50%), hsl(310 60% 45%), hsl(40 80% 50%))' }}
            >
              <Sparkles className="w-4 h-4" />
              {isHe ? 'שדרג עכשיו' : 'Upgrade Now'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProGateOverlay;
