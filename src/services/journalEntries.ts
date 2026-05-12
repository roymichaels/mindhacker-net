/**
 * Journal Entries CRUD service for Dream, Reflection, and Gratitude journals.
 */
import { supabase } from '@/integrations/supabase/client';

export type JournalType =
  | 'dream'
  | 'reflection'
  | 'gratitude'
  | 'plan'
  | 'beliefs'
  | 'breakthrough'
  | 'emotion'
  | 'lesson'
  | 'win';

export interface JournalEntry {
  id: string;
  user_id: string;
  journal_type: JournalType;
  content: string;
  mood: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  title?: string | null;
  summary?: string | null;
  source_excerpt?: string | null;
  ai_insight?: string | null;
  source?: 'manual' | 'aion' | null;
  linked_mission_id?: string | null;
}

export async function getJournalEntries(userId: string, type: JournalType, limit = 30): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('journal_type', type)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as unknown as JournalEntry[];
}

export async function getAllJournalEntries(userId: string, limit = 50): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as unknown as JournalEntry[];
}

export async function createJournalEntry(input: {
  user_id: string;
  journal_type: JournalType;
  content: string;
  mood?: string;
  tags?: string[];
  title?: string;
  summary?: string;
  source_excerpt?: string;
  ai_insight?: string;
  source?: 'manual' | 'aion';
  linked_mission_id?: string;
}): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert(input as any)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as JournalEntry;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
