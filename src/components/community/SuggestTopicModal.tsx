/**
 * SuggestTopicModal - Lets community members suggest new topics for a pillar.
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getDomainById } from '@/navigation/lifeDomains';
import { MessageSquarePlus } from 'lucide-react';

interface SuggestTopicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pillar: string;
}

export default function SuggestTopicModal({ open, onOpenChange, pillar }: SuggestTopicModalProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const domain = getDomainById(pillar);
  const pillarLabel = domain ? (isHe ? domain.labelHe : domain.labelEn) : pillar;

  const handleSubmit = async () => {
    if (!user || !title.trim()) return;
    setSubmitting(true);

    try {
      // Post as a special "topic_suggestion" thread in community_posts
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        title: `[${isHe ? 'הצעת נושא' : 'Topic Suggestion'}] ${title.trim()}`,
        content: reason.trim() || (isHe ? 'הצעה לנושא חדש' : 'New topic suggestion'),
        pillar,
        status: 'pending',
      });

      if (error) throw error;
      toast.success(isHe ? 'ההצעה נשלחה! Aurora תבדוק אותה.' : 'Suggestion sent! Aurora will review it.');
      setTitle('');
      setReason('');
      onOpenChange(false);
    } catch {
      toast.error(isHe ? 'שגיאה בשליחה' : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            {isHe ? 'בקש נושא חדש' : 'Suggest a Topic'}
          </DialogTitle>
          <DialogDescription>
            {isHe
              ? `הצע נושא חדש לקהילת ${pillarLabel}. Aurora תבדוק ותאשר.`
              : `Suggest a new topic for ${pillarLabel} community. Aurora will review.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <Input
            placeholder={isHe ? 'שם הנושא' : 'Topic name'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <Textarea
            placeholder={isHe ? 'למה הנושא הזה חשוב? (אופציונלי)' : 'Why is this topic important? (optional)'}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {isHe ? 'ביטול' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || submitting}>
            {submitting
              ? (isHe ? 'שולח...' : 'Sending...')
              : (isHe ? 'שלח הצעה' : 'Submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
