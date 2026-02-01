import { motion } from 'framer-motion';
import { Star, Flame, Coins, Trophy, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const gamificationFeatures = [
  { 
    icon: Star, 
    key: 'LevelUp', 
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10'
  },
  { 
    icon: Flame, 
    key: 'Streaks', 
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-500/10'
  },
  { 
    icon: Coins, 
    key: 'Tokens', 
    color: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-amber-500/10'
  },
  { 
    icon: Trophy, 
    key: 'Achievements', 
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-500/10'
  },
];

const xpActions = [
  { key: 'xpChat', xp: 5, icon: '💬' },
  { key: 'xpTask', xp: 10, icon: '✅' },
  { key: 'xpInsight', xp: 15, icon: '💡' },
  { key: 'xpDaily', xp: 25, icon: '🔥' },
  { key: 'xpMilestone', xp: 50, icon: '🏆' },
];

export default function GamificationFeaturesSection() {
  const { t, isRTL } = useTranslation();

  // Mock data for preview
  const mockLevel = 7;
  const mockXp = 1450;
  const mockXpRequired = 2000;
  const mockStreak = 12;
  const mockTokens = 340;
  const mockAchievements = 15;
  const mockUsersLeveledUp = 78;

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/50 via-muted/20 to-transparent dark:from-gray-900/50 dark:via-gray-950/30 dark:to-transparent relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-violet-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/20 to-amber-500/20 border border-violet-500/30 mb-6 shadow-lg shadow-violet-500/10">
            <TrendingUp className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-violet-300">Gamification</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5">
            {t('home.gamificationTitle')}
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('home.gamificationSubtitle')}
          </p>
        </motion.div>

        {/* Progress Bar Preview - Addiction Mechanic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto mb-12 p-6 rounded-2xl bg-card border border-border/50"
        >
          {/* Level & XP Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-violet-400" />
              <span className="font-bold text-lg">Level {mockLevel}</span>
            </div>
            <span className="text-muted-foreground tabular-nums">{mockXp} / {mockXpRequired} XP</span>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <Progress value={(mockXp / mockXpRequired) * 100} className="h-3" />
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-orange-500">{mockStreak}</span>
              <span className="text-muted-foreground">{isRTL ? 'ימים' : 'days'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="font-semibold">{mockTokens}</span>
              <span className="text-muted-foreground">Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold">{mockAchievements}/50</span>
              <span className="text-muted-foreground">{isRTL ? 'הישגים' : 'Achievements'}</span>
            </div>
          </div>

          {/* Loss Aversion Message */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center"
          >
            <p className="text-sm font-medium text-orange-400">
              🔥 {t('home.dontLoseStreak')} {mockStreak} {isRTL ? 'ימים רצופים!' : 'day streak!'}
            </p>
          </motion.div>
        </motion.div>

        {/* Features Grid - Vertical stack on mobile, grid on tablet+ */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          {gamificationFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={cn(
                  "relative p-6 sm:p-8 rounded-2xl text-center",
                  "bg-card/60 border border-border/50 backdrop-blur-sm",
                  "hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                )}
              >
                <div className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center mb-5",
                  feature.bgColor
                )}>
                  <div className={cn(
                    "w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    feature.color
                  )}>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                </div>
                
                <h3 className="font-bold text-lg sm:text-xl mb-2">
                  {t(`home.feature${feature.key}`)}
                </h3>
                
                <p className="text-sm text-muted-foreground">
                  {t(`home.feature${feature.key}Desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* XP Actions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <h3 className="text-xl font-bold mb-4 text-center">
              {isRTL ? 'כל פעולה מזכה ב-XP:' : 'Every action earns XP:'}
            </h3>
            
            <div className="space-y-3">
              {xpActions.map((action, index) => (
                <motion.div
                  key={action.key}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{action.icon}</span>
                    <span className="font-medium">{t(`home.${action.key}`)}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
                    +{action.xp} XP
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <Users className="h-4 w-4 text-primary" />
              <span>
                <span className="font-bold text-foreground">{mockUsersLeveledUp}</span> {t('home.usersLeveledUp')}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
