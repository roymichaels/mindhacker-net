import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface PlayerAvatarProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
  className?: string;
}

/**
 * Player avatar for community. Shows first letter fallback.
 * TODO: Replace with PersonalizedOrb component when integrated at this scale.
 */
export default function PlayerAvatar({ userId, size = 'sm', name, className }: PlayerAvatarProps) {
  const sizeClasses = {
    sm: 'h-9 w-9',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
  };

  const textClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-2xl',
  };

  // Deterministic color based on userId
  const hue = userId ? parseInt(userId.replace(/[^0-9]/g, '').slice(0, 4) || '0') % 360 : 200;

  return (
    <Avatar className={cn(sizeClasses[size], 'ring-2 ring-primary/20', className)}>
      <AvatarFallback
        className={cn(textClasses[size], 'font-bold')}
        style={{ 
          backgroundColor: `hsl(${hue}, 50%, 15%)`,
          color: `hsl(${hue}, 80%, 65%)`,
        }}
      >
        {(name || '?').charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
