import { useState, useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, Plus, Image, Camera, X, Mic } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';
import { useAuroraVoice } from '@/hooks/aurora/useAuroraVoice';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuroraVoiceMode } from '@/hooks/aurora/useAuroraVoiceMode';
import VoiceRecordingButton from '@/components/aurora/VoiceRecordingButton';
import AuroraVoiceMode from '@/components/aurora/AuroraVoiceMode';
import UpgradePromptModal from '@/components/subscription/UpgradePromptModal';
import { cn } from '@/lib/utils';
import { useAIONDisplayName } from '@/hooks/useAIONDisplayName';
import { aionPresenceBus } from '@/aion/presenceState';

import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalChatInput = () => {
  const queryClient = useQueryClient();
  const { t, tg, isRTL } = useGenderedTranslation();
  const { user } = useAuth();
  const { canSendMessage, isPro, showUpgradePrompt, upgradeFeature, dismissUpgrade } = useSubscriptionGate();
  const { displayName: aionName } = useAIONDisplayName();
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

  // Voice mode
  const handleVoiceModeSend = useCallback((message: string) => {
    if (sendMessageRef.current) {
      sendMessageRef.current(message);
    }
  }, [sendMessageRef]);

  const voiceMode = useAuroraVoiceMode({
    onSend: handleVoiceModeSend,
    useGlobalResponseEvent: true,
  });

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
    aionPresenceBus.set('listening');
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

  // Surface recording errors as a toast so no caption sits under the composer.
  useEffect(() => {
    if (recordingError) toast.error(recordingError);
  }, [recordingError]);

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


  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
    const imageFile = selectedImage;
    setInput('');
    clearImage();
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Convert image to base64 if present
    let imageBase64: string | undefined;
    if (imageFile) {
      try {
        imageBase64 = await fileToBase64(imageFile);
      } catch (err) {
        console.error('Failed to convert image:', err);
        toast.error(isRTL ? 'שגיאה בטעינת התמונה' : 'Failed to load image');
      }
    }
    
    if (!messageToSend && !imageBase64) return;

    // Increment daily message count for free users
    if (!isPro && user?.id) {
      supabase.rpc('increment_daily_message_count', { p_user_id: user.id }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['daily-message-count', user.id] });
      });
    }
    
    // Retry sending with exponential backoff
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      if (sendMessageRef.current) {
        sendMessageRef.current(messageToSend || (isRTL ? 'נא לנתח את התמונה' : 'Please analyze this image'), imageBase64);
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
    <div className="shrink-0 w-full" data-global-chat-input>
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
        {/* Single cinematic atmo pill */}
        {/* Command dock — barely-there pill, hovers on the environmental glow */}
          <div
            className={cn(
              "relative flex items-end gap-1 rounded-full px-2 py-1.5 backdrop-blur-2xl border transition-all",
              !input && !isStreaming && !isRecording
                ? "bg-foreground/[0.025] border-white/[0.03]"
                : "bg-foreground/[0.04] border-white/[0.06]",
              "focus-within:border-white/10 focus-within:bg-foreground/[0.05] focus-within:shadow-[0_0_36px_hsl(var(--aion-violet)/0.18)]",
            )}
          >
          {/* Plus Button with Attach Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground/80 transition-all shrink-0",
                showAttachMenu && "rotate-45 text-foreground"
              )}
              aria-label="More"
            >
              <Plus className="w-4 h-4 transition-transform" strokeWidth={1.6} />
            </button>

            {/* Attach Menu Popover */}
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={cn(
                    "atmo-surface absolute bottom-full mb-2 rounded-2xl p-2 min-w-[160px]",
                    isRTL ? "right-0" : "left-0"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors text-sm aion-text-soft hover:text-foreground"
                  >
                    <Image className="w-4 h-4 aion-text-mute" />
                    <span>{isRTL ? 'תמונה' : 'Photo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors text-sm aion-text-soft hover:text-foreground"
                  >
                    <Camera className="w-4 h-4 aion-text-mute" />
                    <span>{isRTL ? 'מצלמה' : 'Camera'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachMenu(false);
                      voiceMode.open();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors text-sm aion-text-soft hover:text-foreground"
                  >
                    <Mic className="w-4 h-4 aion-text-mute" />
                    <span>{isRTL ? 'מצב קול' : 'Voice mode'}</span>
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

          {/* Input — borderless, sits inside the pill */}
          <div className="flex-1 min-h-9 relative flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              placeholder={isRTL ? `שלח/י הודעה ל-${aionName}...` : `Message ${aionName}...`}
              disabled={isStreaming || isRecording}
              rows={1}
              className={cn(
                "w-full bg-transparent px-2 py-2 text-base leading-snug",
                "resize-none overflow-hidden",
                "focus:outline-none",
                "disabled:opacity-50",
                !input && !isStreaming && !isRecording
                  ? "placeholder:text-foreground/30"
                  : "placeholder:text-foreground/45",
              )}
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ maxHeight: '120px', minHeight: '36px' }}
            />
          </div>

          {/* Mic ⇄ Send swap */}
          {input.trim() || selectedImage ? (
            <button
              type="submit"
              disabled={isStreaming || isRecording}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full bg-foreground/90 text-background hover:bg-foreground transition-colors shrink-0",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Send"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          ) : (
            <VoiceRecordingButton
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              disabled={isStreaming}
              compact
              className="h-9 w-9 shrink-0"
            />
          )}
        </div>

      </form>

      {/* Free tier message counter */}

      <UpgradePromptModal feature={upgradeFeature} onDismiss={dismissUpgrade} />
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

export default GlobalChatInput;
