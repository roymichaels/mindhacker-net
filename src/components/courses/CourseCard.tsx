import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface CourseCardProps {
  course: Tables<"content_products">;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="glass-panel hover:cyber-border transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={() => navigate(`/courses/${course.slug}`)}
      dir="rtl"
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
        <div className="absolute top-3 right-3 flex gap-2">
          {course.access_level === "free" && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              חינם
            </Badge>
          )}
          {course.is_featured && (
            <Badge variant="default" className="cyber-glow">
              מומלץ
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
              רמה: {course.difficulty_level}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-border/30">
        <div>
          {course.price && course.price > 0 ? (
            <span className="text-2xl font-bold cyber-glow">₪{course.price}</span>
          ) : (
            <span className="text-2xl font-bold text-accent">חינם</span>
          )}
        </div>
        <Button 
          variant="default"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/courses/${course.slug}`);
          }}
        >
          צפה במוצר
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
