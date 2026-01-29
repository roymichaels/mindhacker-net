import { Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const AuroraTypingIndicator = () => {
  return (
    <div className="flex gap-2 animate-fade-in">
      <Avatar className="h-8 w-8 shrink-0">
        <div className="h-full w-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </Avatar>
      
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default AuroraTypingIndicator;
