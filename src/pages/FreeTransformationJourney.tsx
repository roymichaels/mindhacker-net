import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';
import { PersonalizedOrb } from '@/components/orb';
import { 
  Brain, 
  Target, 
  FileText, 
  Sparkles, 
  ArrowRight,
  Gift,
  Star,
  TrendingUp,
  Compass,
  X
} from 'lucide-react';

const BENEFITS = [
  {
    icon: Brain,
    titleHe: 'ניתוח תודעה AI',
    titleEn: 'AI Consciousness Analysis',
    descHe: 'ציון על סולם הוקינס',
    descEn: 'Hawkins scale score',
  },
  {
    icon: Target,
    titleHe: 'תוכנית 90 יום',
    titleEn: '90-Day Plan',
    descHe: '12 אבני דרך שבועיות',
    descEn: '12 weekly milestones',
  },
  {
    icon: FileText,
    titleHe: 'דו"ח PDF מקצועי',
    titleEn: 'Professional PDF',
    descHe: 'הורדה מיידית',
    descEn: 'Instant download',
  },
  {
    icon: Compass,
    titleHe: 'בהירות כיוון',
    titleEn: 'Life Direction',
    descHe: 'חזון ושאיפות',
    descEn: 'Vision & aspirations',
  },
  {
    icon: Star,
    titleHe: 'פרופיל זהות',
    titleEn: 'Identity Profile',
    descHe: 'תכונות וערכים',
    descEn: 'Traits & values',
  },
  {
    icon: TrendingUp,
    titleHe: 'תובנות צמיחה',
    titleEn: 'Growth Insights',
    descHe: 'הרגלים ודפוסים',
    descEn: 'Habits & patterns',
  },
];

export default function FreeTransformationJourney() {
  const { t, language, isRTL } = useTranslation();
  const navigate = useNavigate();

  useSEO({
    title: isRTL ? 'מסע טרנספורמציה חינמי | MindHacker' : 'Free Transformation Journey | MindHacker',
    description: isRTL 
      ? 'קבל ניתוח תודעה מבוסס AI, תוכנית טרנספורמציה ל-90 יום ופרופיל זהות אישי - הכל בחינם!'
      : 'Get AI-powered consciousness analysis, 90-day transformation plan and personal identity profile - all for free!',
    url: `${window.location.origin}/free-journey`,
  });

  const handleStart = () => {
    navigate('/free-journey/start');
  };

  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="h-screen overflow-hidden relative isolate" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Solid background to prevent canvas bleed-through */}
      <div className="absolute inset-0 bg-background z-0" />
      
      {/* Exit button */}
      <button
        onClick={handleExit}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
        aria-label={isRTL ? 'יציאה' : 'Exit'}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Full-height flex container */}
      <section className="relative z-10 flex flex-col h-full px-4 pt-[4.5rem] pb-4">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Top section: Orb + Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex justify-center mb-3"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40">
            <PersonalizedOrb size={160} showGlow disablePersonalization />
          </div>
          
          {/* Free badge - Purple/Yellow gradient */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute -top-1 left-1/2 -translate-x-1/2 sm:-top-2"
          >
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-white text-xs font-bold shadow-lg">
              <Gift className="w-3.5 h-3.5" />
              {isRTL ? 'מתנה חינם' : 'FREE GIFT'}
            </div>
          </motion.div>
        </motion.div>

        {/* Headline - Bigger & Bolder */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-lg mx-auto mb-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 leading-tight">
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 bg-clip-text text-transparent">
              {isRTL ? 'גלה את הפוטנציאל האמיתי שלך' : 'Discover Your True Potential'}
            </span>
          </h1>
          <p className="text-muted-foreground/70 text-sm sm:text-base font-light">
            {isRTL 
              ? 'קבל ניתוח תודעה מותאם אישית ותוכנית טרנספורמציה ל-90 יום' 
              : 'Get personalized consciousness analysis and a 90-day transformation plan'}
          </p>
        </motion.div>

        {/* Benefits Grid - 2-col on mobile, 3-col on large screens */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full max-w-md md:max-w-3xl mx-auto flex-1 content-start"
        >
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.titleEn}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="group flex items-center gap-3 p-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-primary/20 hover:border-primary/40 hover:bg-card/80 transition-all duration-300 shadow-lg shadow-primary/5"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <benefit.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-semibold text-foreground">
                  {isRTL ? benefit.titleHe : benefit.titleEn}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRTL ? benefit.descHe : benefit.descEn}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button - Solid background container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-auto pt-4 pb-[env(safe-area-inset-bottom)] w-full max-w-sm mx-auto"
        >
          <div className="p-3 rounded-2xl bg-card border border-border shadow-xl">
            <Button
              size="lg"
              onClick={handleStart}
              className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:from-purple-600 hover:via-pink-600 hover:to-amber-500 text-white shadow-xl font-bold rounded-xl"
            >
              <Sparkles className="w-5 h-5" />
              {isRTL ? 'התחל את המסע שלי' : 'Start My Journey'}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
