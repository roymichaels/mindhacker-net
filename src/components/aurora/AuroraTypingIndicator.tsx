import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';

const AuroraTypingIndicator = () => {
  return (
    <div className="flex gap-2 animate-fade-in">
      <AuroraHoloOrb size={32} glow="subtle" />
      
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
