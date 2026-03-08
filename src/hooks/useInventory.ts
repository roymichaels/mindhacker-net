/**
 * useInventory — Fetches user's loot inventory joined with catalog details.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InventoryItem {
  loot_id: string;
  qty: number;
  name: string;
  type: string;
  rarity: string;
  icon_url: string | null;
  effects: Record<string, unknown>;
  updated_at: string | null;
}

export function useInventory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inventory', user?.id],
    queryFn: async (): Promise<InventoryItem[]> => {
      const { data, error } = await supabase
        .from('user_inventory')
        .select('loot_id, qty, updated_at, loot_catalog(name, type, rarity, icon_url, effects)')
        .eq('user_id', user!.id)
        .gt('qty', 0);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        loot_id: row.loot_id,
        qty: row.qty,
        updated_at: row.updated_at,
        name: row.loot_catalog?.name ?? row.loot_id,
        type: row.loot_catalog?.type ?? 'unknown',
        rarity: row.loot_catalog?.rarity ?? 'common',
        icon_url: row.loot_catalog?.icon_url ?? null,
        effects: row.loot_catalog?.effects ?? {},
      }));
    },
    enabled: !!user?.id,
  });
}
