import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Globe, Target } from "lucide-react";

interface SocialStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const SocialStep = ({ data, onUpdate, language }: SocialStepProps) => {
  const handleChange = (field: string, value: unknown) => {
    onUpdate({ ...data, [field]: value });
  };

  const socialCircleSizes = [
    { value: 'small', he: 'קטן (1-3 חברים קרובים)', en: 'Small (1-3 close friends)' },
    { value: 'medium', he: 'בינוני (4-10 חברים)', en: 'Medium (4-10 friends)' },
    { value: 'large', he: 'גדול (10+ חברים)', en: 'Large (10+ friends)' },
    { value: 'very_large', he: 'רחב מאוד', en: 'Very wide' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-600/20 mb-4">
          <Users className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'חברה וקהילה' : 'Social Circle & Community'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את החיים החברתיים שלך' 
            : 'Let\'s understand your social life'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'גודל המעגל החברתי' : 'Social Circle Size'}
          </Label>
          <Select
            value={(data.social_circle_size as string) || ''}
            onValueChange={(value) => handleChange('social_circle_size', value)}
          >
            <SelectTrigger className="bg-gray-800/50 border-gray-700">
              <SelectValue placeholder={language === 'he' ? 'בחר גודל' : 'Select size'} />
            </SelectTrigger>
            <SelectContent>
              {socialCircleSizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {language === 'he' ? size.he : size.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'איכות החברויות' : 'Friendship Quality'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'החברויות שלי מאופיינות ב...' 
              : 'My friendships are characterized by...'}
            value={(data.friendship_quality as string) || ''}
            onChange={(e) => handleChange('friendship_quality', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'מעורבות בקהילה' : 'Community Involvement'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מעורב בקהילות כמו...' 
              : 'I\'m involved in communities like...'}
            value={(data.community_involvement as string) || ''}
            onChange={(e) => handleChange('community_involvement', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'מטרות נטוורקינג' : 'Networking Goals'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני רוצה להרחיב את הקשרים שלי על ידי...' 
              : 'I want to expand my connections by...'}
            value={(data.networking_goals as string) || ''}
            onChange={(e) => handleChange('networking_goals', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>
      </div>
    </div>
  );
};

export default SocialStep;
