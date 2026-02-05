import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface KaraokeTextProps {
  text: string;
  progress: number; // 0-1
  isRTL?: boolean;
}

export function KaraokeText({ text, progress, isRTL }: KaraokeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const highlightedWordCount = Math.floor(words.length * progress);

  // Auto-scroll to current word
  useEffect(() => {
    if (!containerRef.current || progress === 0) return;
    
    const container = containerRef.current;
    const scrollableParent = container.closest('[data-scroll-container]');
    
    if (scrollableParent) {
      const scrollPosition = (progress * scrollableParent.scrollHeight) - (scrollableParent.clientHeight / 2);
      scrollableParent.scrollTo({ 
        top: Math.max(0, scrollPosition), 
        behavior: 'smooth' 
      });
    }
  }, [progress]);

  return (
    <div 
      ref={containerRef}
      className="text-center py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <p className="text-lg leading-loose whitespace-pre-wrap">
        {words.map((word, index) => (
          <span
            key={index}
            className={cn(
              "transition-all duration-300 ease-out inline-block mx-0.5",
              index < highlightedWordCount 
                ? "text-foreground opacity-100" 
                : "text-foreground/30 opacity-60"
            )}
          >
            {word}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}

export default KaraokeText;
