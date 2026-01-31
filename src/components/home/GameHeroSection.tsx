import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Sparkles, Zap, Trophy, Target, Clock, Users, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { PersonalizedOrb } from '@/components/orb';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Fake live counter for social proof
const useLiveCounter = (baseNumber: number, increment: number = 1) => {
  const [count, setCount] = useState(baseNumber);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * increment) + 1);
    }, 3000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [increment]);
  
  return count;
};

// Typing effect
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

// XP Bar that fills up
const AnimatedXPBar = () => {
  const [xp, setXp] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setXp(prev => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 15;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-xs text-cyan-300 mb-1">
        <span>Level 1 → Level 2</span>
        <span>{Math.floor(xp)}%</span>
      </div>
      <div className="relative h-3 bg-black/50 rounded-full overflow-hidden border border-cyan-500/30">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400"
          style={{ width: `${xp}%` }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  );
};

// Live notification popup
const LiveNotification = ({ isRTL }: { isRTL: boolean }) => {
  const notifications = isRTL ? [
    { name: 'דני מ.', action: 'עלה לרמה 5', icon: '⭐', time: 'עכשיו' },
    { name: 'שירה ק.', action: 'השלימה צ\'אט יומי', icon: '💬', time: '2 דק\' ' },
    { name: 'אבי ש.', action: 'קיבל הישג חדש', icon: '🏆', time: '5 דק\'' },
    { name: 'מיכל ב.', action: 'התחילה היפנוזה', icon: '🎧', time: '8 דק\'' },
  ] : [
    { name: 'Danny M.', action: 'leveled up to 5', icon: '⭐', time: 'now' },
    { name: 'Sarah K.', action: 'completed daily chat', icon: '💬', time: '2m ago' },
    { name: 'Avi S.', action: 'earned new badge', icon: '🏆', time: '5m ago' },
    { name: 'Michelle B.', action: 'started hypnosis', icon: '🎧', time: '8m ago' },
  ];
  
  const [current, setCurrent] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % notifications.length);
        setIsVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, [notifications.length]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className={cn(
            "fixed bottom-24 z-50 px-4 py-3 rounded-xl",
            "bg-gradient-to-r from-emerald-500/90 to-cyan-500/90 backdrop-blur-md",
            "border border-white/20 shadow-2xl shadow-emerald-500/30",
            isRTL ? "right-4" : "left-4"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{notifications[current].icon}</span>
            <div className="text-white">
              <span className="font-bold">{notifications[current].name}</span>
              <span className="opacity-90"> {notifications[current].action}</span>
            </div>
            <span className="text-xs text-white/70">{notifications[current].time}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function GameHeroSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orbState, setOrbState] = useState<'idle' | 'speaking' | 'thinking'>('idle');
  
  // Live counters for social proof
  const activeUsers = useLiveCounter(1247, 3);
  const totalXPEarned = useLiveCounter(847293, 50);
  
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

  // Calculate time wasted today
  const hoursWasted = new Date().getHours();
  const minutesWasted = new Date().getMinutes();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-8 px-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/10" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)/0.5) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)/0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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

      {/* Live notifications */}
      <LiveNotification isRTL={isRTL} />

      <div className="relative z-10 container mx-auto max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-6">
          
          {/* URGENCY BANNER - Loss Aversion */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full 
              bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 
              border border-red-500/30 shadow-lg shadow-red-500/10"
          >
            <Clock className="h-4 w-4 text-red-400 animate-pulse" />
            <span className="text-sm font-bold text-red-400">
              {isRTL 
                ? `⚠️ עברו ${hoursWasted} שעות ו-${minutesWasted} דקות מהיום בלי שינוי`
                : `⚠️ ${hoursWasted}h ${minutesWasted}m of today already passed without change`
              }
            </span>
          </motion.div>

          {/* Live Stats Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Users className="h-4 w-4 text-emerald-400" />
              <span className="font-bold text-emerald-400">{activeUsers.toLocaleString()}</span>
              <span className="text-xs text-emerald-300">{isRTL ? 'אונליין עכשיו' : 'online now'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30">
              <Zap className="h-4 w-4 text-violet-400" />
              <span className="font-bold text-violet-400">{totalXPEarned.toLocaleString()}</span>
              <span className="text-xs text-violet-300">XP {isRTL ? 'הרוויחו היום' : 'earned today'}</span>
            </div>
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
              showGlow={true}
              className="mx-auto relative z-10"
              disablePersonalization={!user}
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
            <span className="block bg-gradient-to-r from-cyan-400 via-primary to-violet-400 bg-clip-text text-transparent">
              {isRTL ? 'למשחק שאתה מנצח' : 'A Game You Win'}
            </span>
          </motion.h1>

          {/* XP Progress preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <AnimatedXPBar />
          </motion.div>

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
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/50">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-sm">{item.text}</span>
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
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="group relative text-lg px-10 py-7 rounded-2xl 
                bg-gradient-to-br from-cyan-400 via-cyan-500 to-emerald-500
                hover:from-cyan-300 hover:via-cyan-400 hover:to-emerald-400
                text-cyan-950 font-black
                shadow-[0_0_30px_rgba(34,211,238,0.5),0_10px_25px_rgba(0,0,0,0.3)]
                hover:shadow-[0_0_50px_rgba(34,211,238,0.7),0_15px_35px_rgba(0,0,0,0.4)]
                border-2 border-cyan-200/40
                transition-all duration-300 hover:scale-105
                animate-pulse-glow"
            >
              <Play className={cn("h-6 w-6 fill-current", isRTL ? "ml-3" : "mr-3")} />
              {isRTL ? 'התחל את המשחק' : 'Start The Game'}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-white/20"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-lg px-8 py-6 rounded-2xl border-2 group"
            >
              {isRTL ? 'איך זה עובד?' : 'How It Works?'}
              <ArrowRight className={cn(
                "h-5 w-5 transition-transform group-hover:translate-x-1",
                isRTL ? "mr-2 rotate-180 group-hover:-translate-x-1" : "ml-2"
              )} />
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
              <Trophy className="h-4 w-4 text-amber-500" />
              {isRTL ? 'חינם להתחלה' : 'Free to start'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4 text-emerald-500" />
              {isRTL ? 'תוצאות מהיום הראשון' : 'Results from day one'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-violet-500" />
              {isRTL ? 'ללא כרטיס אשראי' : 'No credit card'}
            </span>
          </motion.div>
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
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
