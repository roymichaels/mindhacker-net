/**
 * AIONPage - Full-page AION chat surface.
 * Keeps the same signature header and quick actions as the floating widget.
 */
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';
import DomainAssessChat from '@/components/pillars/DomainAssessChat';
import { AIONNamingGate } from '@/components/aurora/AIONNamingGate';
import InteractiveAION from '@/components/aion/InteractiveAION';
import { useClientFlag } from '@/lib/clientFlags';
import { artifactBus, type ArtifactKind } from '@/lib/aion/artifactBus';
import ShellV2 from '@/shellv2/ShellV2';
import { zStyle } from '@/shellv2/zindex';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import ArtifactLayer from '@/components/artifacts/ArtifactLayer';

export default function AIONPage() {
  useTranslation();
  const { assessmentDomainId, endAssessment } = useAuroraChatContext();
  const interactive = useClientFlag('interactive_mode');
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-link: /aurora?summon=<kind>&...rest -> summon artifact, then strip params.
  useEffect(() => {
    const summon = searchParams.get('summon');
    if (!summon) return;
    const kind = summon as ArtifactKind;
    const params: Record<string, unknown> = {};
    searchParams.forEach((v, k) => {
      if (k !== 'summon') params[k] = v;
    });
    artifactBus.summon(kind, params, { replaceKind: true });
    const next = new URLSearchParams(searchParams);
    next.delete('summon');
    Array.from(next.keys()).forEach((k) => {
      // Keep unrelated params; drop the ones we consumed as artifact params.
      if (k in params) next.delete(k);
    });
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const isAssessing = !!assessmentDomainId;

  // Interactive AION Mode (opt-in via `?ff_interactive_mode=1`).
  // Falls back to compact chat surface for assessment flows.
  if (interactive && !isAssessing) {
    return (
      <AIONNamingGate>
        <InteractiveAION />
      </AIONNamingGate>
    );
  }

  return (
    <AIONNamingGate>
      <ShellV2>
        <main
          className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain touch-pan-y px-1 pt-14 pb-40"
          style={zStyle('chat')}
          data-shellv2-layer="chat"
          data-shellv2-route="aurora"
        >
          {isAssessing && assessmentDomainId ? (
            <DomainAssessChat
              domainId={assessmentDomainId}
              asDock
              dockHeightVh={85}
              onClose={() => endAssessment()}
            />
          ) : (
            <>
              <AuroraChatBubbles showOrbAboveMessages={false} />
              <ArtifactLayer />
            </>
          )}
        </main>
      </ShellV2>
    </AIONNamingGate>
  );
}
