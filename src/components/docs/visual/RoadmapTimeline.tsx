import { motion } from 'framer-motion';

interface Phase {
  label: string;
  items: string[];
  color: string;
  active?: boolean;
}

interface Props {
  phases: Phase[];
  isHe: boolean;
}

export function RoadmapTimeline({ phases, isHe }: Props) {
  return (
    <div className="relative space-y-6 mt-4" dir={isHe ? 'rtl' : 'ltr'}>
      {/* Vertical line */}
      <div className={cn("absolute top-0 bottom-0 w-px bg-border/40", isHe ? "right-4" : "left-4")} />

      {phases.map((phase, i) => (
        <motion.div
          key={i}
          className={cn("relative flex gap-4", isHe && "flex-row-reverse")}
          initial={{ opacity: 0, x: isHe ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Dot */}
          <div
            className="shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10"
            style={{
              borderColor: phase.color,
              background: phase.active ? phase.color : 'transparent',
              boxShadow: phase.active ? `0 0 16px ${phase.color}55` : 'none',
            }}
          >
            {phase.active && <div className="w-2 h-2 rounded-full bg-background" />}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <span className="text-sm font-bold" style={{ color: phase.color }}>{phase.label}</span>
            <ul className="mt-1.5 space-y-1">
              {phase.items.map((item, j) => (
                <li key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ background: phase.color }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
