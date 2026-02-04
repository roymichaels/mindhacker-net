import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, AlertCircle, Target } from "lucide-react";

interface BoundariesStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const BoundariesStep = ({ data, onUpdate, language }: BoundariesStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-600/20 mb-4">
          <Shield className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'גבולות בריאים' : 'Healthy Boundaries'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את הגבולות שאתה צריך להגן עליהם' 
            : 'Let\'s understand the boundaries you need to protect'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'מודעות לגבולות' : 'Boundary Awareness'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הגבולות שחשובים לי בקשרים הם...' 
              : 'The boundaries that are important to me in relationships are...'}
            value={(data.boundary_awareness as string) || ''}
            onChange={(e) => handleChange('boundary_awareness', e.target.value)}
            className="min-h-[100px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'אתגרי גבולות' : 'Boundary Challenges'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'קשה לי לשמור על גבולות כאשר...' 
              : 'I find it hard to maintain boundaries when...'}
            value={(data.boundary_challenges as string) || ''}
            onChange={(e) => handleChange('boundary_challenges', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'מטרות גבולות' : 'Boundary Goals'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני רוצה לשפר את הגבולות שלי על ידי...' 
              : 'I want to improve my boundaries by...'}
            value={(data.boundary_goals as string) || ''}
            onChange={(e) => handleChange('boundary_goals', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'הגנה עצמית' : 'Self Protection'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מגן על עצמי בקשרים על ידי...' 
              : 'I protect myself in relationships by...'}
            value={(data.self_protection as string) || ''}
            onChange={(e) => handleChange('self_protection', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>
      </div>
    </div>
  );
};

export default BoundariesStep;
