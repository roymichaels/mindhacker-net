/**
 * AuroraPage — Full-page Aurora with tabs: Chat, Dream Journal, Daily Reflection, Gratitude.
 * Rebuilt with mobile-first best practices for reliable chat UX.
 */
import { MessageCircle, Moon, Sun, Heart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';

import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import DomainAssessChat from '@/components/domain-assess/DomainAssessChat';
import { JournalTab } from '@/components/aurora/JournalTab';

type AuroraTab = 'chat' | 'dream' | 'reflection' | 'gratitude';

const TABS: { id: AuroraTab; labelHe: string; labelEn: string; icon: typeof MessageCircle }[] = [
  { id: 'chat', labelHe: 'צ\'אט', labelEn: 'Chat', icon: MessageCircle },
  { id: 'dream', labelHe: 'חלומות', labelEn: 'Dreams', icon: Moon },
  { id: 'reflection', labelHe: 'רפלקציה', labelEn: 'Reflect', icon: Sun },
  { id: 'gratitude', labelHe: 'תודה', labelEn: 'Gratitude', icon: Heart },
];

export default function AuroraPage() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const {
    activePillar,
    assessmentDomainId,
    endAssessment,
  } = useAuroraChatContext();
  const [activeTab, setActiveTab] = useState<AuroraTab>('chat');

  // Measure input height dynamically to set proper scroll padding
  const inputRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(80);

  useEffect(() => {
    if (!inputRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setInputHeight(entry.contentRect.height + 16); // + padding
      }
    });
    ro.observe(inputRef.current);
    return () => ro.disconnect();
  }, [activeTab]);

  const isAssessing = !!assessmentDomainId;

  const pillarDomain = activePillar ? LIFE_DOMAINS.find(d => d.id === activePillar) : null;
  const pillarLabel = pillarDomain ? (isHe ? pillarDomain.labelHe : pillarDomain.labelEn) : null;
  const assessDomain = assessmentDomainId ? LIFE_DOMAINS.find(d => d.id === assessmentDomainId) : null;
  const assessLabel = assessDomain ? (isHe ? assessDomain.labelHe : assessDomain.labelEn) : null;

  return (
    <div className="relative flex flex-col fixed inset-0 top-14 z-40 bg-background overflow-hidden">
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

      {/* Tab switcher */}
      <div className="px-3 pt-2 pb-1 shrink-0 z-20">
        <div className="flex gap-1 p-1 rounded-2xl">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all",
                  isActive
                    ? "text-primary-foreground"
                    : "text-foreground/90 hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="aurora-tab-bg"
                    className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/50 ring-2 ring-primary/70"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {isHe ? tab.labelHe : tab.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'chat' ? (
        <>
          {/* Scrollable messages — with bottom padding matching input height + bottom bar */}
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
            style={{ paddingBottom: `${inputHeight + 56}px` }}
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

          {/* Input — pinned above bottom nav */}
          <div
            ref={inputRef}
            className="absolute bottom-0 inset-x-0 z-30 px-3 pb-[calc(3.5rem+env(safe-area-inset-bottom))] pt-2 bg-gradient-to-t from-background via-background/95 to-transparent"
          >
            <GlobalChatInput />
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden">
          <JournalTab type={activeTab} />
        </div>
      )}
    </div>
  );
}
