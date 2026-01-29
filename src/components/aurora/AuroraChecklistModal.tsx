import { useState } from 'react';
import { Plus, ListChecks } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useChecklists } from '@/hooks/aurora/useChecklists';
import AuroraChecklistCard from './AuroraChecklistCard';

interface AuroraChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuroraChecklistModal = ({ open, onOpenChange }: AuroraChecklistModalProps) => {
  const { t, isRTL } = useTranslation();
  const { checklists, loading, createChecklist } = useChecklists();
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    
    await createChecklist(newTitle.trim());
    setNewTitle('');
    setIsCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewTitle('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md max-h-[85vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            {t('aurora.checklists.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* New Checklist */}
          {isCreating ? (
            <div className="flex gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('aurora.checklists.titlePlaceholder')}
                autoFocus
              />
              <Button size="sm" onClick={handleCreate}>
                {t('aurora.checklists.add')}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-4 w-4" />
              {t('aurora.checklists.new')}
            </Button>
          )}

          {/* Checklists */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('aurora.checklists.loading')}
            </div>
          ) : checklists.length === 0 ? (
            <div className="text-center py-8">
              <ListChecks className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {t('aurora.checklists.empty')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {checklists.map((checklist) => (
                <AuroraChecklistCard
                  key={checklist.id}
                  checklist={checklist}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuroraChecklistModal;
