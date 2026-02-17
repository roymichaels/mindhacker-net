import { useLocation, useNavigate } from 'react-router-dom';
import { Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/useTranslation';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import { cn } from '@/lib/utils';

export type DockState = 'orb' | 'peek' | 'full';

export function AuroraDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { language } = useTranslation();
  const { 
    isChatExpanded, 
    setIsChatExpanded,
    isStreaming,
  } = useAuroraChatContext();

  const isAuroraTab = location.pathname === '/aurora';

  // On Aurora tab the dock is hidden entirely – the full chat is the page itself
  if (isAuroraTab) return null;

  // Derive dock state from existing context
  const dockState: DockState = isChatExpanded ? 'peek' : 'orb';

  const handleOrbClick = () => {
    setIsChatExpanded(true);
  };

  const handleExpandToFull = () => {
    setIsChatExpanded(false);
    navigate('/aurora');
  };

  return (
    <>
      {/* ── Orb state ── */}
      <AnimatePresence>
        {dockState === 'orb' && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOrbClick}
            className={cn(
              "fixed z-40",
              "h-12 w-12 rounded-full",
              "bg-primary text-primary-foreground shadow-lg",
              "flex items-center justify-center",
              "hover:scale-105 active:scale-95 transition-transform",
              isMobile
                ? "bottom-[calc(3.5rem+env(safe-area-inset-bottom)+8px)] right-4"
                : "bottom-6 right-6"
            )}
            aria-label={language === 'he' ? 'פתח צ׳אט' : 'Open chat'}
          >
            <AuroraOrbIcon className="w-6 h-6" size={24} />
            {isStreaming && (
              <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-accent border-2 border-primary animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Peek state ── */}
      <AnimatePresence>
        {dockState === 'peek' && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              "fixed left-0 right-0 z-40 flex flex-col items-center",
              isMobile
                ? "bottom-14 px-3 pb-[env(safe-area-inset-bottom)]"
                : "bottom-0"
            )}
          >
            {/* Expand to full chat button */}
            <div className="w-full max-w-3xl mx-auto flex justify-end px-1 mb-1">
              <button
                onClick={handleExpandToFull}
                className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                title={language === 'he' ? 'צ׳אט מלא' : 'Full chat'}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <AuroraChatBubbles />
            <GlobalChatInput />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
