/**
 * OrbShowcaseSection — "Your Living Avatar" — NFT-card style orb showcase
 */
import { motion } from 'framer-motion';
import { Dna, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { cn } from '@/lib/utils';

const traits = [
  { icon: Dna, keyEn: 'Identity DNA', keyHe: 'DNA זהות', color: 'text-fuchsia-400' },
  { icon: TrendingUp, keyEn: 'Growth Score', keyHe: 'ציון צמיחה', color: 'text-emerald-400' },
  { icon: Shield, keyEn: 'Resilience', keyHe: 'חוסן', color: 'text-cyan-400' },
  { icon: Sparkles, keyEn: 'Rarity Tier', keyHe: 'רמת נדירות', color: 'text-amber-400' },
];

export default function OrbShowcaseSection() {
  const { t, isRTL } = useTranslation();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 mb-6">
            <Dna className="h-4 w-4 text-fuchsia-400" />
            <span className="text-sm font-bold text-fuchsia-400">{t('home.orbShowcase.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-fuchsia-400 via-primary to-cyan-400 bg-clip-text text-transparent">
              {t('home.orbShowcase.title')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.orbShowcase.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* NFT Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto"
          >
            <div className="relative p-8 rounded-3xl bg-card/80 backdrop-blur-xl border-2 border-fuchsia-500/30 shadow-2xl shadow-fuchsia-500/10 max-w-[360px] mx-auto">
              {/* Holographic shimmer */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/10 to-fuchsia-500/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              />

              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-fuchsia-500/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <AuroraHoloOrb size={180} glow="full" />
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 mb-1">
                    {isRTL ? 'ארכיטיפ' : 'Archetype'}
                  </p>
                  <p className="text-xl font-black text-foreground">{isRTL ? 'נקסוס ירקן' : 'Jade Nexus'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{isRTL ? 'נדיר • Tier III' : 'Rare • Tier III'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  {traits.map((trait, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/30">
                      <trait.icon className={cn('h-3.5 w-3.5 shrink-0', trait.color)} />
                      <span className="text-[11px] font-medium text-foreground/80">
                        {isRTL ? trait.keyHe : trait.keyEn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {[
                { title: t('home.orbShowcase.evolveTitle'), desc: t('home.orbShowcase.evolveDesc') },
                { title: t('home.orbShowcase.dnaTitle'), desc: t('home.orbShowcase.dnaDesc') },
                { title: t('home.orbShowcase.nftTitle'), desc: t('home.orbShowcase.nftDesc') },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="p-4 rounded-2xl bg-card/60 backdrop-blur border border-border/50"
                >
                  <h3 className="text-base font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
