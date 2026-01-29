import { Link } from 'react-router-dom';
import { Bot, Pin } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { useTranslation } from '@/hooks/useTranslation';

interface ConversationItemProps {
  conversationId: string;
  name: string;
  subtitle?: string;
  avatarUrl?: string | null;
  lastMessage: string;
  lastMessageAt?: string | null;
  unreadCount?: number;
  isAI?: boolean;
  isPinned?: boolean;
}

const ConversationItem = ({
  conversationId,
  name,
  subtitle,
  avatarUrl,
  lastMessage,
  lastMessageAt,
  unreadCount = 0,
  isAI = false,
  isPinned = false,
}: ConversationItemProps) => {
  const { isRTL, language } = useTranslation();
  
  const timeAgo = lastMessageAt 
    ? formatDistanceToNow(new Date(lastMessageAt), { 
        addSuffix: false,
        locale: language === 'he' ? he : enUS,
      })
    : '';

  const linkTo = isAI ? '/messages/ai' : `/messages/${conversationId}`;

  return (
    <Link to={linkTo}>
      <div className={cn(
        "flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors",
        unreadCount > 0 && "bg-primary/5"
      )}>
        {/* Avatar */}
        <Avatar className="h-12 w-12 shrink-0">
          {isAI ? (
            <div className="h-full w-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
          ) : (
            <>
              <AvatarImage src={avatarUrl || ''} alt={name} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </>
          )}
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn(
                "font-semibold truncate",
                unreadCount > 0 && "text-foreground"
              )}>
                {name}
              </span>
              {isPinned && (
                <Pin className="h-3 w-3 text-primary shrink-0" />
              )}
            </div>
            {timeAgo && (
              <span className="text-xs text-muted-foreground shrink-0">
                {timeAgo}
              </span>
            )}
          </div>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground mb-0.5">{subtitle}</p>
          )}
          
          <p className={cn(
            "text-sm truncate",
            unreadCount > 0 
              ? "text-foreground font-medium" 
              : "text-muted-foreground"
          )}>
            {lastMessage}
          </p>
        </div>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <Badge className="bg-primary text-primary-foreground rounded-full h-5 min-w-5 flex items-center justify-center text-xs shrink-0">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </div>
    </Link>
  );
};

export default ConversationItem;
