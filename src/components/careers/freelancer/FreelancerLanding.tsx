/**
 * FreelancerLanding — entry page for non-freelancer users.
 */
import { Code, Briefcase } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function FreelancerLanding() {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHe = language === 'he';

  const handleGetStarted = () => {
    if (!user) { navigate('/auth'); return; }
    toast.info(isHe ? 'הרשמה לפרילנסר תהיה זמינה בקרוב' : 'Freelancer signup coming soon');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">
          {isHe ? 'פרילנסרים' : 'Freelancers'}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {isHe
            ? 'מצא הזדמנויות עבודה, נהל פרויקטים והרוויח טוקנים עבור הכישורים שלך'
            : 'Find gig opportunities, manage projects & earn tokens for your skills'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGetStarted}
          className="group relative rounded-2xl border-2 border-emerald-500/20 bg-card p-8 text-start space-y-4 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Code className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {isHe ? 'הפוך לפרילנסר' : 'Become a Freelancer'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isHe
              ? 'הצטרף לשוק הפרילנסרים שלנו, בנה תיק עבודות ומצא לקוחות חדשים.'
              : 'Join our freelancer marketplace, build your portfolio and find new clients.'}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-emerald-500 group-hover:underline">
            {isHe ? 'התחל עכשיו →' : 'Get started →'}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/fm')}
          className="group relative rounded-2xl border-2 border-amber-500/20 bg-card p-8 text-start space-y-4 transition-all hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {isHe ? 'חפש פרילנסר' : 'Find a Freelancer'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isHe
              ? 'גש לשוק הגיגים ומצא את המומחה המתאים לפרויקט שלך.'
              : 'Browse the gig marketplace and find the perfect expert for your project.'}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-amber-500 group-hover:underline">
            {isHe ? 'חפש עכשיו →' : 'Browse now →'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
