import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PresenceScan {
  id: string;
  user_id: string;
  scan_images: Record<string, string>;
  derived_metrics: Record<string, any>;
  scores: {
    structural_integrity: number;
    aesthetic_symmetry: number;
    composition: number;
    posture_alignment: number;
    projection_potential: number;
    presence_index: number;
    confidence_band: string;
  };
  delta_metrics: Record<string, any> | null;
  direct_mode_notes: Record<string, string> | null;
  scan_number: number;
  created_at: string;
}

export function usePresenceScans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const scansQuery = useQuery({
    queryKey: ["presence-scans", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("presence_scans" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PresenceScan[];
    },
    enabled: !!user?.id,
  });

  const latestScan = scansQuery.data?.[0] ?? null;

  const analyzeMutation = useMutation({
    mutationFn: async (scanImages: Record<string, string>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-presence`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ scan_images: scanImages }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Analysis failed" }));
        throw new Error(err.error || "Analysis failed");
      }

      return resp.json() as Promise<PresenceScan>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presence-scans"] });
    },
  });

  const deleteScanMutation = useMutation({
    mutationFn: async (scanId: string) => {
      const { error } = await supabase
        .from("presence_scans" as any)
        .delete()
        .eq("id", scanId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presence-scans"] });
    },
  });

  // Recalculate: re-analyze using existing images from the latest scan
  const recalculate = async (): Promise<PresenceScan> => {
    if (!latestScan?.scan_images || Object.keys(latestScan.scan_images).length === 0) {
      throw new Error("No existing scan images to recalculate from");
    }
    return analyzeMutation.mutateAsync(latestScan.scan_images);
  };

  return {
    scans: scansQuery.data ?? [],
    latestScan,
    isLoading: scansQuery.isLoading,
    analyze: analyzeMutation.mutateAsync,
    recalculate,
    isAnalyzing: analyzeMutation.isPending,
    deleteScan: deleteScanMutation.mutateAsync,
  };
}
