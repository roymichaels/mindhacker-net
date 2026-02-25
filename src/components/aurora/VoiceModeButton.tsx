import { AudioLines } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceModeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function VoiceModeButton({ onClick, disabled, className }: VoiceModeButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full transition-all duration-200 hover:bg-primary/10",
        className
      )}
      title="Advanced Voice Mode"
    >
      <AudioLines className="w-4 h-4 text-muted-foreground" />
    </Button>
  );
}
