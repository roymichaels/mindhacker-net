import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Counts = { inserted: number; updated: number; skipped: number };
export interface BackfillResult {
  ok: boolean;
  totals: Counts;
  by_source: Record<string, Counts>;
  errors?: Record<string, string[]>;
}

export function useBackfillBrain() {
  const qc = useQueryClient();
  return useMutation<BackfillResult>({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("brain-backfill", {
        body: {},
      });
      if (error) throw error;
      return data as BackfillResult;
    },
    onSuccess: (res) => {
      const t = res.totals;
      const errCount = Object.values(res.errors ?? {}).reduce((s, a) => s + a.length, 0);
      if (t.inserted + t.updated === 0) {
        const firstErr = Object.values(res.errors ?? {})[0]?.[0];
        toast.error(
          firstErr
            ? `Brain backfill skipped everything: ${firstErr}`
            : `Brain backfill found nothing to add (skipped ${t.skipped})`,
        );
      } else if (errCount > 0) {
        toast.warning(`Brain updated · +${t.inserted} new · ${t.updated} reinforced · ${errCount} errors`);
      } else {
        toast.success(`Brain updated · +${t.inserted} new · ${t.updated} reinforced`);
      }
      qc.invalidateQueries({ queryKey: ["brain-overview"] });
      qc.invalidateQueries({ queryKey: ["brain-fallback"] });
    },
    onError: (e: any) => {
      toast.error(`Backfill failed: ${e?.message ?? e}`);
    },
  });
}