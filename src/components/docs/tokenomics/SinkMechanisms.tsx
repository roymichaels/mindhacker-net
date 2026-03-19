import { motion } from 'framer-motion';
import { Lock, Zap, Crown, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { tokenomicsConfig } from '@/config/tokenomics';

const iconMap: Record<string, LucideIcon> = { Lock, Zap, Crown, Shield };

type Item = typeof tokenomicsConfig.sinkMechanisms[number];

interface Props {
  items: Item[];
  futureNote: typeof tokenomicsConfig.sinkFuture;
  isHe: boolean;
}

export function SinkMechanisms({ items, futureNote, isHe }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, i) => {
          const Icon = iconMap[item.icon] || Lock;
          return (
            <motion.div
              key={item.icon}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              viewport={{ once: true }}
              className="rounded-xl border border-border bg-card/50 p-4 text-center hover:border-[hsl(45,90%,55%)]/30 transition-colors"
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-[hsl(45,90%,55%)]/20 to-transparent flex items-center justify-center mb-2">
                <Icon className="w-5 h-5 text-[hsl(45,90%,55%)]" />
              </div>
              <p className="text-sm font-semibold text-foreground">{isHe ? item.he : item.en}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{isHe ? item.descHe : item.descEn}</p>
            </motion.div>
          );
        })}
      </div>
      <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 p-3">
        <p className="text-[11px] text-muted-foreground italic">
          {isHe ? futureNote.he : futureNote.en}
        </p>
      </div>
    </div>
  );
}
