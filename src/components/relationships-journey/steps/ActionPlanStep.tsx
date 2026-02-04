import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Rocket, Target, Calendar, Users } from "lucide-react";
import type { RelationshipsJourneyData } from "@/hooks/useRelationshipsJourney";

interface ActionPlanStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
  journeyData?: RelationshipsJourneyData;
}

const ActionPlanStep = ({ data, onUpdate, language }: ActionPlanStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-600/20 mb-4">
          <Rocket className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'תוכנית פעולה' : 'Action Plan'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא ניצור תוכנית מעשית לשיפור הקשרים שלך' 
            : 'Let\'s create a practical plan to improve your relationships'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'הקשר בעדיפות הגבוהה ביותר' : 'Priority Relationship'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הקשר שאני רוצה לשים עליו דגש הוא...' 
              : 'The relationship I want to focus on is...'}
            value={(data.priority_relationship as string) || ''}
            onChange={(e) => handleChange('priority_relationship', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'הפעולה הראשונה שלי' : 'My First Action'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הצעד הראשון שאני אקח הוא...' 
              : 'The first step I will take is...'}
            value={(data.first_action as string) || ''}
            onChange={(e) => handleChange('first_action', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'התחייבות שבועית' : 'Weekly Commitment'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'כל שבוע אני מתחייב ל...' 
              : 'Every week I commit to...'}
            value={(data.weekly_commitment as string) || ''}
            onChange={(e) => handleChange('weekly_commitment', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'תמיכה שאני צריך' : 'Support I Need'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'כדי להצליח אני צריך...' 
              : 'To succeed I need...'}
            value={(data.support_needed as string) || ''}
            onChange={(e) => handleChange('support_needed', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ActionPlanStep;
