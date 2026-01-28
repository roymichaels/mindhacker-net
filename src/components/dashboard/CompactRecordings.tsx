import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Headphones, Video, Play, ChevronRight, ChevronLeft } from 'lucide-react';

interface AudioAccess {
  id: string;
  access_token: string;
  hypnosis_audios: {
    id: string;
    title: string;
    duration_seconds: number | null;
  };
}

interface VideoAccess {
  id: string;
  access_token: string;
  hypnosis_videos: {
    id: string;
    title: string;
    duration_seconds: number | null;
  };
}

const CompactRecordings = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const { data: recordings, isLoading: loadingAudio } = useQuery({
    queryKey: ['compact-recordings'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      const { data, error } = await supabase
        .from('user_audio_access')
        .select(`id, access_token, hypnosis_audios (id, title, duration_seconds)`)
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .order('granted_at', { ascending: false })
        .limit(2);
      if (error) throw error;
      return data as unknown as AudioAccess[];
    },
  });

  const { data: videos, isLoading: loadingVideo } = useQuery({
    queryKey: ['compact-videos'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      const { data, error } = await supabase
        .from('user_video_access')
        .select(`id, access_token, hypnosis_videos (id, title, duration_seconds)`)
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .order('granted_at', { ascending: false })
        .limit(2);
      if (error) throw error;
      return data as unknown as VideoAccess[];
    },
  });

  const isLoading = loadingAudio || loadingVideo;
  const hasContent = (recordings && recordings.length > 0) || (videos && videos.length > 0);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            {t('dashboard.myRecordings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!hasContent) {
    return null;
  }

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            {t('dashboard.myRecordings')}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {videos?.slice(0, 2).map((video) => (
          <div 
            key={video.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => navigate(`/video/${video.access_token}`)}
          >
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Video className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{video.hypnosis_videos.title}</p>
              {video.hypnosis_videos.duration_seconds && (
                <p className="text-xs text-muted-foreground">
                  {formatDuration(video.hypnosis_videos.duration_seconds)}
                </p>
              )}
            </div>
            <Play className="h-4 w-4 text-primary shrink-0" />
          </div>
        ))}

        {recordings?.slice(0, 2).map((recording) => (
          <div 
            key={recording.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => navigate(`/audio/${recording.access_token}`)}
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Headphones className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{recording.hypnosis_audios.title}</p>
              {recording.hypnosis_audios.duration_seconds && (
                <p className="text-xs text-muted-foreground">
                  {formatDuration(recording.hypnosis_audios.duration_seconds)}
                </p>
              )}
            </div>
            <Play className="h-4 w-4 text-primary shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CompactRecordings;
