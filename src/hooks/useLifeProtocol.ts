import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface LifeProtocol {
  id: string;
  user_id: string;
  plan_id: string | null;
  start_date: string;
  end_date: string | null;
  wake_time: string;
  sleep_time: string;
  energy_peak_start: string | null;
  energy_peak_end: string | null;
  energy_crash_start: string | null;
  energy_crash_end: string | null;
  training_window_start: string | null;
  training_window_end: string | null;
  work_start: string | null;
  work_end: string | null;
  locked_until: string | null;
  tier: 'free' | 'plus' | 'apex';
  status: 'draft' | 'active_locked' | 'active' | 'paused' | 'completed';
  compliance_avg: number;
  created_at: string;
  updated_at: string;
}

export interface ProtocolBlock {
  id: string;
  protocol_id: string;
  day_index: number;
  start_time: string;
  end_time: string;
  block_type: string;
  title: string;
  description: string | null;
  linked_session_id: string | null;
  linked_action_id: string | null;
  is_completed: boolean;
  completed_at: string | null;
  skipped: boolean;
  created_at: string;
}

export interface ProtocolCompliance {
  id: string;
  protocol_id: string;
  user_id: string;
  log_date: string;
  total_blocks: number;
  completed_blocks: number;
  skipped_blocks: number;
  compliance_pct: number;
  notes: string | null;
  created_at: string;
}

// ── Active Protocol ──
export function useActiveProtocol() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['life-protocol', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('life_protocols')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active_locked', 'active', 'draft'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as LifeProtocol | null;
    },
    enabled: !!user?.id,
  });
}

// ── Protocol Blocks ──
export function useProtocolBlocks(protocolId: string | null, dayIndex?: number) {
  return useQuery({
    queryKey: ['protocol-blocks', protocolId, dayIndex],
    queryFn: async () => {
      if (!protocolId) return [];
      let query = supabase
        .from('protocol_blocks')
        .select('*')
        .eq('protocol_id', protocolId)
        .order('start_time', { ascending: true });

      if (dayIndex !== undefined) {
        query = query.eq('day_index', dayIndex);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProtocolBlock[];
    },
    enabled: !!protocolId,
  });
}

// ── Today's Compliance ──
export function useTodayCompliance(protocolId: string | null) {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['protocol-compliance-today', protocolId, today],
    queryFn: async () => {
      if (!protocolId || !user?.id) return null;
      const { data, error } = await supabase
        .from('protocol_compliance')
        .select('*')
        .eq('protocol_id', protocolId)
        .eq('log_date', today)
        .maybeSingle();
      if (error) throw error;
      return data as ProtocolCompliance | null;
    },
    enabled: !!protocolId && !!user?.id,
  });
}

// ── Complete Block ──
export function useCompleteBlock() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ blockId, protocolId }: { blockId: string; protocolId: string }) => {
      const { error } = await supabase
        .from('protocol_blocks')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', blockId);
      if (error) throw error;
      return { blockId, protocolId };
    },
    onSuccess: ({ protocolId }) => {
      queryClient.invalidateQueries({ queryKey: ['protocol-blocks', protocolId] });
      queryClient.invalidateQueries({ queryKey: ['protocol-compliance-today'] });
      toast({ title: '✓ Block completed' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
    },
  });
}

// ── Skip Block ──
export function useSkipBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blockId, protocolId }: { blockId: string; protocolId: string }) => {
      const { error } = await supabase
        .from('protocol_blocks')
        .update({ skipped: true })
        .eq('id', blockId);
      if (error) throw error;
      return { protocolId };
    },
    onSuccess: ({ protocolId }) => {
      queryClient.invalidateQueries({ queryKey: ['protocol-blocks', protocolId] });
    },
  });
}

// ── Lock Protocol ──
export function useLockProtocol() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (protocolId: string) => {
      const lockedUntil = new Date();
      lockedUntil.setDate(lockedUntil.getDate() + 7);

      const { error } = await supabase
        .from('life_protocols')
        .update({
          status: 'active_locked',
          locked_until: lockedUntil.toISOString(),
        })
        .eq('id', protocolId);
      if (error) throw error;
      return protocolId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-protocol'] });
      toast({ title: '🔒 Protocol locked', description: 'Committed for 7 days.' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
    },
  });
}

// ── Create Protocol ──
export function useCreateProtocol() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      wake_time: string;
      sleep_time: string;
      energy_peak_start?: string;
      energy_peak_end?: string;
      energy_crash_start?: string;
      energy_crash_end?: string;
      training_window_start?: string;
      training_window_end?: string;
      work_start?: string;
      work_end?: string;
      plan_id?: string;
      tier?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('life_protocols')
        .insert({
          user_id: user.id,
          ...params,
        })
        .select()
        .single();
      if (error) throw error;
      return data as LifeProtocol;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-protocol'] });
    },
  });
}

// ── Helpers ──
export function isProtocolLocked(protocol: LifeProtocol | null): boolean {
  if (!protocol) return false;
  if (protocol.status !== 'active_locked') return false;
  if (!protocol.locked_until) return false;
  return new Date(protocol.locked_until) > new Date();
}

export function getBlockTypeColor(type: string): string {
  const colors: Record<string, string> = {
    wake: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    focus: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    training: 'bg-red-500/20 text-red-400 border-red-500/30',
    recovery: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    work: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    reflection: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    combat: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    expansion: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    admin: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    meal: 'bg-green-500/20 text-green-400 border-green-500/30',
    sleep: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    play: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    custom: 'bg-muted text-muted-foreground border-border',
  };
  return colors[type] || colors.custom;
}

export function getBlockTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    wake: '☀️', focus: '🎯', training: '💪', recovery: '🧘',
    work: '💼', reflection: '📝', combat: '⚔️', expansion: '🚀',
    admin: '📋', meal: '🍽️', sleep: '🌙', play: '🎮', custom: '⚙️',
  };
  return icons[type] || '⚙️';
}

export function formatTimeShort(time: string): string {
  const [h, m] = time.split(':');
  return `${h}:${m}`;
}
