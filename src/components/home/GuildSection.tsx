/**
 * GuildSection — "Join the Guild" — Community + AI Learning Engine
 * Expanded to properly showcase both pillars with more detail
 */
import { motion } from 'framer-motion';
import {
  Users, BookOpen, MessageSquare, Trophy, GraduationCap, Target,
  Sparkles, Heart, Layers, Flame, Brain, BarChart3
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export default function GuildSection() {
  const { t, isRTL } = useTranslation();

  const communityFeatures = [
    { icon: MessageSquare, text: t('home.guild.posts'), color: 'text-sky-400' },
    { icon: Trophy, text: t('home.guild.leaderboard'), color: 'text-amber-400' },
    { icon: Users, text: t('home.guild.playerCards'), color: 'text-emerald-400' },
    { icon: Heart, text: isRTL ? 'אירועים חיים ומפגשים' : 'Live Events & Meetups', color: 'text-rose-400' },
    { icon: Flame, text: isRTL ? 'רצפים ונקודות XP' : 'Streaks & XP Points', color: 'text-orange-400' },
  ];

  const learningFeatures = [
    { icon: GraduationCap, text: t('home.guild.aiCourses'), color: 'text-indigo-400' },
    { icon: Target, text: t('home.guild.pillarModules'), color: 'text-violet-400' },
    { icon: BookOpen, text: t('home.guild.exercises'), color: 'text-cyan-400' },
    { icon: Brain, text: isRTL ? 'תוכן מותאם מהנתונים שלך' : 'Content adapted from your data', color: 'text-fuchsia-400' },
    { icon: Layers, text: isRTL ? 'סנכרון עם תוכנית 100 יום' : 'Syncs with your 100-Day Plan', color: 'text-emerald-400' },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/30 mb-6">
            <Users className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-bold text-sky-400">{t('home.guild.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            {t('home.guild.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.guild.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Community card */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-3xl bg-card/80 backdrop-blur border-2 border-sky-500/30 shadow-xl shadow-sky-500/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-sky-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">{t('home.guild.communityTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('home.guild.communityDesc')}</p>
              </div>
            </div>
            <div className="space-y-2">
              {communityFeatures.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30 hover:border-sky-500/20 transition-colors"
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', item.color)} />
                  <span className="text-sm text-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Community stats mock */}
            <div className="mt-5 p-3 rounded-xl bg-sky-500/5 border border-sky-500/20">
              <div className="flex items-center justify-around">
                {[
                  { val: '2.4K', label: isRTL ? 'שחקנים' : 'Players' },
                  { val: '14', label: isRTL ? 'רובעים' : 'Districts' },
                  { val: '24/7', label: isRTL ? 'פעיל' : 'Active' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-lg font-black text-sky-400">{s.val}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Learning Engine card */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-3xl bg-card/80 backdrop-blur border-2 border-indigo-500/30 shadow-xl shadow-indigo-500/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">{t('home.guild.learningTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('home.guild.learningDesc')}</p>
              </div>
            </div>
            <div className="space-y-2">
              {learningFeatures.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30 hover:border-indigo-500/20 transition-colors"
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', item.color)} />
                  <span className="text-sm text-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Learning flow mock */}
            <div className="mt-5 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
              <p className="text-xs font-bold text-indigo-400 mb-2 text-center">
                {isRTL ? 'זרימה: Aurora מלמדת אותך' : 'Flow: Aurora Teaches You'}
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 font-bold">
                  {isRTL ? 'בנה קוריקולום' : 'Build Curriculum'}
                </span>
                <span>→</span>
                <span className="px-2 py-1 rounded bg-violet-500/10 text-violet-400 font-bold">
                  {isRTL ? 'למד' : 'Learn'}
                </span>
                <span>→</span>
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                  {isRTL ? 'סנכרן לתוכנית' : 'Sync to Plan'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
