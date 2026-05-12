import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Counts = { inserted: number; updated: number; skipped: number };
export interface BackfillResult {
  ok: boolean;
  totals: Counts;
  by_source: Record<string, Counts>;
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
      toast.success(
        `Brain updated · +${t.inserted} new · ${t.updated} reinforced`,
      );
      qc.invalidateQueries({ queryKey: ["brain-overview"] });
    },
    onError: (e: any) => {
      toast.error(`Backfill failed: ${e?.message ?? e}`);
    },
  });
}