import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
  title?: string;
  onClose: () => void;
  defaultFullscreen?: boolean;
  children: React.ReactNode;
}

export default function ArtifactFrame({ title, onClose, defaultFullscreen, children }: Props) {
  const [fullscreen, setFullscreen] = useState(!!defaultFullscreen);
  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[70] flex flex-col bg-background'
          : 'relative flex flex-col rounded-2xl border border-white/10 bg-card overflow-hidden'
      }
      style={fullscreen ? undefined : { maxHeight: '70vh' }}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/10">
        <div className="text-xs font-medium text-muted-foreground truncate">{title ?? 'AION'}</div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
            aria-label={fullscreen ? 'Minimize' : 'Expand'}
          >
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </div>
  );
}