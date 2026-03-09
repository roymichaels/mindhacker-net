/**
 * Business Hub — Landing page showing user's businesses with option to create new ones.
 * No sidebars, no chat. Clean hub layout.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, ArrowRight, ArrowLeft, Sparkles, Loader2, Building2, ChevronLeft, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import BusinessCreationWizard from '@/components/business/BusinessCreationWizard';
import { toast } from 'sonner';

export default function Business() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [showWizard, setShowWizard] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['user-businesses', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_journeys')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const handleDelete = async (e: React.MouseEvent, bizId: string) => {
    e.stopPropagation();
    if (!confirm(isHe ? 'למחוק את העסק הזה?' : 'Delete this business?')) return;
    setDeletingId(bizId);
    try {
      const { error } = await supabase
        .from('business_journeys')
        .delete()
        .eq('id', bizId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['user-businesses'] });
      toast.success(isHe ? 'העסק נמחק' : 'Business deleted');
    } catch {
      toast.error(isHe ? 'שגיאה במחיקה' : 'Error deleting');
    } finally {
      setDeletingId(null);
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (showWizard) {
    return (
      <BusinessCreationWizard
        onClose={() => setShowWizard(false)}
        onComplete={(journeyId) => {
          setShowWizard(false);
          navigate(`/business/journey/${journeyId}`);
        }}
      />
    );
  }

  return (
    <PageShell className="pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/fm/work')}
            className="shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-amber-500" />
              {isHe ? 'העסקים שלי' : 'My Businesses'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isHe ? 'נהל, בנה והקם את העסקים שלך עם Aurora' : 'Manage, build and launch your businesses with Aurora'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowWizard(true)}
          className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-semibold gap-2"
        >
          <Plus className="h-4 w-4" />
          {isHe ? 'עסק חדש' : 'New Business'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : businesses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-400/10 flex items-center justify-center mb-6">
            <Briefcase className="h-10 w-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {isHe ? 'עדיין אין עסקים' : 'No businesses yet'}
          </h2>
          <p className="text-muted-foreground max-w-md mb-6">
            {isHe 
              ? 'Aurora תעזור לך לבנות את העסק שלך צעד אחר צעד — חזון, מודל עסקי, קהל יעד, שיווק ועוד'
              : 'Aurora will help you build your business step by step — vision, business model, target audience, marketing and more'}
          </p>
          <Button
            size="lg"
            onClick={() => setShowWizard(true)}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-semibold gap-2"
          >
            <Sparkles className="h-5 w-5" />
            {isHe ? 'צור עסק עם Aurora' : 'Create Business with Aurora'}
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((biz, index) => {
            const progress = Math.round(((biz.current_step - 1) / 10) * 100);
            const name = biz.business_name || (isHe ? 'עסק בהקמה' : 'New Business');
            const vision = (biz.step_1_vision as any)?.description || '';

            return (
              <motion.div
                key={biz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="group relative cursor-pointer border-border/50 hover:border-amber-500/40 transition-all hover:shadow-lg hover:shadow-amber-500/5 bg-card/80"
                  onClick={() => {
                    if (progress === 0) return; // Don't navigate if 0% progress
                    if (biz.journey_complete) {
                      navigate(`/business/${biz.id}`);
                    } else {
                      navigate(`/business/journey/${biz.id}`);
                    }
                  }}
                >
                  {/* Trash icon — visible on hover */}
                  <button
                    onClick={(e) => handleDelete(e, biz.id)}
                    disabled={deletingId === biz.id}
                    className="absolute top-2 start-2 z-10 p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                    title={isHe ? 'מחק' : 'Delete'}
                  >
                    {deletingId === biz.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-400/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-amber-500" />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          biz.journey_complete
                            ? "border-emerald-500/40 text-emerald-500"
                            : "border-amber-500/40 text-amber-500"
                        )}
                      >
                        {biz.journey_complete
                          ? (isHe ? 'פעיל' : 'Active')
                          : (isHe ? 'בהקמה' : 'In Progress')}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-base mb-1 truncate">{name}</h3>
                    {vision && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{vision}</p>
                    )}

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-foreground">
                          {isHe ? 'התקדמות' : 'Progress'}
                        </span>
                        <span className="font-medium text-amber-500">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted/50">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end mt-3 text-xs text-muted-foreground group-hover:text-amber-500 transition-colors">
                      <span>{isHe ? 'כניסה' : 'Open'}</span>
                      <ArrowIcon className="h-3.5 w-3.5 ms-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
