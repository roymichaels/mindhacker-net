import { cn } from '@/lib/utils';

interface AuroraOrbIconProps {
  className?: string;
  size?: number;
}

export const AuroraOrbIcon = ({ className, size = 16 }: AuroraOrbIconProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      fill="none"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    >
      <g stroke="currentColor" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
        {/* outer circle */}
        <circle cx="256" cy="256" r="210"/>
        
        {/* meridians */}
        <ellipse cx="256" cy="256" rx="210" ry="95"/>
        <ellipse cx="256" cy="256" rx="210" ry="140"/>
        <ellipse cx="256" cy="256" rx="210" ry="180"/>
        
        {/* rotated meridians */}
        <g transform="rotate(60 256 256)">
          <ellipse cx="256" cy="256" rx="210" ry="95"/>
          <ellipse cx="256" cy="256" rx="210" ry="140"/>
          <ellipse cx="256" cy="256" rx="210" ry="180"/>
        </g>
        <g transform="rotate(-60 256 256)">
          <ellipse cx="256" cy="256" rx="210" ry="95"/>
          <ellipse cx="256" cy="256" rx="210" ry="140"/>
          <ellipse cx="256" cy="256" rx="210" ry="180"/>
        </g>
        
        {/* subtle "illusion" core */}
        <circle cx="256" cy="256" r="46" opacity="0.55"/>
      </g>
    </svg>
  );
};
