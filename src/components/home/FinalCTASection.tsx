/**
 * FinalCTASection - The ultimate closer
 * NO FAKE DATA - only authentic messaging and real guarantees
 */

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Shield, 
  Clock, 
  CreditCard, 
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PresetOrb } from '@/components/orb/PresetOrb';

const guarantees = [
  { icon: Shield, keyHe: 'מסע מותאם אישית', keyEn: 'Personalized journey' },
  { icon: CreditCard, keyHe: 'תוצאות מוכחות', keyEn: 'Proven results' },
  { icon: Clock, keyHe: '5 דקות להתחיל', keyEn: '5 minutes to get started' },
  { icon: Star, keyHe: 'ביטול בכל רגע', keyEn: 'Cancel anytime' },
];

const whatYouGet = [
  { emoji: '🧠', keyHe: 'מאמן AI אישי 24/7', keyEn: 'Personal AI Coach 24/7' },
  { emoji: '🎮', keyHe: 'גיימיפיקציה מלאה', keyEn: 'Full Gamification' },
  { emoji: '🎧', keyHe: 'היפנוזה מותאמת אישית', keyEn: 'Custom Hypnosis' },
  { emoji: '📊', keyHe: 'דאשבורד התקדמות', keyEn: 'Progress Dashboard' },
  { emoji: '🏆', keyHe: 'הישגים ותגמולים', keyEn: 'Achievements & Rewards' },
  { emoji: '🥷', keyHe: 'מערכת Job ייחודית', keyEn: 'Unique Job System' },
];

export default function FinalCTASection() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted via-muted/70 to-muted dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Background effects - subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 sm:p-12 rounded-3xl bg-card border-2 border-primary/30 shadow-2xl shadow-primary/10"
        >
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 blur-xl" />
          
          <div className="relative z-10">
            {/* Orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <PresetOrb startIndex={7} size={160} />
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-4 text-foreground"
            >
              {isRTL 
                ? 'מוכן לשחק את המשחק של החיים שלך?'
                : 'Ready to Play The Game of Your Life?'
              }
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8"
            >
              {isRTL 
                ? 'הצטרף לאנשים שהפכו את החיים שלהם למשחק שהם מנצחים בו כל יום'
                : 'Join people who turned their lives into a game they win every day'
              }
            </motion.p>

            {/* What you get grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8"
            >
              {whatYouGet.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{isRTL ? item.keyHe : item.keyEn}</span>
                </div>
              ))}
            </motion.div>

            {/* Main CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-4 mb-8"
            >
              <Button
                size="lg"
                onClick={() => navigate('/onboarding')}
                className="group text-xl px-12 py-8 rounded-2xl 
                  bg-gradient-to-br from-muted via-muted/80 to-muted dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
                  hover:from-muted/80 hover:via-muted/60 hover:to-muted/80 dark:hover:from-gray-800 dark:hover:via-gray-700 dark:hover:to-gray-800
                  text-foreground font-black
                  shadow-[0_0_40px_rgba(0,0,0,0.3),0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_0_40px_rgba(0,0,0,0.6),0_15px_40px_rgba(0,0,0,0.3)]
                  hover:shadow-[0_0_60px_hsl(var(--primary)/0.3),0_20px_50px_rgba(0,0,0,0.2)]
                  border-2 border-primary/30
                  transition-all duration-300 hover:scale-105"
              >
                <Rocket className={cn(
                  "h-6 w-6 text-primary group-hover:animate-bounce",
                  isRTL ? "ml-3" : "mr-3"
                )} />
                {isRTL ? '🚀 התחל את המשחק!' : '🚀 Start The Game!'}
              </Button>
            </motion.div>

            {/* Guarantees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
            >
              {guarantees.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="h-4 w-4 text-emerald-500" />
                  <span>{isRTL ? item.keyHe : item.keyEn}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
