/**
 * AIONChatPanel - Floating chat widget panel that replaces the old Aurora page.
 * Shares the same AION signature shell pieces as the modal chat surfaces.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Moon, Heart, Target, Brain } from 'lucide-react';
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
import { AIONContextBadges, AIONHeader, AIONQuickActions } from './AIONSignature';

type WidgetModal = 'dream' | 'gratitude' | 'plan' | 'beliefs' | null;

interface AIONChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIONChatPanel({ open, onClose }: AIONChatPanelProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { activePillar, assessmentDomainId, endAssessment } = useAuroraChatContext();
  const [activeModal, setActiveModal] = useState<WidgetModal>(null);

  const isAssessing = !!assessmentDomainId;
  const pillarDomain = activePillar ? LIFE_DOMAINS.find((d) => d.id === activePillar) : null;
  const pillarLabel = pillarDomain ? (isHe ? pillarDomain.labelHe : pillarDomain.labelEn) : null;
  const assessDomain = assessmentDomainId ? LIFE_DOMAINS.find((d) => d.id === assessmentDomainId) : null;
  const assessLabel = assessDomain ? (isHe ? assessDomain.labelHe : assessDomain.labelEn) : null;

  const quickActions = [
    {
      id: 'dream',
      icon: Moon,
      label: isHe ? 'חלומות' : 'Dreams',
      gradient: 'from-indigo-500 to-indigo-700',
      onClick: () => setActiveModal('dream'),
    },
    {
      id: 'gratitude',
      icon: Heart,
      label: isHe ? 'תודה' : 'Gratitude',
      gradient: 'from-rose-500 to-pink-600',
      onClick: () => setActiveModal('gratitude'),
    },
    {
      id: 'plan',
      icon: Target,
      label: isHe ? 'תוכנית' : 'Plan',
      gradient: 'from-cyan-500 to-teal-600',
      onClick: () => setActiveModal('plan'),
    },
    {
      id: 'beliefs',
      icon: Brain,
      label: isHe ? 'אמונות' : 'Beliefs',
      gradient: 'from-violet-500 to-purple-600',
      onClick: () => setActiveModal('beliefs'),
    },
  ] as const;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[79] bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed z-[81] bottom-4 end-4 start-4 md:start-auto md:w-[430px] top-4 md:top-16 flex flex-col rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_42%),linear-gradient(180deg,rgba(10,18,34,0.98),rgba(7,11,20,0.96))] backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.55)] overflow-hidden"
          >
            <AIONNamingGate>
              <AIONHeader
                title="AION"
                subtitle={isHe ? 'שיחה חיה עם שכבת MindOS' : 'Live MindOS conversation layer'}
                icon={<MessageSquare className="w-4 h-4" />}
                onClose={onClose}
              />

              {(pillarLabel || (isAssessing && assessLabel)) && (
                <AIONContextBadges>
                  {pillarLabel && !isAssessing ? (
                    <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                      {pillarLabel}
                    </span>
                  ) : null}
                  {isAssessing && assessLabel ? (
                    <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                      {isHe ? 'סריקה' : 'Scan'}: {assessLabel}
                    </span>
                  ) : null}
                </AIONContextBadges>
              )}

              <AIONQuickActions actions={[...quickActions]} />

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

              <div className="px-3 pb-3 pt-2 shrink-0 border-t border-white/10 bg-black/10">
                <GlobalChatInput />
              </div>
            </AIONNamingGate>

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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
