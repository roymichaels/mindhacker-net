import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BugReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BugReportDialog({ open, onOpenChange }: BugReportDialogProps) {
  const { language } = useTranslation();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('bug_reports').insert({
        title: title.trim(),
        description: description.trim(),
        page_url: window.location.href,
        page_path: window.location.pathname,
        user_id: user?.id || null,
        user_agent: navigator.userAgent,
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
      });
      if (error) throw error;
      toast.success(language === 'he' ? 'הדיווח נשלח בהצלחה' : 'Bug report submitted');
      setTitle('');
      setDescription('');
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error(language === 'he' ? 'שגיאה בשליחת הדיווח' : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'דווח על באג' : 'Report a Bug'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder={language === 'he' ? 'כותרת' : 'Title'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder={language === 'he' ? 'תאר את הבעיה...' : 'Describe the issue...'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || submitting}
            className="w-full"
          >
            {submitting
              ? (language === 'he' ? 'שולח...' : 'Submitting...')
              : (language === 'he' ? 'שלח דיווח' : 'Submit Report')
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
