/**
 * Play2EarnSection — "Proof of Growth" — FM economy, wallet, mining, marketplace
 * Full-width immersive section showcasing the entire economic layer
 */
import { motion } from 'framer-motion';
import { Coins, Pickaxe, ShoppingBag, Wallet, TrendingUp, Shield, ArrowRight, Database } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const miningActions = [
  { action: 'Hypnosis Session', mos: 10, actionHe: 'סשן היפנוזה', icon: '🧠' },
  { action: 'Community Post', mos: 8, actionHe: 'פוסט בקהילה', icon: '💬' },
  { action: 'Learning Lesson', mos: 5, actionHe: 'שיעור לימוד', icon: '📚' },
  { action: 'Habit Complete', mos: 3, actionHe: 'הרגל הושלם', icon: '✅' },
  { action: 'Daily Login', mos: 1, actionHe: 'כניסה יומית', icon: '🔥' },
];

export default function Play2EarnSection() {
  const { t, isRTL } = useTranslation();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Dramatic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">{t('home.play2earn.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 bg-clip-text text-transparent">
              {t('home.play2earn.title')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.play2earn.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Wallet card — 2 cols */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-2 p-6 rounded-3xl bg-card/80 backdrop-blur border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400">{isRTL ? 'ארנק MOS' : 'MOS Wallet'}</p>
                <p className="text-4xl font-black text-foreground mt-1">1,240 <span className="text-lg text-amber-400">MOS</span></p>
                <p className="text-sm text-emerald-400 font-bold">≈ $12.40</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 flex items-center justify-center border border-amber-500/30">
                <Wallet className="h-8 w-8 text-amber-400" />
              </div>
            </div>

            {/* Mining log */}
            <div className="space-y-1.5 mb-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {isRTL ? 'כריית אחרונה' : 'Recent Mining'}
              </p>
              {miningActions.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{a.icon}</span>
                    <span className="text-xs text-foreground">{isRTL ? a.actionHe : a.action}</span>
                  </div>
                  <span className="text-xs font-black text-amber-400">+{a.mos} MOS</span>
                </motion.div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
              <p className="text-sm font-black text-amber-400">100 MOS = $1.00</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{isRTL ? 'מגבלה יומית: 200 MOS' : 'Daily cap: 200 MOS'}</p>
            </div>
          </motion.div>

          {/* Feature cards — 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            {/* Activity Mining */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-5 rounded-2xl bg-card/80 backdrop-blur border border-amber-500/20 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Pickaxe className="h-6 w-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-foreground mb-1">{t('home.play2earn.miningTitle')}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{t('home.play2earn.miningDesc')}</p>
                  <div className="flex flex-wrap gap-2">
                    {['🧠 10 MOS', '💬 8 MOS', '📚 5 MOS', '✅ 3 MOS'].map((item, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Data Marketplace */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-2xl bg-card/80 backdrop-blur border border-emerald-500/20 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Database className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-foreground mb-1">{t('home.play2earn.marketTitle')}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{t('home.play2earn.marketDesc')}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-bold">{isRTL ? 'אנונימי' : 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-bold">80/20 {isRTL ? 'חלוקה' : 'Split'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Cashout & Bridge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-5 rounded-2xl bg-card/80 backdrop-blur border border-cyan-500/20 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <ArrowRight className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-foreground mb-1">{t('home.play2earn.walletTitle')}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{t('home.play2earn.walletDesc')}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20">
                      {isRTL ? '💳 משיכה לפיאט' : '💳 Fiat Cashout'}
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 font-bold border border-violet-500/20">
                      {isRTL ? '🪙 גשר Solana' : '🪙 Solana Bridge'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
