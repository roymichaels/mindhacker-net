/**
 * FeatureDetailPage — Rich long-form page for each of the 13 features.
 * Route: /features/:slug
 */
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FEATURES } from '@/data/featureShowcaseData';
import { FEATURE_DETAILS } from '@/data/featureDetailData';
import { useTranslation } from '@/hooks/useTranslation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, Check, Zap, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const tierLabels = {
  free: { en: 'Free', he: 'חינם', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  plus: { en: 'Plus Plan', he: 'תוכנית Plus', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  apex: { en: 'Apex Plan', he: 'תוכנית Apex', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
};

export default function FeatureDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isRTL } = useTranslation();
  const navigate = useNavigate();

  const featureIdx = FEATURES.findIndex(f => f.slug === slug);
  const feature = FEATURES[featureIdx];
  const detail = slug ? FEATURE_DETAILS[slug] : undefined;

  if (!feature) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">{isRTL ? 'פיצ\'ר לא נמצא' : 'Feature not found'}</h1>
            <Button onClick={() => navigate('/')}>
              {isRTL ? 'חזור לדף הבית' : 'Back to Home'}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const prev = featureIdx > 0 ? FEATURES[featureIdx - 1] : null;
  const next = featureIdx < FEATURES.length - 1 ? FEATURES[featureIdx + 1] : null;
  const tier = detail ? tierLabels[detail.tier] : null;

  const overview = detail ? (isRTL ? detail.overviewHe : detail.overviewEn) : [isRTL ? feature.descHe : feature.descEn];
  const benefits = detail ? (isRTL ? detail.benefitsHe : detail.benefitsEn) : [];
  const howItWorks = detail ? (isRTL ? detail.howItWorksHe : detail.howItWorksEn) : [];
  const whoFor = detail ? (isRTL ? detail.whoForHe : detail.whoForEn) : [];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back link */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {isRTL ? 'חזרה לדף הבית' : 'Back to Home'}
          </button>

          {/* ─── HERO ─── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 mb-16"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-5xl">{feature.icon}</span>
              {tier && (
                <span className={cn('text-xs font-semibold px-3 py-1 rounded-full', tier.className)}>
                  {isRTL ? tier.he : tier.en}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {isRTL ? feature.titleHe : feature.titleEn}
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-primary">
              {isRTL ? feature.hookHe : feature.hookEn}
            </p>
          </motion.section>

          {/* ─── OVERVIEW ─── */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-5 mb-16"
          >
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {isRTL ? 'סקירה כללית' : 'Overview'}
            </h2>
            <div className="space-y-4">
              {overview.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed text-lg">
                  {p}
                </p>
              ))}
            </div>
          </motion.section>

          {/* ─── KEY BENEFITS ─── */}
          {benefits.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-8">
                <Zap className="h-5 w-5 text-primary" />
                {isRTL ? 'יתרונות מרכזיים' : 'Key Benefits'}
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {benefits.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="p-5 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-colors space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{b.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">{b.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ─── HOW IT WORKS ─── */}
          {howItWorks.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold text-foreground mb-8">
                {isRTL ? 'איך זה עובד' : 'How It Works'}
              </h2>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute top-0 bottom-0 start-5 w-px bg-border" />
                <div className="space-y-8">
                  {howItWorks.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="relative flex gap-5"
                    >
                      <div className="shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold z-10">
                        {i + 1}
                      </div>
                      <div className="pt-1">
                        <h3 className="font-bold text-foreground text-lg">{step.step}</h3>
                        <p className="text-muted-foreground leading-relaxed mt-1">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* ─── WHO IS THIS FOR ─── */}
          {whoFor.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-primary" />
                {isRTL ? 'למי זה מתאים?' : 'Who Is This For?'}
              </h2>
              <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
                {whoFor.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ─── CTA ─── */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-primary/20 mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {isRTL ? 'מוכן להתחיל?' : 'Ready to Begin?'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              {isRTL
                ? 'הצטרף לאלפי אנשים שכבר משתמשים ב-Mind OS כדי לשנות את החיים שלהם.'
                : 'Join thousands already using Mind OS to transform their lives.'}
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="rounded-full px-10 text-base"
            >
              {isRTL ? 'התחל את המסע' : 'Start Your Journey'}
            </Button>
          </motion.section>

          {/* ─── PREV / NEXT ─── */}
          <div className="flex justify-between items-center pt-8 border-t border-border">
            {prev ? (
              <Link
                to={`/features/${prev.slug}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                {isRTL ? <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />}
                <div>
                  <div className="text-xs text-muted-foreground/60">{isRTL ? 'הקודם' : 'Previous'}</div>
                  <div className="font-medium">{isRTL ? prev.titleHe.split('—')[0].trim() : prev.titleEn.split('—')[0].trim()}</div>
                </div>
              </Link>
            ) : <div />}
            {next ? (
              <Link
                to={`/features/${next.slug}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-end group"
              >
                <div>
                  <div className="text-xs text-muted-foreground/60">{isRTL ? 'הבא' : 'Next'}</div>
                  <div className="font-medium">{isRTL ? next.titleHe.split('—')[0].trim() : next.titleEn.split('—')[0].trim()}</div>
                </div>
                {isRTL ? <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              </Link>
            ) : <div />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
