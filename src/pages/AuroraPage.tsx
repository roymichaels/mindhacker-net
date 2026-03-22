/**
 * AuroraPage — Full-page chat with floating input & iPhone widget modals.
 */
import { useState, useRef, useEffect } from 'react';
import { Moon, Heart, Target, Brain } from 'lucide-react';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';

import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import DomainAssessChat from '@/components/pillars/DomainAssessChat';
import { IPhoneWidget } from '@/components/ui/IPhoneWidget';
import { AuroraJournalModal } from '@/components/aurora/AuroraJournalModal';
import { AuroraPlanModal } from '@/components/aurora/AuroraPlanModal';
import { AuroraBeliefsModal } from '@/components/aurora/AuroraBeliefsModal';
import { AIONNamingGate } from '@/components/aurora/AIONNamingGate';

type WidgetModal = 'dream' | 'gratitude' | 'plan' | 'beliefs' | null;

export default function AuroraPage() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const {
    activePillar,
    assessmentDomainId,
    endAssessment,
  } = useAuroraChatContext();

  const [activeModal, setActiveModal] = useState<WidgetModal>(null);

  const isAssessing = !!assessmentDomainId;
  const pillarDomain = activePillar ? LIFE_DOMAINS.find(d => d.id === activePillar) : null;
  const pillarLabel = pillarDomain ? (isHe ? pillarDomain.labelHe : pillarDomain.labelEn) : null;
  const assessDomain = assessmentDomainId ? LIFE_DOMAINS.find(d => d.id === assessmentDomainId) : null;
  const assessLabel = assessDomain ? (isHe ? assessDomain.labelHe : assessDomain.labelEn) : null;

  return (
    <AIONNamingGate>
    <div className="fixed inset-0 top-14 z-40 flex flex-col bg-background overflow-hidden">
      {/* Context badges */}
      {(pillarLabel || (isAssessing && assessLabel)) && (
        <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 shrink-0">
          {pillarLabel && !isAssessing && (
            <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
              {pillarLabel}
            </span>
          )}
          {isAssessing && assessLabel && (
            <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
              {isHe ? 'סריקה' : 'Scan'}: {assessLabel}
            </span>
          )}
        </div>
      )}

      {/* Floating widgets row — fixed at top below header */}
      <div className="fixed top-14 inset-x-0 z-30 flex justify-center px-3 pt-2">
        <div className="rounded-2xl backdrop-blur-xl bg-background/80 border border-border/30 shadow-lg px-4 py-2 flex gap-4">
          <IPhoneWidget
            icon={Moon}
            label={isHe ? 'חלומות' : 'Dreams'}
            gradient="from-indigo-500 to-indigo-700"
            size="sm"
            onClick={() => setActiveModal('dream')}
          />
          <IPhoneWidget
            icon={Heart}
            label={isHe ? 'תודה' : 'Gratitude'}
            gradient="from-rose-500 to-pink-600"
            size="sm"
            onClick={() => setActiveModal('gratitude')}
          />
          <IPhoneWidget
            icon={Target}
            label={isHe ? 'תוכנית' : 'Plan'}
            gradient="from-cyan-500 to-teal-600"
            size="sm"
            onClick={() => setActiveModal('plan')}
          />
          <IPhoneWidget
            icon={Brain}
            label={isHe ? 'אמונות' : 'Beliefs'}
            gradient="from-violet-500 to-purple-600"
            size="sm"
            onClick={() => setActiveModal('beliefs')}
          />
        </div>
      </div>

      {/* Chat messages — full height, padded for floating elements */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
        style={{ paddingTop: '80px', paddingBottom: '140px' }}
      >
        {isAssessing && assessmentDomainId ? (
          <DomainAssessChat
            domainId={assessmentDomainId}
            asDock
            dockHeightVh={85}
            onClose={() => endAssessment()}
          />
        ) : (
          <AuroraChatBubbles showOrbAboveMessages />
        )}
      </div>

      {/* Floating input dock — fixed above bottom nav */}
      <div className="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] inset-x-0 z-30 px-3 pb-2">
        <div className="rounded-2xl backdrop-blur-xl bg-background/80 border border-border/30 shadow-lg p-2">
          <GlobalChatInput />
        </div>
      </div>

      {/* Modals */}
      <AuroraJournalModal
        type="dream"
        open={activeModal === 'dream'}
        onOpenChange={(o) => !o && setActiveModal(null)}
      />
      <AuroraJournalModal
        type="gratitude"
        open={activeModal === 'gratitude'}
        onOpenChange={(o) => !o && setActiveModal(null)}
      />
      <AuroraPlanModal
        open={activeModal === 'plan'}
        onOpenChange={(o) => !o && setActiveModal(null)}
      />
      <AuroraBeliefsModal
        open={activeModal === 'beliefs'}
        onOpenChange={(o) => !o && setActiveModal(null)}
      />
    </div>
  );
}
