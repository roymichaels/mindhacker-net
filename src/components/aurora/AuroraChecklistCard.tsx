import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Archive, Edit2, Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useTranslation } from '@/hooks/useTranslation';
import { useChecklists } from '@/hooks/aurora/useChecklists';
import AuroraChecklistItem from './AuroraChecklistItem';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  checklist_id: string;
  content: string;
  is_completed: boolean;
  order_index: number;
  created_at: string;
}

interface Checklist {
  id: string;
  user_id: string;
  title: string;
  origin: 'manual' | 'aurora';
  context: string | null;
  status: 'active' | 'archived';
  created_at: string;
  aurora_checklist_items?: ChecklistItem[];
}

interface AuroraChecklistCardProps {
  checklist: Checklist;
}

const AuroraChecklistCard = ({ checklist }: AuroraChecklistCardProps) => {
  const { t } = useTranslation();
  const { addChecklistItem, deleteChecklist, archiveChecklist, updateChecklistTitle } = useChecklists();
  
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(checklist.title);
  const [newItemContent, setNewItemContent] = useState('');
  const [showNewItem, setShowNewItem] = useState(false);

  const items = checklist.aurora_checklist_items || [];
  const completedCount = items.filter((i) => i.is_completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle !== checklist.title) {
      await updateChecklistTitle(checklist.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleAddItem = async () => {
    if (!newItemContent.trim()) return;
    await addChecklistItem(checklist.id, newItemContent.trim());
    setNewItemContent('');
    setShowNewItem(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'title' | 'item') => {
    if (e.key === 'Enter') {
      if (action === 'title') handleSaveTitle();
      else handleAddItem();
    } else if (e.key === 'Escape') {
      if (action === 'title') {
        setEditTitle(checklist.title);
        setIsEditing(false);
      } else {
        setNewItemContent('');
        setShowNewItem(false);
      }
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 group">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>

          {/* Title */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'title')}
                  className="h-7 text-sm"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSaveTitle}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{checklist.title}</span>
                {checklist.origin === 'aurora' && (
                  <Badge variant="outline" className="shrink-0 gap-1 text-xs py-0">
                    <Sparkles className="h-3 w-3" />
                    Aurora
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Progress */}
          <span className="text-xs text-muted-foreground shrink-0">
            {completedCount}/{totalCount}
          </span>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => archiveChecklist(checklist.id)}>
              <Archive className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteChecklist(checklist.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <Progress value={progress} className="h-1 rounded-none" />
        )}

        {/* Content */}
        <CollapsibleContent>
          <div className="p-3 space-y-2">
            {/* Items */}
            {items
              .sort((a, b) => a.order_index - b.order_index)
              .map((item) => (
                <AuroraChecklistItem key={item.id} item={item} />
              ))}

            {/* New Item */}
            {showNewItem ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'item')}
                  placeholder={t('aurora.checklists.itemPlaceholder')}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddItem}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNewItem(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground"
                onClick={() => setShowNewItem(true)}
              >
                <Plus className="h-4 w-4" />
                {t('aurora.checklists.addItem')}
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default AuroraChecklistCard;
