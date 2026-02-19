/**
 * @module coach/AutoPlanEngineModal
 * @purpose Modal to generate AI coaching plans and convert them to playable action_items
 * @data generate-coach-plan edge function, coach_client_plans, action_items
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';
import { useCoachClients } from '@/hooks/useCoachClients';
import { useMyCoachProfile } from '@/domain/coaches';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface AutoPlanEngineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select a client when opening from client profile */
  preselectedClientId?: string;
}

const COACHING_STYLES = [
  { id: 'transformational', en: 'Transformational Coaching', he: 'אימון טרנספורמטיבי' },
  { id: 'cognitive', en: 'Cognitive Behavioral', he: 'קוגניטיבי התנהגותי' },
  { id: 'holistic', en: 'Holistic / Mind-Body', he: 'הוליסטי / גוף-נפש' },
  { id: 'performance', en: 'Performance Coaching', he: 'אימון ביצועים' },
  { id: 'custom', en: 'Custom / Freestyle', he: 'אישי / חופשי' },
];

const AutoPlanEngineModal = ({ open, onOpenChange, preselectedClientId }: AutoPlanEngineModalProps) => {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: clients } = useCoachClients();
  const { data: myProfile } = useMyCoachProfile();

  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || '');
  const [coachingStyle, setCoachingStyle] = useState('transformational');
  const [clientGoals, setClientGoals] = useState('');
  const [clientBackground, setClientBackground] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const selectedClient = clients?.find(c => c.id === selectedClientId);
  const clientName = selectedClient?.profile?.full_name || 'Client';

  const handleGenerate = async () => {
    if (!selectedClientId || !myProfile?.id) {
      toast.error(isHe ? 'בחר מתאמן' : 'Select a client');
      return;
    }

    setIsGenerating(true);
    try {
      const styleDef = COACHING_STYLES.find(s => s.id === coachingStyle);
      
      const { data, error } = await supabase.functions.invoke('generate-coach-plan', {
        body: {
          clientName,
          clientGoals: clientGoals || undefined,
          clientBackground: clientBackground || undefined,
          coachMethodology: { style: coachingStyle, label: styleDef?.en },
          coachingNiche: myProfile.title || 'Life Coaching',
          coachId: myProfile.id,
        },
      });

      if (error) throw error;

      const plan = data?.plan;
      if (!plan) throw new Error('No plan returned');

      // Convert plan phases into action_items for the client
      const planData = plan.plan_data;
      if (planData?.phases && selectedClient?.client_user_id) {
        const actionItems = [];
        for (const phase of planData.phases) {
          // Create milestone for each phase
          actionItems.push({
            user_id: selectedClient.client_user_id,
            type: 'milestone',
            source: 'coach',
            status: 'todo',
            title: phase.title || `Phase ${phase.phase_number}`,
            description: phase.focus || '',
            metadata: { coach_plan_id: plan.id, phase_number: phase.phase_number },
            xp_reward: 50,
          });

          // Create tasks for each session
          if (phase.sessions) {
            for (const session of phase.sessions) {
              actionItems.push({
                user_id: selectedClient.client_user_id,
                type: 'task',
                source: 'coach',
                status: 'todo',
                title: session.title || `Session ${session.session_number}`,
                description: (session.objectives || []).join('; '),
                metadata: { coach_plan_id: plan.id, homework: session.homework },
                xp_reward: 15,
              });
            }
          }
        }

        if (actionItems.length > 0) {
          const { error: insertError } = await supabase
            .from('action_items')
            .insert(actionItems);
          if (insertError) {
            console.error('Failed to create action items:', insertError);
          }
        }
      }

      setIsComplete(true);
      toast.success(isHe ? 'התוכנית נוצרה בהצלחה!' : 'Plan generated successfully!');
    } catch (err: any) {
      console.error('Plan generation error:', err);
      toast.error(isHe ? 'שגיאה ביצירת תוכנית' : 'Error generating plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setIsComplete(false);
    setClientGoals('');
    setClientBackground('');
    setSelectedClientId(preselectedClientId || '');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {isHe ? 'מנוע תוכניות AI' : 'AI Plan Engine'}
          </DialogTitle>
          <DialogDescription>
            {isHe
              ? 'צור תוכנית אימון מותאמת אישית באמצעות AI. התוכנית תהפוך למשימות בדאשבורד של המתאמן.'
              : 'Generate a personalized coaching plan with AI. The plan becomes playable tasks on the client\'s dashboard.'}
          </DialogDescription>
        </DialogHeader>

        {isComplete ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            <h3 className="text-lg font-semibold">{isHe ? 'התוכנית מוכנה!' : 'Plan Ready!'}</h3>
            <p className="text-sm text-muted-foreground text-center">
              {isHe
                ? 'המשימות נוצרו בדאשבורד של המתאמן. הם יוכלו לראות את התוכנית מיד.'
                : 'Tasks have been created on the client\'s dashboard. They can see their plan immediately.'}
            </p>
            <Button onClick={handleClose} className="mt-2">
              {isHe ? 'סגור' : 'Close'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label>{isHe ? 'בחר מתאמן' : 'Select Client'}</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder={isHe ? 'בחר מתאמן...' : 'Choose a client...'} />
                </SelectTrigger>
                <SelectContent>
                  {clients?.filter(c => c.status === 'active').map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.profile?.full_name || client.client_user_id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Coaching Style */}
            <div className="space-y-2">
              <Label>{isHe ? 'סגנון אימון' : 'Coaching Style'}</Label>
              <Select value={coachingStyle} onValueChange={setCoachingStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COACHING_STYLES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {isHe ? s.he : s.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client Goals */}
            <div className="space-y-2">
              <Label>{isHe ? 'מטרות המתאמן' : 'Client Goals'}</Label>
              <Textarea
                value={clientGoals}
                onChange={(e) => setClientGoals(e.target.value)}
                placeholder={isHe ? 'מה המתאמן רוצה להשיג?' : 'What does the client want to achieve?'}
                rows={2}
              />
            </div>

            {/* Background */}
            <div className="space-y-2">
              <Label>{isHe ? 'רקע' : 'Background'}</Label>
              <Input
                value={clientBackground}
                onChange={(e) => setClientBackground(e.target.value)}
                placeholder={isHe ? 'רקע קצר (אופציונלי)' : 'Brief background (optional)'}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedClientId}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {isHe ? 'יוצר תוכנית...' : 'Generating Plan...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 me-2" />
                  {isHe ? 'צור תוכנית AI' : 'Generate AI Plan'}
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AutoPlanEngineModal;
