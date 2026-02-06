import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users, User, Heart } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SocialStepProps {
  data: {
    social_hobbies?: string[];
    solo_hobbies?: string[];
    preference?: string;
    community_connection?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const SocialStep = ({ data, onUpdate, language }: SocialStepProps) => {
  const handleChange = (field: string, value: string | string[]) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleArrayChange = (field: string, value: string) => {
    const items = value.split(',').map(i => i.trim()).filter(Boolean);
    handleChange(field, items);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 dark:bg-teal-600/20 mb-4">
          <Users className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'תחביבים חברתיים vs אישיים' : 'Social vs Solo Hobbies'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'הבן את ההעדפות החברתיות שלך בתחביבים' 
            : 'Understand your social preferences in hobbies'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'אילו תחביבים אתה עושה עם אחרים? (מופרדים בפסיקים)' : 'Which hobbies do you do with others? (separated by commas)'}
          </Label>
          <Input
            placeholder={language === 'he' 
              ? 'כדורסל, משחקי לוח, טיולים קבוצתיים...' 
              : 'Basketball, board games, group hikes...'}
            value={(data.social_hobbies || []).join(', ')}
            onChange={(e) => handleArrayChange('social_hobbies', e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'אילו תחביבים אתה עושה לבד? (מופרדים בפסיקים)' : 'Which hobbies do you do alone? (separated by commas)'}
          </Label>
          <Input
            placeholder={language === 'he' 
              ? 'קריאה, ציור, ריצה...' 
              : 'Reading, painting, running...'}
            value={(data.solo_hobbies || []).join(', ')}
            onChange={(e) => handleArrayChange('solo_hobbies', e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-foreground">
            {language === 'he' ? 'מה ההעדפה שלך?' : 'What is your preference?'}
          </Label>
          <RadioGroup
            value={data.preference || ''}
            onValueChange={(value) => handleChange('preference', value)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="social" id="social" />
              <Label htmlFor="social" className="cursor-pointer">
                {language === 'he' ? 'מעדיף תחביבים חברתיים' : 'Prefer social hobbies'}
              </Label>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="solo" id="solo" />
              <Label htmlFor="solo" className="cursor-pointer">
                {language === 'he' ? 'מעדיף תחביבים עצמאיים' : 'Prefer solo hobbies'}
              </Label>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="balanced" id="balanced" />
              <Label htmlFor="balanced" className="cursor-pointer">
                {language === 'he' ? 'שילוב מאוזן של שניהם' : 'Balanced mix of both'}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Heart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'האם יש לך קהילה של חובבים בתחום?' : 'Do you have a community of enthusiasts in your field?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני חלק מקבוצת...' 
              : 'I am part of a group...'}
            value={data.community_connection || ''}
            onChange={(e) => handleChange('community_connection', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default SocialStep;
