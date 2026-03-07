/**
 * PlanCinematicSection — Cinematic AI plan generation sequence
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Orb } from '@/components/orb/Orb';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import { Dumbbell, Brain, TrendingUp, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const PILLARS = [
  { icon: Dumbbell, labelEn: 'Power', labelHe: 'כוח', color: 'text-red-400' },
  { icon: Brain, labelEn: 'Mind', labelHe: 'מוח', color: 'text-indigo-400' },
  { icon: TrendingUp, labelEn: 'Wealth', labelHe: 'עושר', color: 'text-emerald-400' },
  { icon: Heart, labelEn: 'Soul', labelHe: 'נשמה', color: 'text-rose-400' },
];

export default function PlanCinematicSection() {
  const { isRTL } = useTranslation();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      {/* Scan lines */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.03) 2px, hsl(var(--primary) / 0.03) 4px)`,
        }}
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="container mx-auto max-w-3xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-10">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isRTL ? 'תוכנית האימפריה שלך' : 'Your Empire Blueprint'}
              </span>
            </h2>
          </motion.div>

          {/* Orb with emanating rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex justify-center"
          >
            <div className="relative">
              {/* Scan emanation rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute rounded-full border border-primary/20"
                  style={{
                    width: 120 + ring * 60,
                    height: 120 + ring * 60,
                    left: `calc(50% - ${(120 + ring * 60) / 2}px)`,
                    top: `calc(50% - ${(120 + ring * 60) / 2}px)`,
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0, 0.4],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: ring * 0.4,
                  }}
                />
              ))}
              <motion.div
                className="absolute w-40 h-40 rounded-full bg-primary/15 blur-[60px]"
                style={{ left: 'calc(50% - 80px)', top: 'calc(50% - 80px)' }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <Orb profile={DEFAULT_ORB_PROFILE} size={120} state="breathing" renderer="css" showGlow />
            </div>
          </motion.div>

          {/* Pillars lighting up */}
          <div className="flex justify-center gap-6 sm:gap-10">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.labelEn}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.2 }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    className={cn(
                      'w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-border/50',
                      'bg-card/80 flex items-center justify-center'
                    )}
                    animate={{
                      boxShadow: [
                        '0 0 0px transparent',
                        '0 0 20px hsl(var(--primary) / 0.3)',
                        '0 0 0px transparent',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  >
                    <Icon className={cn('h-6 w-6', p.color)} />
                  </motion.div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {isRTL ? p.labelHe : p.labelEn}
                    </span>
                </motion.div>
              );
            })}
          </div>

          {/* Plan card materializing */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="relative mx-auto max-w-sm p-6 rounded-2xl border border-primary/30
              bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative z-10 space-y-2">
              <p className="text-xs font-mono text-primary uppercase tracking-widest">
                {isRTL ? 'סטטוס' : 'Status'}
              </p>
              <p className="text-lg sm:text-xl font-black text-foreground">
                {isRTL ? 'מסלול כיבוש 100 יום — נוצר ✓' : '100-Day Conquest Path — Generated ✓'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'AI סורק את ה-DNA שלך. בונה את האימפריה. אתה רק משחק.' : 'AI scans your DNA. Builds your empire. You just play.'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
