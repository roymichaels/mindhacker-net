/**
 * CreatorLanding — entry page for non-creator users.
 */
import { Palette, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function CreatorLanding() {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHe = language === 'he';

  const handleGetStarted = () => {
    if (!user) { navigate('/auth'); return; }
    toast.info(isHe ? 'הרשמה ליוצר תוכן תהיה זמינה בקרוב' : 'Creator signup coming soon');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">
          {isHe ? 'יוצרי תוכן' : 'Content Creators'}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {isHe
            ? 'צור קורסים, תוכן ומוצרים דיגיטליים כדי למנף את המומחיות שלך'
            : 'Create courses, content & digital products to monetize your expertise'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGetStarted}
          className="group relative rounded-2xl border-2 border-sky-500/20 bg-card p-8 text-start space-y-4 transition-all hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center">
            <Palette className="h-8 w-8 text-sky-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {isHe ? 'הפוך ליוצר תוכן' : 'Become a Creator'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isHe
              ? 'בנה את המותג האישי שלך, צור קורסים ומוצרים דיגיטליים ומנף את המומחיות שלך.'
              : 'Build your personal brand, create courses & digital products, and monetize your expertise.'}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-sky-500 group-hover:underline">
            {isHe ? 'התחל עכשיו →' : 'Get started →'}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/learn')}
          className="group relative rounded-2xl border-2 border-purple-500/20 bg-card p-8 text-start space-y-4 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {isHe ? 'גלה קורסים' : 'Discover Courses'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isHe
              ? 'עיין בקורסים ותכנים שנוצרו על ידי יוצרים מובילים בפלטפורמה.'
              : 'Browse courses and content created by top creators on the platform.'}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-purple-500 group-hover:underline">
            {isHe ? 'גלה עכשיו →' : 'Discover now →'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
