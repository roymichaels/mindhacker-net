/**
 * WorldStage — mount point for a world's scene renderer.
 */
import type { ReactNode } from 'react';

export default function WorldStage({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full rounded-3xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-md overflow-hidden">
      {children}
    </div>
  );
}
