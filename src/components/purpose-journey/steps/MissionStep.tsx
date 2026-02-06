import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, Globe, Lightbulb } from "lucide-react";

interface MissionStepProps {
  data: {
    personal_mission?: string;
    unique_contribution?: string;
    world_problem?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const MissionStep = ({ data, onUpdate, language }: MissionStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 dark:bg-purple-600/20 mb-4">
          <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'השליחות שלך' : 'Your Mission'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'מה השליחות שלך בעולם הזה?' 
            : 'What is your mission in this world?'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה השליחות האישית שלך?' : 'What is your personal mission?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'השליחות שלי היא...' 
              : 'My mission is to...'}
            value={data.personal_mission || ''}
            onChange={(e) => handleChange('personal_mission', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה התרומה הייחודית שרק אתה יכול לתת?' : 'What unique contribution can only you give?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'השילוב הייחודי שלי מאפשר לי...' 
              : 'My unique combination allows me to...'}
            value={data.unique_contribution || ''}
            onChange={(e) => handleChange('unique_contribution', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'איזו בעיה בעולם אתה רוצה לפתור?' : 'What problem in the world do you want to solve?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הבעיה שאני רוצה לפתור היא...' 
              : 'The problem I want to solve is...'}
            value={data.world_problem || ''}
            onChange={(e) => handleChange('world_problem', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default MissionStep;
