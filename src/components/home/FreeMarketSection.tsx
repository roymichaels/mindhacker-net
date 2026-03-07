/**
 * FreeMarketSection — "The Empire Economy" — Marketplace, Bounties, Gigs, Data, Affiliate
 * Showcases the internal marketplace ecosystem
 */
import { motion } from 'framer-motion';
import {
  ShoppingBag, Gift, Briefcase, Database, Users, ArrowRight,
  Sparkles, Shield
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export default function FreeMarketSection() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const tabs = [
    {
      icon: Gift,
      title: isHe ? 'באונטי' : 'Bounties',
      desc: isHe ? 'משימות קהילתיות עם תגמול MOS' : 'Community tasks with MOS rewards',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      items: isHe
        ? ['📝 כתוב מדריך — 50 MOS', '🎨 עצב תג קהילתי — 30 MOS', '🐛 דווח באג — 20 MOS']
        : ['📝 Write a guide — 50 MOS', '🎨 Design a badge — 30 MOS', '🐛 Report a bug — 20 MOS'],
    },
    {
      icon: Briefcase,
      title: isHe ? 'גיגים' : 'Gigs',
      desc: isHe ? 'מכור שירותים והרוויח MOS או דולרים' : 'Sell services and earn MOS or dollars',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      items: isHe
        ? ['💼 אימון אישי — 500 MOS', '📊 ניתוח נתונים — 300 MOS', '✍️ כתיבת תוכן — 200 MOS']
        : ['💼 Personal coaching — 500 MOS', '📊 Data analysis — 300 MOS', '✍️ Content writing — 200 MOS'],
    },
    {
      icon: Database,
      title: isHe ? 'שוק נתונים' : 'Data Marketplace',
      desc: isHe ? 'מכור תובנות אנונימיות — 80% לך' : 'Sell anonymized insights — 80% to you',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      items: isHe
        ? ['🔒 אנונימיזציה מלאה', '📊 סף 10 תורמים מינימום', '💰 חלוקה 80/20 אוטומטית']
        : ['🔒 Full anonymization', '📊 10-contributor minimum', '💰 Automatic 80/20 split'],
    },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
            <ShoppingBag className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">FreeMarket</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              {isHe ? 'השוק של האימפריה' : 'The Empire Marketplace'}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isHe
              ? 'הרוויח MOS על ידי מכירת שירותים, ביצוע באונטי, וגיגים — או מכור תובנות התנהגותיות אנונימיות'
              : 'Earn MOS by selling services, completing bounties, and gigs — or sell anonymized behavioral insights'}
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className={cn(
                  'p-6 rounded-3xl bg-card/80 backdrop-blur border-2 shadow-xl',
                  tab.border,
                  `shadow-${tab.color.replace('text-', '')}/10`
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', tab.bg)}>
                    <Icon className={cn('h-6 w-6', tab.color)} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground">{tab.title}</h3>
                    <p className="text-xs text-muted-foreground">{tab.desc}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {tab.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/30">
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Affiliate highlight */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/5 via-card/80 to-emerald-500/5 backdrop-blur border border-amber-500/20 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Users className="h-8 w-8 text-amber-400" />
            </div>
            <div className="flex-1 text-center sm:text-start">
              <h3 className="text-xl font-black text-foreground mb-1">
                {isHe ? 'תוכנית שותפים — הרוויח על הפניות' : 'Affiliate Program — Earn on Referrals'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isHe
                  ? 'קבל עמלה על כל משתמש שהפנית. קוד ייחודי, דשבורד מעקב, ומשיכת רווחים ישירה.'
                  : 'Earn commission on every user you refer. Unique code, tracking dashboard, and direct profit withdrawal.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                <span className="text-xs font-bold text-amber-400">{isHe ? 'קוד ייחודי' : 'Unique Code'}</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-xs font-bold text-emerald-400">{isHe ? 'מעקב חי' : 'Live Tracking'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
