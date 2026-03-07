/**
 * GamificationSection — "Level Up Your Life" — XP, Streaks, Skill Trees, Badges
 * Deep gamification showcase matching the empire aesthetic
 */
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Swords, Target, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const xpActions = [
  { emoji: '🧠', action: 'Hypnosis Session', actionHe: 'סשן היפנוזה', xp: '+50 XP' },
  { emoji: '✅', action: 'Task Complete', actionHe: 'משימה הושלמה', xp: '+20 XP' },
  { emoji: '📚', action: 'Lesson Done', actionHe: 'שיעור הושלם', xp: '+30 XP' },
  { emoji: '💬', action: 'Community Post', actionHe: 'פוסט בקהילה', xp: '+15 XP' },
  { emoji: '🔥', action: '7-Day Streak', actionHe: 'רצף 7 ימים', xp: 'x1.5', xpHe: 'בונוס x1.5' },
];

export default function GamificationSection() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const pillars = [
    { icon: Flame, title: isHe ? 'רצפים יומיים' : 'Daily Streaks', desc: isHe ? 'מכפילי תגמול — x1.5 ביום 7, x2 ביום 30' : 'Reward multipliers — x1.5 at day 7, x2 at day 30', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { icon: Star, title: isHe ? 'רמות 1-100+' : 'Levels 1-100+', desc: isHe ? 'כל פעולה צוברת XP — עלה ברמות ופתח יכולות חדשות' : 'Every action earns XP — level up and unlock new abilities', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { icon: Swords, title: isHe ? 'עץ מיומנויות' : 'Skill Tree', desc: isHe ? 'פתח מיומנויות חוצות-תחומים — כל פעולה משפיעה על skills ספציפיים' : 'Develop cross-domain skills — every action impacts specific skills', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { icon: Target, title: isHe ? 'קווסטים יומיים' : 'Daily Quests', desc: isHe ? 'כל יום הוא קווסט עם שם ייחודי — שבוע שלם = קמפיין' : 'Each day is a quest with a unique name — a full week = a campaign', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { icon: Trophy, title: isHe ? 'תגים ולוח מובילים' : 'Badges & Leaderboards', desc: isHe ? 'הרוויח תגים על הישגים ותתחרה עם הקהילה' : 'Earn badges for achievements and compete with the community', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { icon: BarChart3, title: isHe ? 'ציון תנועה' : 'Movement Score', desc: isHe ? 'ציון מומנטום בזמן אמת שמניע את האורב שלך' : 'Real-time momentum score that drives your Orb', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">
              {isHe ? 'גיימיפיקציה עמוקה' : 'Deep Gamification'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              {isHe ? 'עלה ברמות. הרוויח. שלוט.' : 'Level Up. Earn. Dominate.'}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isHe
              ? 'כל פעולה במערכת מתגמלת XP ו-MOS — משימות, הרגלים, היפנוזה, למידה, ופעילות קהילתית'
              : 'Every action in the system rewards XP & MOS — tasks, habits, hypnosis, learning, and community activity'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* XP Feed — 2 cols */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-2 p-6 rounded-3xl bg-card/80 backdrop-blur border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  {isHe ? 'סטטוס שחקן' : 'Player Status'}
                </p>
                <p className="text-3xl font-black text-foreground mt-1">
                  {isHe ? 'רמה' : 'Level'} <span className="text-amber-400">27</span>
                </p>
                <p className="text-sm text-muted-foreground">4,280 / 5,000 XP</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/30">
                <Star className="h-8 w-8 text-amber-400" />
              </div>
            </div>

            {/* XP bar */}
            <div className="w-full h-3 rounded-full bg-muted mb-5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                initial={{ width: 0 }}
                whileInView={{ width: '86%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>

            {/* XP log */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {isHe ? 'XP אחרון' : 'Recent XP'}
              </p>
              {xpActions.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{a.emoji}</span>
                    <span className="text-xs text-foreground">{isHe ? a.actionHe : a.action}</span>
                  </div>
                  <span className="text-xs font-black text-amber-400">{a.xp}</span>
                </motion.div>
              ))}
            </div>

            {/* Streak */}
            <div className="mt-4 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-center gap-3">
              <Flame className="h-6 w-6 text-orange-400" />
              <div>
                <p className="text-sm font-black text-orange-400">
                  🔥 12 {isHe ? 'ימים ברצף' : 'Day Streak'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isHe ? 'מכפיל x1.5 פעיל!' : 'x1.5 Multiplier Active!'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feature cards — 3 cols */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * i }}
                  className={cn(
                    'p-5 rounded-2xl bg-card/60 backdrop-blur border transition-colors hover:shadow-lg',
                    p.border
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', p.bg)}>
                    <Icon className={cn('h-5 w-5', p.color)} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
