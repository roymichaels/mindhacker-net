import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Target, Briefcase, BarChart3, Landmark, ShoppingCart, Lock, ArrowRight, Crown, Sparkles, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

const STEPS = [
  {
    icon: Gem,
    titleEn: 'Your Skills Have Value',
    titleHe: 'לכישורים שלך יש ערך',
    bodyEn: 'Your skills, data, and time have real value. FM lets you earn MOS points by contributing to the MindOS community.',
    bodyHe: 'הכישורים, הנתונים והזמן שלך שווים כסף אמיתי. FM מאפשר לך להרוויח נקודות MOS על ידי תרומה לקהילת MindOS.',
  },
  {
    icon: Crown,
    titleEn: 'Three Ways to Earn',
    titleHe: 'שלוש דרכים להרוויח',
    items: [
      { icon: Target, en: 'Complete Bounties — quick tasks, clear rewards', he: 'השלם באונטיז — משימות מהירות, תגמול ברור' },
      { icon: Briefcase, en: 'Offer Your Skills — freelance for the community', he: 'הצע את הכישורים שלך — פרילנס לקהילה' },
      { icon: BarChart3, en: 'Share Insights — anonymous data = MOS points', he: 'שתף תובנות — נתונים אנונימיים = נקודות MOS' },
    ],
  },
  {
    icon: Coins,
    titleEn: 'Cash Out Your Way',
    titleHe: 'משוך כסף בדרך שלך',
    items: [
      { icon: Landmark, en: 'Withdraw to your bank', he: 'משיכה לחשבון הבנק' },
      { icon: ShoppingCart, en: 'Spend on courses & coaching', he: 'רכישת קורסים ואימון' },
      { icon: Lock, en: 'Save & grow over time', he: 'חסוך והגדל עם הזמן' },
    ],
    footerEn: "You're in control. Always.",
    footerHe: 'אתה בשליטה. תמיד.',
  },
];

interface Props {
  onFinish: () => void;
}

export function FMOnboarding({ onFinish }: Props) {
  const [step, setStep] = useState(0);
  const { language } = useTranslation();
  const isHe = language === 'he';
  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-amber-950/98 via-background/98 to-background/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="relative rounded-2xl p-8 text-center space-y-6 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-background overflow-hidden"
          >
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-500/20 rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-500/20 rounded-br-2xl pointer-events-none" />

            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/25">
              <current.icon className="w-8 h-8 text-amber-100" />
            </div>

            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {isHe ? current.titleHe : current.titleEn}
            </h2>

            {'bodyEn' in current && (
              <p className="text-muted-foreground leading-relaxed">
                {isHe ? current.bodyHe : current.bodyEn}
              </p>
            )}

            {'items' in current && current.items && (
              <div className="space-y-3 text-start">
                {current.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-muted-foreground text-sm mt-1">{isHe ? item.he : item.en}</span>
                  </div>
                ))}
              </div>
            )}

            {'footerEn' in current && (
              <p className="text-sm font-bold text-amber-300/80">
                {isHe ? current.footerHe : current.footerEn}
              </p>
            )}

            {/* Dots */}
            <div className="flex justify-center gap-2 pt-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'w-2 bg-amber-500/20'}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center pt-2">
              {step > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)} className="text-amber-300/70 hover:text-amber-200">
                  {isHe ? 'חזרה' : 'Back'}
                </Button>
              )}
              {step < 2 ? (
                <Button onClick={() => setStep(s => s + 1)} className="gap-1 bg-gradient-to-r from-amber-500 to-orange-600 text-amber-100 hover:from-amber-400 hover:to-orange-500 border-0 font-bold shadow-lg shadow-amber-500/20">
                  {isHe ? 'הבא' : 'Next'} <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={onFinish} className="gap-1 bg-gradient-to-r from-amber-500 to-orange-600 text-amber-100 hover:from-amber-400 hover:to-orange-500 border-0 font-bold shadow-lg shadow-amber-500/20">
                  {isHe ? 'כניסה ל-FM' : 'Enter FM'} <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
