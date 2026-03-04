/**
 * @page Admin > Coaches
 * @purpose Manage practitioners/coaches — view, edit status, toggle featured/verified
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Search, Star, Shield, Users, Edit, ExternalLink, Ticket } from 'lucide-react';
import AdminCouponsPanel from '@/components/admin/AdminCouponsPanel';

interface Coach {
  id: string;
  user_id: string;
  display_name: string;
  display_name_en: string | null;
  title: string;
  title_en: string | null;
  bio: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  slug: string;
  status: string | null;
  is_featured: boolean | null;
  is_verified: boolean | null;
  rating: number | null;
  reviews_count: number | null;
  clients_count: number | null;
  commission_rate: number | null;
  whatsapp: string | null;
  calendly_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  country: string | null;
  languages: string[] | null;
  created_at: string | null;
}

export default function AdminCoaches() {
  const { language } = useLanguage();
  const isHe = language === 'he';
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  const { data: coaches, isLoading } = useQuery({
    queryKey: ['admin-coaches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practitioners')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Coach[];
    },
  });

  const updateCoach = useMutation({
    mutationFn: async (coach: Partial<Coach> & { id: string }) => {
      const { id, ...updates } = coach;
      const { error } = await supabase.from('practitioners').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coaches'] });
      toast.success(isHe ? 'המאמן עודכן בהצלחה' : 'Coach updated successfully');
      setEditingCoach(null);
    },
    onError: () => {
      toast.error(isHe ? 'שגיאה בעדכון' : 'Update failed');
    },
  });

  const toggleField = (id: string, field: 'is_featured' | 'is_verified', current: boolean | null) => {
    updateCoach.mutate({ id, [field]: !current });
  };

  const filtered = coaches?.filter(c => {
    const matchSearch = !search || 
      c.display_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.display_name_en?.toLowerCase().includes(search.toLowerCase())) ||
      c.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6" dir={isHe ? 'rtl' : 'ltr'}>
      <Tabs defaultValue="coaches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coaches" className="gap-1">
            <Users className="h-4 w-4" />
            {isHe ? 'מאמנים' : 'Coaches'}
          </TabsTrigger>
          <TabsTrigger value="coupons" className="gap-1">
            <Ticket className="h-4 w-4" />
            {isHe ? 'קופונים' : 'Coupons'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coupons">
          <AdminCouponsPanel />
        </TabsContent>

        <TabsContent value="coaches">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{isHe ? 'ניהול מאמנים' : 'Coaches Management'}</h2>
        <Badge variant="secondary" className="text-sm">
          {coaches?.length || 0} {isHe ? 'מאמנים' : 'coaches'}
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isHe ? 'חיפוש מאמן...' : 'Search coach...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isHe ? 'כל הסטטוסים' : 'All statuses'}</SelectItem>
            <SelectItem value="active">{isHe ? 'פעיל' : 'Active'}</SelectItem>
            <SelectItem value="pending">{isHe ? 'ממתין' : 'Pending'}</SelectItem>
            <SelectItem value="inactive">{isHe ? 'לא פעיל' : 'Inactive'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Coaches Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">{isHe ? 'טוען...' : 'Loading...'}</div>
      ) : !filtered?.length ? (
        <div className="text-center py-12 text-muted-foreground">{isHe ? 'לא נמצאו מאמנים' : 'No coaches found'}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(coach => (
            <Card key={coach.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {coach.avatar_url ? (
                    <img src={coach.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                      {coach.display_name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {isHe ? coach.display_name : (coach.display_name_en || coach.display_name)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      {isHe ? coach.title : (coach.title_en || coach.title)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">/{coach.slug}</p>
                  </div>
                  <Badge variant={coach.status === 'active' ? 'default' : 'secondary'} className="shrink-0">
                    {coach.status || 'unknown'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Stats */}
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-3.5 w-3.5" />
                    {coach.rating ? Number(coach.rating).toFixed(1) : '–'}
                    <span className="text-xs">({coach.reviews_count || 0})</span>
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {coach.clients_count || 0} {isHe ? 'לקוחות' : 'clients'}
                  </span>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch
                      checked={!!coach.is_featured}
                      onCheckedChange={() => toggleField(coach.id, 'is_featured', coach.is_featured)}
                    />
                    <Star className="h-3.5 w-3.5" />
                    {isHe ? 'מובחר' : 'Featured'}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch
                      checked={!!coach.is_verified}
                      onCheckedChange={() => toggleField(coach.id, 'is_verified', coach.is_verified)}
                    />
                    <Shield className="h-3.5 w-3.5" />
                    {isHe ? 'מאומת' : 'Verified'}
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setEditingCoach(coach)}>
                    <Edit className="h-3.5 w-3.5 me-1" />
                    {isHe ? 'עריכה' : 'Edit'}
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`/coaches/${coach.slug}`} target="_blank" rel="noopener">
                      <ExternalLink className="h-3.5 w-3.5 me-1" />
                      {isHe ? 'צפייה' : 'View'}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingCoach} onOpenChange={open => !open && setEditingCoach(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" dir={isHe ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{isHe ? 'עריכת מאמן' : 'Edit Coach'}</DialogTitle>
          </DialogHeader>
          {editingCoach && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{isHe ? 'שם (עברית)' : 'Name (Hebrew)'}</Label>
                  <Input value={editingCoach.display_name} onChange={e => setEditingCoach({ ...editingCoach, display_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{isHe ? 'שם (אנגלית)' : 'Name (English)'}</Label>
                  <Input value={editingCoach.display_name_en || ''} onChange={e => setEditingCoach({ ...editingCoach, display_name_en: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{isHe ? 'תפקיד (עברית)' : 'Title (Hebrew)'}</Label>
                  <Input value={editingCoach.title} onChange={e => setEditingCoach({ ...editingCoach, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{isHe ? 'תפקיד (אנגלית)' : 'Title (English)'}</Label>
                  <Input value={editingCoach.title_en || ''} onChange={e => setEditingCoach({ ...editingCoach, title_en: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{isHe ? 'ביוגרפיה (עברית)' : 'Bio (Hebrew)'}</Label>
                <Textarea rows={3} value={editingCoach.bio || ''} onChange={e => setEditingCoach({ ...editingCoach, bio: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label>{isHe ? 'ביוגרפיה (אנגלית)' : 'Bio (English)'}</Label>
                <Textarea rows={3} value={editingCoach.bio_en || ''} onChange={e => setEditingCoach({ ...editingCoach, bio_en: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input value={editingCoach.slug} onChange={e => setEditingCoach({ ...editingCoach, slug: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{isHe ? 'סטטוס' : 'Status'}</Label>
                  <Select value={editingCoach.status || 'active'} onValueChange={v => setEditingCoach({ ...editingCoach, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{isHe ? 'פעיל' : 'Active'}</SelectItem>
                      <SelectItem value="pending">{isHe ? 'ממתין' : 'Pending'}</SelectItem>
                      <SelectItem value="inactive">{isHe ? 'לא פעיל' : 'Inactive'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{isHe ? 'עמלה (%)' : 'Commission (%)'}</Label>
                <Input type="number" min={0} max={100} value={editingCoach.commission_rate ?? ''} onChange={e => setEditingCoach({ ...editingCoach, commission_rate: e.target.value ? Number(e.target.value) : null })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>WhatsApp</Label>
                  <Input value={editingCoach.whatsapp || ''} onChange={e => setEditingCoach({ ...editingCoach, whatsapp: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Calendly</Label>
                  <Input value={editingCoach.calendly_url || ''} onChange={e => setEditingCoach({ ...editingCoach, calendly_url: e.target.value })} />
                </div>
              </div>

              <Button className="w-full" onClick={() => updateCoach.mutate(editingCoach)} disabled={updateCoach.isPending}>
                {isHe ? 'שמור שינויים' : 'Save Changes'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
