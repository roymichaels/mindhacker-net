import { motion } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

interface Props {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  delay?: number;
  color?: string;
}

export function StatCard({ value, suffix, prefix, label, delay = 0, color }: Props) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm"
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.5 + delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatedCounter
        value={value}
        suffix={suffix}
        prefix={prefix}
        delay={0.6 + delay}
        className="text-3xl md:text-4xl font-bold tabular-nums"
        duration={1.8}
      />
      <span className="text-xs md:text-sm text-muted-foreground">{label}</span>
      {color && (
        <div className="w-8 h-0.5 rounded-full mt-1" style={{ background: color }} />
      )}
    </motion.div>
  );
}
