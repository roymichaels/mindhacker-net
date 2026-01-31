import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';
import { Orb } from '@/components/orb';
import { useOrbProfile } from '@/hooks/useOrbProfile';
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
  X,
  Zap
} from 'lucide-react';

const BENEFITS = [
  {
    icon: Brain,
    titleHe: 'ניתוח תודעה AI',
    titleEn: 'AI Consciousness Analysis',
    descHe: 'ציון על סולם הוקינס',
    descEn: 'Hawkins scale score',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Target,
    titleHe: 'תוכנית 90 יום',
    titleEn: '90-Day Plan',
    descHe: '12 אבני דרך שבועיות',
    descEn: '12 weekly milestones',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: FileText,
    titleHe: 'דו"ח PDF מקצועי',
    titleEn: 'Professional PDF',
    descHe: 'הורדה מיידית',
    descEn: 'Instant download',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Compass,
    titleHe: 'בהירות כיוון',
    titleEn: 'Life Direction',
    descHe: 'חזון ושאיפות',
    descEn: 'Vision & aspirations',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Star,
    titleHe: 'פרופיל זהות',
    titleEn: 'Identity Profile',
    descHe: 'תכונות וערכים',
    descEn: 'Traits & values',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: TrendingUp,
    titleHe: 'תובנות צמיחה',
    titleEn: 'Growth Insights',
    descHe: 'הרגלים ודפוסים',
    descEn: 'Habits & patterns',
    gradient: 'from-violet-500 to-purple-600',
  },
];

export default function FreeTransformationJourney() {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { profile: orbProfile } = useOrbProfile();

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
    <div 
      className="fixed inset-0 overflow-y-auto overflow-x-hidden isolate" 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        {/* Shimmer effect */}
        <motion.div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, hsl(var(--primary) / 0.05) 50%, transparent 100%)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      
      {/* Exit button - Glassy */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={handleExit}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-card/60 backdrop-blur-xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-card/80 hover:border-primary/30 transition-all shadow-lg"
        aria-label={isRTL ? 'יציאה' : 'Exit'}
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* Main content - Full height flex with space-between */}
      <div className="relative z-10 min-h-full flex flex-col justify-between px-4 py-6 pt-16">
        
        {/* Top Section: Orb + Headlines */}
        <div className="flex-shrink-0">
          {/* 3D Orb with glow effects */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="relative flex justify-center mb-4"
          >
            {/* Outer glow rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="w-48 h-48 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div 
                className="w-40 h-40 rounded-full border border-primary/20"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.1), transparent)',
                }}
              />
            </motion.div>
            
            {/* The Orb - Enhanced WebGL with particles */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52">
              <Orb 
                profile={orbProfile} 
                size={208} 
                className="w-full h-full"
                showGlow={true}
              />
            </div>
            
            {/* Free badge - Shiny cyber style */}
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full blur-md"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #f59e0b)' }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-white text-sm font-bold shadow-2xl border border-white/20">
                  <Gift className="w-4 h-4" />
                  {isRTL ? 'מתנה חינם' : 'FREE GIFT'}
                  <Zap className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Headlines - Bold & Shiny */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center max-w-lg mx-auto mb-6"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
              <motion.span 
                className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {isRTL ? 'גלה את הפוטנציאל האמיתי שלך' : 'Discover Your True Potential'}
              </motion.span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
              {isRTL 
                ? 'קבל ניתוח תודעה מותאם אישית ותוכנית טרנספורמציה ל-90 יום' 
                : 'Get personalized consciousness analysis and a 90-day transformation plan'}
            </p>
          </motion.div>
        </div>

        {/* Middle Section: Benefits Grid - Takes remaining space */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex-1 flex items-center py-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-md md:max-w-3xl mx-auto">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.titleEn}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.08, type: 'spring' }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group relative overflow-hidden"
              >
                {/* Card glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
                  style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                />
                
                <div className="relative flex items-center gap-3 p-4 rounded-2xl bg-card/70 backdrop-blur-xl border border-white/10 group-hover:border-primary/40 transition-all duration-300 shadow-lg h-full">
                  {/* Icon with gradient background */}
                  <div className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-bold text-foreground leading-tight">
                      {isRTL ? benefit.titleHe : benefit.titleEn}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {isRTL ? benefit.descHe : benefit.descEn}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Section: CTA - Sticky feel */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex-shrink-0 pt-4 pb-[env(safe-area-inset-bottom)] w-full max-w-md mx-auto"
        >
          <div className="relative p-4 rounded-3xl bg-card/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            {/* Shimmer border effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['-100% 0', '200% 0'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            
            <Button
              size="lg"
              onClick={handleStart}
              className="relative w-full h-14 text-lg gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:from-purple-600 hover:via-pink-600 hover:to-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-primary/25 border border-white/20"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.span>
              {isRTL ? 'התחל את המסע שלי' : 'Start My Journey'}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            
            {/* Trust indicator */}
            <p className="text-center text-xs text-muted-foreground mt-3">
              {isRTL ? '✨ ללא עלות • ללא כרטיס אשראי • תוצאות מיידיות' : '✨ No cost • No credit card • Instant results'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
