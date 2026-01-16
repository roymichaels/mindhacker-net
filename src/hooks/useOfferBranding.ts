import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getOfferColors, ProductColorClasses } from "@/lib/productColors";

export interface Offer {
  id: string;
  slug: string;
  product_id: string | null;
  title: string;
  title_en: string | null;
  subtitle: string | null;
  subtitle_en: string | null;
  description: string | null;
  description_en: string | null;
  badge_text: string | null;
  badge_text_en: string | null;
  hero_heading: string | null;
  hero_heading_en: string | null;
  hero_subheading: string | null;
  hero_subheading_en: string | null;
  price: number;
  price_usd: number | null;
  original_price: number | null;
  original_price_usd: number | null;
  brand_color: string | null;
  pain_points: any[];
  process_steps: any[];
  benefits: any[];
  faqs: any[];
  includes: any[];
  seo_title: string | null;
  seo_title_en: string | null;
  seo_description: string | null;
  seo_description_en: string | null;
  landing_page_route: string | null;
  landing_page_enabled: boolean;
  show_on_homepage: boolean;
  homepage_order: number;
  is_free: boolean;
  cta_type: string;
  cta_text: string | null;
  cta_text_en: string | null;
  cta_link: string | null;
  form_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UseOfferBrandingResult {
  colors: ProductColorClasses;
  offer: Offer | null;
  isLoading: boolean;
  error: Error | null;
}

// Hook for fetching a single offer by slug with its colors
export const useOfferBranding = (offerSlug: string): UseOfferBrandingResult => {
  const { data: offer, isLoading, error } = useQuery({
    queryKey: ['offer-branding', offerSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('slug', offerSlug)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching offer branding:', error);
        throw error;
      }
      return data as Offer | null;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!offerSlug,
  });

  const colors = getOfferColors(offer?.brand_color);

  return { colors, offer, isLoading, error: error as Error | null };
};

// Hook for fetching all active offers (for HeroSection and homepage)
export const useHomepageOffers = () => {
  return useQuery({
    queryKey: ['homepage-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('status', 'active')
        .eq('show_on_homepage', true)
        .order('homepage_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching homepage offers:', error);
        return [];
      }
      return data as Offer[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Hook for fetching all offers (for admin panel)
export const useAllOffers = () => {
  return useQuery({
    queryKey: ['all-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('homepage_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching all offers:', error);
        return [];
      }
      return data as Offer[];
    },
    staleTime: 60 * 1000, // Cache for 1 minute
  });
};
