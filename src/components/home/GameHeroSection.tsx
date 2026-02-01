/**
 * GameHeroSection - Clean, conversion-focused hero
 * NO FAKE DATA - only authentic messaging and real value props
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, Target, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
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

export default function GameHeroSection() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orbState, setOrbState] = useState<'idle' | 'speaking' | 'thinking'>('idle');
  
  // Dynamic typing effect for pain points
  const typingTexts = isRTL ? [
    'שאתה מרגיש תקוע...',
    'שאתה יודע שאתה מסוגל ליותר...',
    'שהחיים עוברים מהר מדי...',
    'שאתה רוצה שינוי אמיתי...',
  ] : [
    "you feel stuck...",
    "you know you're capable of more...",
    "life is passing too quickly...",
    "you want real change...",
  ];
  
  const typedText = useTypingEffect(typingTexts, 60, 1500);
  
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-8 px-4">
      {/* HUD-style gradient background - Dark theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)/0.6) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)/0.6) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-6">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full 
              bg-primary/10 border border-primary/30"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">
              {isRTL ? 'הפוך את החיים למשחק' : 'Turn Life Into A Game'}
            </span>
          </motion.div>

          {/* 3D Orb with glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto py-4"
          >
            {/* Outer glow rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 rounded-full bg-primary/20 blur-3xl animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                className="w-48 h-48 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <PersonalizedOrb 
              size={160}
              state={orbState}
              className="mx-auto relative z-10"
            />
          </motion.div>

          {/* Dynamic pain point - typing effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-8 flex items-center justify-center"
          >
            <span className="text-lg text-muted-foreground">
              {isRTL ? 'מכיר את הרגע ' : 'Know that feeling when '}
              <span className="text-primary font-semibold">{typedText}</span>
              <span className="animate-blink">|</span>
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight"
          >
            <span className="block text-foreground mb-2">
              {isRTL ? 'הפוך את החיים שלך' : 'Turn Your Life Into'}
            </span>
            <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              {isRTL ? 'למשחק שאתה מנצח' : 'A Game You Win'}
            </span>
          </motion.h1>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6"
          >
            {[
              { icon: '🧠', text: isRTL ? 'מאמן AI אישי' : 'Personal AI Coach' },
              { icon: '⚡', text: isRTL ? 'XP על כל פעולה' : 'XP for Every Action' },
              { icon: '🎧', text: isRTL ? 'היפנוזה מותאמת' : 'Custom Hypnosis' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-sm text-foreground">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {/* Free Transformation Journey - Primary CTA */}
            <Button
              size="lg"
              onClick={() => navigate('/free-journey')}
              className="group relative text-lg px-10 py-7 rounded-2xl 
                bg-gradient-to-br from-primary via-primary to-primary/80
                hover:from-primary/90 hover:via-primary/90 hover:to-primary/70
                text-primary-foreground font-black
                shadow-[0_0_30px_hsl(var(--primary)/0.5),0_10px_25px_rgba(0,0,0,0.3)]
                hover:shadow-[0_0_50px_hsl(var(--primary)/0.7),0_15px_35px_rgba(0,0,0,0.4)]
                border-2 border-primary/40
                transition-all duration-300 hover:scale-105
                animate-pulse-glow"
            >
              <Sparkles className={cn("h-6 w-6", isRTL ? "ml-3" : "mr-3")} />
              {isRTL ? '🎁 מסע טרנספורמציה חינם' : '🎁 Free Transformation'}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-white/20"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signup')}
              className="text-lg px-8 py-6 rounded-2xl border-2 group"
            >
              <Play className={cn("h-5 w-5 fill-current", isRTL ? "ml-2" : "mr-2")} />
              {isRTL ? 'הרשמה למערכת' : 'Sign Up'}
            </Button>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground pt-4"
          >
            <span className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-accent" />
              {isRTL ? 'חינם להתחלה' : 'Free to start'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4 text-emerald-500" />
              {isRTL ? 'תוצאות מהיום הראשון' : 'Results from day one'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              {isRTL ? 'ללא כרטיס אשראי' : 'No credit card'}
            </span>
          </motion.div>
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </section>
  );
}
