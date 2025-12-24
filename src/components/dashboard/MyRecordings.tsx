import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, Play, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSignedUrl } from "@/hooks/useStorageUrl";
import { useState, useRef, useEffect } from "react";

interface AudioAccess {
  id: string;
  access_token: string;
  granted_at: string;
  hypnosis_audios: {
    id: string;
    title: string;
    description: string | null;
    file_path: string;
    duration_seconds: number | null;
  };
}

const AudioItem = ({ audio, token }: { audio: AudioAccess["hypnosis_audios"]; token: string }) => {
  const navigate = useNavigate();
  
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "לא ידוע";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
          <Headphones className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{audio.title}</h4>
          {audio.description && (
            <p className="text-sm text-muted-foreground truncate">{audio.description}</p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(audio.duration_seconds)}</span>
          </div>
        </div>
        <Button
          size="icon"
          className="shrink-0"
          onClick={() => navigate(`/audio/${token}`)}
        >
          <Play className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export const MyRecordings = () => {
  const { data: recordings, isLoading } = useQuery({
    queryKey: ["my-recordings"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_audio_access")
        .select(`
          id,
          access_token,
          granted_at,
          hypnosis_audios (
            id,
            title,
            description,
            file_path,
            duration_seconds
          )
        `)
        .eq("user_id", user.user.id)
        .eq("is_active", true)
        .order("granted_at", { ascending: false });

      if (error) throw error;
      return data as unknown as AudioAccess[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            ההקלטות שלי
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!recordings || recordings.length === 0) {
    return null; // Don't show section if no recordings
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary" />
          ההקלטות שלי ({recordings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recordings.map((recording) => (
          <AudioItem
            key={recording.id}
            audio={recording.hypnosis_audios}
            token={recording.access_token}
          />
        ))}
      </CardContent>
    </Card>
  );
};
