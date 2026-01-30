import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Phase } from '@/hooks/useLaunchpadProgress';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, Check, ArrowRight } from 'lucide-react';

interface PhaseTransitionProps {
  completedPhase: Phase;
  nextPhase?: Phase;
  onContinue: () => void;
  className?: string;
}

export function PhaseTransition({ completedPhase, nextPhase, onContinue, className }: PhaseTransitionProps) {
  const { language, isRTL } = useTranslation();

  const phaseColors = {
    1: {
      bg: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/30',
      text: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
    2: {
      bg: 'from-amber-500/20 to-amber-600/10',
      border: 'border-amber-500/30',
      text: 'text-amber-500',
      button: 'bg-amber-500 hover:bg-amber-600',
    },
    3: {
      bg: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-500',
      button: 'bg-emerald-500 hover:bg-emerald-600',
    },
  };

  const completedColors = phaseColors[completedPhase.id as 1 | 2 | 3];
  const nextColors = nextPhase ? phaseColors[nextPhase.id as 1 | 2 | 3] : null;

  const getCompletionMessage = () => {
    switch (completedPhase.id) {
      case 1:
        return {
          he: 'הכרנו אותך!',
          en: 'We know you!',
          subHe: 'למדנו על מי אתה היום. עכשיו בוא נראה מה צריך לשנות.',
          subEn: 'We learned about who you are today. Now let\'s see what needs to change.',
        };
      case 2:
        return {
          he: 'זיהינו את החסמים!',
          en: 'Blockers identified!',
          subHe: 'הבנו מה מעכב אותך. עכשיו נבנה את מי שאתה רוצה להיות.',
          subEn: 'We understand what\'s holding you back. Now let\'s build who you want to be.',
        };
      case 3:
        return {
          he: 'המסע מתחיל!',
          en: 'The journey begins!',
          subHe: 'הזהות החדשה שלך מוכנה. Aurora תלווה אותך בכל צעד.',
          subEn: 'Your new identity is ready. Aurora will guide you every step.',
        };
      default:
        return { he: '', en: '', subHe: '', subEn: '' };
    }
  };

  const message = getCompletionMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "min-h-[60vh] flex flex-col items-center justify-center p-6",
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md w-full text-center space-y-8">
        {/* Completed phase celebration */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "relative p-8 rounded-2xl bg-gradient-to-br border",
            completedColors.bg,
            completedColors.border
          )}
        >
          {/* Sparkles */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute -top-4 -right-4"
          >
            <Sparkles className={cn("w-8 h-8", completedColors.text)} />
          </motion.div>
          
          {/* Check icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={cn(
              "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4",
              completedPhase.id === 1 && "bg-blue-500",
              completedPhase.id === 2 && "bg-amber-500",
              completedPhase.id === 3 && "bg-emerald-500"
            )}
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">
            {language === 'he' ? message.he : message.en}
          </h2>
          <p className="text-muted-foreground">
            {language === 'he' ? message.subHe : message.subEn}
          </p>

          {/* Phase summary */}
          <div className="mt-6 p-4 bg-background/50 rounded-lg">
            <p className="text-sm font-medium mb-1">
              {language === 'he' ? `פאזה ${completedPhase.id} הושלמה` : `Phase ${completedPhase.id} completed`}
            </p>
            <p className={cn("text-lg font-bold", completedColors.text)}>
              {language === 'he' ? completedPhase.title : completedPhase.titleEn}
            </p>
          </div>
        </motion.div>

        {/* Next phase preview */}
        {nextPhase && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="h-px w-8 bg-muted" />
              <span className="text-sm">{language === 'he' ? 'הבא' : 'Next'}</span>
              <div className="h-px w-8 bg-muted" />
            </div>

            <div className={cn(
              "p-6 rounded-xl bg-gradient-to-br border",
              nextColors?.bg,
              nextColors?.border
            )}>
              <div className="text-4xl mb-3">{nextPhase.icon}</div>
              <h3 className={cn("text-xl font-bold mb-1", nextColors?.text)}>
                {language === 'he' ? nextPhase.title : nextPhase.titleEn}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'he' ? nextPhase.description : nextPhase.descriptionEn}
              </p>
            </div>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={onContinue}
            size="lg"
            className={cn(
              "w-full text-white gap-2",
              nextColors?.button || completedColors.button
            )}
          >
            {language === 'he' ? 'המשך' : 'Continue'}
            {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PhaseTransition;
