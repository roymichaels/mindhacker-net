/**
 * AIONPage - Full-page AION chat surface.
 * Keeps the same signature header and quick actions as the floating widget.
 */
import { useState } from 'react';
import { Moon, Heart, Target, Brain } from 'lucide-react';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import DomainAssessChat from '@/components/pillars/DomainAssessChat';
import { AuroraJournalModal } from '@/components/aurora/AuroraJournalModal';
import { AuroraPlanModal } from '@/components/aurora/AuroraPlanModal';
import { AuroraBeliefsModal } from '@/components/aurora/AuroraBeliefsModal';
import { AIONNamingGate } from '@/components/aurora/AIONNamingGate';

type WidgetModal = 'dream' | 'gratitude' | 'plan' | 'beliefs' | null;

export default function AIONPage() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { assessmentDomainId, endAssessment } = useAuroraChatContext();
  const [activeModal, setActiveModal] = useState<WidgetModal>(null);

  const isAssessing = !!assessmentDomainId;
  // Note: pillar/scan context label is now reflected in the global header dropdown.
  void LIFE_DOMAINS;

  const quickActions = [
    { id: 'dream', icon: Moon, label: isHe ? 'חלומות' : 'Dreams', onClick: () => setActiveModal('dream') },
    { id: 'gratitude', icon: Heart, label: isHe ? 'תודה' : 'Gratitude', onClick: () => setActiveModal('gratitude') },
    { id: 'plan', icon: Target, label: isHe ? 'תוכנית' : 'Plan', onClick: () => setActiveModal('plan') },
    { id: 'beliefs', icon: Brain, label: isHe ? 'אמונות' : 'Beliefs', onClick: () => setActiveModal('beliefs') },
  ] as const;

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

        {/* Floating dock — chips + composer pinned to viewport bottom */}
        <div
          className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)] pointer-events-none"
        >
          <div className="mx-auto w-full max-w-screen-md pointer-events-auto">
            <div className="flex gap-2 overflow-x-auto scrollbar-none px-1 pb-2 [mask-image:linear-gradient(to_right,black_85%,transparent)]">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.onClick}
                    className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-white/10 bg-background/70 backdrop-blur-xl text-xs font-medium text-foreground/90 hover:bg-background/90 transition-colors whitespace-nowrap"
                  >
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                    {action.label}
                  </button>
                );
              })}
            </div>
            <div className="rounded-3xl border border-white/10 bg-background/80 px-2 py-2 backdrop-blur-xl shadow-lg">
              <GlobalChatInput />
            </div>
          </div>
        </div>

        <AuroraJournalModal
          type="dream"
          open={activeModal === 'dream'}
          onOpenChange={(nextOpen) => !nextOpen && setActiveModal(null)}
        />
        <AuroraJournalModal
          type="gratitude"
          open={activeModal === 'gratitude'}
          onOpenChange={(nextOpen) => !nextOpen && setActiveModal(null)}
        />
        <AuroraPlanModal
          open={activeModal === 'plan'}
          onOpenChange={(nextOpen) => !nextOpen && setActiveModal(null)}
        />
        <AuroraBeliefsModal
          open={activeModal === 'beliefs'}
          onOpenChange={(nextOpen) => !nextOpen && setActiveModal(null)}
        />
      </div>
    </AIONNamingGate>
  );
}
