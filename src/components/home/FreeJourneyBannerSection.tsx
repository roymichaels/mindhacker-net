import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { MultiThreadOrb } from '@/components/orb/MultiThreadOrb';
import { Gift, ArrowRight, Brain, Target, FileText, Sparkles } from 'lucide-react';

export default function FreeJourneyBannerSection() {
  const { isRTL } = useTranslation();

  return (
    <section className="py-12 sm:py-16 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-primary/20 backdrop-blur-xl overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          
          <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Orb */}
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="shrink-0"
            >
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28">
                  <MultiThreadOrb size={112} />
                </div>
                {/* Free badge */}
                <div className="absolute -top-1 -right-1">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold shadow-lg">
                    <Gift className="w-3 h-3" />
                    {isRTL ? 'חינם' : 'FREE'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 text-center sm:text-start">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {isRTL ? '🎁 מתנה: מסע הטרנספורמציה האישי שלך' : '🎁 Free Gift: Your Personal Transformation Journey'}
                </span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {isRTL 
                  ? 'קבל ניתוח תודעה מבוסס AI, תוכנית 90 יום ופרופיל זהות - הכל בחינם וללא הרשמה!'
                  : 'Get AI consciousness analysis, 90-day plan & identity profile - all free, no signup!'}
              </p>

              {/* Mini benefits */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-5 text-xs">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary">
                  <Brain className="w-3.5 h-3.5" />
                  {isRTL ? 'ניתוח AI' : 'AI Analysis'}
                </span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 text-accent">
                  <Target className="w-3.5 h-3.5" />
                  {isRTL ? 'תוכנית 90 יום' : '90-Day Plan'}
                </span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                  <FileText className="w-3.5 h-3.5" />
                  {isRTL ? 'PDF להורדה' : 'PDF Download'}
                </span>
              </div>

              {/* CTA */}
              <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
                <Link to="/free-journey">
                  <Sparkles className="w-4 h-4" />
                  {isRTL ? 'התחל עכשיו - חינם!' : 'Start Now - Free!'}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
