import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { ArrowLeft, Save, Eye, Send, Settings, Loader2 } from "lucide-react";
import { BuilderSidebar, SectionItem } from "@/components/admin/landing/BuilderSidebar";
import { BuilderPreview } from "@/components/admin/landing/BuilderPreview";
import { SectionSettingsPanel } from "@/components/admin/landing/SectionSettingsPanel";
import { AddSectionDialog } from "@/components/admin/landing/AddSectionDialog";

const LandingPageBuilder = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const templateType = searchParams.get('template') || 'product';
  const isNew = !id;

  // State
  const [pageData, setPageData] = useState<any>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch page data
  const { data: fetchedPage, isLoading } = useQuery({
    queryKey: ['landing-page-builder', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Initialize page data
  useEffect(() => {
    if (fetchedPage) {
      setPageData(fetchedPage);
      // Convert sections_order to SectionItem array
      const sectionsOrder = Array.isArray(fetchedPage.sections_order) 
        ? fetchedPage.sections_order 
        : [];
      setSections(sectionsOrder.map((type: string, index: number) => ({
        id: `${type}-${index}`,
        type,
        enabled: true,
      })));
    } else if (isNew) {
      // Default template data
      const defaultSections = getDefaultSections(templateType);
      setPageData({
        slug: '',
        template_type: templateType,
        title_he: '',
        title_en: '',
        sections_order: defaultSections,
        brand_color: '#8B5CF6',
        is_published: false,
        is_homepage: false,
        pain_points: [],
        process_steps: [],
        benefits: [],
        for_who: [],
        not_for_who: [],
        testimonials: [],
        faqs: [],
        includes: [],
      });
      setSections(defaultSections.map((type: string, index: number) => ({
        id: `${type}-${index}`,
        type,
        enabled: true,
      })));
    }
  }, [fetchedPage, isNew, templateType]);

  const getDefaultSections = (type: string): string[] => {
    switch (type) {
      case 'homepage':
        return ['hero', 'benefits', 'testimonials', 'faq', 'cta'];
      case 'product':
        return ['hero', 'pain_points', 'process', 'benefits', 'for_who', 'testimonials', 'faq', 'cta'];
      case 'lead_capture':
        return ['hero', 'benefits', 'cta'];
      default:
        return ['hero'];
    }
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const sectionsOrder = sections.filter(s => s.enabled).map(s => s.type);
      const saveData = {
        ...data,
        sections_order: sectionsOrder,
      };

      if (isNew) {
        const { data: newPage, error } = await supabase
          .from('landing_pages')
          .insert(saveData)
          .select()
          .single();
        if (error) throw error;
        return newPage;
      } else {
        const { error } = await supabase
          .from('landing_pages')
          .update(saveData)
          .eq('id', id);
        if (error) throw error;
        return { ...saveData, id };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['landing-page-builder', id] });
      setHasChanges(false);
      toast({ title: isRTL ? 'נשמר בהצלחה' : 'Saved successfully' });
      
      if (isNew && data?.id) {
        navigate(`/admin/landing-pages/edit/${data.id}`, { replace: true });
      }
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({ 
        title: isRTL ? 'שגיאה בשמירה' : 'Error saving',
        variant: 'destructive'
      });
    },
  });

  // Update page data
  const updatePageData = useCallback((field: string, value: any) => {
    setPageData((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  };

  // Section actions
  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    ));
    setHasChanges(true);
  };

  const duplicateSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const newSection: SectionItem = {
        id: `${section.type}-${Date.now()}`,
        type: section.type,
        enabled: true,
      };
      const index = sections.findIndex(s => s.id === sectionId);
      const newSections = [...sections];
      newSections.splice(index + 1, 0, newSection);
      setSections(newSections);
      setHasChanges(true);
    }
  };

  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
    setHasChanges(true);
  };

  const addSection = (sectionType: string) => {
    const newSection: SectionItem = {
      id: `${sectionType}-${Date.now()}`,
      type: sectionType,
      enabled: true,
    };
    setSections(prev => [...prev, newSection]);
    setHasChanges(true);
  };

  // Get selected section type for settings panel
  const selectedSectionType = selectedSection 
    ? sections.find(s => s.id === selectedSection)?.type 
    : null;

  const handleSave = (publish = false) => {
    if (publish) {
      updatePageData('is_published', true);
    }
    saveMutation.mutate(pageData);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">{isRTL ? 'טוען...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin/landing-pages')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {isRTL ? 'חזרה' : 'Back'}
          </Button>
          
          <div className="h-6 w-px bg-border" />
          
          <div>
            <h1 className="font-semibold text-sm">
              {isNew 
                ? (isRTL ? 'דף נחיתה חדש' : 'New Landing Page')
                : (pageData?.title_he || pageData?.title_en || pageData?.slug || (isRTL ? 'עריכת דף' : 'Edit Page'))
              }
            </h1>
            {!isNew && pageData?.slug && (
              <p className="text-xs text-muted-foreground font-mono">
                /{pageData.is_homepage ? '' : `lp/${pageData.slug}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-muted-foreground">
              {isRTL ? 'שינויים לא נשמרו' : 'Unsaved changes'}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            {isRTL ? 'הגדרות' : 'Settings'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const route = pageData?.is_homepage ? '/' : `/lp/${pageData?.slug || 'preview'}`;
              window.open(route, '_blank');
            }}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            {isRTL ? 'תצוגה מקדימה' : 'Preview'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={saveMutation.isPending}
            className="gap-2"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isRTL ? 'שמור' : 'Save'}
          </Button>

          <Button
            size="sm"
            onClick={() => handleSave(true)}
            disabled={saveMutation.isPending}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {isRTL ? 'פרסם' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <BuilderSidebar
                  sections={sections}
                  selectedSection={selectedSection}
                  onSelectSection={setSelectedSection}
                  onReorder={setSections}
                  onToggleSection={toggleSection}
                  onDuplicateSection={duplicateSection}
                  onDeleteSection={deleteSection}
                  onAddSection={() => setShowAddSection(true)}
                  brandColor={pageData?.brand_color}
                />
              </SortableContext>
            </DndContext>
          </ResizablePanel>

          <ResizableHandle />

          {/* Preview */}
          <ResizablePanel defaultSize={selectedSectionType ? 50 : 80}>
            <BuilderPreview
              pageData={pageData}
              selectedSection={selectedSection}
              onSelectSection={setSelectedSection}
            />
          </ResizablePanel>

          {/* Settings Panel */}
          {selectedSectionType && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
                <SectionSettingsPanel
                  sectionType={selectedSectionType}
                  pageData={pageData}
                  onUpdate={updatePageData}
                  onClose={() => setSelectedSection(null)}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Add Section Dialog */}
      <AddSectionDialog
        open={showAddSection}
        onOpenChange={setShowAddSection}
        onAddSection={addSection}
        existingSections={sections.map(s => s.type)}
      />
    </div>
  );
};

export default LandingPageBuilder;
