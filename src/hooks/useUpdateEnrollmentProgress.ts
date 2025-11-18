import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUpdateEnrollmentProgress = (productId: string) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id || !productId) return;

    const updateProgress = async () => {
      try {
        // Get all episodes for this product
        const { data: episodes } = await supabase
          .from("content_episodes")
          .select("id")
          .eq("product_id", productId);

        if (!episodes) return;

        const totalEpisodes = episodes.length;

        // Get user progress for this product
        const { data: progress } = await supabase
          .from("user_progress")
          .select("*")
          .eq("product_id", productId)
          .eq("user_id", user.id);

        if (!progress) return;

        const completedEpisodes = progress.filter(p => p.completed).length;
        const progressPercentage = totalEpisodes > 0 
          ? Math.round((completedEpisodes / totalEpisodes) * 100) 
          : 0;
        const isCompleted = completedEpisodes === totalEpisodes && totalEpisodes > 0;

        // Update enrollment
        await supabase
          .from("course_enrollments")
          .update({
            total_episodes: totalEpisodes,
            completed_episodes: completedEpisodes,
            progress_percentage: progressPercentage,
            is_completed: isCompleted,
            last_accessed_at: new Date().toISOString(),
            ...(isCompleted && { completed_at: new Date().toISOString() }),
          })
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } catch (error) {
        console.error("Error updating enrollment progress:", error);
      }
    };

    // Update progress initially
    updateProgress();

    // Subscribe to progress changes
    const channel = supabase
      .channel(`progress_${productId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_progress",
          filter: `product_id=eq.${productId}`,
        },
        () => {
          updateProgress();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, productId]);
};
