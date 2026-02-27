/**
 * MapleStory Mode — Services layer
 * Queries and mutations for the RPG quest system.
 * Uses action_items as SSOT for quests (source='maple').
 */
import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────
export interface MapleQuest {
  id: string;
  title: string;
  description: string | null;
  status: string;
  pillar: string | null;
  xp_reward: number;
  scheduled_date: string | null;
  metadata: {
    quest_type: 'daily' | 'boss' | 'weekly' | 'chain' | 'event';
    difficulty: number;
    zone: string;
    loot_table: string;
    is_boss: boolean;
    [key: string]: any;
  };
  completed_at: string | null;
  created_at: string;
}

export interface UserBuild {
  id: string;
  user_id: string;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  build_data: {
    name: string;
    theme: string;
    buffs: Array<{ name: string; description: string }>;
    weakness: { name: string; description: string };
    skill_multipliers: Record<string, number>;
    zone_focus: string[];
    quest_seed: string;
  };
  created_at: string;
}

export interface LootEvent {
  id: string;
  user_id: string;
  action_item_id: string | null;
  loot_id: string;
  rarity: string;
  reason: string;
  created_at: string;
}

export interface LootItem {
  loot_id: string;
  name: string;
  rarity: string;
  type: string;
  effects: Record<string, any>;
  icon_url: string | null;
}

export interface InventoryItem {
  user_id: string;
  loot_id: string;
  qty: number;
  updated_at: string;
}

// ─── Queries ──────────────────────────────────────────────

export async function getTodayQuests(userId: string, date?: string): Promise<MapleQuest[]> {
  const today = date || new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .eq('user_id', userId)
    .eq('source', 'maple')
    .eq('scheduled_date', today)
    .order('order_index');
  if (error) throw error;
  return (data || []) as unknown as MapleQuest[];
}

export async function getActiveBuild(userId: string): Promise<UserBuild | null> {
  const { data, error } = await supabase
    .from('user_builds')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as UserBuild | null;
}

export async function getRecentLoot(userId: string, limit = 10): Promise<LootEvent[]> {
  const { data, error } = await supabase
    .from('loot_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as unknown as LootEvent[];
}

export async function getLootCatalog(): Promise<LootItem[]> {
  const { data, error } = await supabase
    .from('loot_catalog')
    .select('*')
    .order('rarity');
  if (error) throw error;
  return (data || []) as unknown as LootItem[];
}

export async function getUserInventory(userId: string): Promise<(InventoryItem & { loot: LootItem })[]> {
  const { data, error } = await supabase
    .from('user_inventory')
    .select('*, loot_catalog(*)')
    .eq('user_id', userId)
    .gt('qty', 0);
  if (error) throw error;
  return (data || []).map((item: any) => ({
    ...item,
    loot: item.loot_catalog,
  })) as (InventoryItem & { loot: LootItem })[];
}

// ─── Mutations ────────────────────────────────────────────

export async function generateDailyQuests(userId: string, language = 'he') {
  const { data, error } = await supabase.functions.invoke('generate-daily-quests', {
    body: { user_id: userId, language },
  });
  if (error) throw error;
  return data;
}

export async function generateWeeklyBuild(userId: string, language = 'he') {
  const { data, error } = await supabase.functions.invoke('generate-weekly-build', {
    body: { user_id: userId, language },
  });
  if (error) throw error;
  return data;
}

export async function completeQuest(questId: string) {
  const { data, error } = await supabase
    .from('action_items')
    .update({ status: 'done' as any })
    .eq('id', questId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
