/**
 * FeatureDetailPage — Deep-dive page for each of the 13 features.
 * Route: /features/:slug
 */
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FEATURES } from '@/data/featureShowcaseData';
import { useTranslation } from '@/hooks/useTranslation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeatureDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isRTL } = useTranslation();
  const navigate = useNavigate();

  const featureIdx = FEATURES.findIndex(f => f.slug === slug);
  const feature = FEATURES[featureIdx];

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

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Back link */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {isRTL ? 'חזרה לדף הבית' : 'Back to Home'}
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero */}
            <div className="space-y-4">
              <span className="text-5xl">{feature.icon}</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                {isRTL ? feature.titleHe : feature.titleEn}
              </h1>
              <p className="text-xl font-semibold text-primary">
                {isRTL ? feature.hookHe : feature.hookEn}
              </p>
            </div>

            {/* Extended description */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {isRTL ? feature.descHe : feature.descEn}
              </p>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/onboarding')}
                className="rounded-full px-8"
              >
                {isRTL ? 'התחל עכשיו' : 'Get Started'}
              </Button>
            </div>
          </motion.div>

          {/* Prev / Next navigation */}
          <div className="flex justify-between items-center mt-16 pt-8 border-t border-border">
            {prev ? (
              <Link
                to={`/features/${prev.slug}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                <span>{isRTL ? prev.titleHe.split('—')[0].trim() : prev.titleEn.split('—')[0].trim()}</span>
              </Link>
            ) : <div />}
            {next ? (
              <Link
                to={`/features/${next.slug}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{isRTL ? next.titleHe.split('—')[0].trim() : next.titleEn.split('—')[0].trim()}</span>
                {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>
            ) : <div />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
