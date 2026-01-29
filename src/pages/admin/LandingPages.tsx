import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, Home, Brain, Mic, Layout, Eye, Edit, Copy, 
  MoreVertical, ExternalLink, Trash2, CheckCircle, XCircle, PanelTop
} from "lucide-react";
import { LandingPageDialog } from "@/components/admin/landing/LandingPageDialog";

interface LandingPageListItem {
  id: string;
  slug: string;
  template_type: string;
  title_he: string | null;
  title_en: string | null;
  is_published: boolean;
  is_homepage: boolean;
  view_count: number;
  brand_color: string | null;
  created_at: string;
  updated_at: string;
}

const getTemplateIcon = (type: string) => {
  switch (type) {
    case 'homepage': return Home;
    case 'product': return Brain;
    case 'lead_capture': return Mic;
    default: return Layout;
  }
};

const getTemplateLabel = (type: string, isRTL: boolean) => {
  const labels: Record<string, { he: string; en: string }> = {
    homepage: { he: 'דף בית', en: 'Homepage' },
    product: { he: 'מוצר', en: 'Product' },
    lead_capture: { he: 'לכידת לידים', en: 'Lead Capture' },
    custom: { he: 'מותאם אישית', en: 'Custom' },
  };
  return isRTL ? labels[type]?.he : labels[type]?.en || type;
};

const LandingPages = () => {
  const { t, isRTL, language } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: pages, isLoading } = useQuery({
    queryKey: ['landing-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .order('is_homepage', { ascending: false })
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as LandingPageListItem[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      toast({ title: isRTL ? 'הדף נמחק בהצלחה' : 'Page deleted successfully' });
    },
    onError: () => {
      toast({ 
        title: isRTL ? 'שגיאה במחיקת הדף' : 'Error deleting page',
        variant: 'destructive'
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (page: LandingPageListItem) => {
      const { id, created_at, updated_at, is_homepage, ...pageData } = page;
      const newSlug = `${page.slug}-copy-${Date.now()}`;
      
      const { error } = await supabase
        .from('landing_pages')
        .insert({
          ...pageData,
          slug: newSlug,
          title_he: page.title_he ? `${page.title_he} (העתק)` : null,
          title_en: page.title_en ? `${page.title_en} (Copy)` : null,
          is_published: false,
          is_homepage: false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      toast({ title: isRTL ? 'הדף שוכפל בהצלחה' : 'Page duplicated successfully' });
    },
    onError: () => {
      toast({ 
        title: isRTL ? 'שגיאה בשכפול הדף' : 'Error duplicating page',
        variant: 'destructive'
      });
    },
  });

  const handleCreate = () => {
    setSelectedPageId(null);
    setIsCreating(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (page: LandingPageListItem) => {
    setSelectedPageId(page.id);
    setIsCreating(false);
    setIsDialogOpen(true);
  };

  const handlePreview = (page: LandingPageListItem) => {
    const route = page.is_homepage ? '/' : `/lp/${page.slug}`;
    window.open(route, '_blank');
  };

  const getPageTitle = (page: LandingPageListItem) => {
    return language === 'he' ? page.title_he : page.title_en || page.slug;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary hidden sm:flex">
            <PanelTop className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black cyber-glow flex items-center gap-2">
              <PanelTop className="h-6 w-6 sm:hidden text-primary" />
              {isRTL ? "דפי נחיתה" : "Landing Pages"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {isRTL ? "ניהול דפי נחיתה ותבניות" : "Manage landing pages and templates"}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          {isRTL ? 'דף חדש' : 'New Page'}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {pages?.map((page) => {
            const TemplateIcon = getTemplateIcon(page.template_type);
            
            return (
              <Card 
                key={page.id} 
                className="hover:border-primary/50 transition-colors"
                style={{ borderLeftColor: page.brand_color || undefined, borderLeftWidth: 4 }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${page.brand_color}20` || 'var(--primary)' }}
                      >
                        <TemplateIcon 
                          className="w-6 h-6" 
                          style={{ color: page.brand_color || 'var(--primary)' }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg truncate">
                            {getPageTitle(page)}
                          </h3>
                          {page.is_homepage && (
                            <Badge variant="outline" className="text-xs">
                              <Home className="w-3 h-3 mr-1" />
                              {isRTL ? 'ראשי' : 'Home'}
                            </Badge>
                          )}
                          <Badge 
                            variant={page.is_published ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {page.is_published ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {isRTL ? 'פורסם' : 'Published'}
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                {isRTL ? 'טיוטה' : 'Draft'}
                              </>
                            )}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="font-mono">
                            {page.is_homepage ? '/' : `/lp/${page.slug}`}
                          </span>
                          <span>•</span>
                          <span>{getTemplateLabel(page.template_type, isRTL)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {page.view_count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(page)}
                        className="gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {isRTL ? 'תצוגה' : 'Preview'}
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleEdit(page)}
                        className="gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        {isRTL ? 'עריכה' : 'Edit'}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => duplicateMutation.mutate(page)}>
                            <Copy className="w-4 h-4 mr-2" />
                            {isRTL ? 'שכפל' : 'Duplicate'}
                          </DropdownMenuItem>
                          {!page.is_homepage && (
                            <DropdownMenuItem 
                              onClick={() => deleteMutation.mutate(page.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {isRTL ? 'מחק' : 'Delete'}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {pages?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{isRTL ? 'אין דפי נחיתה עדיין' : 'No landing pages yet'}</p>
                <Button onClick={handleCreate} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  {isRTL ? 'צור דף ראשון' : 'Create First Page'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <LandingPageDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        pageId={selectedPageId}
        isCreating={isCreating}
      />
    </div>
  );
};

export default LandingPages;
