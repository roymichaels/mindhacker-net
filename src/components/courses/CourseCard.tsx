import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Star, CheckCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface CourseCardProps {
  course: Tables<"content_products">;
  enrollment?: {
    product_id: string;
    progress_percentage: number | null;
    is_completed: boolean | null;
  };
}

const CourseCard = ({ course, enrollment }: CourseCardProps) => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  return (
    <Card 
      className={cn(
        "glass-panel hover:cyber-border transition-all duration-300 cursor-pointer overflow-hidden group",
        enrollment && "ring-2 ring-green-500/50"
      )}
      onClick={() => navigate(`/courses/${course.slug}`)}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-4xl font-black cyber-glow opacity-30">מוצר</span>
          </div>
        )}
        
        {/* Badges */}
        <div className={cn("absolute top-3 flex gap-2", isRTL ? "right-3" : "left-3")}>
          {enrollment && (
            <Badge className="bg-green-500 text-white flex items-center gap-1 shadow-lg">
              <CheckCircle className="h-3 w-3" />
              {t('courses.owned')}
            </Badge>
          )}
          {course.access_level === "free" && !enrollment && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {isRTL ? "חינם" : "Free"}
            </Badge>
          )}
          {course.is_featured && (
            <Badge variant="default" className="cyber-glow">
              {isRTL ? "מומלץ" : "Featured"}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xl font-bold leading-tight flex-1">
            {course.title}
          </h3>
          <Badge variant="outline">
            {course.content_type}
          </Badge>
        </div>
        {course.instructor_name && (
          <p className="text-sm text-muted-foreground">
            מדריך: {course.instructor_name}
          </p>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {course.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(course.duration_minutes / 60)} שעות</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.enrollment_count || 0} משתתפים</span>
          </div>
          {course.average_rating && course.average_rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span>{course.average_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {course.difficulty_level && (
          <div className="mt-3">
            <Badge variant="outline" className="text-xs">
              {isRTL ? "רמה:" : "Level:"} {course.difficulty_level}
            </Badge>
          </div>
        )}

        {/* Progress bar for enrolled users */}
        {enrollment && enrollment.progress_percentage !== null && enrollment.progress_percentage > 0 && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{isRTL ? "התקדמות" : "Progress"}</span>
              <span>{Math.round(enrollment.progress_percentage)}%</span>
            </div>
            <Progress value={enrollment.progress_percentage} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-border/30">
        <div>
          {enrollment ? (
            <span className="text-lg font-medium text-green-500 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {t('courses.owned')}
            </span>
          ) : course.price && course.price > 0 ? (
            <span className="text-2xl font-bold cyber-glow">₪{course.price}</span>
          ) : (
            <span className="text-2xl font-bold text-accent">{isRTL ? "חינם" : "Free"}</span>
          )}
        </div>
        <Button 
          variant={enrollment ? "secondary" : "default"}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/courses/${course.slug}`);
          }}
        >
          {enrollment ? t('courses.continueWatching') : t('courses.viewProduct')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
