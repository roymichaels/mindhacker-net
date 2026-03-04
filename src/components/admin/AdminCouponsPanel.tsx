/**
 * Admin Coupon Management — CRUD for discount codes.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminCouponsPanel() {
  const { language } = useLanguage();
  const isHe = language === 'he';
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('coupons').insert({
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || null,
        is_active: isActive,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(isHe ? 'קופון נוצר' : 'Coupon created');
      resetForm();
      setCreateOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(isHe ? 'קופון נמחק' : 'Coupon deleted');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('coupons').update({ is_active: active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const resetForm = () => {
    setCode('');
    setDiscountType('percent');
    setDiscountValue('');
    setMaxUses('');
    setExpiresAt('');
    setIsActive(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{isHe ? 'ניהול קופונים' : 'Coupon Management'}</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              {isHe ? 'קופון חדש' : 'New Coupon'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isHe ? 'צור קופון' : 'Create Coupon'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{isHe ? 'קוד' : 'Code'}</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="COACH20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{isHe ? 'סוג הנחה' : 'Discount Type'}</Label>
                  <Select value={discountType} onValueChange={(v: 'percent' | 'fixed') => setDiscountType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">{isHe ? 'אחוזים' : 'Percent'}</SelectItem>
                      <SelectItem value="fixed">{isHe ? 'סכום קבוע' : 'Fixed Amount'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isHe ? 'ערך' : 'Value'}</Label>
                  <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder={discountType === 'percent' ? '20' : '10'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{isHe ? 'מגבלת שימושים' : 'Max Uses'}</Label>
                  <Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder={isHe ? 'ללא הגבלה' : 'Unlimited'} />
                </div>
                <div>
                  <Label>{isHe ? 'תפוגה' : 'Expires'}</Label>
                  <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>{isHe ? 'פעיל' : 'Active'}</Label>
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!code || !discountValue || createMutation.isPending} className="w-full">
                {createMutation.isPending ? '...' : (isHe ? 'צור קופון' : 'Create Coupon')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Coupons Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-start p-3">{isHe ? 'קוד' : 'Code'}</th>
              <th className="text-start p-3">{isHe ? 'הנחה' : 'Discount'}</th>
              <th className="text-start p-3">{isHe ? 'שימושים' : 'Uses'}</th>
              <th className="text-start p-3">{isHe ? 'סטטוס' : 'Status'}</th>
              <th className="text-start p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Loading...</td></tr>
            ) : !coupons?.length ? (
              <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">{isHe ? 'אין קופונים' : 'No coupons'}</td></tr>
            ) : coupons.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-mono font-bold">
                  <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Copied'); }} className="flex items-center gap-1 hover:text-primary">
                    {c.code} <Copy className="h-3 w-3" />
                  </button>
                </td>
                <td className="p-3">
                  {c.discount_type === 'percent' ? `${c.discount_value}%` : `$${c.discount_value}`}
                </td>
                <td className="p-3">
                  {c.current_uses}/{c.max_uses ?? '∞'}
                </td>
                <td className="p-3">
                  <Switch
                    checked={c.is_active}
                    onCheckedChange={(active) => toggleMutation.mutate({ id: c.id, active })}
                  />
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
