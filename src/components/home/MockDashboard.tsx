import { motion } from 'framer-motion';
import { Flame, Coins, Trophy, Target, CheckSquare, Swords } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface MockDashboardProps {
  className?: string;
  animate?: boolean;
}

export default function MockDashboard({ className, animate = true }: MockDashboardProps) {
  const { t, isRTL } = useTranslation();

  const stats = {
    level: 12,
    xp: 78,
    streak: 14,
    tokens: 85,
    tasks: { done: 3, total: 5 },
    weeklyGoal: 67,
  };

  return (
    <motion.div
      className={cn(
        "relative w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl",
        "bg-gradient-to-br from-card/95 via-card/90 to-card/80",
        "border border-primary/20 shadow-2xl shadow-primary/10",
        "backdrop-blur-sm overflow-hidden",
        className
      )}
      initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : undefined}
      animate={animate ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.6, ease: "easeOut" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-50" />
      
      {/* Header Row - Level & XP & Streak */}
      <motion.div 
        className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4"
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 1 } : undefined}
        transition={{ delay: 0.2 }}
      >
        {/* Level Badge */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('home.mockLevel').split(' ')[0]}</p>
            <p className="font-bold text-lg">{stats.level}</p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="flex-1 min-w-[120px] max-w-[200px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">XP</span>
            <span className="font-medium">{stats.xp}%</span>
          </div>
          <Progress value={animate ? stats.xp : 0} className="h-2" />
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <Flame className="h-5 w-5 text-orange-500 fill-orange-500/30" />
          <span className="font-bold text-orange-500">{stats.streak}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {isRTL ? 'ימים' : 'days'}
          </span>
        </div>
      </motion.div>

      {/* Stats Cards Row */}
      <motion.div 
        className="relative z-10 grid grid-cols-3 gap-3 mb-4"
        initial={animate ? { opacity: 0, y: 10 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 0.4 }}
      >
        {/* Ego State */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Swords className="h-4 w-4 text-red-400" />
            <span className="text-xs font-medium text-red-300">Warrior</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isRTL ? 'מצב פעיל' : 'Active State'}
          </p>
        </div>

        {/* Tokens */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">{stats.tokens}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Tokens</p>
        </div>

        {/* Tasks */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="h-4 w-4 text-green-400" />
            <span className="text-xs font-medium text-green-300">
              {stats.tasks.done}/{stats.tasks.total}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isRTL ? 'משימות' : 'Tasks'}
          </p>
        </div>
      </motion.div>

      {/* Weekly Goal */}
      <motion.div 
        className="relative z-10 p-4 rounded-xl bg-muted/30 border border-border/50"
        initial={animate ? { opacity: 0, y: 10 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {isRTL ? 'יעד שבועי' : 'Weekly Goal'}
            </span>
          </div>
          <span className="text-sm font-bold text-primary">{stats.weeklyGoal}%</span>
        </div>
        <Progress value={animate ? stats.weeklyGoal : 0} className="h-3" />
      </motion.div>

      {/* Floating particles effect */}
      {animate && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: '100%',
                opacity: 0 
              }}
              animate={{ 
                y: '-20%',
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
