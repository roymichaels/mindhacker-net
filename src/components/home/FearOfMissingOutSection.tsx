/**
 * FearOfMissingOutSection - Urgency section with countdown
 * NO FAKE DATA - only authentic messaging
 */

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function FearOfMissingOutSection() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  
  // Countdown to midnight (time left in the day)
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

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
      {/* Animated background pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <div className="container mx-auto max-w-4xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/20 border border-primary/30"
          >
            <TrendingUp className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-bold text-primary">
              {isRTL ? 'הזמן לא מחכה' : 'Time Waits for No One'}
            </span>
          </motion.div>

          {/* Countdown Timer - Time left today */}
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="text-2xl sm:text-3xl font-black text-primary-foreground tabular-nums">
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-foreground">
              {isRTL 
                ? 'כמה שעות נשארו להיום - מה תעשה איתן?'
                : 'Hours Left Today - What Will You Do With Them?'
              }
            </h2>
            <p className="text-lg text-muted-foreground">
              {isRTL 
                ? 'כל יום הוא הזדמנות חדשה. התחל את המסע שלך עכשיו.'
                : 'Every day is a new opportunity. Start your journey now.'
              }
            </p>
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
                bg-gradient-to-r from-primary via-primary to-primary/80
                hover:from-primary/90 hover:via-primary/90 hover:to-primary/70
                font-black text-primary-foreground
                shadow-[0_0_30px_hsl(var(--primary)/0.5)]
                hover:shadow-[0_0_50px_hsl(var(--primary)/0.7)]
                animate-pulse-glow"
            >
              <Clock className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
              {isRTL ? 'התחל עכשיו' : 'Start Now'}
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
