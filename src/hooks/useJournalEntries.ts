import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getJournalEntries, createJournalEntry, deleteJournalEntry, type JournalType } from '@/services/journalEntries';

export function useJournalEntries(type: JournalType) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['journal-entries', type, user?.id],
    queryFn: () => getJournalEntries(user!.id, type),
    enabled: !!user?.id,
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: { journal_type: JournalType; content: string; mood?: string; tags?: string[] }) =>
      createJournalEntry({ ...input, user_id: user!.id }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['journal-entries', vars.journal_type] });
    },
  });
}

export function useDeleteJournalEntry(type: JournalType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal-entries', type] });
    },
  });
}
