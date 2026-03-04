/**
 * CommunitySection — Showcase the community features
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Users, MessageSquare, Calendar, Trophy, Star, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const communityHighlights = [
  { icon: MessageSquare, he: 'פוסטים ודיונים', en: 'Posts & Discussions', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: Calendar, he: 'אירועים חיים', en: 'Live Events', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: Trophy, he: 'לוח מובילים', en: 'Leaderboard', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: Star, he: 'רמות ותגים', en: 'Levels & Badges', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { icon: Flame, he: 'רצפים ונקודות', en: 'Streaks & Points', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: Users, he: 'קהילת משתמשים', en: 'User Community', color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

export default function CommunitySection() {
  const { isRTL } = useTranslation();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 via-transparent to-muted/30 dark:from-gray-900/30 dark:via-transparent dark:to-gray-900/30">
      <div className="container mx-auto max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
            <Users className="h-4 w-4 text-pink-500" />
            <span className="text-sm font-medium text-pink-500">
              {isRTL ? 'קומיוניטי' : 'Community'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {isRTL ? 'קהילה של ' : 'A Community of '}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              {isRTL ? 'אנשים שמתפתחים' : 'People Who Grow'}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? 'שתף, למד מאחרים, השתתף באירועים, צבור נקודות ועלה ברמות — ביחד.'
              : 'Share, learn from others, join events, earn points and level up — together.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {communityHighlights.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.07 * i }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-card/60 border border-border/50 hover:border-pink-500/30 transition-all text-center"
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', item.bg)}>
                  <Icon className={cn('h-6 w-6', item.color)} />
                </div>
                <p className="font-semibold text-sm text-foreground">{isRTL ? item.he : item.en}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
