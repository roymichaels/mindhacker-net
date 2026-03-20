import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  icon: string;
  title: string;
  description: string;
  delay: number;
  color: string;
}

export function FeatureNode({ icon, title, description, delay, color }: Props) {
  return (
    <motion.div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm",
        "hover:bg-card/40 transition-colors"
      )}
      initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
        style={{ background: `${color}22`, boxShadow: `0 0 12px ${color}33` }}
      >
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
