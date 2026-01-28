import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

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
    icon: 'LayoutGrid',
    color: '#6366f1',
  };

  const allCategories = [allCategory, ...(categories || [])];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((category) => {
        const IconComponent = category.icon 
          ? (LucideIcons as any)[category.icon] || LucideIcons.MessageCircle
          : LucideIcons.MessageCircle;
        
        const isSelected = selectedCategory === category.id;
        
        return (
          <Badge
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all hover:scale-105 gap-1.5 px-3 py-1.5",
              isSelected && "ring-2 ring-offset-2"
            )}
            style={isSelected ? { 
              backgroundColor: category.color || '#6366f1',
              borderColor: category.color || '#6366f1',
            } : {
              borderColor: category.color || '#6366f1',
              color: category.color || '#6366f1',
            }}
            onClick={() => onCategoryChange(category.id)}
          >
            <IconComponent className="h-3.5 w-3.5" />
            <span>{isRTL ? category.name : category.name_en || category.name}</span>
          </Badge>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
