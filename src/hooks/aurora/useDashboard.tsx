import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { QUERY_KEYS } from '@/lib/queryKeys';
import { debug } from '@/lib/debug';

interface IdentityElement {
  id: string;
  user_id: string;
  element_type: 'value' | 'principle' | 'self_concept' | 'vision_statement' | 'character_trait' | 'identity_title' | 'ai_archetype' | 'role_model';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface LifeVision {
  id: string;
  user_id: string;
  timeframe: '5_year' | '10_year';
  title: string;
  description: string | null;
  focus_areas: string[];
  created_at: string;
}

interface Commitment {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
}

export const useDashboard = () => {
  const { user } = useAuth();

  // Identity Elements
  const { data: identityElements = [], refetch: refetchIdentity } = useQuery({
    queryKey: QUERY_KEYS.aurora.identityElements(user?.id ?? ''),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('aurora_identity_elements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        debug.warn('[useDashboard] Identity elements fetch error:', error);
        throw error;
      }
      return data as IdentityElement[];
    },
    enabled: !!user?.id,
  });

  // Life Visions
  const { data: lifeVisions = [], refetch: refetchVisions } = useQuery({
    queryKey: QUERY_KEYS.aurora.lifeVisions(user?.id ?? ''),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('aurora_life_visions')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        debug.warn('[useDashboard] Life visions fetch error:', error);
        throw error;
      }
      return data as LifeVision[];
    },
    enabled: !!user?.id,
  });

  // Commitments
  const { data: commitments = [], refetch: refetchCommitments } = useQuery({
    queryKey: QUERY_KEYS.aurora.commitments(user?.id ?? ''),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('aurora_commitments')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        debug.warn('[useDashboard] Commitments fetch error:', error);
        throw error;
      }
      return data as Commitment[];
    },
    enabled: !!user?.id,
  });

  // Computed values
  const values = identityElements.filter((e) => e.element_type === 'value');
  const principles = identityElements.filter((e) => e.element_type === 'principle');
  const selfConcepts = identityElements.filter((e) => e.element_type === 'self_concept');
  const visionStatements = identityElements.filter((e) => e.element_type === 'vision_statement');
  const characterTraits = identityElements.filter((e) => e.element_type === 'character_trait');
  const identityTitleElement = identityElements.find((e) => e.element_type === 'identity_title');
  const identityTitle = identityTitleElement ? {
    title: identityTitleElement.content,
    titleEn: (identityTitleElement.metadata as Record<string, unknown>)?.title_en as string || identityTitleElement.content,
    icon: (identityTitleElement.metadata as Record<string, unknown>)?.icon as string || '🎯',
  } : null;

  const fiveYearVision = lifeVisions.find((v) => v.timeframe === '5_year') || null;
  const tenYearVision = lifeVisions.find((v) => v.timeframe === '10_year') || null;

  const activeCommitments = commitments.filter((c) => c.status === 'active');
  const completedCommitments = commitments.filter((c) => c.status === 'completed');

  // Realtime subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const channels = [
      supabase
        .channel('aurora-identity-elements-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'aurora_identity_elements', filter: `user_id=eq.${user.id}` }, () => refetchIdentity())
        .subscribe(),
      supabase
        .channel('aurora-life-visions-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'aurora_life_visions', filter: `user_id=eq.${user.id}` }, () => refetchVisions())
        .subscribe(),
      supabase
        .channel('aurora-commitments-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'aurora_commitments', filter: `user_id=eq.${user.id}` }, () => refetchCommitments())
        .subscribe(),
    ];

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [user?.id, refetchIdentity, refetchVisions, refetchCommitments]);

  return {
    // Raw data
    identityElements,
    lifeVisions,
    commitments,
    
    // Computed
    values,
    principles,
    selfConcepts,
    visionStatements,
    characterTraits,
    identityTitle,
    fiveYearVision,
    tenYearVision,
    activeCommitments,
    completedCommitments,
  };
};
