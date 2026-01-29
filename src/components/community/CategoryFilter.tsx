import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Filter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  
  const selectedCategoryData = allCategories.find(c => c.id === selectedCategory) || allCategory;

  return (
    <div className="flex items-center gap-2 p-3 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            <span>{isRTL ? selectedCategoryData.name : selectedCategoryData.name_en || selectedCategoryData.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isRTL ? "end" : "start"} className="w-48 bg-popover border shadow-lg">
          {allCategories.map((category) => {
            const isSelected = selectedCategory === category.id;
            
            return (
              <DropdownMenuItem
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex items-center justify-between cursor-pointer",
                  isSelected && "bg-primary/10 text-primary"
                )}
              >
                <span>{isRTL ? category.name : category.name_en || category.name}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CategoryFilter;
