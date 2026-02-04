/**
 * GameHeroSection - Immersive, high-impact gamified hero
 * Premium "Life RPG" aesthetic with maximum conversion focus
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, Target, Zap, Play, ChevronDown, Star, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Typing effect for pain points
const useTypingEffect = (texts: string[], typingSpeed = 50, pauseTime = 2000) => {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    const currentText = texts[textIndex];
    
    if (isTyping) {
      if (displayText.length < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, pauseTime);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, typingSpeed / 2);
        return () => clearTimeout(timeout);
      } else {
        setTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }
  }, [displayText, isTyping, textIndex, texts, typingSpeed, pauseTime]);
  
  return displayText;
};

// Floating stat badge component
const FloatingBadge = ({ 
  children, 
  className, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className={cn(
      "absolute hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl",
      "bg-card/90 backdrop-blur-md border border-border/50",
      "shadow-lg shadow-black/10",
      className
    )}
  >
    {children}
  </motion.div>
);

export default function GameHeroSection() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orbState, setOrbState] = useState<'idle' | 'speaking' | 'thinking'>('idle');
  
  // Dynamic typing effect for pain points
  const typingTexts = useMemo(() => isRTL ? [
    'שאתה מרגיש תקוע...',
    'שאתה יודע שאתה מסוגל ליותר...',
    'שהחיים עוברים מהר מדי...',
    'שאתה רוצה שינוי אמיתי...',
    'שמשהו חייב להשתנות...',
  ] : [
    "you feel stuck...",
    "you know you're capable of more...",
    "life is passing too quickly...",
    "you want real change...",
    "something needs to shift...",
  ], [isRTL]);
  
  const typedText = useTypingEffect(typingTexts, 55, 1800);
  
  // Orb animation cycle
  useEffect(() => {
    const states: Array<'idle' | 'speaking' | 'thinking'> = ['idle', 'speaking', 'thinking'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % states.length;
      setOrbState(states[index]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Scroll indicator
  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Multi-layer background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        
        {/* Radial glow from orb area */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent" />
        
        {/* Accent color wash */}
        <div className="absolute inset-0 bg-gradient-to-t from-accent/5 via-transparent to-primary/5" />
        
        {/* Animated gradient overlay */}
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
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute rounded-full",
              i % 3 === 0 ? "w-2 h-2 bg-primary/30" : "w-1 h-1 bg-primary/50"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -150, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Floating stat badges - desktop only */}
      <FloatingBadge className="top-[25%] left-[8%]" delay={1}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Star className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{isRTL ? 'רמה' : 'Level'}</div>
          <div className="font-bold text-foreground">47</div>
        </div>
      </FloatingBadge>

      <FloatingBadge className="top-[35%] right-[10%]" delay={1.2}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Flame className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{isRTL ? 'רצף' : 'Streak'}</div>
          <div className="font-bold text-foreground">21 🔥</div>
        </div>
      </FloatingBadge>

      <FloatingBadge className="bottom-[30%] left-[12%]" delay={1.4}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{isRTL ? 'הישגים' : 'Achievements'}</div>
          <div className="font-bold text-foreground">156</div>
        </div>
      </FloatingBadge>

      <FloatingBadge className="bottom-[25%] right-[8%]" delay={1.6}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">XP</div>
          <div className="font-bold text-foreground">12,450</div>
        </div>
      </FloatingBadge>

      <div className="relative z-10 container mx-auto max-w-5xl px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-6">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
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
              {isRTL ? 'מערכת הפעלה לחיים' : 'Life Operating System'}
            </span>
          </motion.div>

          {/* 3D Orb with enhanced glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 100 }}
            className="relative mx-auto py-6"
          >
            {/* Multiple glow layers */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                className="w-80 h-80 rounded-full bg-primary/20 blur-[100px]"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                className="w-64 h-64 rounded-full bg-accent/30 blur-[60px]"
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
            </div>
            
            {/* Pulsing rings */}
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <motion.div 
                  className={cn(
                    "rounded-full border",
                    ring === 1 && "w-52 h-52 border-primary/40",
                    ring === 2 && "w-64 h-64 border-primary/20",
                    ring === 3 && "w-80 h-80 border-primary/10"
                  )}
                  animate={{ 
                    scale: [1, 1.2 + ring * 0.1, 1], 
                    opacity: [0.6 - ring * 0.15, 0, 0.6 - ring * 0.15] 
                  }}
                  transition={{ 
                    duration: 2.5 + ring * 0.5, 
                    repeat: Infinity,
                    delay: ring * 0.3 
                  }}
                />
              </motion.div>
            ))}
            
            <PersonalizedOrb 
              size={180}
              state={orbState}
              className="mx-auto relative z-10"
            />
          </motion.div>

          {/* Dynamic pain point - typing effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="h-10 flex items-center justify-center"
          >
            <span className="text-lg sm:text-xl text-muted-foreground">
              {isRTL ? 'מכיר את הרגע ' : 'Know that feeling when '}
              <span className="text-primary font-semibold">{typedText}</span>
              <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-primary"
              >|</motion.span>
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]"
          >
            <motion.span 
              className="block text-foreground mb-2"
              initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {isRTL ? 'הפוך את החיים שלך' : 'Turn Your Life Into'}
            </motion.span>
            <motion.span 
              className="block"
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                {isRTL ? 'למשחק שאתה מנצח' : 'A Game You Win'}
              </span>
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {isRTL 
              ? 'מאמן AI אישי + גיימיפיקציה + היפנוזה מותאמת = טרנספורמציה אמיתית'
              : 'Personal AI Coach + Gamification + Custom Hypnosis = Real Transformation'}
          </motion.p>

          {/* Value Props Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { icon: '🧠', text: isRTL ? 'מאמן AI 24/7' : 'AI Coach 24/7' },
              { icon: '⚡', text: isRTL ? 'XP על כל פעולה' : 'XP for Actions' },
              { icon: '🎧', text: isRTL ? 'היפנוזה אישית' : 'Personal Hypnosis' },
              { icon: '🎯', text: isRTL ? 'תוכנית 90 יום' : '90-Day Plan' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl 
                  bg-card/80 backdrop-blur-sm border border-border/50
                  hover:border-primary/30 hover:bg-card transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-semibold text-sm text-foreground">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            {/* Primary CTA - Free Journey */}
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
                {isRTL ? '🎁 התחל מסע חינם' : '🎁 Start Free Journey'}
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                />
              </Button>
            </motion.div>
            
            {/* Secondary CTA */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/signup')}
                className="text-lg px-8 py-6 rounded-2xl border-2 border-border/80 
                  hover:border-primary/50 hover:bg-primary/5
                  group transition-all duration-300"
              >
                <Play className={cn("h-5 w-5 fill-current group-hover:text-primary transition-colors", isRTL ? "ml-2" : "mr-2")} />
                {isRTL ? 'הרשמה למערכת' : 'Sign Up Free'}
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground pt-4"
          >
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isRTL ? 'חינם להתחלה' : 'Free to start'}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-primary" />
              {isRTL ? 'תוצאות מהיום הראשון' : 'Results from day one'}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              {isRTL ? 'ללא כרטיס אשראי' : 'No credit card'}
            </span>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="h-8 w-8" />
        </motion.div>
      </motion.button>
    </section>
  );
}
