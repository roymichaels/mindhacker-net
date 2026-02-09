import { useState, useCallback, useEffect } from 'react';
import { Bug, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useBugReport } from '@/hooks/useBugReport';
import { useAuth } from '@/contexts/AuthContext';
import BugReportChat from '@/components/bug-report/BugReportChat';
import { cn } from '@/lib/utils';

const PROMPT_DISMISSED_KEY = 'bug-report-prompt-dismissed-v2';

export const BugReportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const { t, language } = useTranslation();
  const { captureContext } = useBugReport();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) return;
    const wasDismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (!wasDismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (showPrompt) {
      const timer = setTimeout(() => setShowPrompt(false), 10000);
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

  // Only render for admin users
  if (!isAdmin) return null;

  const context = captureContext();
  const deviceInfo = `${context.browser} / ${context.os} / ${context.deviceType}`;

  return (
    <div className="fixed end-4 bottom-14 lg:bottom-20 z-30 flex flex-col items-end">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              "mb-3 w-[340px] sm:w-[380px] rounded-2xl overflow-hidden",
              "bg-gray-50 dark:bg-gray-950 border border-border",
              "shadow-2xl shadow-black/20 dark:shadow-black/40",
              "flex flex-col",
              "h-[min(480px,70svh)]"
            )}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/20">
                  <Bug className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {language === 'he' ? 'דיווח על באג' : 'Report a Bug'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                aria-label={t('common.close')}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Chat Content */}
            <BugReportChat
              onSuccess={handleClose}
              contextInfo={{
                pagePath: context.pagePath,
                deviceInfo,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt Bubble */}
      <AnimatePresence>
        {showPrompt && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className={cn(
              "mb-2 flex items-center gap-2",
              "bg-background/95 backdrop-blur-xl",
              "border border-border rounded-lg px-3 py-2",
              "shadow-lg max-w-[200px]"
            )}
          >
            <p className="text-xs text-foreground leading-tight">
              {language === 'he' ? 'נתקלת בבאג? ספר לי!' : 'Found a bug? Tell me!'}
            </p>
            <button
              type="button"
              onClick={dismissPrompt}
              className="p-0.5 rounded-full hover:bg-muted transition-colors shrink-0"
              aria-label={t('common.close')}
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={isOpen ? handleClose : handleOpen}
        className={cn(
          "relative p-3.5 rounded-full",
          "bg-gradient-to-br from-primary to-primary/80",
          "text-primary-foreground",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        title={t('bugReport.buttonTooltip')}
      >
        <div className="relative z-10">
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Bug className="h-5 w-5" />
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default BugReportWidget;
