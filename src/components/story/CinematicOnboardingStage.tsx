import type { ReactNode } from 'react';
import { featureFlags } from '@/lib/featureFlags';
import { StoryWorldShell } from '@/components/story/StoryWorldShell';
import { cn } from '@/lib/utils';

interface CinematicOnboardingStageProps {
  children: ReactNode;
  className?: string;
}

export function CinematicOnboardingStage({ children, className }: CinematicOnboardingStageProps) {
  if (!featureFlags.enableCinematicOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative min-h-screen overflow-hidden bg-slate-950', className)}>
      <StoryWorldShell className="fixed inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.05)_0%,rgba(2,6,23,0.62)_100%)]" />
      <div className="relative z-20 min-h-screen">
        {children}
      </div>
    </div>
  );
}

export default CinematicOnboardingStage;
