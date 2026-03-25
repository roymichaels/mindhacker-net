import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AIONDialogShell } from '@/components/orb/AIONSignature';

interface AuroraBeliefsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useBeliefs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['aurora-beliefs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aurora_memory_graph')
        .select('id, content, strength, node_type, pillar, last_referenced_at, context')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .in('node_type', ['belief', 'value', 'identity', 'pattern'])
        .order('strength', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function AuroraBeliefsModal({ open, onOpenChange }: AuroraBeliefsModalProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: beliefs = [], isLoading } = useBeliefs();

  return (
    <AIONDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={isHe ? 'אמונות ודפוסים' : 'Beliefs & Patterns'}
      subtitle={`${beliefs.length} ${isHe ? 'תובנות' : 'insights'}`}
      description="AION beliefs and patterns memory graph"
      icon={<Brain className="w-4 h-4" />}
      className="max-w-lg h-[80vh]"
    >
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : beliefs.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {isHe ? 'AION עדיין לא זיהה אמונות פעילות. המשך לדבר.' : "AION hasn't identified beliefs yet. Keep chatting."}
              </p>
            </div>
          ) : (
            beliefs.map((belief) => {
              const strength = belief.strength ?? 0.5;
              const strengthPct = Math.round(strength * 100);
              return (
                <motion.div
                  key={belief.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl border border-border/60 bg-black/10 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground flex-1">{belief.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all"
                        style={{ width: `${strengthPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{strengthPct}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {belief.node_type ? (
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                          belief.node_type === 'belief' && 'bg-violet-500/10 text-violet-500',
                          belief.node_type === 'value' && 'bg-cyan-500/10 text-cyan-500',
                          belief.node_type === 'identity' && 'bg-amber-500/10 text-amber-500',
                          belief.node_type === 'pattern' && 'bg-rose-500/10 text-rose-500'
                        )}
                      >
                        {belief.node_type}
                      </span>
                    ) : null}
                    {belief.pillar ? (
                      <span className="text-[9px] text-muted-foreground">{belief.pillar}</span>
                    ) : null}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </AIONDialogShell>
  );
}
