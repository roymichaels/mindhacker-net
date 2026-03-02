import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useMyCoachProfile, useCoachServices, useCoachOffers } from '@/domain/coaches';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ShoppingBag, Package, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOfferColors } from '@/lib/productColors';
import { toast } from 'sonner';

const CoachProductsTab = () => {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { data: myProfile, isLoading: loadingProfile } = useMyCoachProfile();
  const { data: offers, isLoading: loadingOffers } = useCoachOffers(myProfile?.id);
  const { data: services, isLoading: loadingServices } = useCoachServices(myProfile?.id);
  const queryClient = useQueryClient();

  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ title: '', title_en: '', description: '', price: '', duration_minutes: '' });

  const isLoading = loadingProfile || loadingOffers || loadingServices;

  const createServiceMutation = useMutation({
    mutationFn: async () => {
      if (!myProfile?.id) throw new Error('No coach profile');
      const { error } = await supabase.from('practitioner_services').insert({
        practitioner_id: myProfile.id,
        title: serviceForm.title,
        title_en: serviceForm.title_en || null,
        description: serviceForm.description || null,
        price: parseFloat(serviceForm.price) || 0,
        duration_minutes: parseInt(serviceForm.duration_minutes) || 60,
        is_active: true,
        order_index: (services?.length || 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-services'] });
      toast.success(isHe ? 'שירות נוצר!' : 'Service created!');
      setAddServiceOpen(false);
      setServiceForm({ title: '', title_en: '', description: '', price: '', duration_minutes: '' });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('practitioner_services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-services'] });
      toast.success(isHe ? 'שירות נמחק' : 'Service deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleServiceMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('practitioner_services').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-services'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{isHe ? 'מוצרים ושירותים' : 'Products & Services'}</h2>
          <p className="text-sm text-muted-foreground">{isHe ? 'צרו ונהלו שירותים והצעות' : 'Create and manage services and offers'}</p>
        </div>
        <Dialog open={addServiceOpen} onOpenChange={setAddServiceOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 me-2" />{isHe ? 'שירות חדש' : 'New Service'}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{isHe ? 'צור שירות חדש' : 'Create New Service'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>{isHe ? 'שם (עברית)' : 'Name (Hebrew)'}</Label><Input value={serviceForm.title} onChange={e => setServiceForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>{isHe ? 'שם (English)' : 'Name (English)'}</Label><Input value={serviceForm.title_en} onChange={e => setServiceForm(p => ({ ...p, title_en: e.target.value }))} /></div>
              <div><Label>{isHe ? 'תיאור' : 'Description'}</Label><Textarea value={serviceForm.description} onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{isHe ? 'מחיר (₪)' : 'Price (₪)'}</Label><Input type="number" value={serviceForm.price} onChange={e => setServiceForm(p => ({ ...p, price: e.target.value }))} /></div>
                <div><Label>{isHe ? 'משך (דקות)' : 'Duration (min)'}</Label><Input type="number" value={serviceForm.duration_minutes} onChange={e => setServiceForm(p => ({ ...p, duration_minutes: e.target.value }))} /></div>
              </div>
              <Button onClick={() => createServiceMutation.mutate()} disabled={!serviceForm.title || createServiceMutation.isPending} className="w-full">
                {createServiceMutation.isPending ? '...' : isHe ? 'צור שירות' : 'Create Service'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">{isHe ? 'שירותים' : 'Services'}</p>
          <p className="text-2xl font-bold">{services?.length || 0}</p>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">{isHe ? 'הצעות' : 'Offers'}</p>
          <p className="text-2xl font-bold">{offers?.length || 0}</p>
        </div>
      </div>

      {/* Services */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          {isHe ? 'השירותים שלי' : 'My Services'}
        </h3>
        {services && services.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service: any) => (
              <Card key={service.id} className="bg-card/80 backdrop-blur-sm rounded-2xl border-border/50 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base truncate">{isHe ? service.title : (service.title_en || service.title)}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><MoreVertical className="h-3.5 w-3.5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleServiceMutation.mutate({ id: service.id, is_active: !service.is_active })}>
                          <Edit className="h-4 w-4 me-2" />{service.is_active ? (isHe ? 'השבת' : 'Deactivate') : (isHe ? 'הפעל' : 'Activate')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteServiceMutation.mutate(service.id)}>
                          <Trash2 className="h-4 w-4 me-2" />{isHe ? 'מחק' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={service.is_active ? 'default' : 'secondary'}>
                      {service.is_active ? (isHe ? 'פעיל' : 'Active') : (isHe ? 'לא פעיל' : 'Inactive')}
                    </Badge>
                    <span className="font-bold">₪{service.price}</span>
                    {service.duration_minutes && <span className="text-muted-foreground">• {service.duration_minutes} min</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {isHe ? 'אין שירותים עדיין — צרו את הראשון!' : 'No services yet — create your first one!'}
          </div>
        )}
      </div>

      {/* Offers */}
      {offers && offers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {isHe ? 'ההצעות שלי' : 'My Offers'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer: any) => {
              const colors = getOfferColors(offer.brand_color);
              const title = isHe ? offer.title : (offer.title_en || offer.title);
              return (
                <Card key={offer.id} className={cn("relative overflow-hidden", `border-2 ${colors.border}/30`)}>
                  <div className={cn("absolute top-0 left-0 right-0 h-1", colors.bg)} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base truncate">{title}</CardTitle>
                      <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                        {offer.status === 'active' ? (isHe ? 'פעיל' : 'Active') : (isHe ? 'טיוטה' : 'Draft')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <span className={cn("text-lg font-bold", colors.text)}>
                      {offer.is_free ? (isHe ? 'חינם' : 'Free') : `₪${offer.price}`}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state when nothing exists */}
      {(!services?.length && !offers?.length) && (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{isHe ? 'אין מוצרים עדיין' : 'No Products Yet'}</h3>
            <p className="text-muted-foreground">{isHe ? 'צרו שירות חדש כדי להתחיל' : 'Create a new service to get started'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoachProductsTab;
