import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { t, isRTL } = useTranslation();

  const { data: categories } = useQuery({
    queryKey: ['community-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const allCategory = {
    id: 'all',
    name: 'הכל',
    name_en: 'All',
  };

  const allCategories = [allCategory, ...(categories || [])];

  return (
    <div className="flex overflow-x-auto no-scrollbar border-b sticky top-0 bg-background z-10">
      {allCategories.map((category) => {
        const isSelected = selectedCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
              "hover:bg-muted/50",
              isSelected ? "text-primary font-semibold" : "text-muted-foreground"
            )}
          >
            {isRTL ? category.name : category.name_en || category.name}
            {isSelected && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
