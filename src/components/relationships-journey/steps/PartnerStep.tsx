import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MessageCircle, Target } from "lucide-react";

interface PartnerStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const PartnerStep = ({ data, onUpdate, language }: PartnerStepProps) => {
  const handleChange = (field: string, value: unknown) => {
    onUpdate({ ...data, [field]: value });
  };

  const relationshipStatuses = [
    { value: 'single', he: 'רווק/ה', en: 'Single' },
    { value: 'dating', he: 'בזוגיות חדשה', en: 'Dating' },
    { value: 'relationship', he: 'בזוגיות', en: 'In a relationship' },
    { value: 'married', he: 'נשוי/אה', en: 'Married' },
    { value: 'divorced', he: 'גרוש/ה', en: 'Divorced' },
    { value: 'complicated', he: 'מסובך', en: 'It\'s complicated' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-600/20 mb-4">
          <Heart className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'זוגיות ורומנטיקה' : 'Partnership & Romance'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את הקשר הזוגי שלך' 
            : 'Let\'s understand your romantic relationship'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'סטטוס זוגי' : 'Relationship Status'}
          </Label>
          <Select
            value={(data.relationship_status as string) || ''}
            onValueChange={(value) => handleChange('relationship_status', value)}
          >
            <SelectTrigger className="bg-gray-800/50 border-gray-700">
              <SelectValue placeholder={language === 'he' ? 'בחר סטטוס' : 'Select status'} />
            </SelectTrigger>
            <SelectContent>
              {relationshipStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {language === 'he' ? status.he : status.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(data.relationship_status && data.relationship_status !== 'single') && (
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              {language === 'he' ? 'שביעות רצון מהזוגיות' : 'Partner Satisfaction'}
            </Label>
            <Slider
              value={[(data.partner_satisfaction as number) || 50]}
              onValueChange={(value) => handleChange('partner_satisfaction', value[0])}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{language === 'he' ? 'לא מרוצה' : 'Not satisfied'}</span>
              <span className="font-medium text-pink-400">{(data.partner_satisfaction as number) || 50}%</span>
              <span>{language === 'he' ? 'מאוד מרוצה' : 'Very satisfied'}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'איכות התקשורת' : 'Communication Quality'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'התקשורת בזוגיות שלי היא...' 
              : 'The communication in my relationship is...'}
            value={(data.communication_quality as string) || ''}
            onChange={(e) => handleChange('communication_quality', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'מטרות רומנטיות' : 'Romantic Goals'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המטרות שלי בתחום הזוגיות הן...' 
              : 'My goals in the romance area are...'}
            value={(data.romantic_goals as string) || ''}
            onChange={(e) => handleChange('romantic_goals', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>
      </div>
    </div>
  );
};

export default PartnerStep;
