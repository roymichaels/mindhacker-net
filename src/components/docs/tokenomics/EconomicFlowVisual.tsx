import { motion } from 'framer-motion';
import { TrendingUp, ShoppingCart, Percent, Gift } from 'lucide-react';

interface Props {
  isHe: boolean;
}

const steps = [
  { icon: TrendingUp, colorClass: 'from-[hsl(160,70%,45%)] to-[hsl(160,70%,35%)]', enLabel: 'Earn', heLabel: 'הרוויח', enDesc: 'Growth & work', heDesc: 'צמיחה ועבודה' },
  { icon: ShoppingCart, colorClass: 'from-primary to-[hsl(204,88%,43%)]', enLabel: 'Use', heLabel: 'השתמש', enDesc: 'Payments & features', heDesc: 'תשלומים ותכונות' },
  { icon: Percent, colorClass: 'from-[hsl(270,70%,60%)] to-[hsl(270,70%,50%)]', enLabel: 'Fee', heLabel: 'עמלה', enDesc: 'System layer (2%)', heDesc: 'שכבת מערכת (2%)' },
  { icon: Gift, colorClass: 'from-[hsl(45,90%,55%)] to-[hsl(45,90%,45%)]', enLabel: 'Rewards', heLabel: 'תגמולים', enDesc: 'Back to users', heDesc: 'חזרה למשתמשים' },
];

export function EconomicFlowVisual({ isHe }: Props) {
  return (
    <div className="relative rounded-xl border border-border bg-card/50 p-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {steps.map((step, i) => (
          <div key={step.enLabel} className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.colorClass} flex items-center justify-center shadow-lg`}>
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-foreground">{isHe ? step.heLabel : step.enLabel}</span>
              <span className="text-[10px] text-muted-foreground text-center max-w-[80px]">{isHe ? step.heDesc : step.enDesc}</span>
            </motion.div>

            {i < steps.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: i * 0.1 + 0.15 }}
                viewport={{ once: true }}
                className="w-6 h-px bg-gradient-to-r from-primary/60 to-primary/20 hidden sm:block"
              />
            )}
          </div>
        ))}
      </div>
      {/* Loop arrow hint */}
      <div className="flex justify-center mt-3">
        <span className="text-[10px] text-muted-foreground/60 tracking-wider">
          {isHe ? '← מחזור מתמשך →' : '← Continuous Cycle →'}
        </span>
      </div>
    </div>
  );
}
