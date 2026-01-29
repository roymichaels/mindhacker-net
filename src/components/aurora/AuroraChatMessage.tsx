import { Copy, Volume2, VolumeX, RefreshCw, Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
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
}: AuroraChatMessageProps) => {
  const { language, t } = useTranslation();
  const { isPlaying, activeMessageId, playMessage, stopPlayback } = useAuroraVoice();
  
  const { cleanContent, ctas } = extractCTAs(content);
  const isPlayingThis = isPlaying && activeMessageId === id;

  const time = timestamp 
    ? format(new Date(timestamp), 'HH:mm', { 
        locale: language === 'he' ? he : enUS 
      })
    : '';

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
    <div className={cn(
      "flex gap-2 animate-fade-in group",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar - only show for Aurora */}
      {!isOwn && (
        <Avatar className="h-8 w-8 shrink-0">
          <div className="h-full w-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn("max-w-[75%] space-y-2", isOwn && "items-end")}>
        {/* Message Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-2.5 relative",
          isOwn 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-muted text-foreground rounded-bl-md"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {cleanContent}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-1" />
            )}
          </p>
          
          {time && (
            <p className={cn(
              "text-[10px] mt-1",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {time}
            </p>
          )}

          {/* Hover Actions */}
          {!isStreaming && !isOwn && (
            <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/90 backdrop-blur rounded-lg p-1 shadow-sm border">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
                title={t('messages.copy')}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleVoice}
                title={isPlayingThis ? t('messages.stopReading') : t('messages.readAloud')}
              >
                {isPlayingThis ? (
                  <VolumeX className="h-3.5 w-3.5" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        {ctas.length > 0 && !isStreaming && (
          <div className="flex flex-wrap gap-2">
            {ctas.map((cta, index) => (
              <AuroraCTAButton key={`${cta}-${index}`} type={cta} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuroraChatMessage;
