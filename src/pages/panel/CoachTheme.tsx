import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Image, FileText } from 'lucide-react';

const CoachTheme = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t('panel.coach.themeSettings')}
        </h1>
        <p className="text-muted-foreground">
          {t('panel.coach.customizeLook')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('panel.coach.colors')}
            </CardTitle>
            <CardDescription>
              {t('panel.coach.chooseColors')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('panel.coach.primaryColor')}</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 h-10 p-1" defaultValue="#7c3aed" />
                <Input placeholder="#7c3aed" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('panel.coach.secondaryColor')}</Label>
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
              {t('panel.coach.images')}
            </CardTitle>
            <CardDescription>
              {t('panel.coach.uploadImages')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('panel.coach.profileImage')}</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Button variant="outline" size="sm">
                  {t('panel.coach.uploadImage')}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('panel.coach.coverImage')}</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Button variant="outline" size="sm">
                  {t('panel.coach.uploadImage')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('panel.coach.profileContent')}
            </CardTitle>
            <CardDescription>
              {t('panel.coach.editProfileTexts')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('panel.coach.headline')}</Label>
              <Input placeholder={t('panel.coach.headlinePlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label>{t('panel.coach.shortBio')}</Label>
              <Textarea 
                placeholder={t('panel.coach.bioPlaceholder')} 
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          {t('panel.coach.saveChanges')}
        </Button>
      </div>
    </div>
  );
};

export default CoachTheme;
