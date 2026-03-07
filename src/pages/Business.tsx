/**
 * Business — entry router page (mirrors Coaches.tsx pattern).
 * Shows BusinessDashboard if user has active journey, otherwise shows landing.
 */
import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageSkeleton } from '@/components/ui/skeleton';

export default function Business() {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHe = language === 'he';

  const handleStartJourney = () => {
    if (!user) { navigate('/auth'); return; }
    navigate('/business/journey');
  };

  const handleViewDashboard = () => {
    if (!user) { navigate('/auth'); return; }
    navigate('/business/journey');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">
          {isHe ? 'עסקים' : 'Business'}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {isHe
            ? 'מרכז הצמיחה העסקית שלך — כלים ואסטרטגיות לטרנספורמציה קריירתית'
            : 'Your business growth center — tools and strategies for career transformation'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartJourney}
          className="group relative rounded-2xl border-2 border-amber-500/20 bg-card p-8 text-start space-y-4 transition-all hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Rocket className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {isHe ? 'התחל מסע עסקי' : 'Start Business Journey'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isHe
              ? 'בנה את האסטרטגיה העסקית שלך צעד אחר צעד עם הדרכת AI.'
              : 'Build your business strategy step by step with AI guidance.'}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-amber-500 group-hover:underline">
            {isHe ? 'התחל עכשיו →' : 'Get started →'}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleViewDashboard}
          className="group relative rounded-2xl border-2 border-orange-500/20 bg-card p-8 text-start space-y-4 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {isHe ? 'המסעות שלי' : 'My Journeys'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isHe
              ? 'חזור למסע עסקי קיים וצפה בלוח הבקרה שלך.'
              : 'Return to an existing business journey and view your dashboard.'}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-orange-500 group-hover:underline">
            {isHe ? 'צפה במסעות →' : 'View journeys →'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
