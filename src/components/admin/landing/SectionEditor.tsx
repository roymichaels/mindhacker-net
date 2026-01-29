import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
}

interface SectionEditorProps {
  title: string;
  items: Record<string, any>[];
  onChange: (items: Record<string, any>[]) => void;
  fields: FieldConfig[];
}

export const SectionEditor = ({
  title,
  items,
  onChange,
  fields,
}: SectionEditorProps) => {
  const { isRTL } = useTranslation();
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const addItem = () => {
    const newItem: Record<string, any> = {};
    fields.forEach(field => {
      newItem[field.key] = '';
    });
    onChange([...items, newItem]);
    setOpenItems(prev => ({ ...prev, [items.length]: true }));
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const updateItem = (index: number, key: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    onChange(newItems);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onChange(newItems);
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getItemPreview = (item: Record<string, any>) => {
    const titleField = fields.find(f => f.key.includes('title') || f.key.includes('question') || f.key.includes('text'));
    if (titleField) {
      const heValue = item[titleField.key] || item[titleField.key.replace('_en', '_he')];
      const enValue = item[titleField.key.replace('_he', '_en')] || item[titleField.key];
      return isRTL ? heValue : enValue || heValue || (isRTL ? 'פריט ללא כותרת' : 'Untitled item');
    }
    return isRTL ? 'פריט ללא כותרת' : 'Untitled item';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            {isRTL ? 'הוסף' : 'Add'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {isRTL ? 'אין פריטים. לחץ על "הוסף" כדי להוסיף פריט חדש.' : 'No items. Click "Add" to add a new item.'}
          </p>
        ) : (
          items.map((item, index) => (
            <Collapsible
              key={index}
              open={openItems[index]}
              onOpenChange={() => toggleItem(index)}
            >
              <div className={cn(
                "border rounded-lg",
                openItems[index] ? "border-primary/50" : "border-border"
              )}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <span className="flex-1 text-sm truncate">
                      {getItemPreview(item)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}
                        disabled={index === items.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); removeItem(index); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-3 pt-0 space-y-3 border-t">
                    {fields.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs">{field.label}</Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            value={item[field.key] || ''}
                            onChange={(e) => updateItem(index, field.key, e.target.value)}
                            rows={2}
                            dir={field.key.includes('_he') ? 'rtl' : 'ltr'}
                            className="text-sm"
                          />
                        ) : (
                          <Input
                            type={field.type}
                            value={item[field.key] || ''}
                            onChange={(e) => updateItem(index, field.key, e.target.value)}
                            dir={field.key.includes('_he') ? 'rtl' : 'ltr'}
                            className="text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))
        )}
      </CardContent>
    </Card>
  );
};
