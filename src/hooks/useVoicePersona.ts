import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getPersonaById, DEFAULT_PERSONA, type VoicePersonaId } from '@/lib/voicePersonas';

export function useVoicePersona() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: personaId } = useQuery({
    queryKey: ['voice-persona', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('aurora_preferences')
        .eq('id', user.id)
        .single();
      const prefs = data?.aurora_preferences as Record<string, unknown> | null;
      return (prefs?.voice_persona as string) || null;
    },
    enabled: !!user?.id,
  });

  const persona = getPersonaById(personaId || null);

  const setPersona = useMutation({
    mutationFn: async (newPersonaId: VoicePersonaId) => {
      if (!user?.id) throw new Error('Not authenticated');
      // Merge into aurora_preferences JSON
      const { data: current } = await supabase
        .from('profiles')
        .select('aurora_preferences')
        .eq('id', user.id)
        .single();
      
      const existing = (current?.aurora_preferences as Record<string, unknown>) || {};
      const { error } = await supabase
        .from('profiles')
        .update({
          aurora_preferences: { ...existing, voice_persona: newPersonaId },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['voice-persona'] });
    },
  });

  return { persona, setPersona, isDefault: !personaId };
}
