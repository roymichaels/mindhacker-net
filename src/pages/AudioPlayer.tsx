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
  SkipForward,
  Download
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "@/hooks/useTranslation";

interface AudioData {
  title: string;
  description: string | null;
  duration_seconds: number | null;
  audio_url: string;
}

const AudioPlayer = () => {
  const { t, isRTL } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [streamError, setStreamError] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false); // Start false, set true only when actually buffering
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useSEO({
    title: audioData?.title || t('audioVideoPlayer.seoAudioTitle'),
    description: audioData?.description || t('audioVideoPlayer.seoAudioDesc'),
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchAudio = async () => {
      if (!token) {
        setError(t('audioVideoPlayer.invalidLink'));
        setLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('get-audio-by-token', {
          body: { token }
        });

        if (!isMounted) return;

        if (fnError) {
          console.error("Edge function error:", fnError);
          setError(t('audioVideoPlayer.audioLoadError'));
          setLoading(false);
          return;
        }

        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        setAudioData(data);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching audio:", err);
        setError(t('audioVideoPlayer.audioLoadError'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAudio();
    
    return () => { isMounted = false; };
  }, [token]); // Only depend on token, not t

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioData?.audio_url) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsBuffering(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleCanPlay = () => setIsBuffering(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.error("Audio stream error");
      setStreamError(true);
      setIsBuffering(false);
      setIsPlaying(false);
    };
    const handleStalled = () => {
      console.warn("Audio stream stalled");
      setIsBuffering(true);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("stalled", handleStalled);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("stalled", handleStalled);
    };
  }, [audioData?.audio_url]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      setIsBuffering(true);
      try {
        await audio.play();
        // State will be updated by 'playing' event
      } catch (err) {
        console.error("Play failed:", err);
        setIsBuffering(false);
        setStreamError(true);
      }
    }
  };

  const retryStream = () => {
    const audio = audioRef.current;
    if (!audio || !audioData?.audio_url) return;
    
    setStreamError(false);
    setIsBuffering(true);
    audio.src = audioData.audio_url;
    audio.load();
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

  const handleDownload = async () => {
    if (!audioData?.audio_url) return;
    
    try {
      const response = await fetch(audioData.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${audioData.title || 'audio'}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
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
          <p className="text-muted-foreground">{t('audioVideoPlayer.loadingAudio')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">{t('audioVideoPlayer.error')}</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")}>{t('audioVideoPlayer.backHome')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <audio ref={audioRef} src={audioData?.audio_url || undefined} preload="metadata" />
      
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
              aria-label="Skip back 15 seconds"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            {streamError ? (
              <Button
                size="icon"
                onClick={retryStream}
                className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90"
                aria-label="Retry"
              >
                <AlertCircle className="h-8 w-8" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={togglePlay}
                className="h-16 w-16 rounded-full"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isBuffering ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className={`h-8 w-8 ${isRTL ? 'ml-[-2px]' : 'mr-[-2px]'}`} />
                )}
              </Button>
            )}
            
            <Button
              size="icon"
              variant="ghost"
              onClick={() => skip(15)}
              className="h-12 w-12"
              aria-label="Skip forward 15 seconds"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume control and Download */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button size="icon" variant="ghost" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
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
                className="w-24"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
              disabled={!audioData?.audio_url}
            >
              <Download className="h-4 w-4" />
              {t('audioVideoPlayer.download')}
            </Button>
          </div>

          {/* Tip */}
          <p className="text-center text-xs text-muted-foreground">
            {t('audioVideoPlayer.audioTip')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioPlayer;
