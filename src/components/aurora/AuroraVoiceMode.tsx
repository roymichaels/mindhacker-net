import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mic } from 'lucide-react';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';
import type { VoiceModeState } from '@/hooks/aurora/useAuroraVoiceMode';
import { cn } from '@/lib/utils';

interface AuroraVoiceModeProps {
  isActive: boolean;
  state: VoiceModeState;
  userTranscript: string;
  auroraResponse: string;
  error: string | null;
  onClose: () => void;
  onStopListening: () => void;
}

const stateLabels = {
  idle: { en: 'Connecting...', he: 'מתחבר...' },
  listening: { en: 'Listening...', he: 'מקשיב...' },
  processing: { en: 'Thinking...', he: 'חושב...' },
  speaking: { en: 'Speaking...', he: 'מדבר...' },
};

export default function AuroraVoiceMode({
  isActive,
  state,
  userTranscript,
  auroraResponse,
  error,
  onClose,
  onStopListening,
}: AuroraVoiceModeProps) {
  const { isRTL } = useGenderedTranslation();

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-background/95 backdrop-blur-2xl"
        >
          {/* Transcript Area */}
          <div className="w-full max-w-md px-6 pt-16 text-center space-y-3 min-h-[120px]">
            {userTranscript && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {userTranscript}
              </motion.p>
            )}
            {auroraResponse && state === 'speaking' && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium text-foreground"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {auroraResponse.slice(0, 300)}
                {auroraResponse.length > 300 && '...'}
              </motion.p>
            )}
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          {/* Center Orb */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            {/* Animated rings behind orb */}
            <div className="relative">
              {/* Pulse rings for listening state */}
              {state === 'listening' && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    style={{ margin: -20 }}
                    animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/20"
                    style={{ margin: -20 }}
                    animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                  />
                </>
              )}

              {/* Processing spinner */}
              {state === 'processing' && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/30"
                  style={{ margin: -16 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Speaking glow */}
              {state === 'speaking' && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                  style={{ margin: -24 }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              <motion.div
                animate={
                  state === 'speaking'
                    ? { scale: [1, 1.05, 1] }
                    : state === 'listening'
                    ? { scale: [1, 1.02, 1] }
                    : {}
                }
                transition={{ duration: state === 'speaking' ? 1.5 : 3, repeat: Infinity }}
              >
                <AuroraHoloOrb size={120} glow="full" />
              </motion.div>
            </div>

            {/* State Label */}
            <motion.p
              key={state}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium text-muted-foreground"
            >
              {isRTL ? stateLabels[state].he : stateLabels[state].en}
            </motion.p>

            {/* Tap to stop listening indicator */}
            {state === 'listening' && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onStopListening}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary hover:bg-primary/20 transition-colors"
              >
                <Mic className="w-4 h-4" />
                <span>{isRTL ? 'לחץ לשלוח' : 'Tap to send'}</span>
              </motion.button>
            )}
          </div>

          {/* End Call Button */}
          <div className="pb-16">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                "bg-destructive text-destructive-foreground",
                "shadow-lg shadow-destructive/30",
                "hover:bg-destructive/90 transition-colors"
              )}
            >
              <Phone className="w-6 h-6 rotate-[135deg]" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
