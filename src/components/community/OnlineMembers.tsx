import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Circle } from 'lucide-react';

interface OnlineMember {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
}

const OnlineMembers = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel('online-community-members', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const members: OnlineMember[] = [];
        
        Object.values(state).forEach((presences: any[]) => {
          presences.forEach((presence) => {
            if (presence.user_id !== user.id) {
              members.push({
                user_id: presence.user_id,
                full_name: presence.full_name,
                avatar_url: presence.avatar_url,
              });
            }
          });
        });
        
        setOnlineMembers(members);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Get profile data to share
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          const { data: memberData } = await supabase
            .from('community_members')
            .select('avatar_url')
            .eq('user_id', user.id)
            .single();

          await channel.track({
            user_id: user.id,
            full_name: profile?.full_name || 'Member',
            avatar_url: memberData?.avatar_url || '',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  return (
    <div className="bg-card rounded-lg p-4 border">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Circle className="h-3 w-3 fill-green-500 text-green-500" />
        {t('community.onlineNow')} ({onlineMembers.length + 1})
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Current user */}
        <Avatar className="h-8 w-8 ring-2 ring-green-500">
          <AvatarFallback className="text-xs">
            {t('common.you').charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        {/* Other online members */}
        {onlineMembers.slice(0, 8).map((member) => (
          <Avatar key={member.user_id} className="h-8 w-8 ring-2 ring-green-500">
            <AvatarImage src={member.avatar_url} />
            <AvatarFallback className="text-xs">
              {member.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        ))}
        
        {onlineMembers.length > 8 && (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            +{onlineMembers.length - 8}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineMembers;
