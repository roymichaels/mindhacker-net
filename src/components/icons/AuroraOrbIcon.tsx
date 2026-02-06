import { cn } from '@/lib/utils';

interface AuroraOrbIconProps {
  className?: string;
  size?: number;
  gradient?: boolean;
}

export const AuroraOrbIcon = ({ className, size = 16, gradient = true }: AuroraOrbIconProps) => {
  const id = `auroraGrad-${size}`;
  const filterId = `softGlow-${size}`;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      fill="none"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    >
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4A6FF"/>
            <stop offset="35%" stopColor="#9B7CFF"/>
            <stop offset="65%" stopColor="#6FE3D6"/>
            <stop offset="100%" stopColor="#FFD27D"/>
          </linearGradient>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      )}
      <g
        stroke={gradient ? `url(#${id})` : "currentColor"}
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={gradient ? `url(#${filterId})` : undefined}
      >
        <circle cx="256" cy="256" r="18" fill={gradient ? `url(#${id})` : "currentColor"}/>
        <polygon points="256,96 320,192 416,256 320,320 256,416 192,320 96,256 192,192"/>
        <polygon points="256,48 344,176 464,256 344,336 256,464 168,336 48,256 168,176" opacity="0.55"/>
        <line x1="256" y1="18" x2="256" y2="96"/>
        <line x1="256" y1="416" x2="256" y2="494"/>
        <line x1="18" y1="256" x2="96" y2="256"/>
        <line x1="416" y1="256" x2="494" y2="256"/>
        <line x1="96" y1="96" x2="176" y2="176"/>
        <line x1="336" y1="336" x2="416" y2="416"/>
        <line x1="96" y1="416" x2="176" y2="336"/>
        <line x1="336" y1="176" x2="416" y2="96"/>
      </g>
    </svg>
  );
};
