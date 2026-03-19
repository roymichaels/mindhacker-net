import { motion } from 'framer-motion';
import { Database, ShieldCheck } from 'lucide-react';
import { tokenomicsConfig } from '@/config/tokenomics';

type Config = typeof tokenomicsConfig.dataContribution;

interface Props {
  config: Config;
  isHe: boolean;
}

export function DataContributionCard({ config, isHe }: Props) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[hsl(190,80%,50%)] flex items-center justify-center">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">
            {isHe ? 'תרומת נתונים (Opt-In)' : 'Data Contribution (Opt-In)'}
          </h4>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {isHe ? config.description.he : config.description.en}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {config.principles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: isHe ? 6 : -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[hsl(160,70%,45%)] shrink-0" />
            <span>{isHe ? p.he : p.en}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
