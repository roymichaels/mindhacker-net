import { motion } from 'framer-motion';
import { Gift, Package } from 'lucide-react';
import type { LootEvent, InventoryItem, LootItem } from '@/services/mapleStory';

const RARITY_COLORS: Record<string, string> = {
  common: 'text-muted-foreground border-border bg-muted/30',
  rare: 'text-blue-500 border-blue-500/30 bg-blue-500/5',
  epic: 'text-purple-500 border-purple-500/30 bg-purple-500/5',
  legendary: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5',
};

const RARITY_LABELS: Record<string, Record<string, string>> = {
  common: { he: 'רגיל', en: 'Common' },
  rare: { he: 'נדיר', en: 'Rare' },
  epic: { he: 'אפי', en: 'Epic' },
  legendary: { he: 'אגדי', en: 'Legendary' },
};

interface LootPanelProps {
  events: LootEvent[];
  inventory: (InventoryItem & { loot: LootItem })[];
  language: string;
}

export default function LootPanel({ events, inventory, language }: LootPanelProps) {
  const isHe = language === 'he';

  return (
    <div className="space-y-6">
      {/* Recent drops */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-bold">{isHe ? 'שלל אחרון' : 'Recent Drops'}</h2>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {isHe ? 'השלם קוויסטים כדי לקבל שלל!' : 'Complete quests to get loot!'}
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between rounded-lg border p-3 ${RARITY_COLORS[event.rarity] || RARITY_COLORS.common}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎁</span>
                  <div>
                    <p className="text-sm font-medium">{event.loot_id.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {event.reason === 'boss_complete' ? (isHe ? 'בוס' : 'Boss') : (isHe ? 'קוויסט' : 'Quest')}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {RARITY_LABELS[event.rarity]?.[isHe ? 'he' : 'en'] || event.rarity}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Inventory */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-bold">{isHe ? 'מלאי' : 'Inventory'}</h2>
        </div>
        {inventory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {isHe ? 'אין פריטים עדיין' : 'No items yet'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {inventory.map((item) => (
              <div
                key={item.loot_id}
                className={`rounded-lg border p-3 text-center ${RARITY_COLORS[item.loot?.rarity] || RARITY_COLORS.common}`}
              >
                <p className="text-xs font-medium truncate">{item.loot?.name || item.loot_id}</p>
                <p className="text-lg font-bold mt-1">×{item.qty}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{item.loot?.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
