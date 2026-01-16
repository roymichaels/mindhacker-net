import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Library } from "lucide-react";
import ProductsList from "@/components/admin/content/ProductsList";
import ProductDialog from "@/components/admin/content/ProductDialog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useTranslation } from "@/hooks/useTranslation";

const Content = () => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { t, isRTL } = useTranslation();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-content-products"],
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
      <AdminPageHeader
        titleKey="admin.contentManagement.title"
        subtitleKey="admin.contentManagement.subtitle"
        icon={Library}
        action={{
          labelKey: "admin.contentManagement.createProduct",
          onClick: handleCreateProduct,
          icon: Plus,
        }}
      />

      <Tabs defaultValue="products" className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <TabsList className="grid w-full grid-cols-1 max-w-md">
          <TabsTrigger value="products">{t('admin.contentManagement.products')}</TabsTrigger>
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
