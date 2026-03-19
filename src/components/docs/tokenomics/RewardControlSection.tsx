import { motion } from 'framer-motion';
import { Activity, Clock, BarChart3, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { tokenomicsConfig } from '@/config/tokenomics';

const iconMap: Record<string, LucideIcon> = { Activity, Clock, BarChart3, ShieldAlert };

type Config = typeof tokenomicsConfig.rewardControl;

interface Props {
  config: Config;
  isHe: boolean;
}

export function RewardControlSection({ config, isHe }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {isHe ? config.description.he : config.description.en}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {config.mechanisms.map((m, i) => {
          const Icon = iconMap[m.icon] || Activity;
          return (
            <motion.div
              key={m.icon}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              viewport={{ once: true }}
              className="rounded-xl border border-border bg-card/50 p-4 text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center mb-2">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{isHe ? m.he : m.en}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{isHe ? m.descHe : m.descEn}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
