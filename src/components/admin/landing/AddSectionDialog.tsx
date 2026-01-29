import { useTranslation } from "@/hooks/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { 
  Heading, AlertTriangle, ListOrdered, Gift, 
  MessageSquareQuote, HelpCircle, MousePointer,
  UserCheck, UserX, Package,
  LucideIcon
} from "lucide-react";

interface SectionType {
  id: string;
  name_he: string;
  name_en: string;
  description_he: string;
  description_en: string;
  icon: LucideIcon;
  color: string;
}

const availableSections: SectionType[] = [
  {
    id: 'hero',
    name_he: 'Hero',
    name_en: 'Hero Section',
    description_he: 'כותרת ראשית עם תמונה/וידאו וקריאה לפעולה',
    description_en: 'Main heading with image/video and CTA',
    icon: Heading,
    color: '#8B5CF6',
  },
  {
    id: 'pain_points',
    name_he: 'נקודות כאב',
    name_en: 'Pain Points',
    description_he: 'הצג את הבעיות שהלקוח מתמודד איתן',
    description_en: 'Show problems your customer faces',
    icon: AlertTriangle,
    color: '#EF4444',
  },
  {
    id: 'process',
    name_he: 'תהליך',
    name_en: 'Process Steps',
    description_he: 'שלבי העבודה או התהליך',
    description_en: 'Work or process steps',
    icon: ListOrdered,
    color: '#3B82F6',
  },
  {
    id: 'benefits',
    name_he: 'יתרונות',
    name_en: 'Benefits',
    description_he: 'מה הלקוח מקבל',
    description_en: 'What the customer gets',
    icon: Gift,
    color: '#10B981',
  },
  {
    id: 'for_who',
    name_he: 'למי זה מתאים',
    name_en: 'For Who',
    description_he: 'קהל היעד האידיאלי',
    description_en: 'Ideal target audience',
    icon: UserCheck,
    color: '#22C55E',
  },
  {
    id: 'not_for_who',
    name_he: 'למי לא מתאים',
    name_en: 'Not For Who',
    description_he: 'למי זה לא מתאים',
    description_en: 'Who this is not for',
    icon: UserX,
    color: '#F97316',
  },
  {
    id: 'includes',
    name_he: 'מה כולל',
    name_en: 'What\'s Included',
    description_he: 'רשימת מה שכלול בחבילה',
    description_en: 'List of what\'s included',
    icon: Package,
    color: '#6366F1',
  },
  {
    id: 'testimonials',
    name_he: 'המלצות',
    name_en: 'Testimonials',
    description_he: 'עדויות מלקוחות מרוצים',
    description_en: 'Testimonials from happy customers',
    icon: MessageSquareQuote,
    color: '#EC4899',
  },
  {
    id: 'faq',
    name_he: 'שאלות נפוצות',
    name_en: 'FAQ',
    description_he: 'שאלות ותשובות נפוצות',
    description_en: 'Frequently asked questions',
    icon: HelpCircle,
    color: '#F59E0B',
  },
  {
    id: 'cta',
    name_he: 'קריאה לפעולה',
    name_en: 'Call to Action',
    description_he: 'כפתור פעולה סופי',
    description_en: 'Final action button',
    icon: MousePointer,
    color: '#8B5CF6',
  },
];

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSection: (sectionType: string) => void;
  existingSections: string[];
}

export const AddSectionDialog = ({
  open,
  onOpenChange,
  onAddSection,
  existingSections,
}: AddSectionDialogProps) => {
  const { isRTL } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? 'הוסף סעיף חדש' : 'Add New Section'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {availableSections.map((section, index) => {
            const Icon = section.icon;
            const isAlreadyAdded = existingSections.includes(section.id);
            
            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onAddSection(section.id);
                  onOpenChange(false);
                }}
                disabled={isAlreadyAdded && section.id === 'hero'}
                className={`
                  relative p-4 rounded-lg border text-left transition-all
                  ${isAlreadyAdded && section.id === 'hero'
                    ? 'opacity-50 cursor-not-allowed border-muted'
                    : 'hover:border-primary/50 hover:bg-muted/50 cursor-pointer border-border'
                  }
                `}
              >
                {/* Mini Preview */}
                <div 
                  className="w-full h-16 rounded-md mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${section.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: section.color }} />
                </div>

                <h4 className="font-medium text-sm mb-1">
                  {isRTL ? section.name_he : section.name_en}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {isRTL ? section.description_he : section.description_en}
                </p>

                {isAlreadyAdded && (
                  <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2">
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                      {isRTL ? 'קיים' : 'Added'}
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
