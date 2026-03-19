import { useState } from 'react';
import { motion } from 'framer-motion';
import { tokenomicsConfig } from '@/config/tokenomics';

type Alloc = typeof tokenomicsConfig.distribution[number];

interface Props {
  distribution: Alloc[];
  isHe: boolean;
}

export function TokenDistributionChart({ distribution, isHe }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = distribution.reduce((s, d) => s + d.pct, 0);

  // Build SVG donut
  const cx = 100, cy = 100, r = 70, strokeW = 28;
  const circumference = 2 * Math.PI * r;
  let accum = 0;

  const segments = distribution.map(d => {
    const len = (d.pct / total) * circumference;
    const offset = circumference - (accum / total) * circumference;
    accum += d.pct;
    return { ...d, len, offset };
  });

  const hoveredItem = hovered ? distribution.find(d => d.key === hovered) : null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Donut */}
      <div className="relative w-[220px] h-[220px] shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {segments.map(seg => (
            <circle
              key={seg.key}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={hovered === seg.key ? strokeW + 6 : strokeW}
              strokeDasharray={`${seg.len} ${circumference - seg.len}`}
              strokeDashoffset={seg.offset}
              className="transition-all duration-300 cursor-pointer"
              style={{
                filter: hovered === seg.key ? `drop-shadow(0 0 8px ${seg.color})` : 'none',
                opacity: hovered && hovered !== seg.key ? 0.4 : 1,
              }}
              onMouseEnter={() => setHovered(seg.key)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {hoveredItem ? (
            <>
              <span className="text-2xl font-bold text-foreground">{hoveredItem.pct}%</span>
              <span className="text-[10px] text-muted-foreground max-w-[80px] leading-tight">
                {isHe ? hoveredItem.he : hoveredItem.en}
              </span>
            </>
          ) : (
            <>
              <span className="text-lg font-bold text-foreground">MOS</span>
              <span className="text-[10px] text-muted-foreground">100M</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-2 flex-1 min-w-0">
        {distribution.map((d, i) => (
          <motion.div
            key={d.key}
            initial={{ opacity: 0, x: isHe ? 10 : -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 rounded-lg p-2 cursor-pointer transition-colors hover:bg-muted/40"
            style={{ opacity: hovered && hovered !== d.key ? 0.4 : 1 }}
            onMouseEnter={() => setHovered(d.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{isHe ? d.he : d.en}</span>
                <span className="text-sm font-bold text-foreground ms-2">{d.pct}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">{isHe ? d.descHe : d.descEn}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
