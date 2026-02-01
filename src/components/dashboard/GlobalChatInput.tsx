import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';
import { useAuroraVoice } from '@/hooks/aurora/useAuroraVoice';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import VoiceRecordingButton from '@/components/aurora/VoiceRecordingButton';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

const GlobalChatInput = () => {
  const { t, tg, isRTL } = useGenderedTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { sendMessageRef, isStreaming } = useAuroraChatContext();

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
    if (!input.trim() || isStreaming) return;
    
    // If not on Aurora page, navigate there first
    if (!location.pathname.startsWith('/aurora')) {
      navigate('/aurora');
    }
    
    // Send message via the registered callback
    if (sendMessageRef.current) {
      sendMessageRef.current(input.trim());
    }
    
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
    <div className="shrink-0 w-full pt-3 pb-[15px] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
        <div className="relative flex items-end gap-3">
          {/* Input Container - same style as sidebar search bar */}
          <div className="flex-1 h-9 relative bg-background/50 backdrop-blur-xl rounded-lg border border-border/50 flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tg('aurora.chat.placeholder')}
              disabled={isStreaming || isRecording}
              rows={1}
              className={cn(
                "w-full h-9 bg-transparent px-3 py-2 pe-10 text-sm leading-tight",
                "resize-none overflow-hidden",
                "focus:outline-none",
                "disabled:opacity-50",
                "placeholder:text-muted-foreground"
              )}
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ maxHeight: '36px' }}
            />

            {/* Voice Recording Button Inside Input */}
            <div className="absolute end-1">
              <VoiceRecordingButton
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                disabled={isStreaming}
                compact
                className="h-7 w-7"
              />
            </div>
          </div>

          {/* Send Button - same style as sidebar plus button */}
          <button
            type="submit"
            disabled={isStreaming || !input.trim() || isRecording}
            className={cn(
              "h-9 w-9 flex items-center justify-center bg-background/50 backdrop-blur-xl border border-border/50 rounded-lg hover:bg-muted/50 transition-colors shrink-0",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <Send className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {recordingError && (
          <p className="text-xs text-destructive mt-2 text-center">
            {recordingError}
          </p>
        )}

      </form>
    </div>
  );
};

export default GlobalChatInput;
