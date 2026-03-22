/**
 * AIONChatPanel — Floating chat widget panel that replaces the /aurora full page.
 * Contains the same widgets bar, chat bubbles, and floating input dock.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Heart, Target, Brain } from 'lucide-react';
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
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { OrganicOrbCanvas } from './OrganicOrbCanvas';

type WidgetModal = 'dream' | 'gratitude' | 'plan' | 'beliefs' | null;

interface AIONChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIONChatPanel({ open, onClose }: AIONChatPanelProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const {
    activePillar,
    assessmentDomainId,
    endAssessment,
  } = useAuroraChatContext();
  const { profile } = useOrbProfile();

  const [activeModal, setActiveModal] = useState<WidgetModal>(null);

  const isAssessing = !!assessmentDomainId;
  const pillarDomain = activePillar ? LIFE_DOMAINS.find(d => d.id === activePillar) : null;
  const pillarLabel = pillarDomain ? (isHe ? pillarDomain.labelHe : pillarDomain.labelEn) : null;
  const assessDomain = assessmentDomainId ? LIFE_DOMAINS.find(d => d.id === assessmentDomainId) : null;
  const assessLabel = assessDomain ? (isHe ? assessDomain.labelHe : assessDomain.labelEn) : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed z-[71] bottom-4 end-4 start-4 md:start-auto md:w-[420px] top-4 md:top-16 flex flex-col rounded-2xl border border-border/30 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            <AIONNamingGate>
              {/* Header with orb + close */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8">
                    <OrganicOrbCanvas profile={profile} size={32} />
                  </div>
                  <span className="text-sm font-bold text-foreground">AION</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

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

              {/* Widget row */}
              <div className="flex justify-center px-3 py-2 shrink-0">
                <div className="rounded-xl bg-muted/40 border border-border/20 px-3 py-1.5 flex gap-3">
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

              {/* Chat messages */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-1">
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

              {/* Floating input dock */}
              <div className="px-3 pb-3 pt-2 shrink-0 border-t border-border/20">
                <GlobalChatInput />
              </div>
            </AIONNamingGate>

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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
