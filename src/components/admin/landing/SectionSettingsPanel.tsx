import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, FileText, Palette, Settings } from "lucide-react";
import { SectionEditor } from "./SectionEditor";
import { sectionMeta } from "./BuilderSidebar";

interface SectionSettingsPanelProps {
  sectionType: string;
  pageData: any;
  onUpdate: (field: string, value: any) => void;
  onClose: () => void;
}

export const SectionSettingsPanel = ({
  sectionType,
  pageData,
  onUpdate,
  onClose,
}: SectionSettingsPanelProps) => {
  const { isRTL } = useTranslation();
  const meta = sectionMeta[sectionType];
  const Icon = meta?.icon;

  const renderHeroSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isRTL ? 'כותרת (עברית)' : 'Heading (Hebrew)'}</Label>
          <Textarea
            value={pageData.hero_heading_he || ''}
            onChange={(e) => onUpdate('hero_heading_he', e.target.value)}
            dir="rtl"
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>{isRTL ? 'כותרת (אנגלית)' : 'Heading (English)'}</Label>
          <Textarea
            value={pageData.hero_heading_en || ''}
            onChange={(e) => onUpdate('hero_heading_en', e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isRTL ? 'תת-כותרת (עברית)' : 'Subheading (Hebrew)'}</Label>
          <Textarea
            value={pageData.hero_subheading_he || ''}
            onChange={(e) => onUpdate('hero_subheading_he', e.target.value)}
            dir="rtl"
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>{isRTL ? 'תת-כותרת (אנגלית)' : 'Subheading (English)'}</Label>
          <Textarea
            value={pageData.hero_subheading_en || ''}
            onChange={(e) => onUpdate('hero_subheading_en', e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isRTL ? 'תגית (עברית)' : 'Badge (Hebrew)'}</Label>
          <Input
            value={pageData.hero_badge_text_he || ''}
            onChange={(e) => onUpdate('hero_badge_text_he', e.target.value)}
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label>{isRTL ? 'תגית (אנגלית)' : 'Badge (English)'}</Label>
          <Input
            value={pageData.hero_badge_text_en || ''}
            onChange={(e) => onUpdate('hero_badge_text_en', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isRTL ? 'תמונת Hero' : 'Hero Image URL'}</Label>
          <Input
            value={pageData.hero_image_url || ''}
            onChange={(e) => onUpdate('hero_image_url', e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label>{isRTL ? 'וידאו Hero' : 'Hero Video URL'}</Label>
          <Input
            value={pageData.hero_video_url || ''}
            onChange={(e) => onUpdate('hero_video_url', e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );

  const renderPainPointsSettings = () => (
    <SectionEditor
      title={isRTL ? 'נקודות כאב' : 'Pain Points'}
      items={pageData.pain_points || []}
      onChange={(items) => onUpdate('pain_points', items)}
      fields={[
        { key: 'title_he', label: isRTL ? 'כותרת (עברית)' : 'Title (Hebrew)', type: 'text' },
        { key: 'title_en', label: isRTL ? 'כותרת (אנגלית)' : 'Title (English)', type: 'text' },
        { key: 'description_he', label: isRTL ? 'תיאור (עברית)' : 'Description (Hebrew)', type: 'textarea' },
        { key: 'description_en', label: isRTL ? 'תיאור (אנגלית)' : 'Description (English)', type: 'textarea' },
      ]}
    />
  );

  const renderProcessSettings = () => (
    <SectionEditor
      title={isRTL ? 'שלבי התהליך' : 'Process Steps'}
      items={pageData.process_steps || []}
      onChange={(items) => onUpdate('process_steps', items)}
      fields={[
        { key: 'title_he', label: isRTL ? 'כותרת (עברית)' : 'Title (Hebrew)', type: 'text' },
        { key: 'title_en', label: isRTL ? 'כותרת (אנגלית)' : 'Title (English)', type: 'text' },
        { key: 'description_he', label: isRTL ? 'תיאור (עברית)' : 'Description (Hebrew)', type: 'textarea' },
        { key: 'description_en', label: isRTL ? 'תיאור (אנגלית)' : 'Description (English)', type: 'textarea' },
        { key: 'icon', label: isRTL ? 'אייקון' : 'Icon', type: 'text' },
      ]}
    />
  );

  const renderBenefitsSettings = () => (
    <SectionEditor
      title={isRTL ? 'יתרונות' : 'Benefits'}
      items={pageData.benefits || []}
      onChange={(items) => onUpdate('benefits', items)}
      fields={[
        { key: 'title_he', label: isRTL ? 'כותרת (עברית)' : 'Title (Hebrew)', type: 'text' },
        { key: 'title_en', label: isRTL ? 'כותרת (אנגלית)' : 'Title (English)', type: 'text' },
        { key: 'description_he', label: isRTL ? 'תיאור (עברית)' : 'Description (Hebrew)', type: 'textarea' },
        { key: 'description_en', label: isRTL ? 'תיאור (אנגלית)' : 'Description (English)', type: 'textarea' },
      ]}
    />
  );

  const renderForWhoSettings = () => (
    <div className="space-y-6">
      <SectionEditor
        title={isRTL ? 'למי זה מתאים' : 'For Who'}
        items={pageData.for_who || []}
        onChange={(items) => onUpdate('for_who', items)}
        fields={[
          { key: 'text_he', label: isRTL ? 'טקסט (עברית)' : 'Text (Hebrew)', type: 'text' },
          { key: 'text_en', label: isRTL ? 'טקסט (אנגלית)' : 'Text (English)', type: 'text' },
        ]}
      />
      <SectionEditor
        title={isRTL ? 'למי לא מתאים' : 'Not For Who'}
        items={pageData.not_for_who || []}
        onChange={(items) => onUpdate('not_for_who', items)}
        fields={[
          { key: 'text_he', label: isRTL ? 'טקסט (עברית)' : 'Text (Hebrew)', type: 'text' },
          { key: 'text_en', label: isRTL ? 'טקסט (אנגלית)' : 'Text (English)', type: 'text' },
        ]}
      />
    </div>
  );

  const renderTestimonialsSettings = () => (
    <SectionEditor
      title={isRTL ? 'המלצות' : 'Testimonials'}
      items={pageData.testimonials || []}
      onChange={(items) => onUpdate('testimonials', items)}
      fields={[
        { key: 'name', label: isRTL ? 'שם' : 'Name', type: 'text' },
        { key: 'role', label: isRTL ? 'תפקיד' : 'Role', type: 'text' },
        { key: 'content_he', label: isRTL ? 'תוכן (עברית)' : 'Content (Hebrew)', type: 'textarea' },
        { key: 'content_en', label: isRTL ? 'תוכן (אנגלית)' : 'Content (English)', type: 'textarea' },
        { key: 'avatar_url', label: isRTL ? 'תמונה' : 'Avatar URL', type: 'text' },
      ]}
    />
  );

  const renderFAQSettings = () => (
    <SectionEditor
      title={isRTL ? 'שאלות נפוצות' : 'FAQs'}
      items={pageData.faqs || []}
      onChange={(items) => onUpdate('faqs', items)}
      fields={[
        { key: 'question_he', label: isRTL ? 'שאלה (עברית)' : 'Question (Hebrew)', type: 'text' },
        { key: 'question_en', label: isRTL ? 'שאלה (אנגלית)' : 'Question (English)', type: 'text' },
        { key: 'answer_he', label: isRTL ? 'תשובה (עברית)' : 'Answer (Hebrew)', type: 'textarea' },
        { key: 'answer_en', label: isRTL ? 'תשובה (אנגלית)' : 'Answer (English)', type: 'textarea' },
      ]}
    />
  );

  const renderCTASettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isRTL ? 'טקסט כפתור (עברית)' : 'Button Text (Hebrew)'}</Label>
          <Input
            value={pageData.primary_cta_text_he || ''}
            onChange={(e) => onUpdate('primary_cta_text_he', e.target.value)}
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label>{isRTL ? 'טקסט כפתור (אנגלית)' : 'Button Text (English)'}</Label>
          <Input
            value={pageData.primary_cta_text_en || ''}
            onChange={(e) => onUpdate('primary_cta_text_en', e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{isRTL ? 'קישור' : 'Link'}</Label>
        <Input
          value={pageData.primary_cta_link || ''}
          onChange={(e) => onUpdate('primary_cta_link', e.target.value)}
          placeholder="/contact or https://..."
        />
      </div>
    </div>
  );

  const renderContentByType = () => {
    switch (sectionType) {
      case 'hero': return renderHeroSettings();
      case 'pain_points': return renderPainPointsSettings();
      case 'process': return renderProcessSettings();
      case 'benefits': return renderBenefitsSettings();
      case 'for_who': 
      case 'not_for_who': return renderForWhoSettings();
      case 'testimonials': return renderTestimonialsSettings();
      case 'faq': return renderFAQSettings();
      case 'cta': return renderCTASettings();
      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            {isRTL ? 'אין הגדרות זמינות לסעיף זה' : 'No settings available for this section'}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          {meta && Icon && (
            <div 
              className="p-1.5 rounded-md"
              style={{ backgroundColor: `${meta.color}20` }}
            >
              <Icon className="w-4 h-4" style={{ color: meta.color }} />
            </div>
          )}
          <h3 className="font-semibold">
            {meta ? (isRTL ? meta.name_he : meta.name_en) : sectionType}
          </h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="content">
            <TabsList className="mb-4">
              <TabsTrigger value="content" className="gap-1 text-xs">
                <FileText className="w-3 h-3" />
                {isRTL ? 'תוכן' : 'Content'}
              </TabsTrigger>
              <TabsTrigger value="style" className="gap-1 text-xs">
                <Palette className="w-3 h-3" />
                {isRTL ? 'עיצוב' : 'Style'}
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-1 text-xs">
                <Settings className="w-3 h-3" />
                {isRTL ? 'מתקדם' : 'Advanced'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              {renderContentByType()}
            </TabsContent>

            <TabsContent value="style">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'צבע מותג' : 'Brand Color'}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={pageData.brand_color || '#8B5CF6'}
                      onChange={(e) => onUpdate('brand_color', e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={pageData.brand_color || '#8B5CF6'}
                      onChange={(e) => onUpdate('brand_color', e.target.value)}
                      placeholder="#8B5CF6"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'CSS מותאם אישית' : 'Custom CSS'}</Label>
                  <Textarea
                    value={pageData.custom_css || ''}
                    onChange={(e) => onUpdate('custom_css', e.target.value)}
                    placeholder=".section { ... }"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};
