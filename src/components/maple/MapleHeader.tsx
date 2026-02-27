import { motion } from 'framer-motion';
import { Zap, Flame, Star, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { UserBuild } from '@/services/mapleStory';

interface MapleHeaderProps {
  level: number;
  xp: number;
  xpCurrent: number;
  xpRequired: number;
  xpPercentage: number;
  streak: number;
  energy: number;
  build: UserBuild | null | undefined;
  language: string;
}

export default function MapleHeader({
  level, xp, xpCurrent, xpRequired, xpPercentage,
  streak, energy, build, language,
}: MapleHeaderProps) {
  const isHe = language === 'he';
  const buildData = build?.build_data;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5 space-y-4"
    >
      {/* Top row: Level + Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
            {level}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{isHe ? 'שלב' : 'Level'}</p>
            <div className="flex items-center gap-2">
              <Progress value={xpPercentage} className="w-24 h-2" />
              <span className="text-xs text-muted-foreground">{xpCurrent}/{xpRequired}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="w-4 h-4" />
            <span className="font-semibold">{streak}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">{energy}</span>
          </div>
        </div>
      </div>

      {/* Build info */}
      {buildData && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{buildData.name}</span>
            <span className="text-xs text-muted-foreground">— {buildData.theme}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {buildData.buffs?.map((buff, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium"
              >
                ↑ {buff.name}
              </span>
            ))}
            {buildData.weakness && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-medium">
                ↓ {buildData.weakness.name}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
