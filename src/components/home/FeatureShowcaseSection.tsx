/**
 * FeatureShowcaseSection — Sidebar navigation + detail card for 15 features
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
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            {isRTL ? 'כל מה שבפנים' : 'Everything Inside'}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {isRTL
              ? '15 מערכות שמשנות את אופן הניהול של החיים שלך.'
              : '15 systems that change how you run your life.'}
          </p>
        </motion.div>

        {/* Sidebar + Content layout */}
        <div className="flex flex-col md:flex-row gap-0 rounded-2xl border border-border/60 bg-card overflow-hidden">
          {/* Sidebar */}
          <nav className="md:w-64 lg:w-72 shrink-0 border-b md:border-b-0 md:border-e border-border/60 bg-muted/30">
            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:max-h-[520px] scrollbar-hide">
              {FEATURES.map((f, i) => (
                <button
                  key={f.slug}
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap md:whitespace-normal text-start w-full shrink-0",
                    i === activeIdx
                      ? "bg-primary/10 text-primary border-s-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border-s-2 border-transparent"
                  )}
                >
                  <span className="text-lg shrink-0">{f.icon}</span>
                  <span className="hidden md:inline">
                    {isRTL ? f.titleHe.split('—')[0].trim() : f.titleEn.split('—')[0].trim()}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {/* Content area */}
          <div className="flex-1 min-h-[400px] md:min-h-[520px] flex items-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, x: isRTL ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 16 : -16 }}
                transition={{ duration: 0.2 }}
                className="p-8 md:p-10 space-y-6 w-full"
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
                <p className="text-muted-foreground leading-relaxed text-base max-w-2xl">
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
          </div>
        </div>
      </div>
    </section>
  );
}
