import { motion } from 'framer-motion';
import type { MapleQuest } from '@/services/mapleStory';

const ZONE_ICONS: Record<string, string> = {
  mind: '🧠', vitality: '💚', power: '💪', combat: '⚔️',
  focus: '🎯', consciousness: '👁️', expansion: '📚', presence: '✨',
  wealth: '💰', influence: '📡', relationships: '❤️', business: '🏢',
  projects: '🚀', play: '🎮',
};

const ZONE_COLORS: Record<string, string> = {
  mind: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
  vitality: 'from-green-500/10 to-green-500/5 border-green-500/20',
  power: 'from-red-500/10 to-red-500/5 border-red-500/20',
  combat: 'from-orange-500/10 to-orange-500/5 border-orange-500/20',
  focus: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
  consciousness: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20',
  expansion: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20',
  presence: 'from-pink-500/10 to-pink-500/5 border-pink-500/20',
  wealth: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
  influence: 'from-teal-500/10 to-teal-500/5 border-teal-500/20',
  relationships: 'from-rose-500/10 to-rose-500/5 border-rose-500/20',
  business: 'from-slate-500/10 to-slate-500/5 border-slate-500/20',
  projects: 'from-violet-500/10 to-violet-500/5 border-violet-500/20',
  play: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
};

interface ZoneMapProps {
  quests: MapleQuest[];
  language: string;
}

export default function ZoneMap({ quests, language }: ZoneMapProps) {
  const isHe = language === 'he';

  // Group quests by zone
  const zoneGroups: Record<string, { total: number; done: number }> = {};
  for (const q of quests) {
    const zone = q.metadata?.zone || q.pillar || 'mind';
    if (!zoneGroups[zone]) zoneGroups[zone] = { total: 0, done: 0 };
    zoneGroups[zone].total++;
    if (q.status === 'done') zoneGroups[zone].done++;
  }

  // Get all known zones
  const allZones = Object.keys(ZONE_ICONS);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">{isHe ? 'מפת אזורים' : 'Zone Map'}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {allZones.map((zone, i) => {
          const stats = zoneGroups[zone];
          const hasQuests = stats && stats.total > 0;
          const allDone = stats && stats.done === stats.total;

          return (
            <motion.div
              key={zone}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`relative rounded-xl border p-3 text-center transition-all bg-gradient-to-br ${
                ZONE_COLORS[zone] || 'from-muted/50 to-muted/30 border-border'
              } ${hasQuests ? 'ring-1 ring-primary/20' : 'opacity-50'}`}
            >
              <div className="text-2xl mb-1">{ZONE_ICONS[zone] || '❓'}</div>
              <p className="text-xs font-medium capitalize">{zone}</p>
              {hasQuests && (
                <p className={`text-[10px] mt-0.5 font-semibold ${allDone ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {stats.done}/{stats.total}
                </p>
              )}
              {allDone && hasQuests && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-[8px]">✓</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
