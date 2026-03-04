/**
 * TwoWorldsSection - Unified 14-pillar system + Core vs Arena functional split
 * Core = Map (assessment & planning) | Arena = Movement (daily execution)
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';
import { cn } from '@/lib/utils';
import { Map, Swords, Brain, Target } from 'lucide-react';

function DomainCard({ domain, index, isRTL }: { domain: typeof CORE_DOMAINS[0]; index: number; isRTL: boolean }) {
  const Icon = domain.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/50 hover:border-primary/30 hover:bg-card transition-all"
    >
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
        `bg-${domain.color}-500/15`
      )}>
        <Icon className={cn('h-5 w-5', `text-${domain.color}-500`)} />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-foreground">{isRTL ? domain.labelHe : domain.labelEn}</p>
        <p className="text-xs text-muted-foreground truncate">{isRTL ? domain.descriptionHe : domain.description}</p>
      </div>
    </motion.div>
  );
}

export default function TwoWorldsSection() {
  const { isRTL } = useTranslation();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 via-transparent to-muted/30 dark:from-gray-900/30 dark:via-transparent dark:to-gray-900/30">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {isRTL ? 'מערכת שלמה ל' : 'A Complete System for '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isRTL ? '14 תחומי חיים' : '14 Life Domains'}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? 'מערכת אחת. 14 פילרים. שני מצבים — מפה ותנועה.'
              : 'One system. 14 pillars. Two modes — Map and Movement.'}
          </p>
        </motion.div>

        {/* Two Hubs explanation */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl border border-primary/20 bg-primary/5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {isRTL ? '🧠 ליבה — המפה' : '🧠 Core — The Map'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'אבחון, אסטרטגיה ותכנון 100 יום' : 'Assessment, strategy & 100-day planning'}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isRTL
                ? 'אבחן את כל 14 התחומים, בנה תוכנית 100 יום מותאמת אישית, וצפה בתוצאות.'
                : 'Diagnose all 14 domains, build a personalized 100-day plan, and track results.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl border border-accent/20 bg-accent/5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {isRTL ? '⚔️ זירה — התנועה' : '⚔️ Arena — The Movement'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'ביצוע יומי, משימות חיות ומומנטום' : 'Daily execution, live tasks & momentum'}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isRTL
                ? 'בצע את המשימות שלך היום — תור פעולות, הרגלים, ומשוב בזמן אמת.'
                : 'Execute your tasks today — action queue, habits, and real-time feedback.'}
            </p>
          </motion.div>
        </div>

        {/* All 14 pillars grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h3 className="text-xl font-bold text-foreground mb-1">
            {isRTL ? '14 הפילרים' : 'The 14 Pillars'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? 'בחר את הפילרים שלך לפי המנוי — חינם: 2, Plus: 6, Apex: הכל'
              : 'Choose your pillars by plan — Free: 2, Plus: 6, Apex: all'}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {CORE_DOMAINS.map((d, i) => (
            <DomainCard key={d.id} domain={d} index={i} isRTL={isRTL} />
          ))}
        </div>
      </div>
    </section>
  );
}
