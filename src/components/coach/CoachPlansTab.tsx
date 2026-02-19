import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyCoachProfile } from '@/domain/coaches';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReactMarkdown from 'react-markdown';

const CoachPlansTab = () => {
  const { data: myProfile } = useMyCoachProfile();
  const { language } = useTranslation();
  const isHebrew = language === 'he';
  const queryClient = useQueryClient();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientGoals, setClientGoals] = useState('');
  const [clientBackground, setClientBackground] = useState('');
  const [viewPlan, setViewPlan] = useState<any>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['coach-client-plans', myProfile?.id],
    queryFn: async () => {
      if (!myProfile?.id) return [];
      const { data, error } = await supabase
        .from('coach_client_plans')
        .select('*')
        .eq('coach_id', myProfile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!myProfile?.id,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-coach-plan', {
        body: {
          coach_id: myProfile?.id,
          client_name: clientName,
          client_goals: clientGoals,
          client_background: clientBackground,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(isHebrew ? 'תוכנית נוצרה בהצלחה!' : 'Plan generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['coach-client-plans'] });
      setGenerateOpen(false);
      setClientName('');
      setClientGoals('');
      setClientBackground('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate plan');
    },
  });

  const renderPlanContent = (planData: any) => {
    if (!planData) return null;
    const getMarkdownText = (data: any): string | null => {
      if (typeof data === 'string') return data;
      if (data.content || data.text || data.plan) {
        const text = data.content || data.text || data.plan;
        if (typeof text === 'string') return text;
      }
      return null;
    };
    const md = getMarkdownText(planData);
    if (md) {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{md}</ReactMarkdown>
        </div>
      );
    }
    return (
      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto">
        {JSON.stringify(planData, null, 2)}
      </pre>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{isHebrew ? 'תוכניות אימון AI' : 'AI Coaching Plans'}</h2>
          <p className="text-sm text-muted-foreground">
            {isHebrew ? 'צרו תוכניות מותאמות אישית עם בינה מלאכותית' : 'Generate personalized plans with AI'}
          </p>
        </div>
        <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white">
              <Sparkles className="h-4 w-4 me-2" />
              {isHebrew ? 'צור תוכנית' : 'Generate Plan'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isHebrew ? 'צור תוכנית אימון חדשה' : 'Generate New Coaching Plan'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{isHebrew ? 'שם הלקוח' : 'Client Name'}</Label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div>
                <Label>{isHebrew ? 'רקע הלקוח' : 'Client Background'}</Label>
                <Textarea
                  value={clientBackground}
                  onChange={(e) => setClientBackground(e.target.value)}
                  placeholder={isHebrew ? 'גיל, מצב משפחתי, תעסוקה, רקע רלוונטי...' : 'Age, family status, occupation, relevant background...'}
                  rows={2}
                />
              </div>
              <div>
                <Label>{isHebrew ? 'מטרות ואתגרים' : 'Goals & Challenges'}</Label>
                <Textarea
                  value={clientGoals}
                  onChange={(e) => setClientGoals(e.target.value)}
                  placeholder={isHebrew ? 'תאר את המטרות והאתגרים של הלקוח...' : 'Describe client goals and challenges...'}
                  rows={4}
                />
              </div>
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={!clientName || !clientGoals || generateMutation.isPending}
                className="w-full"
              >
                {generateMutation.isPending
                  ? (isHebrew ? 'מייצר...' : 'Generating...')
                  : (isHebrew ? 'צור תוכנית עם AI' : 'Generate with AI')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {plans.map((plan: any) => (
            <Card key={plan.id} className="bg-card/80 backdrop-blur-sm rounded-2xl border-border/50 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.client_name || (isHebrew ? 'לקוח' : 'Client')}</CardTitle>
                  <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                    {plan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {plan.coaching_niche && (
                  <p className="text-xs text-muted-foreground mb-2">{plan.coaching_niche}</p>
                )}
                <p className="text-sm text-muted-foreground mb-3">
                  {new Date(plan.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewPlan(plan)}>
                    <Eye className="h-4 w-4 me-1" />
                    {isHebrew ? 'צפה' : 'View'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 bg-card/80 backdrop-blur-sm rounded-2xl border-border/50">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isHebrew ? 'אין תוכניות עדיין' : 'No plans yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isHebrew ? 'צרו את תוכנית האימון הראשונה שלכם' : 'Create your first coaching plan'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* View Plan Dialog */}
      <Dialog open={!!viewPlan} onOpenChange={() => setViewPlan(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewPlan?.client_name || (isHebrew ? 'תוכנית אימון' : 'Coaching Plan')}
            </DialogTitle>
          </DialogHeader>
          {viewPlan?.plan_data && renderPlanContent(viewPlan.plan_data)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachPlansTab;
