import { motion } from 'framer-motion';
import { TrendingUp, Hammer, Target, FileText, Users, Database } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { tokenomicsConfig } from '@/config/tokenomics';

const iconMap: Record<string, LucideIcon> = {
  TrendingUp, Hammer, Target, FileText, Users, Database,
};

type Item = typeof tokenomicsConfig.earningSources[number];

interface Props {
  items: Item[];
  isHe: boolean;
}

export function EarningSourcesVisual({ items, isHe }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item, i) => {
        const Icon = iconMap[item.icon] || TrendingUp;
        return (
          <motion.div
            key={item.icon}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3 flex-1 min-w-[180px] hover:border-primary/30 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(160,70%,45%)]/20 to-transparent flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[hsl(160,70%,45%)]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{isHe ? item.he : item.en}</p>
              <p className="text-[10px] text-muted-foreground leading-snug">{isHe ? item.descHe : item.descEn}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
