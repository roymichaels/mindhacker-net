import { motion } from 'framer-motion';
import { Activity, CheckCircle, Heart, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { tokenomicsConfig } from '@/config/tokenomics';

const iconMap: Record<string, LucideIcon> = { Activity, CheckCircle, Heart, Star };

type Config = typeof tokenomicsConfig.reputation;

interface Props {
  config: Config;
  isHe: boolean;
}

export function ReputationLayer({ config, isHe }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {isHe ? config.description.he : config.description.en}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {config.factors.map((f, i) => {
          const Icon = iconMap[f.icon] || Star;
          return (
            <motion.div
              key={f.icon}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              viewport={{ once: true }}
              className="rounded-xl border border-border bg-card/50 p-4 text-center hover:border-[hsl(270,70%,60%)]/30 transition-colors"
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-[hsl(270,70%,60%)]/20 to-transparent flex items-center justify-center mb-2">
                <Icon className="w-5 h-5 text-[hsl(270,70%,60%)]" />
              </div>
              <p className="text-sm font-semibold text-foreground">{isHe ? f.he : f.en}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{isHe ? f.descHe : f.descEn}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
