import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Target, Clock, Users, Rocket } from "lucide-react";

interface ActionPlanStepProps {
  data: {
    immediate_actions?: string[];
    weekly_commitment?: string;
    resources_needed?: string;
    accountability?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const ActionPlanStep = ({ data, onUpdate, language }: ActionPlanStepProps) => {
  const handleChange = (field: string, value: string | string[]) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleActionsChange = (value: string) => {
    const actions = value.split(',').map(a => a.trim()).filter(Boolean);
    handleChange('immediate_actions', actions);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 dark:bg-teal-600/20 mb-4">
          <Rocket className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'תוכנית פעולה' : 'Action Plan'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'צעדים קונקרטיים להפוך את התחביבים שלך למציאות' 
            : 'Concrete steps to make your hobbies a reality'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מה הפעולות הראשונות שלך? (מופרדות בפסיקים)' : 'What are your first actions? (separated by commas)'}
          </Label>
          <Input
            placeholder={language === 'he' 
              ? 'להירשם לחוג, לקנות ציוד, לתאם זמן...' 
              : 'Sign up for a class, buy equipment, schedule time...'}
            value={(data.immediate_actions || []).join(', ')}
            onChange={(e) => handleActionsChange(e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מהי ההתחייבות השבועית שלך?' : 'What is your weekly commitment?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'בכל שבוע אני מתחייב ל...' 
              : 'Every week I commit to...'}
            value={data.weekly_commitment || ''}
            onChange={(e) => handleChange('weekly_commitment', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Rocket className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'אילו משאבים אתה צריך?' : 'What resources do you need?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני צריך: זמן, כסף, ציוד...' 
              : 'I need: time, money, equipment...'}
            value={data.resources_needed || ''}
            onChange={(e) => handleChange('resources_needed', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מי יעזור לך להישאר מחויב?' : 'Who will help you stay committed?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני אשתף את... הם יעזרו לי...' 
              : 'I will share with... They will help me...'}
            value={data.accountability || ''}
            onChange={(e) => handleChange('accountability', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default ActionPlanStep;
