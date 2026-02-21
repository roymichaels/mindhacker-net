/**
 * CommunityOrb - Renders another user's personalized orb by fetching their orb_profiles row.
 * Falls back to null if no orb profile exists.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Orb } from '@/components/orb/Orb';
import { DEFAULT_ORB_PROFILE } from '@/hooks/useOrbProfile';
import { VISUAL_DEFAULTS } from '@/components/orb/types';
import type { OrbProfile } from '@/components/orb/types';
import { cn } from '@/lib/utils';

interface CommunityOrbProps {
  userId: string;
  size?: number;
  className?: string;
}

function rowToProfile(row: Record<string, unknown>): OrbProfile {
  return {
    ...DEFAULT_ORB_PROFILE,
    ...VISUAL_DEFAULTS,
    primaryColor: (row.primary_color as string) || DEFAULT_ORB_PROFILE.primaryColor,
    secondaryColors: (row.secondary_colors as string[]) || DEFAULT_ORB_PROFILE.secondaryColors,
    accentColor: (row.accent_color as string) || DEFAULT_ORB_PROFILE.accentColor,
    morphIntensity: (row.morph_intensity as number) ?? DEFAULT_ORB_PROFILE.morphIntensity,
    morphSpeed: (row.morph_speed as number) ?? DEFAULT_ORB_PROFILE.morphSpeed,
    coreIntensity: (row.core_intensity as number) ?? DEFAULT_ORB_PROFILE.coreIntensity,
    layerCount: (row.layer_count as number) ?? DEFAULT_ORB_PROFILE.layerCount,
    particleEnabled: (row.particle_enabled as boolean) ?? DEFAULT_ORB_PROFILE.particleEnabled,
    particleCount: (row.particle_count as number) ?? DEFAULT_ORB_PROFILE.particleCount,
    geometryDetail: (row.geometry_detail as number) ?? DEFAULT_ORB_PROFILE.geometryDetail,
  };
}

export function useCommunityOrbProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['community-orb-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('orb_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error || !data) return null;
      return rowToProfile(data as Record<string, unknown>);
    },
    enabled: !!userId,
    staleTime: 10 * 60_000, // cache 10 min — orb profiles rarely change
  });
}

export default function CommunityOrb({ userId, size = 36, className }: CommunityOrbProps) {
  const { data: profile } = useCommunityOrbProfile(userId);

  if (!profile) return null;

  return (
    <div className={cn('rounded-full overflow-hidden shrink-0', className)} style={{ width: size, height: size }}>
      <Orb
        size={size}
        state="idle"
        profile={profile}
        showGlow={false}
        renderer="css"
      />
    </div>
  );
}
