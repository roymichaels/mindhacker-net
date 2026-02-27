import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import {
  useTodayQuests,
  useActiveBuild,
  useRecentLoot,
  useUserInventory,
  useGenerateQuests,
  useCompleteQuest,
} from '@/hooks/useMapleStory';
import MapleHeader from './MapleHeader';
import QuestDeck from './QuestDeck';
import ZoneMap from './ZoneMap';
import LootPanel from './LootPanel';
import TalentBoard from './TalentBoard';
import { toast } from 'sonner';

export default function MapleStoryPage() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const xp = useXpProgress();
  const streak = useStreak();
  const energy = useEnergy();
  const { data: quests, isLoading: questsLoading } = useTodayQuests();
  const { data: build } = useActiveBuild();
  const { data: lootEvents } = useRecentLoot();
  const { data: inventory } = useUserInventory();
  const generateQuests = useGenerateQuests();
  const completeQuest = useCompleteQuest();

  const [activeTab, setActiveTab] = useState<'quests' | 'zones' | 'loot' | 'talents'>('quests');

  // Auto-generate quests if none exist
  useEffect(() => {
    if (!questsLoading && quests && quests.length === 0 && user?.id && !generateQuests.isPending) {
      generateQuests.mutate(language);
    }
  }, [questsLoading, quests, user?.id]);

  const handleCompleteQuest = async (questId: string) => {
    try {
      await completeQuest.mutateAsync(questId);
      toast.success(language === 'he' ? '⚔️ קוויסט הושלם!' : '⚔️ Quest Complete!', {
        description: language === 'he' ? 'XP ושלל נוספו!' : 'XP and loot added!',
      });
    } catch (e) {
      toast.error(language === 'he' ? 'שגיאה בהשלמת הקוויסט' : 'Error completing quest');
    }
  };

  const handleRefreshQuests = () => {
    generateQuests.mutate(language);
  };

  const dailyQuests = (quests || []).filter((q: any) => !q.metadata?.is_boss);
  const bossQuest = (quests || []).find((q: any) => q.metadata?.is_boss);

  const tabs = [
    { id: 'quests' as const, label: language === 'he' ? '⚔️ קוויסטים' : '⚔️ Quests' },
    { id: 'zones' as const, label: language === 'he' ? '🗺️ אזורים' : '🗺️ Zones' },
    { id: 'loot' as const, label: language === 'he' ? '🎁 שלל' : '🎁 Loot' },
    { id: 'talents' as const, label: language === 'he' ? '🧠 כישורים' : '🧠 Talents' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 space-y-6">
      <MapleHeader
        level={xp.level}
        xp={xp.experience}
        xpCurrent={xp.current}
        xpRequired={xp.required}
        xpPercentage={xp.percentage}
        streak={streak.streak}
        energy={energy.balance}
        build={build}
        language={language}
      />

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'quests' && (
            <QuestDeck
              dailyQuests={dailyQuests}
              bossQuest={bossQuest}
              onComplete={handleCompleteQuest}
              onRefresh={handleRefreshQuests}
              isLoading={questsLoading || generateQuests.isPending}
              isCompleting={completeQuest.isPending}
              language={language}
            />
          )}
          {activeTab === 'zones' && (
            <ZoneMap quests={quests || []} language={language} />
          )}
          {activeTab === 'loot' && (
            <LootPanel
              events={lootEvents || []}
              inventory={inventory || []}
              language={language}
            />
          )}
          {activeTab === 'talents' && (
            <TalentBoard build={build} language={language} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
