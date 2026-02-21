/**
 * TwoWorldsSection - Core (inner transformation) + Arena (external impact)
 * Shows all 11 life domains with icons and descriptions
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { CORE_DOMAINS, ARENA_DOMAINS } from '@/navigation/lifeDomains';
import { cn } from '@/lib/utils';

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
              {isRTL ? 'כל תחומי החיים' : 'Every Area of Life'}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? '12 תחומים. שני עולמות. מערכת אחת שמחברת את הכל.'
              : '12 domains. Two worlds. One system that connects it all.'}
          </p>
        </motion.div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Core */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <h3 className="text-xl font-bold text-foreground">
                {isRTL ? '🧠 ליבה — טרנספורמציה פנימית' : '🧠 Core — Inner Transformation'}
              </h3>
            </div>
            <div className="space-y-2">
              {CORE_DOMAINS.map((d, i) => (
                <DomainCard key={d.id} domain={d} index={i} isRTL={isRTL} />
              ))}
            </div>
          </motion.div>

          {/* Arena */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <h3 className="text-xl font-bold text-foreground">
                {isRTL ? '⚔️ זירה — השפעה חיצונית' : '⚔️ Arena — External Impact'}
              </h3>
            </div>
            <div className="space-y-2">
              {ARENA_DOMAINS.map((d, i) => (
                <DomainCard key={d.id} domain={d} index={i + 6} isRTL={isRTL} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
