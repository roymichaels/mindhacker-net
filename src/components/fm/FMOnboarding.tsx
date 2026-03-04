import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Target, Briefcase, BarChart3, Landmark, ShoppingCart, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

const STEPS = [
  {
    icon: Coins,
    titleEn: 'Your Skills Have Value',
    titleHe: 'לכישורים שלך יש ערך',
    bodyEn: 'Your skills, data, and time have real value. FM lets you earn MOS points by contributing to the MindOS community.',
    bodyHe: 'הכישורים, הנתונים והזמן שלך שווים כסף אמיתי. FM מאפשר לך להרוויח נקודות MOS על ידי תרומה לקהילת MindOS.',
  },
  {
    icon: Target,
    titleEn: 'Three Ways to Earn',
    titleHe: 'שלוש דרכים להרוויח',
    items: [
      { icon: Target, en: 'Complete Bounties — quick tasks, clear rewards', he: 'השלם באונטיז — משימות מהירות, תגמול ברור' },
      { icon: Briefcase, en: 'Offer Your Skills — freelance for the community', he: 'הצע את הכישורים שלך — פרילנס לקהילה' },
      { icon: BarChart3, en: 'Share Insights — anonymous data = MOS points', he: 'שתף תובנות — נתונים אנונימיים = נקודות MOS' },
    ],
  },
  {
    icon: Landmark,
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
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="bg-card border border-border rounded-2xl p-8 text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center">
              <current.icon className="w-8 h-8 text-accent" />
            </div>

            <h2 className="text-2xl font-bold text-foreground">
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
                  <div key={i} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-muted-foreground text-sm">{isHe ? item.he : item.en}</span>
                  </div>
                ))}
              </div>
            )}

            {'footerEn' in current && (
              <p className="text-sm font-medium text-foreground/80">
                {isHe ? current.footerHe : current.footerEn}
              </p>
            )}

            {/* Dots */}
            <div className="flex justify-center gap-2 pt-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-accent' : 'bg-muted'}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center pt-2">
              {step > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)}>
                  {isHe ? 'חזרה' : 'Back'}
                </Button>
              )}
              {step < 2 ? (
                <Button onClick={() => setStep(s => s + 1)} className="gap-1">
                  {isHe ? 'הבא' : 'Next'} <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={onFinish} className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
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
