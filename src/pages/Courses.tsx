import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import MatrixRain from "@/components/MatrixRain";
import CourseCard from "@/components/courses/CourseCard";
import CourseFilters from "@/components/courses/CourseFilters";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: courses, isLoading, refetch } = useQuery({
    queryKey: ["courses", selectedCategory, selectedDifficulty, selectedType, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("content_products")
        .select("*")
        .eq("status", "published");

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (selectedDifficulty !== "all") {
        query = query.eq("difficulty_level", selectedDifficulty);
      }

      if (selectedType !== "all") {
        query = query.eq("content_type", selectedType as "course" | "masterclass" | "workshop" | "guide" | "toolkit");
      }

      // Sorting
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "popular":
          query = query.order("enrollment_count", { ascending: false });
          break;
        case "price_low":
          query = query.order("price", { ascending: true });
          break;
        case "price_high":
          query = query.order("price", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredCourses = courses?.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    },
  });

  return (
    <div className="relative min-h-screen">
      <PullToRefreshIndicator {...pullToRefresh} />
      <MatrixRain />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.01)_50%)] bg-[length:100%_4px] opacity-10" style={{ zIndex: 1 }} />
      
      <Header />
      
      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-16 sm:mt-20">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12" dir="rtl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black cyber-glow mb-3 sm:mb-4">
            המוצרים הדיגיטליים שלנו
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            גלה את מגוון המוצרים הדיגיטליים והתוכן שלנו. לימוד מתקדם, הדרכה מקצועית, ותוכן איכותי
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 sm:mb-8 max-w-2xl mx-auto sticky top-16 sm:top-20 z-10 bg-background/95 backdrop-blur-sm py-2">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
          <Input
            type="text"
            placeholder="חפש מוצר..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 sm:pr-10 glass-panel text-right h-10 sm:h-11"
            dir="rtl"
          />
        </div>

        {/* Filters and Sort */}
        <CourseFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="glass-panel p-4 sm:p-6 space-y-3 sm:space-y-4">
                <Skeleton className="h-40 sm:h-48 w-full" />
                <Skeleton className="h-5 sm:h-6 w-3/4" />
                <Skeleton className="h-3 sm:h-4 w-full" />
                <Skeleton className="h-3 sm:h-4 w-full" />
                <Skeleton className="h-9 sm:h-10 w-full" />
              </div>
            ))
          ) : filteredCourses && filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <div className="col-span-full text-center py-12" dir="rtl">
              <p className="text-base sm:text-xl text-muted-foreground">
                לא נמצאו מוצרים התואמים את החיפוש
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Courses;
