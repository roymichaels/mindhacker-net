import { ArrowLeft, Coins, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type Gig = Database['public']['Tables']['fm_gigs']['Row'];

export default function FMWork() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  const { data: gigs = [], isLoading } = useQuery({
    queryKey: ['fm-gigs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fm_gigs')
        .select('*')
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const statusLabel = (status: string) => {
    const map: Record<string, { en: string; he: string; color: string }> = {
      open:        { en: 'Open',        he: 'פתוח',    color: 'bg-emerald-500/15 text-emerald-500' },
      in_progress: { en: 'In Progress', he: 'בביצוע',  color: 'bg-primary/15 text-primary' },
      completed:   { en: 'Completed',   he: 'הושלם',   color: 'bg-muted text-muted-foreground' },
    };
    const s = map[status] || map['open'];
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.color}`}>{isHe ? s.he : s.en}</span>;
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/fm')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{isHe ? 'שוק עבודה' : 'Marketplace'}</h1>
        </div>
        <Button size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> {isHe ? 'פרסם' : 'Post'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted/50 rounded-xl animate-pulse" />)}
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Users className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm">
            {isHe ? 'עדיין אין עבודות. פרסם את הראשונה!' : 'No gigs yet. Post the first one!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {gigs.map((gig: Gig) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm text-foreground">{gig.title}</h3>
                {statusLabel(gig.status)}
              </div>
              {gig.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{gig.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-accent" />
                  <span className="font-semibold text-foreground">{gig.budget_mos} MOS</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">{gig.category}</span>
              </div>
              {gig.status === 'open' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">{isHe ? 'צפה' : 'View'}</Button>
                  <Button size="sm">{isHe ? 'הגש הצעה' : 'Apply'}</Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
