import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Rocket, Target, Calendar, Users } from "lucide-react";
import type { LearningJourneyData } from "@/hooks/useLearningJourney";

interface ActionPlanStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
  journeyData?: LearningJourneyData;
}

const ActionPlanStep = ({ data, onUpdate, language }: ActionPlanStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 mb-4">
          <Rocket className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'תוכנית פעולה' : 'Action Plan'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא ניצור תוכנית מעשית ללמידה' 
            : 'Let\'s create a practical learning plan'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'פעולת הלמידה הראשונה' : 'First Learning Action'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הצעד הראשון שאקח ללמידה הוא...' 
              : 'The first learning step I will take is...'}
            value={(data.first_learning_action as string) || ''}
            onChange={(e) => handleChange('first_learning_action', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'התחייבות שבועית' : 'Weekly Commitment'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'כל שבוע אקדיש ללמידה...' 
              : 'Every week I will dedicate to learning...'}
            value={(data.weekly_commitment as string) || ''}
            onChange={(e) => handleChange('weekly_commitment', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'אחריותיות' : 'Accountability'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני אשמור על מחויבות על ידי...' 
              : 'I will stay accountable by...'}
            value={(data.accountability as string) || ''}
            onChange={(e) => handleChange('accountability', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Rocket className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'משאבים נדרשים' : 'Resources Needed'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המשאבים שאני צריך ללמידה הם...' 
              : 'The resources I need for learning are...'}
            value={(data.resources_needed as string) || ''}
            onChange={(e) => handleChange('resources_needed', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default ActionPlanStep;
