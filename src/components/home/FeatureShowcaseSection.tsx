/**
 * FeatureShowcaseSection — Tabbed feature overview with "See More" links
 * Reference: horizontal tab bar at top, card list below, each with hook + desc + CTA
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '@/data/featureShowcaseData';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FeatureShowcaseSection() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const active = FEATURES[activeIdx];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 via-transparent to-muted/30 dark:from-gray-900/30 dark:via-transparent dark:to-gray-900/30">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            {isRTL ? 'כל מה שבפנים' : 'Everything Inside'}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {isRTL
              ? '13 מערכות שמשנות את אופן הניהול של החיים שלך.'
              : '13 systems that change how you run your life.'}
          </p>
        </motion.div>

        {/* Tab bar — horizontal scroll */}
        <div className="relative mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FEATURES.map((f, i) => (
              <button
                key={f.slug}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  i === activeIdx
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="mr-1.5">{f.icon}</span>
                {isRTL ? f.titleHe.split('—')[0].trim() : f.titleEn.split('—')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Active feature card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border/60 bg-card p-8 md:p-10 space-y-6"
          >
            {/* Icon + Title */}
            <div className="flex items-center gap-4">
              <span className="text-4xl">{active.icon}</span>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                {isRTL ? active.titleHe : active.titleEn}
              </h3>
            </div>

            {/* Hook */}
            <p className="text-lg font-semibold text-primary">
              {isRTL ? active.hookHe : active.hookEn}
            </p>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed text-base max-w-3xl">
              {isRTL ? active.descHe : active.descEn}
            </p>

            {/* See More CTA */}
            <button
              onClick={() => navigate(`/features/${active.slug}`)}
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline transition-colors"
            >
              {isRTL ? 'קרא עוד' : 'See More'}
              {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Quick nav dots for mobile */}
        <div className="flex justify-center gap-1.5 mt-6 md:hidden">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === activeIdx ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
