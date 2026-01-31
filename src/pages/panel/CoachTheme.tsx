import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Image, FileText } from 'lucide-react';

const CoachTheme = () => {
  const { language } = useTranslation();
  const isHebrew = language === 'he';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isHebrew ? 'ערכת נושא' : 'Theme Settings'}
        </h1>
        <p className="text-muted-foreground">
          {isHebrew ? 'התאם אישית את המראה של הפרופיל ודפי הנחיתה שלך' : 'Customize the look of your profile and landing pages'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {isHebrew ? 'צבעים' : 'Colors'}
            </CardTitle>
            <CardDescription>
              {isHebrew ? 'בחר את צבעי המותג שלך' : 'Choose your brand colors'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{isHebrew ? 'צבע ראשי' : 'Primary Color'}</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 h-10 p-1" defaultValue="#7c3aed" />
                <Input placeholder="#7c3aed" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isHebrew ? 'צבע משני' : 'Secondary Color'}</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 h-10 p-1" defaultValue="#0ea5e9" />
                <Input placeholder="#0ea5e9" className="flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              {isHebrew ? 'תמונות' : 'Images'}
            </CardTitle>
            <CardDescription>
              {isHebrew ? 'העלה תמונות לפרופיל שלך' : 'Upload images for your profile'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{isHebrew ? 'תמונת פרופיל' : 'Profile Image'}</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Button variant="outline" size="sm">
                  {isHebrew ? 'העלה תמונה' : 'Upload Image'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isHebrew ? 'תמונת כריכה' : 'Cover Image'}</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Button variant="outline" size="sm">
                  {isHebrew ? 'העלה תמונה' : 'Upload Image'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isHebrew ? 'תוכן הפרופיל' : 'Profile Content'}
            </CardTitle>
            <CardDescription>
              {isHebrew ? 'ערוך את הטקסטים בפרופיל שלך' : 'Edit your profile texts'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{isHebrew ? 'כותרת' : 'Headline'}</Label>
              <Input placeholder={isHebrew ? 'מאמן אישי מוסמך' : 'Certified Life Coach'} />
            </div>
            <div className="space-y-2">
              <Label>{isHebrew ? 'תיאור קצר' : 'Short Bio'}</Label>
              <Textarea 
                placeholder={isHebrew ? 'ספר על עצמך...' : 'Tell about yourself...'} 
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          {isHebrew ? 'שמור שינויים' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default CoachTheme;
