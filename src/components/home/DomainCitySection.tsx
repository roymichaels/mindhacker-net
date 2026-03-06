/**
 * DomainCitySection — "The City Map" — 14 life domains as glowing district cards
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';
import { cn } from '@/lib/utils';

const colorMap: Record<string, { border: string; bg: string; text: string; shadow: string }> = {
  blue:    { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', shadow: 'shadow-blue-500/10' },
  fuchsia: { border: 'border-fuchsia-500/40', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', shadow: 'shadow-fuchsia-500/10' },
  red:     { border: 'border-red-500/40', bg: 'bg-red-500/10', text: 'text-red-400', shadow: 'shadow-red-500/10' },
  amber:   { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-400', shadow: 'shadow-amber-500/10' },
  cyan:    { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-400', shadow: 'shadow-cyan-500/10' },
  slate:   { border: 'border-slate-400/40', bg: 'bg-slate-500/10', text: 'text-slate-400', shadow: 'shadow-slate-500/10' },
  indigo:  { border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', text: 'text-indigo-400', shadow: 'shadow-indigo-500/10' },
  emerald: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', shadow: 'shadow-emerald-500/10' },
  purple:  { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400', shadow: 'shadow-purple-500/10' },
  sky:     { border: 'border-sky-500/40', bg: 'bg-sky-500/10', text: 'text-sky-400', shadow: 'shadow-sky-500/10' },
  rose:    { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-400', shadow: 'shadow-rose-500/10' },
  violet:  { border: 'border-violet-500/40', bg: 'bg-violet-500/10', text: 'text-violet-400', shadow: 'shadow-violet-500/10' },
  teal:    { border: 'border-teal-500/40', bg: 'bg-teal-500/10', text: 'text-teal-400', shadow: 'shadow-teal-500/10' },
};

export default function DomainCitySection() {
  const { t, isRTL } = useTranslation();

  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            {t('home.domainCity.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.domainCity.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CORE_DOMAINS.map((domain, i) => {
            const colors = colorMap[domain.color] || colorMap.blue;
            const Icon = domain.icon;
            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.03 * i }}
                whileHover={{ scale: 1.05, y: -4 }}
                className={cn(
                  'relative p-3 rounded-2xl border backdrop-blur-sm cursor-pointer transition-all',
                  'bg-card/80 shadow-lg',
                  colors.border, colors.shadow
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-2', colors.bg)}>
                  <Icon className={cn('h-5 w-5', colors.text)} />
                </div>
                <p className="text-xs font-bold text-foreground leading-tight">
                  {isRTL ? domain.labelHe : domain.labelEn}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight line-clamp-2">
                  {isRTL ? domain.descriptionHe : domain.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
