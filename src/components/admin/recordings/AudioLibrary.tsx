import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Music, Clock, Calendar, Play, Pause, X, UserPlus } from "lucide-react";
import { AudioUploadDialog } from "./AudioUploadDialog";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignAudioDialog } from "./AssignAudioDialog";

interface HypnosisAudio {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  duration_seconds: number | null;
  created_at: string;
}

export const AudioLibrary = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingAudio, setEditingAudio] = useState<HypnosisAudio | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<HypnosisAudio | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [assigningAudioId, setAssigningAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: audios, isLoading } = useQuery({
    queryKey: ["hypnosis-audios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hypnosis_audios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HypnosisAudio[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const audio = audios?.find((a) => a.id === id);
      if (audio?.file_path) {
        await supabase.storage.from("hypnosis-audios").remove([audio.file_path]);
      }
      const { error } = await supabase.from("hypnosis_audios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hypnosis-audios"] });
      toast({ title: "ההקלטה נמחקה בהצלחה" });
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: "שגיאה במחיקת ההקלטה", variant: "destructive" });
    },
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "לא ידוע";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayAudio = async (audio: HypnosisAudio) => {
    try {
      const { data, error } = await supabase.storage
        .from("hypnosis-audios")
        .createSignedUrl(audio.file_path, 3600);
      
      if (error) throw error;
      
      setPlayingAudio(audio);
      setAudioUrl(data.signedUrl);
      setCurrentTime(0);
      setIsPlaying(false);
    } catch (err) {
      toast({ title: "שגיאה בטעינת ההקלטה", variant: "destructive" });
    }
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingAudio(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted/50" />
            <CardContent className="h-16 bg-muted/30" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">כל ההקלטות ({audios?.length || 0})</h2>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          העלה הקלטה חדשה
        </Button>
      </div>

      {audios?.length === 0 ? (
        <Card className="p-12 text-center">
          <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">אין הקלטות עדיין</h3>
          <p className="text-muted-foreground mt-2">העלה את ההקלטה הראשונה שלך</p>
          <Button onClick={() => setIsUploadOpen(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            העלה הקלטה
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {audios?.map((audio) => (
            <Card key={audio.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-start justify-between gap-2">
                  <span className="line-clamp-2">{audio.title}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditingAudio(audio)}
                      title="עריכה"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeletingId(audio.id)}
                      title="מחיקה"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {audio.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {audio.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(audio.duration_seconds)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(audio.created_at), "d MMM yyyy", { locale: he })}
                  </span>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handlePlayAudio(audio)}
                  >
                    <Play className="h-4 w-4" />
                    הפעל
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => setAssigningAudioId(audio.id)}
                  >
                    <UserPlus className="h-4 w-4" />
                    הקצה
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Audio Player Dialog */}
      <Dialog open={!!playingAudio} onOpenChange={(open) => !open && closePlayer()}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{playingAudio?.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          {audioUrl && (
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
          )}
          
          <div className="space-y-6 py-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Play button */}
            <div className="flex justify-center">
              <Button
                size="icon"
                onClick={togglePlay}
                className="h-16 w-16 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 mr-[-2px]" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AudioUploadDialog
        open={isUploadOpen || !!editingAudio}
        onOpenChange={(open) => {
          if (!open) {
            setIsUploadOpen(false);
            setEditingAudio(null);
          }
        }}
        editingAudio={editingAudio}
      />

      {/* Assign Audio Dialog */}
      <AssignAudioDialog
        open={!!assigningAudioId}
        onOpenChange={(open) => !open && setAssigningAudioId(null)}
        preselectedAudioId={assigningAudioId}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>האם למחוק את ההקלטה?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את ההקלטה לצמיתות ותבטל את הגישה לכל המשתמשים שהוקצו אליה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
