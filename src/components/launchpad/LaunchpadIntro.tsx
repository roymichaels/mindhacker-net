import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Orb } from '@/components/orb';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { 
  Brain, 
  Target, 
  Sparkles, 
  ArrowRight,
  Star,
  TrendingUp,
  Compass,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';

const BENEFITS = [
  {
    icon: Brain,
    titleHe: 'ניתוח תודעה AI',
    titleEn: 'AI Consciousness Analysis',
    descHe: 'הבנה עמוקה של עצמך',
    descEn: 'Deep self-understanding',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Target,
    titleHe: 'תוכנית 90 יום',
    titleEn: '90-Day Plan',
    descHe: 'אבני דרך מותאמות אישית',
    descEn: 'Personalized milestones',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: Compass,
    titleHe: 'בהירות כיוון',
    titleEn: 'Life Direction',
    descHe: 'חזון ברור לעתיד',
    descEn: 'Clear vision ahead',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Star,
    titleHe: 'פרופיל זהות',
    titleEn: 'Identity Profile',
    descHe: 'DNA התודעתי שלך',
    descEn: 'Your consciousness DNA',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: TrendingUp,
    titleHe: 'תובנות צמיחה',
    titleEn: 'Growth Insights',
    descHe: 'זיהוי דפוסים וחסמים',
    descEn: 'Pattern recognition',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Zap,
    titleHe: 'Aurora AI Coach',
    titleEn: 'Aurora AI Coach',
    descHe: 'ליווי אישי 24/7',
    descEn: '24/7 personal coaching',
    gradient: 'from-amber-500 to-orange-600',
  },
];

interface LaunchpadIntroProps {
  onStart: () => void;
  onSkip?: () => void;
}

export function LaunchpadIntro({ onStart, onSkip }: LaunchpadIntroProps) {
  const { language, isRTL } = useTranslation();
  const { profile: orbProfile } = useOrbProfile();

  return (
    <div 
      className="fixed inset-0 overflow-y-auto overflow-x-hidden isolate bg-background" 
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
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-full flex flex-col justify-between px-4 py-6 pt-8">
        
        {/* Top Section: Orb + Headlines */}
        <div className="flex-shrink-0">
          {/* 3D Orb */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="relative flex justify-center mb-4"
          >
            <div className="relative w-44 h-44 sm:w-56 sm:h-56">
              <Orb 
                profile={orbProfile ? { ...orbProfile, particleEnabled: false } : undefined} 
                size={224} 
                className="w-full h-full"
                showGlow={false}
              />
            </div>
            
            {/* Badge */}
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              className="absolute -top-1 left-1/2 -translate-x-1/2"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full blur-md"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground text-sm font-bold shadow-2xl border border-white/20">
                  <Sparkles className="w-4 h-4" />
                  {isRTL ? 'מסע הטרנספורמציה' : 'Transformation Journey'}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Headlines */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center max-w-lg mx-auto mb-6"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight">
              <motion.span 
                className="inline-block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {isRTL ? 'בוא נכיר אותך לעומק' : "Let's Get To Know You"}
              </motion.span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
              {isRTL 
                ? 'שאלון קצר שיעזור לנו לבנות עבורך תוכנית צמיחה אישית ומותאמת' 
                : 'A quick questionnaire to build your personalized growth plan'}
            </p>
          </motion.div>
        </div>

        {/* Middle Section: Benefits Grid */}
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
                <div className="relative flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-card/70 backdrop-blur-xl border border-white/10 group-hover:border-primary/40 transition-all duration-300 shadow-lg h-full">
                  <div className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
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

        {/* Bottom Section: CTA */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex-shrink-0 pt-4 pb-[env(safe-area-inset-bottom)] w-full max-w-md mx-auto space-y-3"
        >
          {/* Time estimate */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{isRTL ? 'כ-10 דקות להשלמה' : '~10 minutes to complete'}</span>
          </div>

          <div className="relative p-4 rounded-3xl bg-card/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            {/* Shimmer border effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
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
              onClick={onStart}
              className="relative w-full h-14 text-lg gap-2 bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/25 border border-white/20"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.span>
              {isRTL ? 'בואו נתחיל!' : "Let's Start!"}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {isRTL ? 'שומר אוטומטית' : 'Auto-saves'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {isRTL ? 'ניתן לעצור ולהמשיך' : 'Pause anytime'}
              </span>
            </div>
          </div>

          {/* Skip option */}
          {onSkip && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={onSkip}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {isRTL ? 'אמשיך אחר כך →' : 'I\'ll do this later →'}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default LaunchpadIntro;
