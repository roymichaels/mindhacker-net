import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, X } from 'lucide-react';

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
  const { t, isRTL } = useTranslation();
  const [open, setOpen] = useState(false);

  // Count active filters
  const activeFilters = [
    selectedCategory !== 'all',
    selectedDifficulty !== 'all',
    selectedType !== 'all',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedType('all');
    setSortBy('newest');
  };

  const FilterContent = () => (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Category Filter */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium">
          {t('courses.category')}
        </Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger id="category" className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[60]">
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="פיתוח אישי">{t('courses.categories.personal')}</SelectItem>
            <SelectItem value="עסקים">{t('courses.categories.business')}</SelectItem>
            <SelectItem value="טכנולוגיה">{t('courses.categories.technology')}</SelectItem>
            <SelectItem value="בריאות">{t('courses.categories.health')}</SelectItem>
            <SelectItem value="אמנות">{t('courses.categories.art')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-2">
        <Label htmlFor="difficulty" className="text-sm font-medium">
          {t('courses.difficulty')}
        </Label>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger id="difficulty" className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[60]">
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="מתחיל">{t('courses.levels.beginner')}</SelectItem>
            <SelectItem value="בינוני">{t('courses.levels.intermediate')}</SelectItem>
            <SelectItem value="מתקדם">{t('courses.levels.advanced')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Type Filter */}
      <div className="space-y-2">
        <Label htmlFor="type" className="text-sm font-medium">
          {t('courses.contentType')}
        </Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger id="type" className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[60]">
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="course">{t('courses.types.course')}</SelectItem>
            <SelectItem value="masterclass">{t('courses.types.masterclass')}</SelectItem>
            <SelectItem value="workshop">{t('courses.types.workshop')}</SelectItem>
            <SelectItem value="guide">{t('courses.types.guide')}</SelectItem>
            <SelectItem value="toolkit">{t('courses.types.toolkit')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <Label htmlFor="sort" className="text-sm font-medium">
          {t('courses.sortBy')}
        </Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger id="sort" className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[60]">
            <SelectItem value="newest">{t('courses.sort.newest')}</SelectItem>
            <SelectItem value="popular">{t('courses.sort.popular')}</SelectItem>
            <SelectItem value="price_low">{t('courses.sort.priceLow')}</SelectItem>
            <SelectItem value="price_high">{t('courses.sort.priceHigh')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {activeFilters > 0 && (
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={clearAllFilters}
        >
          <X className="h-4 w-4" />
          {t('courses.clearFilters')}
        </Button>
      )}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
          {activeFilters > 0 && (
            <Badge 
              className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilters}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side={isRTL ? "right" : "left"} 
        className="w-[300px] sm:w-[350px]"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className={isRTL ? 'text-right' : 'text-left'}>
            {t('courses.filters')}
          </SheetTitle>
        </SheetHeader>
        <FilterContent />
      </SheetContent>
    </Sheet>
  );
};

export default CourseFilters;
