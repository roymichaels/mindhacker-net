import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getProductColors, ProductColorClasses } from "@/lib/productColors";

interface ProductBranding {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  brand_color: string | null;
}

interface UseProductBrandingResult {
  colors: ProductColorClasses;
  product: ProductBranding | null;
  isLoading: boolean;
}

export const useProductBranding = (productSlug: string): UseProductBrandingResult => {
  const { data: product, isLoading } = useQuery({
    queryKey: ['product-branding', productSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, slug, title, title_en, brand_color')
        .eq('slug', productSlug)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching product branding:', error);
        return null;
      }
      return data as ProductBranding | null;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const colors = getProductColors(product?.brand_color);

  return { colors, product, isLoading };
};

// Hook for fetching all products with their colors (for HeroSection)
export const useProductsColors = () => {
  return useQuery({
    queryKey: ['products-colors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, slug, title, title_en, brand_color')
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching products colors:', error);
        return [];
      }
      return data as ProductBranding[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
