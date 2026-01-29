import { Copy, Volume2, Square, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraVoice } from '@/hooks/aurora/useAuroraVoice';
import { toast } from 'sonner';
import AuroraCTAButton from './AuroraCTAButton';

interface AuroraChatMessageProps {
  id: string;
  content: string;
  isOwn: boolean;
  isAI?: boolean;
  isStreaming?: boolean;
  timestamp?: string;
  onRegenerate?: () => void;
}

// Extract CTA buttons from content
const extractCTAs = (content: string): { cleanContent: string; ctas: string[] } => {
  const ctaRegex = /\[cta:(\w+)\]/g;
  const ctas: string[] = [];
  let match;
  
  while ((match = ctaRegex.exec(content)) !== null) {
    ctas.push(match[1]);
  }
  
  const cleanContent = content.replace(ctaRegex, '').trim();
  return { cleanContent, ctas };
};

const AuroraChatMessage = ({
  id,
  content,
  isOwn,
  isAI = false,
  isStreaming = false,
  timestamp,
  onRegenerate,
}: AuroraChatMessageProps) => {
  const { t, isRTL } = useTranslation();
  const { isPlaying, activeMessageId, playMessage, stopPlayback } = useAuroraVoice();
  
  const { cleanContent, ctas } = extractCTAs(content);
  const isPlayingThis = isPlaying && activeMessageId === id;

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent);
    toast.success(t('messages.copied'));
  };

  const handleVoice = () => {
    if (isPlayingThis) {
      stopPlayback();
    } else {
      playMessage(id, cleanContent);
    }
  };

  return (
    <div className={cn("group", isOwn && "flex flex-col items-end")}>
      {/* Label */}
      <div className="mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {isOwn ? t('aurora.you') : t('aurora.name')}
        </span>
      </div>

      {/* Message Container */}
      <div className={cn(
        "flex gap-3",
        isOwn && "flex-row-reverse"
      )}>
        {/* Avatar - only for Aurora */}
        {!isOwn && (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Message Bubble */}
        <div className="space-y-2">
          <div className={cn(
            "rounded-2xl px-4 py-3",
            isOwn 
              ? "bg-primary text-primary-foreground rounded-br-sm" 
              : "bg-muted text-foreground rounded-bl-sm"
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {cleanContent}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-current animate-pulse ms-1" />
              )}
            </p>
          </div>

          {/* Action Buttons - Below message for Aurora */}
          {!isStreaming && !isOwn && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
                title={t('messages.copy')}
              >
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleVoice}
                title={isPlayingThis ? t('messages.stopReading') : t('messages.readAloud')}
              >
                {isPlayingThis ? (
                  <Square className="h-3 w-3 text-muted-foreground fill-current" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
              {onRegenerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onRegenerate}
                  title={t('aurora.regenerate')}
                >
                  <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          {ctas.length > 0 && !isStreaming && (
            <div className="flex flex-wrap gap-2 pt-1">
              {ctas.map((cta, index) => (
                <AuroraCTAButton key={`${cta}-${index}`} type={cta} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuroraChatMessage;
