import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import CourseWatchSidebar from "@/components/course-watch/CourseWatchSidebar";
import CourseWatchHeader from "@/components/course-watch/CourseWatchHeader";
import { EpisodeViewer } from "@/components/EpisodeViewer";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateEnrollmentProgress } from "@/hooks/useUpdateEnrollmentProgress";

const CourseWatch = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(
    searchParams.get("episode")
  );

  // Fetch course
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course-watch", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_products")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch curriculum with episodes
  const { data: curriculum, isLoading: curriculumLoading } = useQuery({
    queryKey: ["curriculum-watch", course?.id],
    queryFn: async () => {
      if (!course?.id) return null;

      const { data: series, error } = await supabase
        .from("content_series")
        .select(`
          *,
          content_episodes (*)
        `)
        .eq("product_id", course.id)
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (error) throw error;

      // Sort episodes within each series
      series.forEach((s: any) => {
        if (s.content_episodes) {
          s.content_episodes.sort((a: any, b: any) => 
            (a.order_index || 0) - (b.order_index || 0)
          );
        }
      });

      return series;
    },
    enabled: !!course?.id,
  });

  // Check access
  const { data: hasAccess, isLoading: accessLoading } = useQuery({
    queryKey: ["course-watch-access", course?.id, user?.id],
    queryFn: async () => {
      if (!user?.id || !course?.id) return false;

      // Check purchase
      const { data: purchase } = await supabase
        .from("content_purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", course.id)
        .eq("payment_status", "completed")
        .maybeSingle();

      if (purchase) return true;

      // Check subscription
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_tiers (*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (subscription) {
        const userAccessLevel = subscription.subscription_tiers?.access_level;
        const courseAccessLevel = course.access_level;

        const accessLevels = ["free", "basic", "premium", "vip"];
        const userLevel = accessLevels.indexOf(userAccessLevel || "free");
        const requiredLevel = accessLevels.indexOf(courseAccessLevel || "free");

        return userLevel >= requiredLevel;
      }

      return false;
    },
    enabled: !!user?.id && !!course?.id,
  });

  // Get all episodes in order
  const allEpisodes = curriculum?.flatMap(series => 
    series.content_episodes || []
  ) || [];

  // Current episode
  const currentEpisode = allEpisodes.find(ep => ep.id === currentEpisodeId) || allEpisodes[0];

  // Update enrollment progress whenever watching
  useUpdateEnrollmentProgress(course?.id || "");

  // Set first episode if none selected
  useEffect(() => {
    if (!currentEpisodeId && allEpisodes.length > 0) {
      const firstEpisode = allEpisodes[0];
      setCurrentEpisodeId(firstEpisode.id);
      setSearchParams({ episode: firstEpisode.id });
    }
  }, [allEpisodes, currentEpisodeId, setSearchParams]);

  // Navigation
  const handleEpisodeChange = (episodeId: string) => {
    setCurrentEpisodeId(episodeId);
    setSearchParams({ episode: episodeId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentIndex = allEpisodes.findIndex(ep => ep.id === currentEpisodeId);
  const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <p className="mb-4">יש להתחבר כדי לצפות בתוכן זה</p>
            <Button onClick={() => navigate("/login")}>התחבר</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (courseLoading || curriculumLoading || accessLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-16 border-b bg-background/95 backdrop-blur" />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full mb-4" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!course || !curriculum) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="mb-4">לא נמצא תוכן זה</p>
            <Button variant="outline" onClick={() => navigate("/courses")}>
              חזור לקורסים
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user has access to current episode
  const canViewEpisode = hasAccess || currentEpisode?.is_preview || course.access_level === "free";

  if (!canViewEpisode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <p className="mb-4">
              אין לך גישה לתוכן זה. אנא רכוש את הקורס או הירשם למנוי מתאים.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate(`/courses/${course.slug}`)}>
                צפה בפרטי הקורס
              </Button>
              <Button variant="outline" onClick={() => navigate("/subscriptions")}>
                צפה במנויים
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" dir="rtl">
        <CourseWatchSidebar
          course={course}
          curriculum={curriculum}
          currentEpisodeId={currentEpisodeId || ""}
          onEpisodeSelect={handleEpisodeChange}
          hasAccess={hasAccess || false}
        />

        <div className="flex-1 flex flex-col">
          <CourseWatchHeader
            course={course}
            currentEpisode={currentEpisode}
            nextEpisode={nextEpisode}
            prevEpisode={prevEpisode}
            onNavigate={handleEpisodeChange}
          />

          <main className="flex-1 p-6 overflow-y-auto">
            {currentEpisode ? (
              <div className="max-w-5xl mx-auto">
                <EpisodeViewer episode={currentEpisode} />

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
                  <Button
                    variant="outline"
                    onClick={() => prevEpisode && handleEpisodeChange(prevEpisode.id)}
                    disabled={!prevEpisode}
                  >
                    ← שיעור קודם
                  </Button>
                  <Button
                    onClick={() => nextEpisode && handleEpisodeChange(nextEpisode.id)}
                    disabled={!nextEpisode}
                  >
                    שיעור הבא →
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Alert>
                  <AlertDescription>אין שיעור נבחר</AlertDescription>
                </Alert>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CourseWatch;
