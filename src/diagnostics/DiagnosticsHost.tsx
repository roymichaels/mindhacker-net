import { lazy, Suspense, useState } from 'react';
import { Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDiagnosticsFlag } from './useDiagnosticsFlag';

const DiagnosticsSheet = lazy(() => import('./DiagnosticsSheet'));

/**
 * Floating, dev-only entry point for the MindOS diagnostics overlay.
 * Renders nothing in production unless the user opted-in via `?diag=1`
 * or `localStorage['mindos.diag']='1'`. Hidden when no user is signed in.
 */
export default function DiagnosticsHost() {
  const enabled = useDiagnosticsFlag();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!enabled || !user) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open MindOS diagnostics"
        className="fixed bottom-20 left-3 z-[60] flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground/80 shadow-lg backdrop-blur-md hover:bg-background/90"
      >
        <Brain className="h-4 w-4" />
      </button>
      {open && (
        <Suspense fallback={null}>
          <DiagnosticsSheet onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}