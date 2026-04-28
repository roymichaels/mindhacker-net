import type { ReactNode } from 'react';
import { featureFlags } from '@/lib/featureFlags';
import { StoryWorldShell } from '@/components/story/StoryWorldShell';
import { cn } from '@/lib/utils';

interface CinematicOnboardingStageProps {
  children: ReactNode;
  className?: string;
  /** When true, the StoryWorld background and headline are omitted (used for the first onboarding step). */
  skipStory?: boolean;
}

export function CinematicOnboardingStage({ children, className, skipStory }: CinematicOnboardingStageProps) {
  if (!featureFlags.enableCinematicOnboarding) {
    return <>{children}</>;
  }

  // When skipping the story, suppress the background and any global headline side‑effects
  if (skipStory) {
    // Set a temporary flag so other story‑related code can know we are skipping
    if (typeof window !== 'undefined') {
      (window as any).__skipStoryWorld = true;
    }
  }

  return (
    <div className={cn('relative min-h-screen overflow-hidden bg-slate-950', className)}>
      {/* Render the StoryWorld only when not skipping */}
      {!skipStory && <StoryWorldShell className="fixed inset-0" />}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.05)_0%,rgba(2,6,23,0.62)_100%)]" />
      {/* Center the onboarding content both vertically and horizontally */}
      <div className="relative z-20 flex min-h-screen items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

export default CinematicOnboardingStage;
