import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Image, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PostEditorProps {
  onSuccess?: () => void;
  editPost?: {
    id: string;
    title: string | null;
    content: string;
    category_id: string | null;
    media_urls: string[] | null;
  };
  onCancel?: () => void;
}

const PostEditor = ({ onSuccess, editPost, onCancel }: PostEditorProps) => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(editPost?.title || '');
  const [content, setContent] = useState(editPost?.content || '');
  const [categoryId, setCategoryId] = useState(editPost?.category_id || '');
  const [mediaUrls, setMediaUrls] = useState<string[]>(editPost?.media_urls || []);
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['community-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!content.trim()) throw new Error('Content is required');

      const postData = {
        user_id: user.id,
        title: title.trim() || null,
        content: content.trim(),
        category_id: categoryId || null,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
      };

      if (editPost) {
        const { error } = await supabase
          .from('community_posts')
          .update({ ...postData, is_edited: true, edited_at: new Date().toISOString() })
          .eq('id', editPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_posts')
          .insert(postData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editPost ? t('community.postUpdated') : t('community.postCreated'));
      setTitle('');
      setContent('');
      setCategoryId('');
      setMediaUrls([]);
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user?.id) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('community-media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('community-media')
          .getPublicUrl(fileName);

        newUrls.push(urlData.publicUrl);
      }

      setMediaUrls([...mediaUrls, ...newUrls]);
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  if (!user) return null;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <Input
              placeholder={t('community.postTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(isRTL && "text-right")}
            />
            
            <Textarea
              placeholder={t('community.postContentPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={cn("min-h-[100px] resize-none", isRTL && "text-right")}
            />

            {/* Image Preview */}
            {mediaUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt="" 
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex flex-wrap gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('community.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {isRTL ? cat.name : cat.name_en || cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            <Button variant="ghost" size="icon" asChild disabled={isUploading}>
              <span>
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Image className="h-4 w-4" />
                )}
              </span>
            </Button>
          </label>
        </div>
        
        <div className="flex gap-2">
          {editPost && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          )}
          <Button 
            onClick={() => createPostMutation.mutate()}
            disabled={!content.trim() || createPostMutation.isPending}
          >
            {createPostMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editPost ? (
              t('common.save')
            ) : (
              t('community.publish')
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostEditor;
