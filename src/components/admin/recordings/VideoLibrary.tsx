import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Video, Clock, Calendar, Play, UserPlus, Link, Check } from "lucide-react";
import { VideoUploadDialog } from "./VideoUploadDialog";
import { format } from "date-fns";
import { he } from "date-fns/locale";
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
import { AssignVideoDialog } from "./AssignVideoDialog";

interface HypnosisVideo {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  duration_seconds: number | null;
  created_at: string;
}

export const VideoLibrary = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<HypnosisVideo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<HypnosisVideo | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [assigningVideoId, setAssigningVideoId] = useState<string | null>(null);
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);
  const [generatingLinkFor, setGeneratingLinkFor] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ["hypnosis-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hypnosis_videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HypnosisVideo[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const video = videos?.find((v) => v.id === id);
      if (video?.file_path) {
        await supabase.storage.from("hypnosis-videos").remove([video.file_path]);
      }
      const { error } = await supabase.from("hypnosis_videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hypnosis-videos"] });
      toast({ title: "הסרטון נמחק בהצלחה" });
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: "שגיאה במחיקת הסרטון", variant: "destructive" });
    },
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "לא ידוע";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayVideo = async (video: HypnosisVideo) => {
    try {
      const { data, error } = await supabase.storage
        .from("hypnosis-videos")
        .createSignedUrl(video.file_path, 3600);
      
      if (error) throw error;
      
      setPlayingVideo(video);
      setVideoUrl(data.signedUrl);
    } catch (err) {
      toast({ title: "שגיאה בטעינת הסרטון", variant: "destructive" });
    }
  };

  // Generate a shareable link without assigning to a specific user
  const generateQuickLink = async (videoId: string) => {
    setGeneratingLinkFor(videoId);
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("user_video_access")
        .insert({
          video_id: videoId,
          user_id: null, // No specific user - anonymous link
          granted_by: user.user?.id,
          notes: "קישור מהיר",
        })
        .select("access_token")
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/video/${data.access_token}`;
      await navigator.clipboard.writeText(link);
      setCopiedVideoId(videoId);
      toast({ title: "הקישור הועתק ללוח! 🔗" });
      setTimeout(() => setCopiedVideoId(null), 2000);
    } catch (err) {
      toast({ title: "שגיאה ביצירת קישור", variant: "destructive" });
    } finally {
      setGeneratingLinkFor(null);
    }
  };

  const closePlayer = () => {
    setPlayingVideo(null);
    setVideoUrl(null);
  };

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
        <h2 className="text-xl font-semibold">כל הסרטונים ({videos?.length || 0})</h2>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          העלה סרטון חדש
        </Button>
      </div>

      {videos?.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">אין סרטונים עדיין</h3>
          <p className="text-muted-foreground mt-2">העלה את הסרטון הראשון שלך</p>
          <Button onClick={() => setIsUploadOpen(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            העלה סרטון
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos?.map((video) => (
            <Card key={video.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-start justify-between gap-2">
                  <span className="line-clamp-2">{video.title}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditingVideo(video)}
                      title="עריכה"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeletingId(video.id)}
                      title="מחיקה"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(video.duration_seconds)}
                  </span>
                  {video.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(video.created_at), "d MMM yyyy", { locale: he })}
                    </span>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handlePlayVideo(video)}
                  >
                    <Play className="h-4 w-4" />
                    צפה
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => generateQuickLink(video.id)}
                    disabled={generatingLinkFor === video.id}
                  >
                    {copiedVideoId === video.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Link className="h-4 w-4" />
                    )}
                    {copiedVideoId === video.id ? "הועתק!" : "העתק לינק"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2"
                    onClick={() => setAssigningVideoId(video.id)}
                    title="הקצה למשתמש ספציפי"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={(open) => !open && closePlayer()}>
        <DialogContent dir="rtl" className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{playingVideo?.title}</DialogTitle>
          </DialogHeader>
          
          {videoUrl && (
            <div className="aspect-video w-full">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <VideoUploadDialog
        open={isUploadOpen || !!editingVideo}
        onOpenChange={(open) => {
          if (!open) {
            setIsUploadOpen(false);
            setEditingVideo(null);
          }
        }}
        editingVideo={editingVideo}
      />

      {/* Assign Video Dialog */}
      <AssignVideoDialog
        open={!!assigningVideoId}
        onOpenChange={(open) => !open && setAssigningVideoId(null)}
        preselectedVideoId={assigningVideoId}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>האם למחוק את הסרטון?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הסרטון לצמיתות ותבטל את הגישה לכל המשתמשים שהוקצו אליו.
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
