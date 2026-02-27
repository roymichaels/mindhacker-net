import { motion } from 'framer-motion';
import { Check, Loader2, RefreshCw, Skull, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MapleQuest } from '@/services/mapleStory';

interface QuestDeckProps {
  dailyQuests: MapleQuest[];
  bossQuest?: MapleQuest;
  onComplete: (id: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isCompleting: boolean;
  language: string;
}

const DIFFICULTY_COLORS = [
  '', 'text-green-500', 'text-green-500', 'text-green-400',
  'text-yellow-500', 'text-yellow-500', 'text-orange-500',
  'text-orange-500', 'text-red-500', 'text-red-500', 'text-red-600',
];

function DifficultyStars({ difficulty }: { difficulty: number }) {
  const filled = Math.ceil(difficulty / 2);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < filled ? DIFFICULTY_COLORS[difficulty] || 'text-yellow-500' : 'text-muted-foreground/30'}`}
          fill={i < filled ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

function QuestCard({ quest, onComplete, isCompleting, isBoss, language }: {
  quest: MapleQuest;
  onComplete: (id: string) => void;
  isCompleting: boolean;
  isBoss: boolean;
  language: string;
}) {
  const isDone = quest.status === 'done';
  const difficulty = quest.metadata?.difficulty || 3;
  const isHe = language === 'he';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-xl border p-4 transition-all ${
        isBoss
          ? 'border-red-500/30 bg-gradient-to-br from-red-500/5 to-orange-500/5 shadow-lg shadow-red-500/10'
          : isDone
            ? 'border-green-500/30 bg-green-500/5 opacity-70'
            : 'border-border bg-card hover:border-primary/30'
      }`}
    >
      {isBoss && (
        <div className="absolute -top-2 -right-2">
          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
            {isHe ? 'בוס' : 'BOSS'}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            {isBoss && <Skull className="w-4 h-4 text-red-500 shrink-0" />}
            <h3 className={`font-semibold text-sm leading-tight ${isDone ? 'line-through text-muted-foreground' : ''}`}>
              {quest.title}
            </h3>
          </div>
          {quest.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{quest.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs">
            <DifficultyStars difficulty={difficulty} />
            <span className="text-primary font-medium">+{quest.xp_reward} XP</span>
            {quest.metadata?.zone && (
              <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                {quest.metadata.zone}
              </span>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant={isDone ? 'ghost' : isBoss ? 'destructive' : 'default'}
          disabled={isDone || isCompleting}
          onClick={() => onComplete(quest.id)}
          className="shrink-0"
        >
          {isDone ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : isCompleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            isHe ? 'השלם' : 'Done'
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export default function QuestDeck({
  dailyQuests, bossQuest, onComplete, onRefresh, isLoading, isCompleting, language,
}: QuestDeckProps) {
  const isHe = language === 'he';
  const completed = dailyQuests.filter(q => q.status === 'done').length;
  const total = dailyQuests.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{isHe ? 'קוויסטים יומיים' : 'Daily Quests'}</h2>
          <p className="text-xs text-muted-foreground">
            {completed}/{total} {isHe ? 'הושלמו' : 'completed'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading && dailyQuests.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          {isHe ? 'יוצר קוויסטים...' : 'Generating quests...'}
        </div>
      ) : (
        <div className="space-y-3">
          {dailyQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={onComplete}
              isCompleting={isCompleting}
              isBoss={false}
              language={language}
            />
          ))}

          {bossQuest && (
            <>
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-red-500/20" />
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                  {isHe ? 'בוס' : 'BOSS'}
                </span>
                <div className="h-px flex-1 bg-red-500/20" />
              </div>
              <QuestCard
                quest={bossQuest}
                onComplete={onComplete}
                isCompleting={isCompleting}
                isBoss={true}
                language={language}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
