import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraVoice } from '@/hooks/aurora/useAuroraVoice';
import { cn } from '@/lib/utils';

interface AuroraChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const AuroraChatInput = ({ onSend, disabled }: AuroraChatInputProps) => {
  const { t, isRTL } = useTranslation();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTranscription = (text: string) => {
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

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border pt-4 pb-6 px-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-3">
          {/* Input Container */}
          <div className="flex-1 relative bg-muted rounded-2xl border border-border">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('aurora.chat.placeholder')}
              disabled={disabled}
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
            
            {/* Mic Button Inside Input */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleMicClick}
              disabled={disabled}
              className={cn(
                "absolute end-2 bottom-1.5 h-8 w-8 rounded-full",
                isRecording && "text-destructive bg-destructive/10"
              )}
              title={isRecording ? t('aurora.chat.stopRecording') : t('aurora.chat.startRecording')}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !input.trim()}
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
