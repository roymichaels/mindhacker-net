/**
 * Hook to manage business branding data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BusinessBranding {
  id: string;
  business_id: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_heading: string | null;
  font_body: string | null;
  brand_voice: string | null;
  tone_keywords: string[];
  tagline: string | null;
  mission_statement: string | null;
  vision_statement: string | null;
  core_values: string[];
  brand_story: string | null;
  target_emotions: string[];
  created_at: string;
  updated_at: string;
}

export type BrandingUpdateData = Partial<Omit<BusinessBranding, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;

export function useBusinessBranding(businessId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch branding data
  const { data: branding, isLoading } = useQuery({
    queryKey: ['business-branding', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('business_branding')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as BusinessBranding | null;
    },
    enabled: !!businessId && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Create or update branding
  const saveBrandingMutation = useMutation({
    mutationFn: async (brandingData: BrandingUpdateData) => {
      if (!businessId) throw new Error('Missing business ID');
      
      const { error } = await supabase
        .from('business_branding')
        .upsert({
          business_id: businessId,
          ...brandingData,
        }, { onConflict: 'business_id' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-branding', businessId] });
    },
  });

  // Upload logo
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!businessId || !user?.id) throw new Error('Missing IDs');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessId}-logo.${fileExt}`;
      const filePath = `business-logos/${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('business-assets')
        .getPublicUrl(filePath);
      
      // Update branding with logo URL
      await saveBrandingMutation.mutateAsync({ logo_url: publicUrl });
      
      return publicUrl;
    },
  });

  return {
    branding,
    isLoading,
    saveBranding: saveBrandingMutation.mutate,
    isSaving: saveBrandingMutation.isPending,
    uploadLogo: uploadLogoMutation.mutate,
    isUploadingLogo: uploadLogoMutation.isPending,
  };
}
