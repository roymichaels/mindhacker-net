import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Brain, Mic, Layout, ArrowRight, Sparkles, LucideIcon } from "lucide-react";

interface Template {
  id: string;
  type: string;
  name_he: string;
  name_en: string;
  description_he: string;
  description_en: string;
  icon: LucideIcon;
  color: string;
  sections: string[];
}

const templates: Template[] = [
  {
    id: 'homepage',
    type: 'homepage',
    name_he: 'דף בית',
    name_en: 'Homepage',
    description_he: 'Hero עם פורטרט, כרטיסי מוצרים, ועדויות',
    description_en: 'Hero with portrait, product cards, and testimonials',
    icon: Home,
    color: '#8B5CF6',
    sections: ['hero', 'products', 'about', 'testimonials', 'faq'],
  },
  {
    id: 'product',
    type: 'product',
    name_he: 'מוצר / שירות',
    name_en: 'Product / Service',
    description_he: 'משפך מלא עם נקודות כאב, תהליך, יתרונות ו-CTA',
    description_en: 'Full funnel with pain points, process, benefits & CTA',
    icon: Brain,
    color: '#EC4899',
    sections: ['hero', 'pain_points', 'process', 'benefits', 'for_who', 'testimonials', 'faq', 'cta'],
  },
  {
    id: 'lead_capture',
    type: 'lead_capture',
    name_he: 'לכידת לידים',
    name_en: 'Lead Capture',
    description_he: 'טופס פשוט עם הצעת ערך וסימני אמון',
    description_en: 'Simple form with value proposition and trust signals',
    icon: Mic,
    color: '#10B981',
    sections: ['hero', 'benefits', 'cta'],
  },
  {
    id: 'custom',
    type: 'custom',
    name_he: 'דף ריק',
    name_en: 'Blank Page',
    description_he: 'התחל מאפס עם בחירת סעיפים מלאה',
    description_en: 'Start from scratch with full section selection',
    icon: Layout,
    color: '#F59E0B',
    sections: [],
  },
];

interface TemplateGalleryProps {
  onSelect: (template: Template) => void;
}

// Mini preview component for each template type
const TemplatePreview = ({ template }: { template: Template }) => {
  const { color } = template;
  
  return (
    <div className="w-full h-40 rounded-lg overflow-hidden bg-background/50 border border-border/50 p-3 flex flex-col gap-2 relative">
      {/* Mini Hero */}
      <div 
        className="h-12 rounded flex items-center justify-between px-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <div className="flex flex-col gap-1">
          <div 
            className="h-2 w-16 rounded"
            style={{ backgroundColor: color }}
          />
          <div className="h-1.5 w-24 rounded bg-muted" />
        </div>
        <div 
          className="h-6 w-6 rounded-full"
          style={{ backgroundColor: `${color}40` }}
        />
      </div>
      
      {/* Mini Content Blocks */}
      <div className="flex-1 flex gap-2">
        {template.type === 'homepage' && (
          <>
            <div className="flex-1 rounded bg-muted/50 p-2 flex flex-col gap-1">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-1 w-3/4 rounded bg-muted/50" />
            </div>
            <div className="flex-1 rounded bg-muted/50 p-2 flex flex-col gap-1">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-1 w-3/4 rounded bg-muted/50" />
            </div>
            <div className="flex-1 rounded bg-muted/50 p-2 flex flex-col gap-1">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-1 w-3/4 rounded bg-muted/50" />
            </div>
          </>
        )}
        
        {template.type === 'product' && (
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex gap-1">
              <div className="h-6 flex-1 rounded bg-destructive/20" />
              <div className="h-6 flex-1 rounded bg-destructive/20" />
              <div className="h-6 flex-1 rounded bg-destructive/20" />
            </div>
            <div className="flex gap-1">
              <div 
                className="h-6 flex-1 rounded flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
              >
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              </div>
              <div 
                className="h-6 flex-1 rounded flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
              >
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              </div>
              <div 
                className="h-6 flex-1 rounded flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
              >
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              </div>
            </div>
          </div>
        )}
        
        {template.type === 'lead_capture' && (
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: `${color}50` }}
            >
              <div 
                className="w-12 h-6 rounded"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        )}
        
        {template.type === 'custom' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Sparkles className="w-6 h-6" />
              <div className="h-1.5 w-12 rounded bg-muted" />
            </div>
          </div>
        )}
      </div>
      
      {/* Mini CTA */}
      {template.type !== 'custom' && (
        <div 
          className="h-5 rounded flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <div className="h-1.5 w-8 rounded bg-white/50" />
        </div>
      )}
    </div>
  );
};

export const TemplateGallery = ({ onSelect }: TemplateGalleryProps) => {
  const { isRTL } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {templates.map((template, index) => {
        const Icon = template.icon;
        
        return (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="group relative overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer"
              onClick={() => onSelect(template)}
            >
              {/* Gradient overlay on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${template.color}, transparent)` }}
              />
              
              <div className="p-4 space-y-4">
                {/* Preview */}
                <TemplatePreview template={template} />
                
                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${template.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: template.color }} />
                    </div>
                    <h3 className="font-semibold">
                      {isRTL ? template.name_he : template.name_en}
                    </h3>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {isRTL ? template.description_he : template.description_en}
                  </p>
                </div>
                
                {/* Action */}
                <Button 
                  variant="outline" 
                  className="w-full gap-2 group-hover:border-primary group-hover:text-primary transition-colors"
                >
                  {isRTL ? 'השתמש בתבנית' : 'Use Template'}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export type { Template };
