import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GripVertical, Trash2, Copy, Eye, EyeOff,
  Heading, AlertTriangle, ListOrdered, Gift, 
  MessageSquareQuote, HelpCircle, MousePointer,
  UserCheck, UserX, Package, Plus,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionItem {
  id: string;
  type: string;
  enabled: boolean;
}

interface BuilderSidebarProps {
  sections: SectionItem[];
  selectedSection: string | null;
  onSelectSection: (id: string) => void;
  onReorder: (sections: SectionItem[]) => void;
  onToggleSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onAddSection: () => void;
  brandColor?: string;
}

const sectionMeta: Record<string, { 
  icon: LucideIcon;
  name_he: string;
  name_en: string;
  color: string;
}> = {
  hero: { icon: Heading, name_he: 'Hero', name_en: 'Hero', color: '#8B5CF6' },
  pain_points: { icon: AlertTriangle, name_he: 'נקודות כאב', name_en: 'Pain Points', color: '#EF4444' },
  process: { icon: ListOrdered, name_he: 'תהליך', name_en: 'Process', color: '#3B82F6' },
  benefits: { icon: Gift, name_he: 'יתרונות', name_en: 'Benefits', color: '#10B981' },
  for_who: { icon: UserCheck, name_he: 'למי זה מתאים', name_en: 'For Who', color: '#22C55E' },
  not_for_who: { icon: UserX, name_he: 'למי לא מתאים', name_en: 'Not For', color: '#F97316' },
  includes: { icon: Package, name_he: 'מה כולל', name_en: 'Includes', color: '#6366F1' },
  testimonials: { icon: MessageSquareQuote, name_he: 'המלצות', name_en: 'Testimonials', color: '#EC4899' },
  faq: { icon: HelpCircle, name_he: 'שאלות נפוצות', name_en: 'FAQ', color: '#F59E0B' },
  cta: { icon: MousePointer, name_he: 'קריאה לפעולה', name_en: 'Call to Action', color: '#8B5CF6' },
};

// Sortable section item
const SortableSection = ({ 
  section, 
  isSelected, 
  onSelect, 
  onToggle, 
  onDuplicate, 
  onDelete,
  isRTL,
}: { 
  section: SectionItem;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isRTL: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const meta = sectionMeta[section.type] || sectionMeta.hero;
  const Icon = meta.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer",
        isSelected 
          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
          : "border-border hover:border-primary/30 hover:bg-muted/50",
        isDragging && "opacity-50 ring-2 ring-primary shadow-lg",
        !section.enabled && "opacity-50"
      )}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <button
        className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Icon */}
      <div 
        className="p-1.5 rounded-md shrink-0"
        style={{ backgroundColor: `${meta.color}20` }}
      >
        <Icon className="w-4 h-4" style={{ color: meta.color }} />
      </div>

      {/* Name */}
      <span className="flex-1 text-sm font-medium truncate">
        {isRTL ? meta.name_he : meta.name_en}
      </span>

      {/* Quick Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          {section.enabled ? (
            <Eye className="w-3.5 h-3.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export const BuilderSidebar = ({
  sections,
  selectedSection,
  onSelectSection,
  onToggleSection,
  onDuplicateSection,
  onDeleteSection,
  onAddSection,
}: BuilderSidebarProps) => {
  const { isRTL } = useTranslation();

  const enabledCount = useMemo(
    () => sections.filter(s => s.enabled).length,
    [sections]
  );

  return (
    <div className="h-full flex flex-col bg-card border-e border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">
            {isRTL ? 'סעיפים' : 'Sections'}
          </h3>
          <span className="text-xs text-muted-foreground">
            {enabledCount} {isRTL ? 'פעיל' : 'active'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {isRTL ? 'גרור לשינוי סדר' : 'Drag to reorder'}
        </p>
      </div>

      {/* Sections List */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              isSelected={selectedSection === section.id}
              onSelect={() => onSelectSection(section.id)}
              onToggle={() => onToggleSection(section.id)}
              onDuplicate={() => onDuplicateSection(section.id)}
              onDelete={() => onDeleteSection(section.id)}
              isRTL={isRTL}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Add Section Button */}
      <div className="p-3 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={onAddSection}
        >
          <Plus className="w-4 h-4" />
          {isRTL ? 'הוסף סעיף' : 'Add Section'}
        </Button>
      </div>
    </div>
  );
};

export { sectionMeta };
export type { SectionItem };
