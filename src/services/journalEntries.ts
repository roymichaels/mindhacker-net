/**
 * Journal Entries CRUD service for Dream, Reflection, and Gratitude journals.
 */
import { supabase } from '@/integrations/supabase/client';

export type JournalType = 'dream' | 'reflection' | 'gratitude';

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

export async function createJournalEntry(input: {
  user_id: string;
  journal_type: JournalType;
  content: string;
  mood?: string;
  tags?: string[];
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
