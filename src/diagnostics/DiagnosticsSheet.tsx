import { useEffect } from 'react';
import { X } from 'lucide-react';
import BrainSection from './sections/BrainSection';
import EnvironmentSection from './sections/EnvironmentSection';
import MemoryWriterSection from './sections/MemoryWriterSection';
import GraphCountersSection from './sections/GraphCountersSection';
import LeakGuardSection from './sections/LeakGuardSection';
import ResponseSourceSection from './sections/ResponseSourceSection';

export default function DiagnosticsSheet({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-stretch md:justify-end" dir="ltr">
      <button
        type="button"
        aria-label="Close diagnostics"
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
      />
      <div className="relative flex max-h-[85dvh] w-full flex-col rounded-t-2xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl md:max-h-none md:h-full md:w-[420px] md:rounded-none md:border-l">
        <header className="flex items-center justify-between border-b border-border/40 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">dev only</p>
            <h2 className="text-sm font-medium text-foreground">MindOS diagnostics</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-card/60 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4 space-y-5">
          <Section title="1 · AION Brain"><BrainSection /></Section>
          <Section title="2 · Environment"><EnvironmentSection /></Section>
          <Section title="3 · Memory Writer"><MemoryWriterSection /></Section>
          <Section title="4 · Graph counters"><GraphCountersSection active /></Section>
          <Section title="5 · Leak guard"><LeakGuardSection /></Section>
          <Section title="6 · Response source"><ResponseSourceSection /></Section>
          <p className="pt-2 text-[10px] text-muted-foreground">
            Hidden from end users. Disable with <code>?diag=0</code> or
            <code className="mx-1">localStorage.removeItem('mindos.diag')</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/40 bg-card/30 p-3">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}