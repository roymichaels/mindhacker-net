import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, ImagePlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useBugReport, BugReportData } from '@/hooks/useBugReport';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

const AURORA_QUESTIONS = {
  he: [
    'היי! אני כאן לעזור לדווח על באג 🐛\n\nספר/י לי בקצרה - מה קרה? מה ניסית לעשות ומה השתבש?',
    'תודה! עכשיו תוכל/י להוסיף צילום מסך אם זה יעזור להבין טוב יותר.\n\nאפשר גם פשוט להמשיך לשלב הבא.',
    'מעולה! כמה זה משפיע עליך?\n\n• **קטן** - מטריד אבל אפשר להמשיך\n• **בינוני** - מקשה על השימוש\n• **גדול** - חוסם אותי לגמרי',
    'הבנתי! רוצה להשאיר אימייל ליצירת קשר? (אופציונלי)\n\nאפשר גם פשוט לדלג.',
    'מצוין! אני שולח את הדיווח עכשיו... 🚀',
  ],
  en: [
    "Hi! I'm here to help report a bug 🐛\n\nTell me briefly - what happened? What were you trying to do and what went wrong?",
    "Thanks! Now you can add a screenshot if it helps understand better.\n\nYou can also just continue to the next step.",
    "Great! How much does this affect you?\n\n• **Minor** - Annoying but I can continue\n• **Medium** - Makes it harder to use\n• **Major** - Completely blocks me",
    "Got it! Want to leave an email for contact? (optional)\n\nYou can also just skip.",
    "Perfect! Sending the report now... 🚀",
  ],
};

interface BugReportChatProps {
  onSuccess: () => void;
  contextInfo: { pagePath: string; deviceInfo: string };
}

export const BugReportChat = ({ onSuccess, contextInfo }: BugReportChatProps) => {
  const { t, language, isRTL } = useTranslation();
  const { submitReport, isSubmitting, captureScreenshot, screenshotPreview, clearScreenshot } = useBugReport();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [collectedData, setCollectedData] = useState<Partial<BugReportData>>({
    category: 'other',
    priority: 'medium',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const questions = language === 'he' ? AURORA_QUESTIONS.he : AURORA_QUESTIONS.en;

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add initial message
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{
        id: 'initial',
        role: 'assistant',
        content: questions[0],
      }]);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'he' ? 'הקובץ גדול מדי (מקסימום 5MB)' : 'File too large (max 5MB)');
        return;
      }
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `bug-report-${Date.now()}.${fileExt}`;
      const filePath = `bug-reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bug-screenshots')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('bug-screenshots')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() && !selectedImage && step !== 1 && step !== 3) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim() || (selectedImage ? (language === 'he' ? '📷 צילום מסך' : '📷 Screenshot') : (language === 'he' ? 'המשך' : 'Continue')),
      imageUrl: imagePreview || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Process based on step
    let nextStep = step + 1;
    
    switch (step) {
      case 0: // Description
        setCollectedData(prev => ({
          ...prev,
          title: input.trim().substring(0, 100),
          description: input.trim(),
        }));
        break;
      case 1: // Screenshot (optional)
        if (selectedImage) {
          const uploadedUrl = await uploadImage(selectedImage);
          if (uploadedUrl) {
            setCollectedData(prev => ({
              ...prev,
              screenshotUrl: uploadedUrl,
            }));
          }
        }
        break;
      case 2: // Priority
        const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
          'קטן': 'low', 'minor': 'low',
          'בינוני': 'medium', 'medium': 'medium',
          'גדול': 'high', 'major': 'high',
        };
        const lowerInput = input.toLowerCase();
        const priority = Object.entries(priorityMap).find(([key]) => lowerInput.includes(key))?.[1] || 'medium';
        setCollectedData(prev => ({ ...prev, priority }));
        break;
      case 3: // Email
        if (input.trim() && input.includes('@')) {
          setCollectedData(prev => ({ ...prev, contactEmail: input.trim() }));
        }
        break;
    }

    setInput('');
    clearImage();

    // Add Aurora response
    if (nextStep < questions.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `aurora-${nextStep}`,
          role: 'assistant',
          content: questions[nextStep],
        }]);
        setStep(nextStep);

        // Auto-submit on last step
        if (nextStep === 4) {
          submitFinalReport();
        }
      }, 600);
    }
  };

  const submitFinalReport = async () => {
    const finalData: BugReportData = {
      title: collectedData.title || 'Bug Report',
      description: collectedData.description || '',
      category: collectedData.category || 'other',
      priority: collectedData.priority || 'medium',
      contactEmail: collectedData.contactEmail,
      screenshotUrl: collectedData.screenshotUrl,
    };

    const success = await submitReport(finalData);

    if (success) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 'success',
          role: 'assistant',
          content: language === 'he' 
            ? 'הדיווח נשלח בהצלחה! תודה שעזרת לנו לשפר 💜' 
            : 'Report sent successfully! Thanks for helping us improve 💜',
        }]);
        
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#8b5cf6', '#d946ef', '#06b6d4'],
        });

        setTimeout(onSuccess, 1500);
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Context Bar */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border/50 text-xs text-muted-foreground flex items-center gap-2">
        <span className="truncate">{contextInfo.pagePath}</span>
        <span className="opacity-50">•</span>
        <span className="truncate">{contextInfo.deviceInfo}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex gap-2",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5",
                msg.role === 'user'
                  ? "bg-primary/20 border border-primary/40 rounded-br-md"
                  : "bg-muted rounded-bl-md"
              )}>
                {msg.imageUrl && (
                  <img 
                    src={msg.imageUrl} 
                    alt="Attached" 
                    className="max-w-full max-h-48 rounded-lg mb-2"
                  />
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 border-t border-border/50"
          >
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-20 rounded-lg"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-destructive-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input - matching GlobalChatInput style */}
      <div className="shrink-0 w-full pt-3 pb-3 px-4">
        <div className="relative flex items-end gap-2">
          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isSubmitting || step >= 4}
            className={cn(
              "h-9 w-9 flex items-center justify-center bg-background/50 backdrop-blur-xl border border-border/50 rounded-lg hover:bg-muted/50 transition-all shrink-0",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <ImagePlus className="w-5 h-5 text-muted-foreground" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Input Container */}
          <div className="flex-1 h-9 relative bg-background/50 backdrop-blur-xl rounded-lg border border-border/50 flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting || step >= 4}
              placeholder={
                step === 1 
                  ? (language === 'he' ? 'הוסף תיאור או המשך...' : 'Add description or continue...')
                  : (language === 'he' ? 'הקלד הודעה...' : 'Type a message...')
              }
              rows={1}
              className={cn(
                "w-full h-9 bg-transparent px-3 py-2 text-sm leading-tight",
                "resize-none overflow-hidden",
                "focus:outline-none",
                "disabled:opacity-50",
                "placeholder:text-muted-foreground"
              )}
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ maxHeight: '36px' }}
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={(!input.trim() && !selectedImage && step !== 1 && step !== 3) || isSubmitting || isUploading || step >= 4}
            className={cn(
              "h-9 w-9 flex items-center justify-center bg-background/50 backdrop-blur-xl border border-border/50 rounded-lg hover:bg-muted/50 transition-colors shrink-0",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting || isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <Send className={cn("w-4 h-4 text-muted-foreground", isRTL && "rotate-180")} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BugReportChat;
