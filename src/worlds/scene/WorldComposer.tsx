/**
 * WorldComposer — bottom verb strip. Phase 5B.7: each verb tap is now a
 * graph mutation. The composer translates the world's grammar into
 * `MutationEvent`s via `useGraphMutator` and emits a soft confirmation.
 */
import { useState } from 'react';
import { useGraphMutator, inferKindFromVerb } from '@/worlds/graph/useGraphMutator';
import type { CognitiveWorldId } from '@/worlds/types';

interface Verb { id: string; label: string }

interface Props {
  verbs: Verb[];
  worldId: CognitiveWorldId;
}

export default function WorldComposer({ verbs, worldId }: Props) {
  const mutate = useGraphMutator();
  const [recent, setRecent] = useState<string | null>(null);

  if (!verbs?.length) return null;

  const handle = (verb: Verb) => {
    const kind = inferKindFromVerb(verb.id);
    mutate({
      worldId,
      kind,
      verb: verb.id,
      label: verb.label,
      meaning: verb.label,
    });
    setRecent(verb.id);
    window.setTimeout(() => setRecent((r) => (r === verb.id ? null : r)), 1200);
  };

  return (
    <div className="flex flex-wrap gap-2 px-1 pt-2">
      {verbs.map((v) => {
        const active = recent === v.id;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => handle(v)}
            className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
              active
                ? 'border-primary/40 bg-primary/15 text-foreground'
                : 'border-white/[0.06] bg-white/[0.03] text-foreground/70 hover:bg-white/[0.06]'
            }`}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
