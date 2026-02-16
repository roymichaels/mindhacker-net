/**
 * GameHeroSection - 90-Day Transformation OS Hero
 * Sells the transformation loop, not a feature list
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ChevronDown, 
  User, 
  Briefcase, 
  Heart, 
  Users, 
  Wallet, 
  GraduationCap, 
  Compass,
  Palette,
  CalendarCheck,
  Brain,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// 8 Life Pillars for orbital visualization
const lifePillars = [
  { icon: User, color: 'text-blue-400', name: 'Personality', nameHe: 'אישיות' },
  { icon: Briefcase, color: 'text-amber-400', name: 'Business', nameHe: 'עסקים' },
  { icon: Heart, color: 'text-red-400', name: 'Health', nameHe: 'בריאות' },
  { icon: Users, color: 'text-pink-400', name: 'Relationships', nameHe: 'יחסים' },
  { icon: Wallet, color: 'text-emerald-400', name: 'Finances', nameHe: 'פיננסים' },
  { icon: GraduationCap, color: 'text-indigo-400', name: 'Learning', nameHe: 'למידה' },
  { icon: Compass, color: 'text-purple-400', name: 'Purpose', nameHe: 'ייעוד' },
  { icon: Palette, color: 'text-teal-400', name: 'Hobbies', nameHe: 'תחביבים' },
];

export default function GameHeroSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orbState, setOrbState] = useState<'idle' | 'speaking' | 'thinking'>('idle');
  
  useEffect(() => {
    const states: Array<'idle' | 'speaking' | 'thinking'> = ['idle', 'speaking', 'thinking'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % states.length;
      setOrbState(states[index]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' });
  };

  const trustBadges = [
    { icon: CalendarCheck, label: isRTL ? 'תוכנית 12 שבועות' : '12-Week Plan' },
    { icon: Brain, label: isRTL ? 'אימון AI יומי' : 'Daily AI Coaching' },
    { icon: TrendingUp, label: isRTL ? 'התקדמות מדידה' : 'Measurable Progress' },
  ];

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Multi-layer background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-accent/5 via-transparent to-primary/5" />
        
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-8">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" as const }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full 
              bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20
              border border-primary/30 shadow-lg shadow-primary/10"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isRTL ? 'מערכת הפעלה לחיים' : '90-Day Transformation OS'}
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]"
          >
            <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              {isRTL ? 'שנה את חייך ב-90 ימים' : 'Transform Your Life in 90 Days'}
            </span>
          </motion.h1>

          {/* Clear value proposition subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            {isRTL 
              ? 'קבל מאמן AI אישי, תוכנית פעולה יומית ומפגשי כוח שבועיים — הכל עובד יחד כדי לשנות 8 תחומים בחייך.'
              : 'Get a personalized AI coach, a daily action plan, and weekly power-up sessions — all working together to transform 8 areas of your life.'
            }
          </motion.p>

          {/* Trust Badges - outcome-driven */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
                    bg-card/80 backdrop-blur-sm border border-border/60 text-foreground shadow-sm"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {badge.label}
                </span>
              );
            })}
          </motion.div>

          {/* Central Orb with Orbiting Pillars + 90-day arc */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, type: "spring" as const, stiffness: 100 }}
            className="relative mx-auto py-8"
          >
            {/* Glow layers */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                className="w-[400px] h-[400px] rounded-full bg-primary/15 blur-[100px]"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
            
            {/* Orbiting 8 Pillars */}
            <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] mx-auto">
              {/* 90-Day Progress Arc (3 segments) */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                {[0, 1, 2].map((segment) => {
                  const startAngle = -90 + segment * 120;
                  const endAngle = startAngle + 110;
                  const radius = 185;
                  const cx = 200, cy = 200;
                  const start = {
                    x: cx + radius * Math.cos(startAngle * Math.PI / 180),
                    y: cy + radius * Math.sin(startAngle * Math.PI / 180)
                  };
                  const end = {
                    x: cx + radius * Math.cos(endAngle * Math.PI / 180),
                    y: cy + radius * Math.sin(endAngle * Math.PI / 180)
                  };
                  const colors = ['hsl(var(--primary))', 'hsl(var(--accent, var(--primary)))', 'hsl(var(--primary))'];
                  return (
                    <motion.path
                      key={segment}
                      d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
                      fill="none"
                      stroke={colors[segment]}
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity={0.3}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 1 + segment * 0.3 }}
                    />
                  );
                })}
                {/* Month labels */}
                {[
                  { label: isRTL ? 'חודש 1' : 'Month 1', x: 200, y: 8 },
                  { label: isRTL ? 'חודש 2' : 'Month 2', x: 370, y: 360 },
                  { label: isRTL ? 'חודש 3' : 'Month 3', x: 30, y: 360 },
                ].map((m) => (
                  <text key={m.label} x={m.x} y={m.y} textAnchor="middle" className="fill-muted-foreground text-[11px] font-medium">
                    {m.label}
                  </text>
                ))}
              </svg>

              {/* Orbital Track */}
              <div className="absolute inset-0 rounded-full border border-border/30" />
              
              {/* Rotating Container for Pillars */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                {lifePillars.map((pillar, index) => {
                  const angle = (index * (360 / lifePillars.length)) * (Math.PI / 180);
                  const radius = 140;
                  
                  return (
                    <motion.div
                      key={pillar.name}
                      className={cn(
                        "absolute w-11 h-11 sm:w-12 sm:h-12 rounded-xl",
                        "flex items-center justify-center",
                        "bg-card/90 backdrop-blur-sm border border-border/50",
                        "shadow-lg hover:scale-110 transition-transform cursor-pointer group"
                      )}
                      style={{ 
                        left: `calc(50% + ${Math.cos(angle) * radius}px - 22px)`,
                        top: `calc(50% + ${Math.sin(angle) * radius}px - 22px)`,
                      }}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                      whileHover={{ scale: 1.2 }}
                      title={isRTL ? pillar.nameHe : pillar.name}
                    >
                      <pillar.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", pillar.color)} />
                      {/* Hover label */}
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {isRTL ? pillar.nameHe : pillar.name}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>
              
              {/* Central Orb */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {[1, 2].map((ring) => (
                    <motion.div
                      key={ring}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <motion.div 
                        className={cn(
                          "rounded-full border border-primary/40",
                          ring === 1 ? "w-44 h-44" : "w-52 h-52"
                        )}
                        animate={{ 
                          scale: [1, 1.15, 1], 
                          opacity: [0.5, 0, 0.5] 
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          delay: ring * 0.4 
                        }}
                      />
                    </motion.div>
                  ))}
                  
                  <PersonalizedOrb 
                    size={140}
                    state={orbState}
                    className="relative z-10"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={() => navigate('/free-journey')}
                className="group relative text-lg px-10 py-7 rounded-2xl 
                  bg-gradient-to-r from-primary via-primary to-accent
                  hover:from-primary/90 hover:to-accent/90
                  text-primary-foreground font-black
                  shadow-[0_0_40px_rgba(0,0,0,0.3),0_0_60px_hsl(var(--primary)/0.3)]
                  hover:shadow-[0_0_60px_rgba(0,0,0,0.4),0_0_80px_hsl(var(--primary)/0.4)]
                  border-0 transition-all duration-300"
              >
                <Sparkles className={cn("h-6 w-6", isRTL ? "ml-3" : "mr-3")} />
                {isRTL ? '🚀 התחל טרנספורמציה (חינם)' : '🚀 Start Your 90-Day Transformation (Free)'}
                
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/signup')}
                className="text-lg px-8 py-6 rounded-2xl border-2 border-border/80 
                  hover:border-primary/50 hover:bg-primary/5
                  group transition-all duration-300"
              >
                {isRTL ? 'הרשמה מהירה' : 'Quick Sign Up'}
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="pt-8"
          >
            <motion.button
              onClick={scrollToContent}
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors mx-auto"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-sm font-medium">
                {isRTL ? 'גלול למטה' : 'Scroll Down'}
              </span>
              <ChevronDown className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
