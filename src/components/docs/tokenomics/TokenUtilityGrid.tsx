import { motion } from 'framer-motion';
import { CreditCard, Briefcase, GraduationCap, Unlock, Zap, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { tokenomicsConfig } from '@/config/tokenomics';

const iconMap: Record<string, LucideIcon> = {
  CreditCard, Briefcase, GraduationCap, Unlock, Zap, Globe,
};

type Item = typeof tokenomicsConfig.utility[number];

interface Props {
  items: Item[];
  isHe: boolean;
}

export function TokenUtilityGrid({ items, isHe }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((item, i) => {
        const Icon = iconMap[item.icon] || Zap;
        return (
          <motion.div
            key={item.icon}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            className="group rounded-xl border border-border bg-card/50 p-4 hover:border-primary/40 hover:shadow-[0_0_20px_-6px_hsl(204,88%,53%,0.15)] transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-2 group-hover:from-primary/30 transition-colors">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">{isHe ? item.he : item.en}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{isHe ? item.descHe : item.descEn}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
