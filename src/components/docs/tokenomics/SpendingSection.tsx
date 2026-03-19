import { motion } from 'framer-motion';
import { ShoppingCart, GraduationCap, Unlock, Rocket, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { tokenomicsConfig } from '@/config/tokenomics';

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart, GraduationCap, Unlock, Rocket, Layers,
};

type Item = typeof tokenomicsConfig.spending[number];

interface Props {
  items: Item[];
  isHe: boolean;
}

export function SpendingSection({ items, isHe }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item, i) => {
        const Icon = iconMap[item.icon] || ShoppingCart;
        return (
          <motion.div
            key={item.icon}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            className="group rounded-xl border border-border bg-card/50 p-4 hover:border-destructive/30 hover:shadow-[0_0_20px_-6px_hsl(340,75%,55%,0.15)] transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center mb-2 group-hover:from-destructive/30 transition-colors">
              <Icon className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-sm font-semibold text-foreground">{isHe ? item.he : item.en}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{isHe ? item.descHe : item.descEn}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
