import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CourseFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

const CourseFilters = ({
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedType,
  setSelectedType,
  sortBy,
  setSortBy,
}: CourseFiltersProps) => {
  return (
    <div className="glass-panel p-4 sm:p-6 mb-6 sm:mb-8" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-xs sm:text-sm">קטגוריה</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category" className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="פיתוח אישי">פיתוח אישי</SelectItem>
              <SelectItem value="עסקים">עסקים</SelectItem>
              <SelectItem value="טכנולוגיה">טכנולוגיה</SelectItem>
              <SelectItem value="בריאות">בריאות</SelectItem>
              <SelectItem value="אמנות">אמנות</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-2">
          <Label htmlFor="difficulty" className="text-xs sm:text-sm">רמת קושי</Label>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger id="difficulty" className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="מתחיל">מתחיל</SelectItem>
              <SelectItem value="בינוני">בינוני</SelectItem>
              <SelectItem value="מתקדם">מתקדם</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type" className="text-xs sm:text-sm">סוג תוכן</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger id="type" className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="course">קורס מלא</SelectItem>
              <SelectItem value="masterclass">מאסטרקלאס</SelectItem>
              <SelectItem value="workshop">סדנה</SelectItem>
              <SelectItem value="guide">מדריך</SelectItem>
              <SelectItem value="toolkit">ערכת כלים</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label htmlFor="sort" className="text-xs sm:text-sm">מיון</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sort" className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="newest">חדשים ביותר</SelectItem>
              <SelectItem value="popular">פופולריים ביותר</SelectItem>
              <SelectItem value="price_low">מחיר נמוך לגבוה</SelectItem>
              <SelectItem value="price_high">מחיר גבוה לנמוך</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
