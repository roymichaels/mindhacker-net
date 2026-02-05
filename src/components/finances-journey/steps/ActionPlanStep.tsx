import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Rocket, Target, Calendar, DollarSign } from "lucide-react";
import type { FinancesJourneyData } from "@/hooks/useFinancesJourney";

interface ActionPlanStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
  journeyData?: FinancesJourneyData;
}

const ActionPlanStep = ({ data, onUpdate, language }: ActionPlanStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 dark:bg-emerald-600/20 mb-4">
          <Rocket className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'תוכנית פעולה' : 'Action Plan'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא ניצור תוכנית מעשית לשיפור הכספים שלך' 
            : 'Let\'s create a practical plan to improve your finances'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'פעולה בעדיפות עליונה' : 'Priority Action'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הפעולה הפיננסית החשובה ביותר שאני צריך לעשות היא...' 
              : 'The most important financial action I need to take is...'}
            value={(data.priority_action as string) || ''}
            onChange={(e) => handleChange('priority_action', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'פעולה לשבוע הראשון' : 'First Week Action'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'בשבוע הקרוב אני אעשה...' 
              : 'This week I will do...'}
            value={(data.first_week_action as string) || ''}
            onChange={(e) => handleChange('first_week_action', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'מעקב חודשי' : 'Monthly Review'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'כל חודש אני אבדוק את...' 
              : 'Every month I will review...'}
            value={(data.monthly_review as string) || ''}
            onChange={(e) => handleChange('monthly_review', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'תמיכה שאני צריך' : 'Support I Need'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'כדי להצליח אני צריך...' 
              : 'To succeed I need...'}
            value={(data.support_needed as string) || ''}
            onChange={(e) => handleChange('support_needed', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default ActionPlanStep;
