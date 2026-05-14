/**
 * Avatar / Identity bootstrap — read-only (Phase 2 · Batch 2).
 *
 * - getAvatarConfig: latest avatar customisation row (if any)
 * - identityBootstrapStatus: which onboarding/identity rows already exist
 */
import { supabase } from '@/integrations/supabase/client';

export interface AvatarConfigSummary {
  hasCustomization: boolean;
  data: Record<string, unknown> | null;
  text: string;
}

export async function getAvatarConfig(userId: string): Promise<AvatarConfigSummary> {
  if (!userId) return { hasCustomization: false, data: null, text: 'אין משתמש.' };
  const { data } = await supabase
    .from('avatar_customizations')
    .select('customization_data')
    .eq('user_id', userId)
    .maybeSingle();
  const has = !!data?.customization_data;
  return {
    hasCustomization: has,
    data: (data?.customization_data as Record<string, unknown> | undefined) ?? null,
    text: has ? 'יש לך אווטאר מותאם.' : 'עוד לא הגדרת אווטאר. אפשר לפתוח את ה־Configurator.',
  };
}

export interface IdentityBootstrapStatus {
  hasProfile: boolean;
  hasIdentityElements: boolean;
  hasAvatar: boolean;
  text: string;
}

export async function identityBootstrapStatus(userId: string): Promise<IdentityBootstrapStatus> {
  if (!userId) return { hasProfile: false, hasIdentityElements: false, hasAvatar: false, text: 'אין משתמש.' };
  const [{ data: profile }, { count: idCount }, avatar] = await Promise.all([
    supabase.from('profiles').select('id, full_name').eq('id', userId).maybeSingle(),
    supabase.from('aurora_identity_elements').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    getAvatarConfig(userId),
  ]);
  const hasProfile = !!profile?.full_name;
  const hasIdentity = (idCount ?? 0) > 0;
  const text = `זהות · פרופיל: ${hasProfile ? 'מוכן' : 'חסר'} · DNA: ${hasIdentity ? 'מוכן' : 'חסר'} · אווטאר: ${avatar.hasCustomization ? 'מוכן' : 'חסר'}`;
  return {
    hasProfile,
    hasIdentityElements: hasIdentity,
    hasAvatar: avatar.hasCustomization,
    text,
  };
}