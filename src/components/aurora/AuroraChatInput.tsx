import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';
import { useAuroraVoice } from '@/hooks/aurora/useAuroraVoice';
import { useAuroraVoiceMode } from '@/hooks/aurora/useAuroraVoiceMode';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { useAuth } from '@/contexts/AuthContext';
import { useEnergy } from '@/hooks/useGameState';
import { useGameState } from '@/contexts/GameStateContext';
import { supabase } from '@/integrations/supabase/client';
import { ENERGY_COSTS } from '@/lib/energyCosts';
import UpgradePromptModal from '@/components/subscription/UpgradePromptModal';
import EnergySpendModal from '@/components/energy/EnergySpendModal';
import VoiceRecordingButton from './VoiceRecordingButton';
import VoiceModeButton from './VoiceModeButton';
import AuroraVoiceMode from './AuroraVoiceMode';
import { cn } from '@/lib/utils';

interface AuroraChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const AuroraChatInput = ({ onSend, disabled }: AuroraChatInputProps) => {
  const queryClient = useQueryClient();
  const { t, tg, isRTL } = useGenderedTranslation();
  const { user } = useAuth();
  const { canSendMessage, messagesRemaining, isPro, showUpgradePrompt, upgradeFeature, dismissUpgrade } = useSubscriptionGate();
  const [input, setInput] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [energyModalOpen, setEnergyModalOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { canAfford } = useEnergy();
  const { spendEnergy } = useGameState();

  // Voice mode
  const voiceMode = useAuroraVoiceMode({
    onSend,
    useGlobalResponseEvent: true,
  });

  const handleTranscription = (text: string) => {
    setIsTranscribing(false);
    setInput((prev) => prev + (prev ? ' ' : '') + text);
  };

  const {
    isRecording,
    recordingError,
    startRecording,
    stopRecording,
  } = useAuroraVoice({ onTranscription: handleTranscription });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    const message = input.trim();

    // Subscription gate check: if free user out of messages, offer energy spend
    if (!canSendMessage && !isPro) {
      if (canAfford(ENERGY_COSTS.AURORA_MESSAGE)) {
        setPendingMessage(message);
        setEnergyModalOpen(true);
      } else {
        showUpgradePrompt('aurora_limit');
      }
      return;
    }
    
    sendMessage(message);
  };

  const sendMessage = (message: string) => {
    onSend(message);
    setInput('');

    // Increment daily message count for free users
    if (!isPro && user?.id) {
      supabase.rpc('increment_daily_message_count', { p_user_id: user.id }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['daily-message-count', user.id] });
      });
    }
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleEnergyConfirm = async () => {
    setEnergyModalOpen(false);
    const ok = await spendEnergy(ENERGY_COSTS.AURORA_MESSAGE, 'aurora_message', 'Premium message');
    if (ok && pendingMessage) {
      sendMessage(pendingMessage);
    }
    setPendingMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStartRecording = () => {
    startRecording();
  };

  const handleStopRecording = () => {
    setIsTranscribing(true);
    stopRecording();
  };

  return (
    <div className="shrink-0 w-full bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border-t border-border pt-3 pb-4 px-4">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-end gap-3">
          {/* Input Container */}
          <div className="flex-1 relative bg-muted rounded-2xl border border-border">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tg('aurora.chat.placeholder')}
              disabled={disabled || isRecording}
              rows={1}
              className={cn(
                "w-full bg-transparent px-4 py-3 pe-12 text-sm",
                "resize-none overflow-hidden",
                "focus:outline-none",
                "disabled:opacity-50",
                "placeholder:text-muted-foreground"
              )}
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ maxHeight: '200px' }}
            />

            {/* Voice buttons inside input */}
            <div className="absolute end-2 bottom-1.5 flex items-center gap-0.5">
              <VoiceModeButton
                onClick={voiceMode.open}
                disabled={disabled || isRecording}
                className="h-8 w-8"
              />
              <VoiceRecordingButton
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                disabled={disabled}
                compact
                className="h-8 w-8"
              />
            </div>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !input.trim() || isRecording}
            className="rounded-full h-11 w-11 shrink-0"
          >
            {disabled ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {recordingError && (
          <p className="text-xs text-destructive mt-2 text-center">
            {recordingError}
          </p>
        )}

        {/* Footer Note + Message Counter */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <p className="text-xs text-muted-foreground">
            {t('aurora.footerNote')}
          </p>
          {!isPro && (
            <span className="text-xs text-muted-foreground">
              · {messagesRemaining} {isRTL ? 'נותרו' : 'left'}
            </span>
          )}
        </div>
      </form>
      <UpgradePromptModal feature={upgradeFeature} onDismiss={dismissUpgrade} />
      <EnergySpendModal
        open={energyModalOpen}
        cost={ENERGY_COSTS.AURORA_MESSAGE}
        source="aurora_message"
        onConfirm={handleEnergyConfirm}
        onCancel={() => { setEnergyModalOpen(false); setPendingMessage(''); }}
      />
      <AuroraVoiceMode
        isActive={voiceMode.isActive}
        state={voiceMode.state}
        userTranscript={voiceMode.userTranscript}
        auroraResponse={voiceMode.auroraResponse}
        error={voiceMode.error}
        onClose={voiceMode.close}
        onStopListening={voiceMode.stopListening}
      />
    </div>
  );
};

export default AuroraChatInput;
