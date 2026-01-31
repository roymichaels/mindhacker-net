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
  Compass
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

  return (
    <div className="h-screen overflow-hidden bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Full-height flex container */}
      <section className="relative flex flex-col h-full px-4 py-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
        
        {/* Top section: Orb + Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex justify-center mb-3"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28">
            <PersonalizedOrb size={112} showGlow disablePersonalization />
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

        {/* Benefits Grid - Flex grow to fill space */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-md mx-auto flex-1 content-start"
        >
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.titleEn}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-start gap-2 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
            >
              <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                  {isRTL ? benefit.titleHe : benefit.titleEn}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {isRTL ? benefit.descHe : benefit.descEn}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button - Fixed at bottom, inside the flex flow */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-auto pt-4 pb-[env(safe-area-inset-bottom)] w-full max-w-sm mx-auto"
        >
          <Button
            size="lg"
            onClick={handleStart}
            className="w-full h-14 text-lg gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 font-bold rounded-2xl"
          >
            <Sparkles className="w-5 h-5" />
            {isRTL ? 'התחל את המסע שלי' : 'Start My Journey'}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
