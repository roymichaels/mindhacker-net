import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import SeriesList from "./SeriesList";
import SeriesDialog from "./SeriesDialog";

interface SeriesManagerProps {
  productId: string;
}

const SeriesManager = ({ productId }: SeriesManagerProps) => {
  const [seriesDialogOpen, setSeriesDialogOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);

  const { data: series, isLoading } = useQuery({
    queryKey: ["admin-series", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_series")
        .select("*")
        .eq("product_id", productId)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleCreateSeries = () => {
    setSelectedSeries(null);
    setSeriesDialogOpen(true);
  };

  const handleEditSeries = (series: any) => {
    setSelectedSeries(series);
    setSeriesDialogOpen(true);
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
        <h2 className="text-2xl font-black">ניהול סדרות</h2>
        <Button onClick={handleCreateSeries} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          סדרה חדשה
        </Button>
      </div>

      <SeriesList 
        series={series || []} 
        onEdit={handleEditSeries}
      />

      <SeriesDialog
        open={seriesDialogOpen}
        onOpenChange={setSeriesDialogOpen}
        series={selectedSeries}
        productId={productId}
      />
    </div>
  );
};

export default SeriesManager;
