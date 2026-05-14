/**
 * WorldComposer — bottom verb strip exposing the world's interaction
 * grammar as quick prompts. Phase 5B.5 ships display-only; verbs will
 * push into the AION composer in a later phase.
 */
interface Verb { id: string; label: string }

export default function WorldComposer({ verbs }: { verbs: Verb[] }) {
  if (!verbs?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 px-1 pt-2">
      {verbs.map((v) => (
        <button
          key={v.id}
          type="button"
          className="text-[11px] px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] text-foreground/70 hover:bg-white/[0.06] transition-colors"
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
