/**
 * AIONPage - Full-page AION chat surface.
 * Keeps the same signature header and quick actions as the floating widget.
 */
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import DomainAssessChat from '@/components/pillars/DomainAssessChat';
import { AIONNamingGate } from '@/components/aurora/AIONNamingGate';
import InteractiveAION from '@/components/aion/InteractiveAION';
import { useClientFlag } from '@/lib/clientFlags';

export default function AIONPage() {
  useTranslation();
  const { assessmentDomainId, endAssessment } = useAuroraChatContext();
  const interactive = useClientFlag('interactive_mode');

  const isAssessing = !!assessmentDomainId;

  // Interactive AION Mode (opt-in via `?ff_interactive_mode=1`).
  // Falls back to compact chat surface for assessment flows.
  if (interactive && !isAssessing) {
    return (
      <AIONNamingGate>
        <InteractiveAION />
      </AIONNamingGate>
    );
  }

  return (
    <AIONNamingGate>
      <div className="flex-1 min-h-0 -mx-2 lg:-mx-3 flex flex-col bg-background overflow-hidden">
        {/* Home IS the chat. Like ChatGPT / Lovable: a single conversation
            surface with a composer dock at the bottom. No dashboards, no
            cards, no launchers. */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-1 pb-40">
          {isAssessing && assessmentDomainId ? (
            <DomainAssessChat
              domainId={assessmentDomainId}
              asDock
              dockHeightVh={85}
              onClose={() => endAssessment()}
            />
          ) : (
            <AuroraChatBubbles showOrbAboveMessages={false} />
          )}
        </div>

        {/* Floating dock — composer only (journaling lives in /journal) */}
        <div
          className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)] pointer-events-none"
        >
          <div className="mx-auto w-full max-w-screen-md pointer-events-auto">
            <div className="rounded-3xl border border-white/10 bg-background px-2 py-2 backdrop-blur-xl shadow-lg">
              <GlobalChatInput />
            </div>
          </div>
        </div>
      </div>
    </AIONNamingGate>
  );
}
