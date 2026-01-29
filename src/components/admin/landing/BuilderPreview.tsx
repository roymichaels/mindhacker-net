import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Smartphone, Tablet, Monitor, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DynamicHero,
  DynamicPainPoints,
  DynamicProcess,
  DynamicBenefits,
  DynamicForWho,
  DynamicTestimonials,
  DynamicFAQ,
  DynamicCTA,
} from "@/components/landing";

interface BuilderPreviewProps {
  pageData: any;
  selectedSection: string | null;
  onSelectSection: (id: string) => void;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

const deviceWidths: Record<DeviceType, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
};

export const BuilderPreview = ({
  pageData,
  selectedSection,
  onSelectSection,
}: BuilderPreviewProps) => {
  const { isRTL, language } = useTranslation();
  const [device, setDevice] = useState<DeviceType>('desktop');

  const sectionsOrder = useMemo(() => {
    if (!pageData?.sections_order || !Array.isArray(pageData.sections_order)) {
      return [];
    }
    return pageData.sections_order;
  }, [pageData?.sections_order]);

  const renderSection = (sectionType: string, index: number) => {
    const sectionId = `${sectionType}-${index}`;
    const isSelected = selectedSection === sectionId;

    const wrapperClass = cn(
      "relative transition-all duration-200 cursor-pointer",
      isSelected && "ring-2 ring-primary ring-offset-2 rounded-lg"
    );

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectSection(sectionId);
    };

    const sectionContent = (() => {
      switch (sectionType) {
        case 'hero':
          return (
            <DynamicHero
              heading_he={pageData.hero_heading_he}
              heading_en={pageData.hero_heading_en}
              subheading_he={pageData.hero_subheading_he}
              subheading_en={pageData.hero_subheading_en}
              badge_text_he={pageData.hero_badge_text_he}
              badge_text_en={pageData.hero_badge_text_en}
              image_url={pageData.hero_image_url}
              video_url={pageData.hero_video_url}
              cta_text_he={pageData.primary_cta_text_he}
              cta_text_en={pageData.primary_cta_text_en}
              cta_link={pageData.primary_cta_link}
              brand_color={pageData.brand_color}
            />
          );
        case 'pain_points':
          return <DynamicPainPoints items={pageData.pain_points || []} brand_color={pageData.brand_color} />;
        case 'process':
          return <DynamicProcess items={pageData.process_steps || []} brand_color={pageData.brand_color} />;
        case 'benefits':
          return <DynamicBenefits items={pageData.benefits || []} brand_color={pageData.brand_color} />;
        case 'for_who':
          return <DynamicForWho for_who={pageData.for_who || []} not_for_who={pageData.not_for_who || []} brand_color={pageData.brand_color} />;
        case 'testimonials':
          return <DynamicTestimonials items={pageData.testimonials || []} brand_color={pageData.brand_color} />;
        case 'faq':
          return <DynamicFAQ items={pageData.faqs || []} brand_color={pageData.brand_color} />;
        case 'cta':
          return (
            <DynamicCTA
              section_title_he={pageData.cta_heading_he}
              section_title_en={pageData.cta_heading_en}
              section_subtitle_he={pageData.cta_subheading_he}
              section_subtitle_en={pageData.cta_subheading_en}
              cta_text_he={pageData.primary_cta_text_he}
              cta_text_en={pageData.primary_cta_text_en}
              cta_link={pageData.primary_cta_link}
              brand_color={pageData.brand_color}
            />
          );
        default:
          return (
            <div className="p-8 text-center text-muted-foreground">
              {isRTL ? `סעיף לא מוכר: ${sectionType}` : `Unknown section: ${sectionType}`}
            </div>
          );
      }
    })();

    return (
      <div 
        key={sectionId} 
        className={wrapperClass}
        onClick={handleClick}
      >
        {/* Section Type Label (shown on hover) */}
        <div className="absolute -top-6 left-2 rtl:left-auto rtl:right-2 text-xs font-medium text-primary opacity-0 hover:opacity-100 transition-opacity z-10 bg-background/80 px-2 py-1 rounded">
          {sectionType.replace('_', ' ').toUpperCase()}
        </div>
        {sectionContent}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Device Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={device === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setDevice('mobile')}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          <Button
            variant={device === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setDevice('tablet')}
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            variant={device === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setDevice('desktop')}
          >
            <Monitor className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{deviceWidths[device]}px</span>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs h-8"
            onClick={() => {
              const route = pageData.is_homepage ? '/' : `/lp/${pageData.slug}`;
              window.open(route, '_blank');
            }}
          >
            <ExternalLink className="w-3 h-3" />
            {isRTL ? 'פתח בחלון חדש' : 'Open in new tab'}
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <ScrollArea className="flex-1">
        <div className="flex justify-center py-6 px-4">
          <div 
            className={cn(
              "bg-background rounded-lg border border-border shadow-lg overflow-hidden transition-all duration-300",
              device === 'mobile' && "max-w-[375px]",
              device === 'tablet' && "max-w-[768px]",
              device === 'desktop' && "max-w-[1280px] w-full"
            )}
            style={{
              minHeight: '600px',
            }}
          >
            {/* Simulated Browser Chrome */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-flex items-center gap-1 bg-background/80 rounded px-3 py-1 text-xs text-muted-foreground">
                  {pageData?.is_homepage ? 'example.com' : `example.com/lp/${pageData?.slug || 'preview'}`}
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div 
              className="relative"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {sectionsOrder.length > 0 ? (
                sectionsOrder.map((sectionType: string, index: number) => 
                  renderSection(sectionType, index)
                )
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <Monitor className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">
                        {isRTL ? 'אין סעיפים עדיין' : 'No sections yet'}
                      </h3>
                      <p className="text-sm">
                        {isRTL ? 'הוסף סעיפים מהסרגל הצדדי' : 'Add sections from the sidebar'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
