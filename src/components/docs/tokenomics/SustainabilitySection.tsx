import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { tokenomicsConfig } from '@/config/tokenomics';

type Item = typeof tokenomicsConfig.sustainability[number];

interface Props {
  items: Item[];
  isHe: boolean;
}

export function SustainabilitySection({ items, isHe }: Props) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: isHe ? 8 : -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          viewport={{ once: true }}
          className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/30 p-3"
        >
          <ShieldCheck className="w-4 h-4 text-[hsl(160,70%,45%)] shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">{isHe ? item.he : item.en}</p>
        </motion.div>
      ))}
    </div>
  );
}
