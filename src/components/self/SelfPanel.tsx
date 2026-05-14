/**
 * SelfPanel — Phase 5B.4 thin wrapper. The body is now SelfWorldShell:
 * an inner-OS shell with the AION presence layer above the user
 * identity triad (AION · DNA · Character) and the explorable inner
 * systems registry. See `src/selfworld/`.
 */
import SelfWorldShell from '@/selfworld/SelfWorldShell';
import { artifactBus } from '@/lib/aion/artifactBus';

interface Props {
  /** Optional override. If omitted, "Advanced" summons the profile-stats artifact. */
  onOpenAdvanced?: () => void;
}

export default function SelfPanel({ onOpenAdvanced }: Props) {
  const handleAdvanced =
    onOpenAdvanced ??
    (() => {
      artifactBus.summon('profile-stats', {}, { fullscreen: true, replaceKind: true });
    });
  return <SelfWorldShell onOpenAdvanced={handleAdvanced} />;
}
