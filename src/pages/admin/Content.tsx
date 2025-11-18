import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductsList from "@/components/admin/content/ProductsList";
import ProductDialog from "@/components/admin/content/ProductDialog";
import SeriesDialog from "@/components/admin/content/SeriesDialog";
import EpisodeDialog from "@/components/admin/content/EpisodeDialog";

const Content = () => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
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
        <div>
          <h1 className="text-3xl font-black cyber-glow">ניהול תוכן</h1>
          <p className="text-muted-foreground mt-2">
            נהל קורסים, סדרות ופרקים
          </p>
        </div>
        <Button onClick={handleCreateProduct} className="gap-2">
          <Plus className="w-4 h-4" />
          יצירת מוצר חדש
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-6" dir="rtl">
        <TabsList className="grid w-full grid-cols-1 max-w-md">
          <TabsTrigger value="products">מוצרי תוכן</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ProductsList 
            products={products || []} 
            onEdit={handleEditProduct}
          />
        </TabsContent>
      </Tabs>

      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={selectedProduct}
      />
    </div>
  );
};

export default Content;
