import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { PractitionerClient } from '@/hooks/useCoachClients';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowRight, ArrowLeft, Calendar, Sparkles, FileText, Eye, User,
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface ClientProfilePanelProps {
  client: PractitionerClient;
  onBack: () => void;
}

const ClientProfilePanel = ({ client, onBack }: ClientProfilePanelProps) => {
  const { language, isRTL } = useTranslation();
  const isHebrew = language === 'he';
  const { data: myProfile } = useMyPractitionerProfile();
  const queryClient = useQueryClient();

  const [generateOpen, setGenerateOpen] = useState(false);
  const [clientGoals, setClientGoals] = useState('');
  const [clientBackground, setClientBackground] = useState('');
  const [viewPlan, setViewPlan] = useState<any>(null);

  // Fetch plans for this client
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['coach-client-plans', myProfile?.id, client.client_user_id],
    queryFn: async () => {
      if (!myProfile?.id) return [];
      const { data, error } = await supabase
        .from('coach_client_plans')
        .select('*')
        .eq('coach_id', myProfile.id)
        .eq('client_user_id', client.client_user_id)
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
          client_name: client.profile?.full_name || '',
          client_goals: clientGoals,
          client_background: clientBackground,
          client_user_id: client.client_user_id,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(isHebrew ? 'תוכנית נוצרה בהצלחה!' : 'Plan generated!');
      queryClient.invalidateQueries({ queryKey: ['coach-client-plans'] });
      setGenerateOpen(false);
      setClientGoals('');
      setClientBackground('');
    },
    onError: (err: any) => toast.error(err.message || 'Failed'),
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

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const clientName = client.profile?.full_name || (isHebrew ? 'מתאמן' : 'Client');

  return (
    <div className="space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <BackArrow className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{clientName}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {isHebrew ? 'הצטרף ' : 'Joined '}
              {format(new Date(client.created_at), 'PP', { locale: isHebrew ? he : undefined })}
            </span>
          </div>
        </div>
        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
          {client.status === 'active' ? (isHebrew ? 'פעיל' : 'Active') :
           client.status === 'completed' ? (isHebrew ? 'הושלם' : 'Completed') :
           client.status}
        </Badge>
      </div>

      {/* Client Info Card */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary">
              {clientName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg">{clientName}</p>
            <p className="text-sm text-muted-foreground">
              {isHebrew ? `${plans?.length || 0} תוכניות` : `${plans?.length || 0} plans`}
            </p>
          </div>
        </div>
        {client.notes && (
          <p className="mt-3 text-sm text-muted-foreground border-t border-border/30 pt-3">{client.notes}</p>
        )}
      </div>

      {/* AI Plans Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {isHebrew ? 'תוכניות אימון' : 'Coaching Plans'}
          </h3>
          <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white">
                <Sparkles className="h-4 w-4 me-2" />
                {isHebrew ? 'צור תוכנית' : 'Generate Plan'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isHebrew ? `תוכנית חדשה ל${clientName}` : `New Plan for ${clientName}`}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{isHebrew ? 'רקע הלקוח' : 'Client Background'}</Label>
                  <Textarea
                    value={clientBackground}
                    onChange={(e) => setClientBackground(e.target.value)}
                    placeholder={isHebrew ? 'גיל, מצב משפחתי, תעסוקה...' : 'Age, occupation, relevant background...'}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>{isHebrew ? 'מטרות ואתגרים' : 'Goals & Challenges'}</Label>
                  <Textarea
                    value={clientGoals}
                    onChange={(e) => setClientGoals(e.target.value)}
                    placeholder={isHebrew ? 'תאר את המטרות והאתגרים...' : 'Describe goals and challenges...'}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={!clientGoals || generateMutation.isPending}
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

        {plansLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="space-y-3">
            {plans.map((plan: any) => (
              <div
                key={plan.id}
                className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setViewPlan(plan)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {plan.coaching_niche || (isHebrew ? 'תוכנית אימון' : 'Coaching Plan')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(plan.created_at), 'PP', { locale: isHebrew ? he : undefined })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={plan.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {plan.status}
                    </Badge>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-8 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              {isHebrew ? 'אין תוכניות עדיין – צרו אחת עם AI' : 'No plans yet – generate one with AI'}
            </p>
          </div>
        )}
      </div>

      {/* View Plan Dialog */}
      <Dialog open={!!viewPlan} onOpenChange={() => setViewPlan(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewPlan?.client_name || clientName} – {isHebrew ? 'תוכנית אימון' : 'Coaching Plan'}
            </DialogTitle>
          </DialogHeader>
          {viewPlan?.plan_data && renderPlanContent(viewPlan.plan_data)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientProfilePanel;
