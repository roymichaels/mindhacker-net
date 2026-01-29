import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name: string | null;
}

interface NewMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewMessageDialog = ({ open, onOpenChange }: NewMessageDialogProps) => {
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all profiles except current user
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['all-profiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .neq('id', user.id)
        .order('full_name');
      
      if (error) throw error;
      return data as Profile[];
    },
    enabled: open && !!user?.id,
  });

  // Filter profiles by search
  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create or get existing conversation
  const createConversation = useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user?.id) throw new Error('No user');
      
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'direct')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
        .single();
      
      if (existing) {
        return existing.id;
      }
      
      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          participant_1: user.id,
          participant_2: otherUserId,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    },
    onSuccess: (conversationId) => {
      onOpenChange(false);
      navigate(`/messages/${conversationId}`);
    },
    onError: () => {
      toast.error(t('messages.errorCreatingConversation'));
    },
  });

  const handleSelectUser = (profile: Profile) => {
    createConversation.mutate(profile.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {t('messages.newMessage')}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
            isRTL ? "right-3" : "left-3"
          )} />
          <Input
            placeholder={t('messages.searchUsers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("h-10", isRTL ? "pr-10" : "pl-10")}
            autoFocus
          />
        </div>

        {/* User List */}
        <div className="max-h-[300px] overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchQuery ? t('messages.noUsersFound') : t('messages.noUsersAvailable')}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSelectUser(profile)}
                  disabled={createConversation.isPending}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-right disabled:opacity-50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium flex-1 truncate">
                    {profile.full_name || t('messages.unknownUser')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageDialog;
