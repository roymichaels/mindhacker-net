import { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useChecklists } from '@/hooks/aurora/useChecklists';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  checklist_id: string;
  content: string;
  is_completed: boolean;
  order_index: number;
  created_at: string;
}

interface AuroraChecklistItemProps {
  item: ChecklistItem;
}

const AuroraChecklistItem = ({ item }: AuroraChecklistItemProps) => {
  const { toggleItem, deleteItem, updateItemContent } = useChecklists();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);

  const handleSave = async () => {
    if (editContent.trim() && editContent !== item.content) {
      await updateItemContent(item.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditContent(item.content);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      <Checkbox
        checked={item.is_completed}
        onCheckedChange={(checked) => toggleItem(item.id, !!checked)}
        className="shrink-0"
      />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <Input
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm"
            autoFocus
          />
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSave}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(false)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <span className={cn(
            "flex-1 text-sm",
            item.is_completed && "line-through text-muted-foreground"
          )}>
            {item.content}
          </span>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-destructive" 
              onClick={() => deleteItem(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AuroraChecklistItem;
