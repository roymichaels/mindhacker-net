import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Sparkles, Eye } from 'lucide-react';
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

const CoachClientPlans = () => {
  const { user } = useAuth();
  const { data: myProfile } = useMyPractitionerProfile();
  const { language } = useTranslation();
  const isHebrew = language === 'he';
  const queryClient = useQueryClient();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientGoals, setClientGoals] = useState('');
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
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate plan');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isHebrew ? 'תוכניות לקוחות' : 'Client Plans'}</h1>
          <p className="text-muted-foreground">
            {isHebrew ? 'צור תוכניות אימון מותאמות אישית עם AI' : 'Generate personalized coaching plans with AI'}
          </p>
        </div>
        <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white">
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
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.client_name || (isHebrew ? 'לקוח' : 'Client')}</CardTitle>
                  <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                    {plan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {new Date(plan.created_at).toLocaleDateString()}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewPlan(plan)}
                >
                  <Eye className="h-4 w-4 me-2" />
                  {isHebrew ? 'צפה בתוכנית' : 'View Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isHebrew ? 'אין תוכניות עדיין' : 'No plans yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isHebrew ? 'צור את תוכנית האימון הראשונה שלך' : 'Create your first coaching plan'}
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
          {viewPlan?.plan_data && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                {typeof viewPlan.plan_data === 'string'
                  ? viewPlan.plan_data
                  : JSON.stringify(viewPlan.plan_data, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachClientPlans;
