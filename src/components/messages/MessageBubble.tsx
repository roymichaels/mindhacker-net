import { Bot, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { useTranslation } from '@/hooks/useTranslation';

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  isAI?: boolean;
  isStreaming?: boolean;
  timestamp?: string;
  avatarUrl?: string | null;
}

const MessageBubble = ({
  content,
  isOwn,
  isAI = false,
  isStreaming = false,
  timestamp,
  avatarUrl,
}: MessageBubbleProps) => {
  const { language } = useTranslation();
  
  const time = timestamp 
    ? format(new Date(timestamp), 'HH:mm', { 
        locale: language === 'he' ? he : enUS 
      })
    : '';

  return (
    <div className={cn(
      "flex gap-2 animate-fade-in",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar - only show for non-own messages */}
      {!isOwn && (
        <Avatar className="h-8 w-8 shrink-0">
          {isAI ? (
            <div className="h-full w-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
          ) : avatarUrl ? (
            <AvatarImage src={avatarUrl} />
          ) : (
            <AvatarFallback className="bg-muted">
              <User className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
      )}

      {/* Message Bubble */}
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-2.5",
        isOwn 
          ? "bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/40 text-foreground rounded-br-md" 
          : "bg-muted text-foreground rounded-bl-md"
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-current animate-pulse mr-1" />
          )}
        </p>
        {time && (
          <p className={cn(
            "text-[10px] mt-1 text-muted-foreground"
          )}>
            {time}
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
