import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Plus, Image, Camera, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';
import { useAuroraVoice } from '@/hooks/aurora/useAuroraVoice';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import VoiceRecordingButton from '@/components/aurora/VoiceRecordingButton';
import UpgradePromptModal from '@/components/subscription/UpgradePromptModal';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalChatInput = () => {
  const { t, tg, isRTL } = useGenderedTranslation();
  const { user } = useAuth();
  const { canSendMessage, messagesRemaining, isPro, showUpgradePrompt, upgradeFeature, dismissUpgrade } = useSubscriptionGate();
  const [input, setInput] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { sendMessageRef, isStreaming, isChatExpanded, setIsChatExpanded } = useAuroraChatContext();
  const isMobile = useIsMobile();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    
    if (showAttachMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAttachMenu]);

  // Handle focus to expand chat bubbles
  const handleFocus = () => {
    setIsChatExpanded(true);
  };

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(isRTL ? 'הקובץ גדול מדי (מקסימום 10MB)' : 'File too large (max 10MB)');
        return;
      }
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setShowAttachMenu(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isStreaming) return;

    // Subscription gate check
    if (!canSendMessage) {
      showUpgradePrompt('aurora_limit');
      return;
    }
    
    const messageToSend = input.trim();
    setInput('');
    clearImage();
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // TODO: Handle image upload with message when backend supports it
    if (selectedImage) {
      toast.info(isRTL ? 'תמיכה בתמונות בקרוב!' : 'Image support coming soon!');
    }
    
    if (!messageToSend) return;

    // Increment daily message count for free users
    if (!isPro && user?.id) {
      supabase.rpc('increment_daily_message_count', { p_user_id: user.id }).then(() => {});
    }
    
    // Retry sending with exponential backoff
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      if (sendMessageRef.current) {
        sendMessageRef.current(messageToSend);
        return;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 100 * attempts));
    }
    
    // If still not available, show error
    console.error('Could not send message - chat not ready');
    toast.error('Could not send message. Please try again.');
    setInput(messageToSend);
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
    <div className="shrink-0 w-full pt-1 pb-2 px-4" data-global-chat-input>
      {/* Image Preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="w-full max-w-3xl mx-auto"
          >
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-24 rounded-lg border border-border/50"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-destructive-foreground shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2">
          {/* Plus Button with Attach Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={cn(
                "h-9 w-9 flex items-center justify-center bg-background/50 backdrop-blur-xl border border-border/50 rounded-lg hover:bg-muted/50 transition-all shrink-0",
                showAttachMenu && "bg-muted/50 rotate-45"
              )}
            >
              <Plus className="w-5 h-5 text-muted-foreground transition-transform" />
            </button>

            {/* Attach Menu Popover */}
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={cn(
                    "absolute bottom-full mb-2 bg-background/95 backdrop-blur-xl",
                    "border border-border rounded-xl shadow-lg",
                    "p-2 min-w-[140px]",
                    isRTL ? "right-0" : "left-0"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                  >
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <Image className="w-4 h-4 text-primary" />
                    </div>
                    <span>{isRTL ? 'תמונה' : 'Photo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                  >
                    <div className="p-1.5 rounded-full bg-accent/30">
                      <Camera className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <span>{isRTL ? 'מצלמה' : 'Camera'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>



          {/* Input Container */}
          <div className="flex-1 h-9 relative bg-background/50 backdrop-blur-xl rounded-lg border border-border/50 flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
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

          {/* Send Button */}
          <button
            type="submit"
            disabled={isStreaming || (!input.trim() && !selectedImage) || isRecording}
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

      {/* Free tier message counter */}
      {!isPro && (
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          {isRTL
            ? `${messagesRemaining} הודעות נותרו היום`
            : `${messagesRemaining} messages remaining today`}
        </p>
      )}

      <UpgradePromptModal feature={upgradeFeature} onDismiss={dismissUpgrade} />
    </div>
  );
};

export default GlobalChatInput;
