/**
 * LEGACY WRAPPER: This hook still reads aurora_checklists via useChecklistsData.
 * TODO: Migrate useChecklistsData to action_items in Phase 2.
 * useMissionsRoadmap has already been migrated to action_items (Phase 1 SSOT).
 */
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useChecklistsData } from './useChecklistsData';
import { toast } from 'sonner';

/**
 * UI-aware wrapper around useChecklistsData.
 * This hook adds toast notifications and translations.
 * Use this in UI components. Use useChecklistsData in other hooks (like useAuroraChat).
 */
export const useChecklists = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const data = useChecklistsData(user);

  const createChecklistWithToast = useCallback(async (title: string, origin: 'manual' | 'aurora' = 'manual') => {
    const result = await data.createChecklist(title, origin);
    if (result) {
      toast.success(t('aurora.checklists.created'));
    } else {
      toast.error(t('aurora.checklists.createError'));
    }
    return result;
  }, [data, t]);

  const deleteChecklistWithToast = useCallback(async (checklistId: string) => {
    const result = await data.deleteChecklist(checklistId);
    if (result) {
      toast.success(t('aurora.checklists.deleted'));
    } else {
      toast.error(t('aurora.checklists.deleteError'));
    }
    return result;
  }, [data, t]);

  const archiveChecklistWithToast = useCallback(async (checklistId: string) => {
    const result = await data.archiveChecklist(checklistId);
    if (result) {
      toast.success(t('aurora.checklists.archived'));
    } else {
      toast.error(t('aurora.checklists.archiveError'));
    }
    return result;
  }, [data, t]);

  const toggleItemWithToast = useCallback(async (itemId: string, isCompleted: boolean) => {
    const result = await data.toggleItem(itemId, isCompleted);
    if (result && isCompleted) {
      toast.success(t('aurora.checklists.itemCompleted'));
    }
    return result;
  }, [data, t]);

  return {
    ...data,
    createChecklist: createChecklistWithToast,
    deleteChecklist: deleteChecklistWithToast,
    archiveChecklist: archiveChecklistWithToast,
    toggleItem: toggleItemWithToast,
  };
};
