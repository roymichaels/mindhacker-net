import { motion } from 'framer-motion';
import { Star, Flame, Coins, Trophy, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

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

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Gamification</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('home.gamificationTitle')}
          </h2>
          
          <p className="text-lg text-muted-foreground">
            {t('home.gamificationSubtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {gamificationFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "relative p-6 rounded-2xl text-center",
                  "bg-card border border-border/50",
                  "hover:border-primary/30 transition-all hover:shadow-lg"
                )}
              >
                <div className={cn(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4",
                  feature.bgColor
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                    feature.color
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <h3 className="font-bold text-lg mb-1">
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

            <p className="text-center text-sm text-muted-foreground mt-4">
              {isRTL 
                ? 'פתח הישגים ואסוף tokens לפיצ\'רים פרימיום!' 
                : 'Unlock achievements and collect tokens for premium features!'}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
