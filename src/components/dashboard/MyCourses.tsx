import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

const MyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["my-enrollments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("course_enrollments")
        .select(`
          *,
          content_products (
            id,
            title,
            slug,
            thumbnail_url,
            description,
            instructor_name
          )
        `)
        .eq("user_id", user.id)
        .order("last_accessed_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch progress for all enrolled courses
  const { data: progressData } = useQuery({
    queryKey: ["all-course-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const getLastWatchedEpisode = (productId: string) => {
    const courseProgress = progressData?.filter(p => p.product_id === productId);
    if (!courseProgress || courseProgress.length === 0) return null;

    // Get most recently watched episode
    const sorted = courseProgress.sort((a, b) => 
      new Date(b.last_watched_at || 0).getTime() - new Date(a.last_watched_at || 0).getTime()
    );
    return sorted[0];
  };

  if (isLoading) {
    return (
      <Card className="glass-panel" dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            הקורסים שלי
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-24 w-32 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card className="glass-panel" dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            הקורסים שלי
          </CardTitle>
          <CardDescription>
            הקורסים שנרשמת אליהם יופיעו כאן
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              עדיין לא נרשמת לאף קורס
            </p>
            <Button onClick={() => navigate("/courses")}>
              גלה קורסים
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          הקורסים שלי
        </CardTitle>
        <CardDescription>
          {enrollments.length} קורסים רשומים
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {enrollments.map((enrollment) => {
          const course = enrollment.content_products;
          if (!course) return null;

          const progressPercentage = enrollment.progress_percentage || 0;
          const isCompleted = enrollment.is_completed;
          const lastProgress = getLastWatchedEpisode(course.id);

          return (
            <div
              key={enrollment.id}
              className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border border-border/30 hover:border-primary/50 transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative w-full md:w-40 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                onClick={() => navigate(`/courses/${course.slug}`)}>
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                )}
                {isCompleted && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h3 
                      className="font-bold text-lg mb-1 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/courses/${course.slug}`)}
                    >
                      {course.title}
                    </h3>
                    {course.instructor_name && (
                      <p className="text-sm text-muted-foreground">
                        {course.instructor_name}
                      </p>
                    )}
                  </div>
                  {isCompleted ? (
                    <Badge className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      הושלם
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      {progressPercentage}% הושלם
                    </Badge>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>
                      {enrollment.completed_episodes || 0} מתוך {enrollment.total_episodes || 0} שיעורים
                    </span>
                    {lastProgress?.last_watched_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(lastProgress.last_watched_at), { 
                          addSuffix: true,
                          locale: he 
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (lastProgress?.episode_id) {
                        navigate(`/courses/${course.slug}/watch?episode=${lastProgress.episode_id}`);
                      } else {
                        navigate(`/courses/${course.slug}/watch`);
                      }
                    }}
                    className="gap-2"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {lastProgress ? "המשך צפייה" : "התחל ללמוד"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/courses/${course.slug}`)}
                  >
                    פרטי הקורס
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default MyCourses;
