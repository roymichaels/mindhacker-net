/**
 * Play2EarnSection — "Proof of Growth" — FM economy, wallet, mining
 */
import { motion } from 'framer-motion';
import { Coins, Pickaxe, ShoppingBag, Wallet } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const miningActions = [
  { action: 'Hypnosis Session', mos: 10, actionHe: 'סשן היפנוזה' },
  { action: 'Community Post', mos: 8, actionHe: 'פוסט בקהילה' },
  { action: 'Learning Lesson', mos: 5, actionHe: 'שיעור לימוד' },
  { action: 'Habit Complete', mos: 3, actionHe: 'הרגל הושלם' },
];

export default function Play2EarnSection() {
  const { t, isRTL } = useTranslation();

  const features = [
    { icon: Pickaxe, title: t('home.play2earn.miningTitle'), desc: t('home.play2earn.miningDesc'), color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: ShoppingBag, title: t('home.play2earn.marketTitle'), desc: t('home.play2earn.marketDesc'), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Wallet, title: t('home.play2earn.walletTitle'), desc: t('home.play2earn.walletDesc'), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">{t('home.play2earn.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
              {t('home.play2earn.title')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.play2earn.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Mining preview card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 rounded-3xl bg-card/80 backdrop-blur border border-amber-500/30 shadow-2xl shadow-amber-500/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400">{isRTL ? 'ארנק' : 'Wallet'}</p>
                <p className="text-3xl font-black text-foreground mt-1">1,240 <span className="text-lg text-amber-400">MOS</span></p>
                <p className="text-xs text-muted-foreground">≈ $12.40</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Coins className="h-7 w-7 text-amber-400" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {isRTL ? 'כריית אחרונה' : 'Recent Mining'}
              </p>
              {miningActions.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-border/30">
                  <span className="text-sm text-foreground">{isRTL ? a.actionHe : a.action}</span>
                  <span className="text-sm font-bold text-amber-400">+{a.mos} MOS</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
              <p className="text-xs text-amber-400 font-bold">100 MOS = $1.00</p>
            </div>
          </motion.div>

          {/* Feature cards */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-card/60 backdrop-blur border border-border/50"
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', f.bg)}>
                  <f.icon className={cn('h-6 w-6', f.color)} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
