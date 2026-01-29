import { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Image, X, Loader2, ChevronDown } from 'lucide-react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [content, setContent] = useState(editPost?.content || '');
  const [categoryId, setCategoryId] = useState(editPost?.category_id || '');
  const [mediaUrls, setMediaUrls] = useState<string[]>(editPost?.media_urls || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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

  const { data: member } = useQuery({
    queryKey: ['community-member', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('community_members')
        .select('avatar_url')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const selectedCategory = categories?.find(c => c.id === categoryId);

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!content.trim()) throw new Error('Content is required');

      const postData = {
        user_id: user.id,
        title: null,
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
      setContent('');
      setCategoryId('');
      setMediaUrls([]);
      setIsFocused(false);
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

  const isExpanded = isFocused || content.length > 0 || mediaUrls.length > 0 || !!editPost;

  return (
    <div className={cn(
      "border-b bg-background px-4 py-3",
      editPost && "border rounded-lg mb-4"
    )}>
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={member?.avatar_url || ''} />
          <AvatarFallback className="text-sm">
            {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <Textarea
            ref={textareaRef}
            placeholder={t('community.postContentPlaceholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className={cn(
              "border-0 resize-none p-0 shadow-none focus-visible:ring-0 bg-transparent",
              "placeholder:text-muted-foreground/60",
              isExpanded ? "min-h-[80px]" : "min-h-[40px]",
              isRTL && "text-right"
            )}
          />

          {/* Image Preview */}
          {mediaUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt="" 
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions Row */}
          {isExpanded && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-1">
                {/* Category Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs gap-1"
                    >
                      {selectedCategory ? (
                        <span style={{ color: selectedCategory.color || undefined }}>
                          {isRTL ? selectedCategory.name : selectedCategory.name_en || selectedCategory.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{t('community.selectCategory')}</span>
                      )}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1" align="start">
                    <div className="space-y-0.5">
                      {categories?.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCategoryId(cat.id)}
                          className={cn(
                            "w-full text-start px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors",
                            categoryId === cat.id && "bg-muted"
                          )}
                        >
                          <span style={{ color: cat.color || undefined }}>
                            {isRTL ? cat.name : cat.name_en || cat.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Image Upload */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild disabled={isUploading}>
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
                  <Button variant="ghost" size="sm" onClick={onCancel} className="h-8">
                    {t('common.cancel')}
                  </Button>
                )}
                <Button 
                  size="sm"
                  className="h-8 px-4"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
