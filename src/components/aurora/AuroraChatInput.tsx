import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';
import { useAuroraVoice } from '@/hooks/aurora/useAuroraVoice';
import VoiceRecordingButton from './VoiceRecordingButton';
import { cn } from '@/lib/utils';

interface AuroraChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const AuroraChatInput = ({ onSend, disabled }: AuroraChatInputProps) => {
  const { t, tg, isRTL } = useGenderedTranslation();
  const [input, setInput] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    
    onSend(input.trim());
    setInput('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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

            {/* Voice Recording Button Inside Input */}
            <div className="absolute end-2 bottom-1.5">
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

        {/* Footer Note */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          {t('aurora.footerNote')}
        </p>
      </form>
    </div>
  );
};

export default AuroraChatInput;
