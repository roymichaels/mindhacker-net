/**
 * ActiveWorldsStrip — horizontal row of currently active life-worlds.
 * Renders nothing when no worlds are active (no empty placeholder).
 */
import { useNavigate } from 'react-router-dom';
import { useActiveWorlds } from '@/hooks/aurora/useActiveWorlds';
import { useTranslation } from '@/hooks/useTranslation';

const COLOR_DOT: Record<string, string> = {
  violet: 'bg-violet-400', fuchsia: 'bg-fuchsia-400', red: 'bg-red-400',
  amber: 'bg-amber-400', cyan: 'bg-cyan-400', slate: 'bg-slate-400',
  indigo: 'bg-indigo-400', emerald: 'bg-emerald-400', purple: 'bg-purple-400',
  sky: 'bg-sky-400', orange: 'bg-orange-400', blue: 'bg-blue-400',
  lime: 'bg-lime-400', teal: 'bg-teal-400', rose: 'bg-rose-400',
};

export default function ActiveWorldsStrip() {
  const navigate = useNavigate();
  const { worlds } = useActiveWorlds();
  const { language, isRTL } = useTranslation();

  if (!worlds.length) return null;

  return (
    <div
      className="w-full max-w-md mx-auto overflow-x-auto no-scrollbar"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2 px-1 py-1">
        {worlds.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => navigate(`/d/${w.id}`)}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11.5px] text-foreground/80 hover:bg-white/[0.06] transition-colors"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${COLOR_DOT[w.color] ?? 'bg-primary'}`} />
            <span>{language === 'he' ? w.labelHe : w.labelEn}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
