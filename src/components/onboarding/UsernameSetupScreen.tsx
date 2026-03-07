import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCommunityUsername } from '@/hooks/useCommunityUsername';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { User, Sparkles, Shield, Globe } from 'lucide-react';

/**
 * Full-screen username setup required after onboarding completion.
 * Beautiful, immersive experience before entering the app.
 */
export function UsernameSetupScreen() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { setUsername } = useCommunityUsername();
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    const trimmed = input.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (trimmed.length < 3) {
      toast.error(isHe ? 'שם משתמש חייב להיות לפחות 3 תווים' : 'Username must be at least 3 characters');
      return;
    }
    try {
      await setUsername.mutateAsync(trimmed);
      toast.success(isHe ? '🎉 ברוך הבא!' : '🎉 Welcome aboard!');
    } catch (err: any) {
      if (err.message?.includes('already taken')) {
        toast.error(isHe ? 'שם המשתמש כבר תפוס, נסה אחר' : 'Username already taken, try another');
      } else {
        toast.error(err.message || 'Error');
      }
    }
  };

  const features = [
    {
      icon: Globe,
      title: isHe ? 'הזהות שלך בפלטפורמה' : 'Your platform identity',
      desc: isHe ? 'כל הפעילויות שלך יוצגו תחת השם הזה' : 'All your activity will appear under this name',
    },
    {
      icon: Shield,
      title: isHe ? 'פרטיות מלאה' : 'Full privacy',
      desc: isHe ? 'בחר כינוי שמרגיש נכון לך' : 'Choose a name that feels right for you',
    },
    {
      icon: Sparkles,
      title: isHe ? 'ייחודי לך' : 'Unique to you',
      desc: isHe ? 'אף אחד אחר לא יכול להשתמש בו' : 'No one else can use it',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" dir={isHe ? 'rtl' : 'ltr'}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative max-w-md w-full space-y-8 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center"
        >
          <User className="w-10 h-10 text-primary" />
        </motion.div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {isHe ? 'שלב אחרון — בחר שם משתמש' : 'One last step — Choose your username'}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {isHe
              ? 'השם הזה ילווה אותך בכל הפלטפורמה — בקומיוניטי, בדירוגים ובפרופיל שלך.'
              : 'This name will follow you across the platform — in the community, rankings, and your profile.'}
          </p>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-medium pointer-events-none">@</span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isHe ? 'your_username' : 'your_username'}
              maxLength={20}
              dir="ltr"
              className="text-center text-lg h-12 pl-8 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              onKeyDown={(e) => e.key === 'Enter' && input.length >= 3 && handleSubmit()}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isHe ? 'אותיות קטנות באנגלית, מספרים ו-_ בלבד. 3-20 תווים.' : 'Lowercase letters, numbers, and _ only. 3-20 characters.'}
          </p>
        </div>

        {/* Features */}
        <div className="grid gap-3 text-start">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isHe ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-card/30 border border-border/20"
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit */}
        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handleSubmit}
          disabled={input.length < 3 || setUsername.isPending}
        >
          {setUsername.isPending
            ? '...'
            : (isHe ? 'אישור וכניסה למערכת' : 'Confirm & Enter')}
        </Button>
      </motion.div>
    </div>
  );
}