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
  Clock, 
  CreditCard, 
  ArrowRight,
  Gift,
  Zap,
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
    <div className="min-h-screen bg-background overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section - Single compact view */}
      <section className="relative flex flex-col items-center justify-start px-4 py-6 pb-12">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
        
        {/* Animated Orb */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative mb-6"
        >
          <div className="w-28 h-28 sm:w-32 sm:h-32">
            <PersonalizedOrb size={128} showGlow disablePersonalization />
          </div>
          
          {/* Free badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3"
          >
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold shadow-lg">
              <Gift className="w-3.5 h-3.5" />
              {isRTL ? 'מתנה חינם' : 'FREE GIFT'}
            </div>
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-lg mx-auto mb-6"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {isRTL ? 'גלה את הפוטנציאל האמיתי שלך' : 'Discover Your True Potential'}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isRTL 
              ? 'קבל ניתוח תודעה מותאם אישית ותוכנית טרנספורמציה ל-90 יום' 
              : 'Get personalized consciousness analysis and a 90-day transformation plan'}
          </p>
        </motion.div>

        {/* Benefits Grid - 2 columns compact */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-md mb-6"
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

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-muted-foreground mb-6"
        >
          <span className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" />
            {isRTL ? 'בלי כרטיס אשראי' : 'No credit card'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {isRTL ? '5 דקות' : '5 minutes'}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            {isRTL ? 'תוצאות מיידיות' : 'Instant results'}
          </span>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-sm"
        >
          <Button
            size="lg"
            onClick={handleStart}
            className="w-full h-14 text-lg gap-2 shadow-xl shadow-primary/20"
          >
            <Sparkles className="w-5 h-5" />
            {isRTL ? 'התחל את המסע שלי' : 'Start My Journey'}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 text-xs text-muted-foreground text-center"
        >
          {isRTL 
            ? '⭐ כבר יותר מ-2,000 אנשים התחילו את המסע שלהם' 
            : '⭐ Over 2,000 people have already started their journey'}
        </motion.p>
      </section>
    </div>
  );
}
