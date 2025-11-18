import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EpisodeProgressData {
  episode_id: string;
  product_id: string;
  last_position_seconds?: number;
  watch_time_seconds?: number;
  completed?: boolean;
}

export const useEpisodeProgress = (episodeId: string, productId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState(0);

  // Fetch existing progress
  const { data: progress, isLoading } = useQuery({
    queryKey: ["episode-progress", episodeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("episode_id", episodeId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    },
    enabled: !!episodeId,
  });

  // Save progress mutation
  const saveMutation = useMutation({
    mutationFn: async (data: EpisodeProgressData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const progressData = {
        user_id: user.id,
        episode_id: data.episode_id,
        product_id: data.product_id,
        last_position_seconds: data.last_position_seconds || 0,
        watch_time_seconds: data.watch_time_seconds || 0,
        completed: data.completed || false,
        last_watched_at: new Date().toISOString(),
      };

      if (progress?.id) {
        // Update existing progress
        const { error } = await supabase
          .from("user_progress")
          .update(progressData)
          .eq("id", progress.id);

        if (error) throw error;
      } else {
        // Insert new progress
        const { error } = await supabase
          .from("user_progress")
          .insert(progressData);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episode-progress", episodeId] });
    },
    onError: (error: any) => {
      console.error("Error saving progress:", error);
    },
  });

  // Save progress with debounce
  const saveProgress = (currentTime: number, duration: number) => {
    const now = Date.now();
    
    // Save every 5 seconds
    if (now - lastSaved < 5000) return;

    setLastSaved(now);

    const watchTime = (progress?.watch_time_seconds || 0) + 5;
    const completed = currentTime >= duration * 0.9; // 90% watched = completed

    saveMutation.mutate({
      episode_id: episodeId,
      product_id: productId,
      last_position_seconds: Math.floor(currentTime),
      watch_time_seconds: watchTime,
      completed,
    });
  };

  // Mark as completed
  const markCompleted = () => {
    saveMutation.mutate({
      episode_id: episodeId,
      product_id: productId,
      completed: true,
    });
  };

  return {
    progress,
    isLoading,
    saveProgress,
    markCompleted,
    isSaving: saveMutation.isPending,
  };
};
