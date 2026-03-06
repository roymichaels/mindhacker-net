/**
 * TraitShowcaseSection — NFT-style trait cards grid
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Shield, Crosshair, Flame, Eye, Brain, Crown, Zap, Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TRAITS = [
  { name: 'Resilience', nameHe: 'חוסן', icon: Shield, glow: 'from-emerald-500/30 border-emerald-500/40 shadow-emerald-500/20' },
  { name: 'Focus', nameHe: 'מיקוד', icon: Crosshair, glow: 'from-cyan-500/30 border-cyan-500/40 shadow-cyan-500/20' },
  { name: 'Discipline', nameHe: 'משמעת', icon: Flame, glow: 'from-red-500/30 border-red-500/40 shadow-red-500/20' },
  { name: 'Awareness', nameHe: 'מודעות', icon: Eye, glow: 'from-fuchsia-500/30 border-fuchsia-500/40 shadow-fuchsia-500/20' },
  { name: 'Creativity', nameHe: 'יצירתיות', icon: Brain, glow: 'from-indigo-500/30 border-indigo-500/40 shadow-indigo-500/20' },
  { name: 'Charisma', nameHe: 'כריזמה', icon: Crown, glow: 'from-purple-500/30 border-purple-500/40 shadow-purple-500/20' },
  { name: 'Drive', nameHe: 'דחף', icon: Zap, glow: 'from-amber-500/30 border-amber-500/40 shadow-amber-500/20' },
  { name: 'Empathy', nameHe: 'אמפתיה', icon: Heart, glow: 'from-rose-500/30 border-rose-500/40 shadow-rose-500/20' },
];

export default function TraitShowcaseSection() {
  const { isRTL } = useTranslation();

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      {/* Glow particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 rounded-full bg-primary/5 blur-[100px]"
          style={{ left: `${20 + i * 30}%`, top: `${30 + (i % 2) * 20}%` }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5 + i, repeat: Infinity }}
        />
      ))}

      <div className="container mx-auto max-w-4xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isRTL ? 'הדמות שלך. ה-NFT שלך.' : 'Your Character. Your NFT.'}
            </span>
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            {isRTL ? 'זהות שמתפתחת — לא צ׳קליסט' : 'Identity that evolves — not a checklist'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {TRAITS.map((trait, i) => {
            const Icon = trait.icon;
            return (
              <motion.div
                key={trait.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.06, y: -6 }}
                className={cn(
                  'relative aspect-square rounded-2xl border bg-gradient-to-br from-card/90 to-card/50',
                  'flex flex-col items-center justify-center gap-3 cursor-default',
                  'backdrop-blur-sm transition-shadow duration-300',
                  'hover:shadow-xl',
                  trait.glow
                )}
              >
                {/* Glow behind icon */}
                <motion.div
                  className="absolute w-12 h-12 rounded-full bg-primary/10 blur-xl"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                />
                <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-foreground/80 relative z-10" />
                <span className="text-xs sm:text-sm font-black text-foreground/90 relative z-10">
                  {isRTL ? trait.nameHe : trait.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
