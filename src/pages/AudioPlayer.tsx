import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Loader2,
  AlertCircle,
  Headphones,
  SkipBack,
  SkipForward
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface AudioData {
  title: string;
  description: string | null;
  file_path: string;
  duration_seconds: number | null;
}

const AudioPlayer = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useSEO({
    title: audioData?.title || "הקלטה",
    description: audioData?.description || "הקלטת היפנוזה מותאמת אישית",
  });

  useEffect(() => {
    const fetchAudio = async () => {
      if (!token) {
        setError("קישור לא תקין");
        setLoading(false);
        return;
      }

      try {
        // First, verify the access token
        const { data: access, error: accessError } = await supabase
          .from("user_audio_access")
          .select(`
            is_active,
            expires_at,
            hypnosis_audios (
              title,
              description,
              file_path,
              duration_seconds
            )
          `)
          .eq("access_token", token)
          .maybeSingle();

        if (accessError) throw accessError;

        if (!access) {
          setError("הקישור לא נמצא או שפג תוקפו");
          setLoading(false);
          return;
        }

        if (!access.is_active) {
          setError("הגישה להקלטה זו הושבתה");
          setLoading(false);
          return;
        }

        if (access.expires_at && new Date(access.expires_at) < new Date()) {
          setError("פג תוקף הגישה להקלטה זו");
          setLoading(false);
          return;
        }

        const audio = access.hypnosis_audios as unknown as AudioData;
        setAudioData(audio);

        // Generate signed URL for the audio file
        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from("hypnosis-audios")
          .createSignedUrl(audio.file_path, 3600); // 1 hour expiry

        if (signedError) throw signedError;
        
        setAudioUrl(signedUrlData.signedUrl);
      } catch (err) {
        console.error("Error fetching audio:", err);
        setError("שגיאה בטעינת ההקלטה");
      } finally {
        setLoading(false);
      }
    };

    fetchAudio();
  }, [token]);

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

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(duration, currentTime + seconds)
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">טוען הקלטה...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">שגיאה</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")}>חזרה לדף הבית</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />
      
      <Card className="max-w-lg w-full overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 text-center">
          <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-primary/30">
            <Headphones className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{audioData?.title}</h1>
          {audioData?.description && (
            <p className="text-muted-foreground text-sm">{audioData.description}</p>
          )}
        </div>

        <CardContent className="p-6 space-y-6">
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

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => skip(-15)}
              className="h-12 w-12"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
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
            
            <Button
              size="icon"
              variant="ghost"
              onClick={() => skip(15)}
              className="h-12 w-12"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-32"
            />
          </div>

          {/* Tip */}
          <p className="text-center text-xs text-muted-foreground">
            💡 מומלץ להאזין עם אוזניות במקום שקט
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioPlayer;
