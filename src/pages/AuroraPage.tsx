/**
 * AIONPage - Full-page AION chat surface.
 * Keeps the same signature header and quick actions as the floating widget.
 */
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import DomainAssessChat from '@/components/pillars/DomainAssessChat';
import { AIONNamingGate } from '@/components/aurora/AIONNamingGate';

export default function AIONPage() {
  useTranslation();
  const { assessmentDomainId, endAssessment } = useAuroraChatContext();

  const isAssessing = !!assessmentDomainId;
  // Note: pillar/scan context label is now reflected in the global header dropdown.
  void LIFE_DOMAINS;

  return (
    <AIONNamingGate>
      <div className="flex-1 min-h-0 -mx-2 lg:-mx-3 flex flex-col bg-background overflow-hidden">
        {/* Conversation surface — leaves room at the bottom for the floating dock */}
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
            <div className="rounded-3xl border border-white/10 bg-background/80 px-2 py-2 backdrop-blur-xl shadow-lg">
              <GlobalChatInput />
            </div>
          </div>
        </div>
      </div>
    </AIONNamingGate>
  );
}
