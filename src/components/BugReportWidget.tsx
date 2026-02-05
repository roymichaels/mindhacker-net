import { useState, useCallback, useEffect } from 'react';
import { Bug, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useBugReport } from '@/hooks/useBugReport';
import { BugReportForm } from '@/components/bug-report/BugReportForm';
import { cn } from '@/lib/utils';

const PROMPT_DISMISSED_KEY = 'bug-report-prompt-dismissed-v2';

export const BugReportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const { t } = useTranslation();
  const { captureContext } = useBugReport();
  // Show the prompt after a delay if not dismissed
  useEffect(() => {
    const wasDismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    console.log('[BugWidget] Checking prompt - dismissed:', wasDismissed);
    if (!wasDismissed) {
      console.log('[BugWidget] Will show prompt in 3 seconds...');
      const timer = setTimeout(() => {
        console.log('[BugWidget] Showing prompt now');
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds (reduced for better UX)
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-hide prompt after 10 seconds
  useEffect(() => {
    if (showPrompt) {
      const timer = setTimeout(() => {
        setShowPrompt(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showPrompt]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setShowPrompt(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
  }, []);

  const context = captureContext();
  const deviceInfo = `${context.browser} / ${context.os} / ${context.deviceType}`;

  return (
    <>
      {/* Floating Button Container - positioned on start, above bottom dock */}
      <div
        id="bug-report-widget"
        className="fixed start-4 bottom-20 z-40 pointer-events-none"
      >
        <div className="relative flex items-center gap-2">
          {/* Prompt Bubble */}
          <AnimatePresence>
            {showPrompt && (
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                className={cn(
                  "pointer-events-auto absolute top-1/2 -translate-y-1/2 flex items-center gap-2",
                  "bg-background/90 backdrop-blur-xl",
                  "border border-border rounded-lg px-3 py-2",
                  "shadow-md",
                  "start-14 max-w-[70vw]"
                )}
              >
                <p className="text-xs text-foreground leading-tight whitespace-normal">
                  {t('bugReport.promptCta')}
                </p>
                <button
                  type="button"
                  onClick={dismissPrompt}
                  className="p-0.5 rounded-full hover:bg-muted transition-colors"
                  aria-label={t('common.close')}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bug Button */}
          <motion.button
            onClick={handleOpen}
            className={cn(
              "pointer-events-auto relative p-3 rounded-full",
              "bg-gradient-to-br from-card to-muted",
              "border border-border",
              "shadow-md hover:shadow-lg",
              "transition-shadow duration-300",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.3 }}
            title={t('bugReport.buttonTooltip')}
          >
            {/* Subtle animated glow */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-primary/15 to-primary/30 opacity-40 blur-md"
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div className="relative z-10 text-primary">
              <Bug className="h-5 w-5" />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Dialog */}
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent 
              className="max-w-md h-[85svh] max-h-[85svh] flex flex-col overflow-hidden"
              hideCloseButton
            >
              <DialogHeader 
                title={t('bugReport.title')} 
                icon={<Bug className="h-5 w-5" />}
                showBackArrow={false}
                className="flex-shrink-0"
              />
              <DialogDescription className="text-center text-muted-foreground -mt-2 flex-shrink-0">
                {t('bugReport.subtitle')}
              </DialogDescription>
              
              <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                <BugReportForm
                  onSuccess={handleClose}
                  contextInfo={{
                    pagePath: context.pagePath,
                    deviceInfo,
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default BugReportWidget;
