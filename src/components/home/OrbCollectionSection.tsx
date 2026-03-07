/**
 * OrbCollectionSection - DNA explanation section (carousel moved to hero)
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useWelcomeGate } from '@/contexts/WelcomeGateContext';
import { Sparkles, Dna, Fingerprint, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function OrbCollectionSection() {
  const { isRTL, language } = useTranslation();
  const { openWelcomeGate } = useWelcomeGate();
  const lang = language === 'he' ? 'he' : 'en';
  const NextArrow = isRTL ? ArrowLeft : ArrowRight;
  const isHe = isRTL;

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10 container mx-auto max-w-7xl px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
            <Dna className="w-3.5 h-3.5" />
            {isHe ? 'DNA חזותי' : 'Visual DNA'}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {lang === 'he' ? 'ה-Orb שלך נבנה מה-DNA שלך' : 'Your Orb Is Built From Your DNA'}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            {lang === 'he'
              ? 'כל ארכיטיפ מייצג ממד אחר של האישיות שלך. המערכת ממפה את התשובות, ההרגלים והפעילות שלך — ויוצרת Orb ייחודי שמשלב את כולם יחד.'
              : 'Each archetype represents a different dimension of your personality. The system maps your answers, habits, and activity — and creates a unique Orb that blends them all.'}
          </p>
        </motion.div>

        {/* DNA explanation pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-14"
        >
          {[
            { icon: Fingerprint, textEn: 'Unique to you', textHe: 'ייחודי לך' },
            { icon: Dna, textEn: 'Built from behavior', textHe: 'נבנה מהתנהגות' },
            { icon: Sparkles, textEn: 'Evolves with you', textHe: 'מתפתח איתך' },
          ].map(({ icon: Icon, textEn, textHe }) => (
            <div key={textEn} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border/40 text-sm text-muted-foreground">
              <Icon className="w-4 h-4 text-primary" />
              <span>{lang === 'he' ? textHe : textEn}</span>
            </div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-14 space-y-4"
        >
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            {lang === 'he'
              ? '10 ארכיטיפים × מיליוני וריאציות = ה-Orb שלך. התחל את האבחון וגלה איזה שילוב מייצג אותך.'
              : '10 archetypes × millions of variations = your Orb. Start the assessment and discover which blend represents you.'}
          </p>
          <Button
            size="lg"
            onClick={openWelcomeGate}
            className="rounded-xl px-8 py-6 text-base font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Fingerprint className={cn('w-5 h-5', isRTL ? 'ml-2' : 'mr-2')} />
            {lang === 'he' ? 'גלה את ה-Orb שלך' : 'Discover Your Orb'}
            <NextArrow className={cn('w-4 h-4', isRTL ? 'mr-2' : 'ml-2')} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}