import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  onClose: () => void;
  defaultFullscreen?: boolean;
  children: React.ReactNode;
}

/**
 * ArtifactFrame — chamber-native floating shell.
 *
 * Phase 4B: every summoned experience uses one frame language so artifacts
 * feel "manifested above the chamber" rather than "modal opened". No hard
 * borders, no opaque backgrounds — atmosphere stays visible behind.
 *
 * - inline mode: floating rounded card, soft top fade, ghost close
 * - fullscreen mode: transparent backdrop-blur over the chamber, never an
 *   opaque page background, so the orb + atmosphere remain perceptible
 */
export default function ArtifactFrame({ title, onClose, defaultFullscreen, children }: Props) {
  const [fullscreen, setFullscreen] = useState(!!defaultFullscreen);
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden text-foreground',
        fullscreen
          ? 'fixed inset-0 z-[70] bg-background/40 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/30'
          : 'relative rounded-3xl bg-card/40 backdrop-blur-xl ring-1 ring-white/5',
      )}
      style={
        fullscreen
          ? {
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }
          : { maxHeight: '70vh' }
      }
    >
      {/* Soft top fade — replaces the hard header bar */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-12',
          'bg-gradient-to-b from-background/60 to-transparent',
        )}
      />
      {/* Ghost controls — float, no chrome */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-3 pt-2">
        <div className="pointer-events-auto text-[10px] uppercase tracking-[0.18em] text-foreground/40 truncate max-w-[60%]">
          {title ?? ''}
        </div>
        <div className="pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            className="p-1.5 rounded-full text-foreground/50 hover:text-foreground/90 hover:bg-white/5 transition-colors"
            aria-label={fullscreen ? 'Minimize' : 'Expand'}
          >
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-foreground/50 hover:text-foreground/90 hover:bg-white/5 transition-colors"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div
        className={cn(
          'flex-1 min-h-0 overflow-y-auto',
          fullscreen ? 'pt-10' : 'pt-8',
        )}
      >
        {children}
      </div>
    </div>
  );
}