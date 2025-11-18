import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import MatrixRain from "@/components/MatrixRain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Clock, Users, Star, BookOpen, Target, CheckCircle2 } from "lucide-react";
import CourseCurriculum from "@/components/courses/CourseCurriculum";
import CheckoutDialog from "@/components/checkout/CheckoutDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSwipeable } from "react-swipeable";
import { useSEO } from "@/hooks/useSEO";
import { getCourseSchema, getBreadcrumbSchema } from "@/lib/seo";

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Swipe to go back on mobile
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (window.innerWidth < 768) {
        navigate(-1);
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 50,
  });

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", slug],
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

  // Fetch curriculum (series and episodes)
  const { data: curriculum, isLoading: curriculumLoading } = useQuery({
    queryKey: ["curriculum", course?.id],
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
      return series;
    },
    enabled: !!course?.id,
  });

  // Check if user has access
  const { data: hasAccess } = useQuery({
    queryKey: ["course-access", course?.id, user?.id],
    queryFn: async () => {
      if (!user?.id || !course?.id) return false;

      // Check if user purchased this course
      const { data: purchase } = await supabase
        .from("content_purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", course.id)
        .eq("payment_status", "completed")
        .single();

      if (purchase) return true;

      // Check if user has active subscription with sufficient access level
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_tiers (*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

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

  const handleEnroll = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setCheckoutOpen(true);
  };

  // Update SEO when course data is loaded
  useSEO({
    title: course ? `${course.title} | מיינד-האקר` : "מוצר דיגיטלי | מיינד-האקר",
    description: course?.description || "גלה מוצר דיגיטלי איכותי בתחום אימון התודעה והפיתוח האישי",
    keywords: course ? `${course.title}, קורס אונליין, ${course.category}, ${course.difficulty_level}` : undefined,
    image: course?.thumbnail_url,
    url: `${window.location.origin}/courses/${slug}`,
    type: "product",
    structuredData: course ? [
      getCourseSchema({
        name: course.title,
        description: course.description || "",
        provider: "מיינד-האקר - Dean Azulay",
        image: course.thumbnail_url || undefined,
        price: course.price || undefined,
        currency: "ILS",
      }),
      getBreadcrumbSchema([
        { name: "דף הבית", url: window.location.origin },
        { name: "מוצרים דיגיטליים", url: `${window.location.origin}/courses` },
        { name: course.title, url: `${window.location.origin}/courses/${slug}` },
      ]),
    ] : undefined,
  });


  if (courseLoading) {
    return (
      <div className="relative min-h-screen">
        <MatrixRain />
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 mt-16 sm:mt-20">
          <Skeleton className="h-64 sm:h-80 lg:h-96 w-full mb-6 sm:mb-8" />
          <Skeleton className="h-10 sm:h-12 w-3/4 mb-3 sm:mb-4" />
          <Skeleton className="h-5 sm:h-6 w-full mb-2" />
          <Skeleton className="h-5 sm:h-6 w-full" />
        </div>
      </div>
    );
  }

  if (!course) {
  return (
    <div {...swipeHandlers} className="relative min-h-screen">
      <MatrixRain />
      <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20 text-center" dir="rtl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black cyber-glow mb-4">קורס לא נמצא</h1>
          <Button onClick={() => navigate("/courses")} size="lg">חזור לקורסים</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <MatrixRain />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.01)_50%)] bg-[length:100%_4px] opacity-10" style={{ zIndex: 1 }} />
      
      <Header />
      
      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 mt-16 sm:mt-20 pb-32 lg:pb-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/courses")}
          className="mb-4 sm:mb-6 h-9 sm:h-10"
          dir="rtl"
        >
          <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">חזור למוצרים</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8" dir="rtl">
            {/* Hero Section */}
            <div className="glass-panel p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
              {/* Thumbnail */}
              {course.thumbnail_url && (
                <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title and Badges */}
              <div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <Badge variant="outline" className="text-xs">{course.content_type}</Badge>
                  {course.difficulty_level && (
                    <Badge variant="outline" className="text-xs">רמה: {course.difficulty_level}</Badge>
                  )}
                  {course.access_level === "free" && (
                    <Badge className="bg-accent text-accent-foreground text-xs">חינם</Badge>
                  )}
                  {course.is_featured && (
                    <Badge className="cyber-glow text-xs">מומלץ</Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black cyber-glow mb-3 sm:mb-4">
                  {course.title}
                </h1>

                {course.instructor_name && (
                  <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4">
                    מדריך: {course.instructor_name}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
                  {course.duration_minutes && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <span>{Math.floor(course.duration_minutes / 60)} שעות תוכן</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span>{course.enrollment_count || 0} משתתפים</span>
                  </div>
                  {course.average_rating && course.average_rating > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 text-accent fill-accent flex-shrink-0" />
                      <span>{course.average_rating.toFixed(1)} דירוג</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  אודות הקורס
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>
              </div>

              {/* Learning Objectives */}
              {course.learning_objectives && course.learning_objectives.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    מה תלמדו בקורס?
                  </h2>
                  <ul className="space-y-2 sm:space-y-3">
                    {course.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-muted-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3">דרישות מוקדמות</h2>
                  <ul className="space-y-2 sm:space-y-3">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3">
                        <span className="text-primary text-sm sm:text-base">•</span>
                        <span className="text-sm sm:text-base text-muted-foreground">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Curriculum */}
            {!curriculumLoading && curriculum && (
              <CourseCurriculum 
                curriculum={curriculum} 
                hasAccess={hasAccess || course.access_level === "free"} 
              />
            )}
          </div>

          {/* Sidebar - Enrollment Card (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="glass-panel sticky top-24" dir="rtl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-center">
                  {course.price && course.price > 0 ? (
                    <div className="text-3xl sm:text-4xl font-black cyber-glow">₪{course.price}</div>
                  ) : (
                    <div className="text-3xl sm:text-4xl font-black text-accent">חינם</div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                {hasAccess ? (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate(`/courses/${course.slug}/watch`)}
                  >
                    המשך לצפייה
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleEnroll}
                    >
                      {course.price && course.price > 0 ? "רכוש עכשיו" : "הירשם חינם"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      גישה מלאה לכל התוכן לכל החיים
                    </p>
                  </>
                )}

                {/* Preview Info */}
                {curriculum && curriculum.some(series => 
                  series.content_episodes?.some(ep => ep.is_preview)
                ) && (
                  <div className="pt-3 sm:pt-4 border-t border-border/30">
                    <p className="text-xs sm:text-sm text-center text-muted-foreground">
                      ניתן לצפות בשיעורי התצוגה המקדימה ללא הרשמה
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Fixed CTA Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background/95 backdrop-blur-sm border-t border-border/50 p-4 z-50" dir="rtl">
          <div className="container mx-auto flex items-center justify-between gap-3">
            <div className="flex flex-col">
              {course.price && course.price > 0 ? (
                <div className="text-xl sm:text-2xl font-black cyber-glow">₪{course.price}</div>
              ) : (
                <div className="text-xl sm:text-2xl font-black text-accent">חינם</div>
              )}
            </div>
            {hasAccess ? (
              <Button 
                className="flex-1" 
                size="lg"
                onClick={() => navigate(`/courses/${course.slug}/watch`)}
              >
                המשך לצפייה
              </Button>
            ) : (
              <Button 
                className="flex-1" 
                size="lg"
                onClick={handleEnroll}
              >
                {course.price && course.price > 0 ? "רכוש עכשיו" : "הירשם חינם"}
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Checkout Dialog */}
      {course && (
        <CheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          course={course}
        />
      )}
    </div>
  );
};

export default CourseDetail;
