import { useState } from 'react';
import { Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAIONDisplayName } from '@/hooks/useAIONDisplayName';
import { toast } from 'sonner';
import AuroraCTAButton from './AuroraCTAButton';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useXpProgress } from '@/hooks/useGameState';
import { TTSPlayer } from './TTSPlayer';

interface AuroraChatMessageProps {
  id: string;
  content: string;
  isOwn: boolean;
  isAI?: boolean;
  isStreaming?: boolean;
  timestamp?: string;
  onRegenerate?: () => void;
  onRetry?: () => void;
  isFailed?: boolean;
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
  onRetry,
  isFailed = false,
}: AuroraChatMessageProps) => {
  const { t, isRTL } = useTranslation();
  const { displayName: aionName } = useAIONDisplayName();
  const { profile: orbProfile } = useOrbProfile();
  const { level } = useXpProgress();
  
  const { cleanContent, ctas } = extractCTAs(content);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent);
    toast.success(t('messages.copied'));
  };

  return (
    <div className={cn("group", isOwn && "flex flex-col items-end")}>
      {/* Label */}
      <div className="mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {isOwn ? t('aurora.you') : aionName}
        </span>
      </div>

      {/* Message Container */}
      <div className={cn(
        "flex gap-3",
        isOwn && "flex-row-reverse"
      )}>
        {/* Avatar - only for Aurora */}
        {!isOwn && (
          <StandaloneMorphOrb size={32} profile={AURORA_ORB_PROFILE} geometryFamily="octa" level={100} />
        )}

        {/* Message Bubble */}
        <div className="space-y-2">
          <div className={cn(
            "rounded-2xl px-4 py-3",
            isOwn 
              ? "bg-primary/15 border border-primary/30 text-foreground rounded-br-sm" 
              : "bg-muted text-foreground rounded-bl-sm",
            isFailed && "border-destructive/50 bg-destructive/5"
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {cleanContent}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-current animate-pulse ms-1" />
              )}
            </p>
            {isFailed && onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 mt-2 text-xs text-destructive hover:underline cursor-pointer"
              >
                <AlertCircle className="h-3 w-3" />
                {t('aurora.sendFailed') || 'Failed to send. Tap to retry'} 🔄
              </button>
            )}
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
              <TTSPlayer messageId={id} content={cleanContent} compact />
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
