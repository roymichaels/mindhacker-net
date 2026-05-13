/**
 * BrainBackfillDebug — collapsible debug panel showing the latest
 * `brain-backfill` edge function result: sources found, rows per source,
 * nodes inserted/updated/skipped, and per-source errors.
 *
 * Pure presentation. Reads `BackfillResult` from `useBackfillBrain`.
 */
import type { BackfillResult } from "./useBackfill";

interface Props {
  result: BackfillResult | undefined;
}

export default function BrainBackfillDebug({ result }: Props) {
  if (!result) return null;
  const { totals, source_counts, detailed_source_counts, by_source, errors } = result;
  const sourceRows = detailed_source_counts ?? source_counts ?? {};
  const sourceCount = Object.keys(sourceRows).length;
  const errorEntries = Object.entries(errors ?? {}).filter(([, arr]) => arr.length > 0);

  return (
    <details className="mt-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 text-[11px] text-muted-foreground">
      <summary className="cursor-pointer text-foreground/80 font-medium select-none">
        Brain backfill debug · {sourceCount} sources · +{totals.inserted} new · {totals.updated} reinforced · {totals.skipped} skipped
      </summary>
      <div className="mt-3 space-y-2">
        <div>
          <div className="text-foreground/60 mb-1">Rows read per source</div>
          <div className="font-mono leading-relaxed break-words">
            {Object.entries(sourceRows)
              .map(([k, v]) => `${k} ${v}`)
              .join(" · ") || "—"}
          </div>
        </div>
        {by_source && Object.keys(by_source).length > 0 && (
          <div>
            <div className="text-foreground/60 mb-1">Nodes per source (inserted / updated / skipped)</div>
            <div className="font-mono leading-relaxed break-words">
              {Object.entries(by_source)
                .map(([k, c]) => `${k} ${c.inserted}/${c.updated}/${c.skipped}`)
                .join(" · ")}
            </div>
          </div>
        )}
        {errorEntries.length > 0 && (
          <div>
            <div className="text-destructive/80 mb-1">Errors</div>
            <ul className="font-mono space-y-0.5">
              {errorEntries.map(([src, msgs]) => (
                <li key={src} className="text-destructive/90">
                  {src}: {msgs.slice(0, 2).join("; ")}
                  {msgs.length > 2 && ` (+${msgs.length - 2} more)`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}