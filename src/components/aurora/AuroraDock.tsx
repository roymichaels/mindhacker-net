import { useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Bug, GripHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/useTranslation';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';

import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import DomainAssessChat from '@/components/domain-assess/DomainAssessChat';
import { cn } from '@/lib/utils';
import { BugReportDialog } from '@/components/aurora/BugReportDialog';

/** Min/max height for the expanded chat area (vh units) */
const MIN_CHAT_VH = 15;
const MAX_CHAT_VH = 85;
const DEFAULT_CHAT_VH = 55;
const CLOSE_THRESHOLD_VH = 20;

export function AuroraDock() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { language } = useTranslation();
  const {
    isChatExpanded,
    setIsChatExpanded,
    isDockVisible,
    setIsDockVisible,
    isStreaming,
    activePillar,
    assessmentDomainId,
    endAssessment,
  } = useAuroraChatContext();
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const [chatHeightVh, setChatHeightVh] = useState(DEFAULT_CHAT_VH);
  const dragRef = useRef<{ startY: number; startVh: number } | null>(null);

  const isHe = language === 'he';

  const isAssessing = !!assessmentDomainId;

  // Get pillar label if active
  const pillarDomain = activePillar ? LIFE_DOMAINS.find(d => d.id === activePillar) : null;
  const pillarLabel = pillarDomain ? (isHe ? pillarDomain.labelHe : pillarDomain.labelEn) : null;

  // Get assessment domain label
  const assessDomain = assessmentDomainId ? LIFE_DOMAINS.find(d => d.id === assessmentDomainId) : null;
  const assessLabel = assessDomain ? (isHe ? assessDomain.labelHe : assessDomain.labelEn) : null;

  // Drag handle logic for resizing
  const handleDragStart = useCallback((clientY: number) => {
    dragRef.current = { startY: clientY, startVh: chatHeightVh };
  }, [chatHeightVh]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!dragRef.current) return;
    const deltaY = dragRef.current.startY - clientY;
    const viewportH = window.innerHeight;
    const deltaVh = (deltaY / viewportH) * 100;
    const newVh = Math.min(MAX_CHAT_VH, Math.max(MIN_CHAT_VH, dragRef.current.startVh + deltaVh));
    setChatHeightVh(newVh);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragRef.current && chatHeightVh <= CLOSE_THRESHOLD_VH) {
      setIsChatExpanded(false);
      setChatHeightVh(DEFAULT_CHAT_VH);
    }
    dragRef.current = null;
  }, [chatHeightVh, setIsChatExpanded]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const onTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
    const onMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
    const onUp = () => { handleDragEnd(); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  // Hide dock on non-dashboard pages (panels, etc.)
  const isPanel = location.pathname.startsWith('/panel') ||
    location.pathname.startsWith('/coach') ||
    location.pathname.startsWith('/affiliate');
  if (isPanel) return null;

  const dragHandle = isChatExpanded ? (
    <div
      className="flex items-center justify-center py-1 cursor-row-resize touch-none select-none shrink-0"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <GripHorizontal className="w-5 h-5 text-muted-foreground/40" />
    </div>
  ) : null;

  return (
    <>
      <BugReportDialog open={bugReportOpen} onOpenChange={setBugReportOpen} />

      <div
        data-aurora-dock
        className={cn(
          "fixed left-0 right-0 z-40 flex flex-col",
          "bg-background/100 backdrop-blur-none border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.5)]",
          isMobile
            ? "bottom-14"
            : "bottom-0",
        )}
      >
        {/* Assessment mode: full-height DomainAssessChat */}
        {isAssessing && assessmentDomainId ? (
          <>
            {/* Drag handle */}
            {dragHandle}

            {/* Assessment indicator + close (visible when expanded) */}
            {isChatExpanded && (
              <div className="w-full max-w-3xl mx-auto flex items-center justify-between px-3 pt-0.5 mb-0.5 shrink-0">
                <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                  {isHe ? 'סריקה' : 'Scan'}: {assessLabel}
                </span>
                <button
                  onClick={() => endAssessment()}
                  className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  title={isHe ? 'סגור' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Assessment chat bubbles (expanded only) */}
            <AnimatePresence>
              {isChatExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full overflow-hidden"
                  style={{ maxHeight: `${chatHeightVh}vh` }}
                >
                  <DomainAssessChat
                    domainId={assessmentDomainId}
                    asDock
                    dockHeightVh={chatHeightVh}
                    onClose={() => endAssessment()}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Assessment input (always visible) */}
            <GlobalChatInput />
          </>
        ) : (
          <>
            {/* Drag handle */}
            {dragHandle}

            {/* Bug report + pillar indicator (visible only when expanded) */}
            {isChatExpanded && (
              <div className="w-full max-w-3xl mx-auto flex items-center justify-between px-3 pt-0.5 mb-0.5 shrink-0">
                {pillarLabel ? (
                  <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                    {pillarLabel}
                  </span>
                ) : (
                  <span />
                )}
                <button
                  onClick={() => setBugReportOpen(true)}
                  className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  title={isHe ? 'דווח על באג' : 'Report Bug'}
                >
                  <Bug className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Chat bubbles (expanded only) */}
            <AnimatePresence>
              {isChatExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full overflow-hidden"
                  style={{ maxHeight: `${chatHeightVh}vh` }}
                >
                  <AuroraChatBubbles />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input bar (always visible) */}
            <GlobalChatInput />
          </>
        )}
      </div>
    </>
  );
}
