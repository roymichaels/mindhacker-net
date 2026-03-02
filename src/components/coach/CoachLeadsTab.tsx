import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCoachLeads, useCoachLeadStats, useAddCoachLead, useUpdateCoachLead, useDeleteCoachLead } from '@/hooks/useCoachLeads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, MoreVertical, Mail, Phone, Trash2, Edit, Users, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'converted', 'lost'] as const;

const CoachLeadsTab = () => {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: leads, isLoading } = useCoachLeads();
  const { stats } = useCoachLeadStats();
  const addLead = useAddCoachLead();
  const updateLead = useUpdateCoachLead();
  const deleteLead = useDeleteCoachLead();

  const [addOpen, setAddOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });

  const filteredLeads = filterStatus === 'all' ? leads : leads?.filter(l => l.status === filterStatus);

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    addLead.mutate({ ...form, source: 'manual' }, {
      onSuccess: () => { setAddOpen(false); setForm({ name: '', email: '', phone: '', notes: '' }); },
    });
  };

  const statusLabel = (s: string) => {
    const map: Record<string, { he: string; en: string; color: string }> = {
      new: { he: 'חדש', en: 'New', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
      contacted: { he: 'פנייה', en: 'Contacted', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
      qualified: { he: 'מתאים', en: 'Qualified', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
      converted: { he: 'הומר', en: 'Converted', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' },
      lost: { he: 'אבד', en: 'Lost', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
    };
    const m = map[s] || { he: s, en: s, color: '' };
    return <Badge className={m.color}>{isHe ? m.he : m.en}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{isHe ? 'ניהול לידים' : 'Lead Management'}</h2>
          <p className="text-sm text-muted-foreground">{isHe ? 'לידים מדפי נחיתה ומקורות נוספים' : 'Leads from landing pages and other sources'}</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><UserPlus className="h-4 w-4 me-2" />{isHe ? 'הוסף ליד' : 'Add Lead'}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{isHe ? 'הוסף ליד חדש' : 'Add New Lead'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>{isHe ? 'שם' : 'Name'}</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>{isHe ? 'אימייל' : 'Email'}</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div><Label>{isHe ? 'טלפון' : 'Phone'}</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div><Label>{isHe ? 'הערות' : 'Notes'}</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
              <Button onClick={handleAdd} disabled={!form.name || !form.email || addLead.isPending} className="w-full">
                {addLead.isPending ? '...' : isHe ? 'שמור' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: isHe ? 'סה"כ' : 'Total', value: stats.total, color: 'border-border/50' },
          { label: isHe ? 'חדשים' : 'New', value: stats.new, color: 'border-blue-500/30 bg-blue-500/5' },
          { label: isHe ? 'פנייה' : 'Contacted', value: stats.contacted, color: 'border-amber-500/30 bg-amber-500/5' },
          { label: isHe ? 'הומרו' : 'Converted', value: stats.converted, color: 'border-emerald-500/30 bg-emerald-500/5' },
          { label: isHe ? 'אבדו' : 'Lost', value: stats.lost, color: 'border-red-500/30 bg-red-500/5' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.color} p-3 text-center`}>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isHe ? 'הכל' : 'All'}</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leads list */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5">
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : !filteredLeads?.length ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{isHe ? 'אין לידים עדיין' : 'No leads yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map(lead => (
              <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{lead.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm truncate">{lead.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>
                      {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                      <span>{format(new Date(lead.created_at), 'PP', { locale: isHe ? he : undefined })}</span>
                    </div>
                    {lead.notes && <p className="text-xs text-muted-foreground mt-1 truncate max-w-sm">{lead.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statusLabel(lead.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {STATUS_OPTIONS.filter(s => s !== lead.status).map(s => (
                        <DropdownMenuItem key={s} onClick={() => updateLead.mutate({ id: lead.id, updates: { status: s } })}>
                          <Edit className="h-4 w-4 me-2" />{isHe ? `שנה ל-${s}` : `Mark as ${s}`}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteLead.mutate(lead.id)}>
                        <Trash2 className="h-4 w-4 me-2" />{isHe ? 'מחק' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachLeadsTab;
