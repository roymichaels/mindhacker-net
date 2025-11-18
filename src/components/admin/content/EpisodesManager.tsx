import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import EpisodesList from "./EpisodesList";
import EpisodeDialog from "./EpisodeDialog";

interface EpisodesManagerProps {
  seriesId: string;
  productId: string;
}

const EpisodesManager = ({ seriesId, productId }: EpisodesManagerProps) => {
  const [episodeDialogOpen, setEpisodeDialogOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);

  const { data: episodes, isLoading } = useQuery({
    queryKey: ["admin-episodes", seriesId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_episodes")
        .select("*")
        .eq("series_id", seriesId)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleCreateEpisode = () => {
    setSelectedEpisode(null);
    setEpisodeDialogOpen(true);
  };

  const handleEditEpisode = (episode: any) => {
    setSelectedEpisode(episode);
    setEpisodeDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">ניהול פרקים</h2>
        <Button onClick={handleCreateEpisode} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          פרק חדש
        </Button>
      </div>

      <EpisodesList 
        episodes={episodes || []} 
        onEdit={handleEditEpisode}
      />

      <EpisodeDialog
        open={episodeDialogOpen}
        onOpenChange={setEpisodeDialogOpen}
        episode={selectedEpisode}
        seriesId={seriesId}
        productId={productId}
      />
    </div>
  );
};

export default EpisodesManager;
