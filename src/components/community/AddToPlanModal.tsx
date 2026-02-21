/**
 * AddToPlanModal - Lets user add a community thread insight to their plan.
 * Maps pillar to action type: combat→drill, focus→habit, wealth→task, etc.
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ThreadData } from './ThreadCard';

interface AddToPlanModalProps {
  thread: ThreadData | null;
  open: boolean;
  onClose: () => void;
}

function getActionType(pillar: string | null): string {
  switch (pillar) {
    case 'combat': return 'task'; // drill
    case 'focus': return 'habit';
    case 'vitality': return 'habit';
    case 'power': return 'task';
    default: return 'task';
  }
}

export default function AddToPlanModal({ thread, open, onClose }: AddToPlanModalProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!user?.id || !thread || !title.trim()) return;
    setSubmitting(true);

    try {
      const actionType = getActionType(thread.pillar);
      
      const { error } = await supabase.from('action_items').insert({
        user_id: user.id,
        type: actionType,
        source: 'user',
        title: title.trim(),
        description: `${isHe ? 'מתוך שרשור קהילה' : 'From community thread'}: ${thread.title || thread.content.slice(0, 50)}`,
        pillar: thread.pillar,
        status: 'todo',
        metadata: { community_thread_id: thread.id },
      });

      if (error) throw error;

      toast.success(isHe ? 'נוסף לתוכנית!' : 'Added to plan!');
      queryClient.invalidateQueries({ queryKey: ['unified-dashboard'] });
      setTitle('');
      onClose();
    } catch (err) {
      toast.error(isHe ? 'שגיאה' : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isHe ? '➕ הוסף תובנה לתוכנית' : '➕ Add Insight to Plan'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {thread && (
            <div className="rounded-lg bg-muted/30 border border-border/30 p-2.5">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {thread.title || thread.content.slice(0, 80)}
              </p>
            </div>
          )}
          <div>
            <Label className="text-sm mb-1 block">
              {isHe ? 'כותרת הפעולה' : 'Action Title'}
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isHe ? 'מה לעשות עם התובנה הזו?' : 'What to do with this insight?'}
              dir={isHe ? 'rtl' : 'ltr'}
            />
          </div>
          <Button className="w-full" disabled={!title.trim() || submitting} onClick={handleAdd}>
            {submitting ? '...' : (isHe ? 'הוסף' : 'Add')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
