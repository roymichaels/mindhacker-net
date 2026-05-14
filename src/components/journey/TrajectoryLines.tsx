/**
 * TrajectoryLines — three soft, ambient lines under the next step.
 * Phase, friction, momentum. Read-only. No charts.
 */
import { useTranslation } from '@/hooks/useTranslation';

interface Line {
  label: string;
  text: string;
}

interface TrajectoryLinesProps {
  lines: Line[];
}

export default function TrajectoryLines({ lines }: TrajectoryLinesProps) {
  const { isRTL } = useTranslation();
  if (!lines.length) return null;
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="mx-auto mt-10 flex w-full max-w-md flex-col gap-2.5 px-2"
    >
      {lines.map((l, i) => (
        <p
          key={i}
          className="text-[12.5px] leading-relaxed text-foreground/45 italic text-center"
        >
          <span className="not-italic opacity-50 me-1.5">·</span>
          <span className="opacity-70">{l.label}</span>
          <span className="mx-2 opacity-30">—</span>
          <span>{l.text}</span>
        </p>
      ))}
    </div>
  );
}