import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Rocket, Shield, Users, CheckCircle2 } from "lucide-react";

interface ActionPlanStepProps {
  data: {
    first_steps?: string;
    support_needed?: string;
    obstacles?: string;
    commitment?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const ActionPlanStep = ({ data, onUpdate, language }: ActionPlanStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 dark:bg-purple-600/20 mb-4">
          <Rocket className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'תוכנית פעולה' : 'Action Plan'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'צעדים מעשיים להתחיל לחיות את הייעוד שלך' 
            : 'Practical steps to start living your purpose'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Rocket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה הצעדים הראשונים שתעשה השבוע?' : 'What are the first steps you will take this week?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? '1. ...\n2. ...\n3. ...' 
              : '1. ...\n2. ...\n3. ...'}
            value={data.first_steps || ''}
            onChange={(e) => handleChange('first_steps', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'איזו תמיכה אתה צריך מאחרים?' : 'What support do you need from others?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני צריך תמיכה ב...' 
              : 'I need support with...'}
            value={data.support_needed || ''}
            onChange={(e) => handleChange('support_needed', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה המכשולים האפשריים ואיך תתמודד איתם?' : 'What are possible obstacles and how will you overcome them?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המכשולים האפשריים הם... ואני אתמודד איתם על ידי...' 
              : 'Possible obstacles are... and I will overcome them by...'}
            value={data.obstacles || ''}
            onChange={(e) => handleChange('obstacles', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה ההתחייבות שלך לעצמך?' : 'What is your commitment to yourself?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מתחייב/ת לעצמי ש...' 
              : 'I commit to myself that...'}
            value={data.commitment || ''}
            onChange={(e) => handleChange('commitment', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="mt-6 p-4 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 dark:from-purple-800/20 dark:to-fuchsia-800/20 rounded-xl border border-purple-300/50 dark:border-purple-800/30">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-foreground">
            {language === 'he' ? 'כמעט סיימת!' : 'Almost done!'}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {language === 'he' 
            ? 'לחץ על "סיים מסע" כדי לשמור את כל התובנות שלך ולהתחיל לחיות את הייעוד שלך.'
            : 'Click "Complete Journey" to save all your insights and start living your purpose.'}
        </p>
      </div>
    </div>
  );
};

export default ActionPlanStep;
