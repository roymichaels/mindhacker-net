/**
 * JobShowcaseSection - Shows the RPG Job system with character selection feel
 * Makes users excited to discover their "class"
 */

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const showcaseJobs = [
  {
    id: 'mind-ninja',
    icon: '🥷',
    nameHe: "נינג'ה של המוח",
    nameEn: 'Mind Ninja',
    descHe: 'שולט במחשבות בדיוק קטלני',
    descEn: 'Masters thoughts with lethal precision',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    tier: 2,
  },
  {
    id: 'reality-hacker',
    icon: '💻',
    nameHe: 'האקר המציאות',
    nameEn: 'Reality Hacker',
    descHe: 'פורץ קודי מציאות ומשנה אותם',
    descEn: 'Breaks reality codes and rewrites them',
    color: 'from-cyan-500 to-emerald-500',
    bgColor: 'bg-cyan-500/10',
    tier: 2,
  },
  {
    id: 'shadow-master',
    icon: '🌘',
    nameHe: 'שליט הצללים',
    nameEn: 'Shadow Master',
    descHe: 'שולט באופל ובאור',
    descEn: 'Masters both darkness and light',
    color: 'from-slate-600 to-slate-800',
    bgColor: 'bg-slate-500/10',
    tier: 3,
    locked: true,
  },
  {
    id: 'consciousness-sage',
    icon: '🔮',
    nameHe: 'חכם התודעה',
    nameEn: 'Consciousness Sage',
    descHe: 'הגיע לשיא ההבנה האנושית',
    descEn: 'Reached peak human understanding',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    tier: 4,
    locked: true,
  },
  {
    id: 'infinite-player',
    icon: '♾️',
    nameHe: 'השחקן האינסופי',
    nameEn: 'Infinite Player',
    descHe: 'משחק את משחק החיים ללא גבולות',
    descEn: 'Plays the game of life without limits',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-500/10',
    tier: 4,
    locked: true,
  },
  {
    id: 'unknown',
    icon: '❓',
    nameHe: 'ה-Job שלך',
    nameEn: 'Your Job',
    descHe: 'מה תהיה הזהות שלך?',
    descEn: 'What will your identity be?',
    color: 'from-primary to-primary/60',
    bgColor: 'bg-primary/10',
    tier: 0,
    isYou: true,
  },
];

export default function JobShowcaseSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/50 via-muted/20 to-transparent dark:from-gray-950/50 dark:via-gray-900/30 dark:to-transparent relative overflow-hidden" id="how-it-works">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/20 to-primary/20 border border-violet-500/30 mb-6">
            <Star className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-violet-300">
              {isRTL ? 'מערכת ה-Job' : 'Job System'}
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {isRTL ? 'גלה את ה' : 'Discover Your '}
            <span className="bg-gradient-to-r from-violet-400 to-primary bg-clip-text text-transparent">
              {isRTL ? 'זהות הדיגיטלית' : 'Digital Identity'}
            </span>
            {isRTL ? ' שלך' : ''}
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? 'ה-AI יגלה את ה"מקצוע" הייחודי שלך על סמך מי שאתה באמת. התקדם ברמות ופתח זהויות חדשות!'
              : 'The AI discovers your unique "class" based on who you really are. Level up and unlock new identities!'
            }
          </p>
        </motion.div>

        {/* Jobs Grid - Character Selection Style */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {showcaseJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={cn(
                "relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer group",
                job.isYou 
                  ? "border-primary/50 bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse-glow"
                  : job.locked 
                    ? "border-border/30 bg-card/30 opacity-60"
                    : "border-border/50 bg-card/60 hover:border-primary/40",
              )}
            >
              {/* Tier Badge */}
              {job.tier > 0 && (
                <div className={cn(
                  "absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  job.tier === 2 ? "bg-violet-500 text-white" :
                  job.tier === 3 ? "bg-amber-500 text-black" :
                  job.tier === 4 ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white" :
                  "bg-primary text-primary-foreground"
                )}>
                  {job.locked ? <Lock className="h-3 w-3" /> : `T${job.tier}`}
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 mx-auto",
                job.bgColor
              )}>
                <span className="text-4xl sm:text-5xl">{job.icon}</span>
              </div>

              {/* Name */}
              <h3 className={cn(
                "text-lg sm:text-xl font-bold text-center mb-2",
                job.isYou && "text-primary"
              )}>
                {isRTL ? job.nameHe : job.nameEn}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground text-center">
                {isRTL ? job.descHe : job.descEn}
              </p>

              {/* Hover effect for unlocked */}
              {!job.locked && !job.isYou && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}

              {/* Glow for "your job" */}
              {job.isYou && (
                <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-pulse pointer-events-none" />
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="text-lg px-8 py-6 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 font-bold border border-primary/30 text-foreground shadow-xl shadow-black/20"
          >
            <Sparkles className={cn("h-5 w-5 text-primary", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'גלה את ה-Job שלך' : 'Discover Your Job'}
            <ArrowRight className={cn(
              "h-5 w-5 transition-transform",
              isRTL ? "mr-2 rotate-180" : "ml-2"
            )} />
          </Button>
          
          <p className="mt-4 text-sm text-muted-foreground">
            {isRTL 
              ? '🎮 ה-AI יקבע את ה-Job שלך בסיום תהליך ההיכרות'
              : '🎮 The AI determines your Job after the onboarding process'
            }
          </p>
        </motion.div>
      </div>
    </section>
  );
}
