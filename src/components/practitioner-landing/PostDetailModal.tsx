import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Heart, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { useTranslation } from '@/hooks/useTranslation';

interface CommunityPost {
  id: string;
  content: string;
  title: string | null;
  media_urls: string[] | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string | null;
  user_id: string;
}

interface PostDetailModalProps {
  post: CommunityPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostDetailModal = ({ post, open, onOpenChange }: PostDetailModalProps) => {
  const { language, isRTL } = useTranslation();

  if (!post) return null;

  const hasImages = post.media_urls && post.media_urls.length > 0;
  const dateStr = post.created_at
    ? format(new Date(post.created_at), 'd MMM yyyy', { locale: language === 'he' ? he : enUS })
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Image */}
        {hasImages && (
          <div className="w-full max-h-[60vh] overflow-hidden bg-muted">
            <img
              src={post.media_urls![0]}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {post.title && (
            <h3 className="font-bold text-lg mb-2">{post.title}</h3>
          )}
          <p className="text-sm whitespace-pre-line mb-4">{post.content}</p>

          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" /> {post.likes_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" /> {post.comments_count || 0}
              </span>
            </div>
            <span>{dateStr}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
