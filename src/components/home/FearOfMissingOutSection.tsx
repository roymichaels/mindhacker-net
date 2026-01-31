/**
 * FearOfMissingOutSection - Strong FOMO with countdown and scarcity
 */

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, Users, ArrowRight, Flame, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function FearOfMissingOutSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  
  // Countdown to midnight (or custom date)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight.getTime() - now.getTime();
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };
    
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fake "people viewing" counter
  const [viewing, setViewing] = useState(127);
  useEffect(() => {
    const interval = setInterval(() => {
      setViewing(prev => Math.max(100, prev + Math.floor(Math.random() * 7) - 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 relative overflow-hidden">
      {/* Animated background pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/10 to-orange-500/5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <div className="container mx-auto max-w-4xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-6">
          {/* Alert banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/20 border border-red-500/30"
          >
            <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
            <span className="text-sm font-bold text-red-400">
              {isRTL ? 'ההזדמנות נגמרת בחצות!' : 'Opportunity ends at midnight!'}
            </span>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center gap-4"
          >
            {[
              { value: timeLeft.hours, label: isRTL ? 'שעות' : 'Hours' },
              { value: timeLeft.minutes, label: isRTL ? 'דקות' : 'Min' },
              { value: timeLeft.seconds, label: isRTL ? 'שניות' : 'Sec' },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {String(item.value).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-2">{item.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              {isRTL 
                ? 'כל יום שאתה מחכה = יום שאתה מפסיד'
                : 'Every Day You Wait = A Day You Lose'
              }
            </h2>
            <p className="text-lg text-muted-foreground">
              {isRTL 
                ? 'המתחרים שלך כבר מתקדמים. אתה מוכן להצטרף?'
                : 'Your competitors are already progressing. Ready to join?'
              }
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <Users className="h-4 w-4 text-red-400" />
              <span className="font-bold">{viewing}</span>
              <span className="text-sm text-muted-foreground">
                {isRTL ? 'צופים עכשיו' : 'viewing now'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/50">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="font-bold">47</span>
              <span className="text-sm text-muted-foreground">
                {isRTL ? 'הצטרפו היום' : 'joined today'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/50">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="font-bold">92%</span>
              <span className="text-sm text-muted-foreground">
                {isRTL ? 'המשיכו אחרי שבוע' : 'continued after week 1'}
              </span>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="text-lg px-10 py-7 rounded-2xl 
                bg-gradient-to-r from-red-500 via-orange-500 to-red-500
                hover:from-red-400 hover:via-orange-400 hover:to-red-400
                font-black text-white
                shadow-[0_0_30px_rgba(239,68,68,0.5)]
                hover:shadow-[0_0_50px_rgba(239,68,68,0.7)]
                animate-pulse-glow"
            >
              <Clock className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
              {isRTL ? 'אל תפספס - התחל עכשיו' : "Don't Miss Out - Start Now"}
              <ArrowRight className={cn(
                "h-5 w-5",
                isRTL ? "mr-2 rotate-180" : "ml-2"
              )} />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
