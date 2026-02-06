import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, Heart, Target } from "lucide-react";

interface ContributionStepProps {
  data: {
    contribution_vision?: string;
    target_audience?: string;
    impact_measurement?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const ContributionStep = ({ data, onUpdate, language }: ContributionStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 dark:bg-purple-600/20 mb-4">
          <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'התרומה שלך לעולם' : 'Your Contribution to the World'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'איך אתה רוצה לתרום לאחרים ולעולם?' 
            : 'How do you want to contribute to others and the world?'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה החזון שלך לתרומה לעולם?' : 'What is your vision for contributing to the world?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני רוצה לתרום לעולם על ידי...' 
              : 'I want to contribute to the world by...'}
            value={data.contribution_vision || ''}
            onChange={(e) => handleChange('contribution_vision', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'למי אתה רוצה לעזור? מי קהל היעד שלך?' : 'Who do you want to help? Who is your target audience?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'האנשים שאני רוצה לעזור להם הם...' 
              : 'The people I want to help are...'}
            value={data.target_audience || ''}
            onChange={(e) => handleChange('target_audience', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'איך תמדוד את ההשפעה שלך?' : 'How will you measure your impact?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אדע שהצלחתי כאשר...' 
              : 'I will know I\'ve succeeded when...'}
            value={data.impact_measurement || ''}
            onChange={(e) => handleChange('impact_measurement', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default ContributionStep;
