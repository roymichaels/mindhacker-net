/**
 * useUserAvatarData — loads saved avatar customization from the database.
 */
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AvatarCustomizationData = Record<string, { assetId?: string | null; color?: string }>;

export function useUserAvatarData() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['avatar-customization', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data: row } = await supabase
        .from('avatar_customizations' as any)
        .select('customization_data')
        .eq('user_id', user.id)
        .single();
      return (row as any)?.customization_data as AvatarCustomizationData | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const hasAvatar = !!data && Object.keys(data).length > 0;
  const skinColor = data?.Head?.color;

  return { avatarData: data ?? null, isLoading, hasAvatar, skinColor };
}
