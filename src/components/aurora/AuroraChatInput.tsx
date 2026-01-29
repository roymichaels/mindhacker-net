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
    <form 
      onSubmit={handleSubmit} 
      className="fixed bottom-14 left-0 right-0 p-4 bg-background border-t"
    >
      <div className="flex gap-2 max-w-3xl mx-auto items-end">
        {/* Voice Button */}
        <Button
          type="button"
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          onClick={handleMicClick}
          disabled={disabled}
          className={cn(
            "shrink-0 rounded-full w-10 h-10",
            isRecording && "animate-pulse"
          )}
          title={isRecording ? t('aurora.chat.stopRecording') : t('aurora.chat.startRecording')}
        >
          {isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('aurora.chat.placeholder')}
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full bg-muted border border-border rounded-2xl px-4 py-3 text-sm",
              "resize-none overflow-hidden",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:opacity-50",
              "placeholder:text-muted-foreground"
            )}
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ maxHeight: '200px' }}
          />
          
          {recordingError && (
            <p className="absolute -bottom-5 left-0 text-xs text-destructive">
              {recordingError}
            </p>
          )}
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !input.trim()}
          className="rounded-full w-10 h-10 shrink-0"
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </form>
  );
};

export default AuroraChatInput;
