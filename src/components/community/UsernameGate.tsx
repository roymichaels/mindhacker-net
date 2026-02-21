import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCommunityUsername } from '@/hooks/useCommunityUsername';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface UsernameGateProps {
  children: React.ReactNode;
}

/**
 * If the user has no community_username set, show a one-time setup screen.
 */
export default function UsernameGate({ children }: UsernameGateProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { username, isLoading, setUsername } = useCommunityUsername();
  const [input, setInput] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (username) {
    return <>{children}</>;
  }

  const handleSubmit = async () => {
    const trimmed = input.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (trimmed.length < 3) {
      toast.error(isHe ? 'שם משתמש חייב להיות לפחות 3 תווים' : 'Username must be at least 3 characters');
      return;
    }
    try {
      await setUsername.mutateAsync(trimmed);
      toast.success(isHe ? 'שם משתמש נקבע!' : 'Username set!');
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className="text-5xl">🌐</div>
        <h2 className="text-xl font-bold">
          {isHe ? 'בחר שם משתמש לקומיוניטי' : 'Choose your Community Username'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isHe 
            ? 'השם הזה יוצג בכל השרשורים והתגובות שלך. לא ניתן לשנות אותו.'
            : 'This name will appear on all your threads and replies. It cannot be changed.'
          }
        </p>
        <div className="space-y-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}
            placeholder={isHe ? 'שם_משתמש' : 'username'}
            maxLength={20}
            dir="ltr"
            className="text-center text-lg"
          />
          <p className="text-[10px] text-muted-foreground">
            {isHe ? 'אותיות קטנות, מספרים ו-_ בלבד. 3-20 תווים.' : 'Lowercase letters, numbers, and _ only. 3-20 chars.'}
          </p>
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={input.length < 3 || setUsername.isPending}
          >
            {setUsername.isPending 
              ? '...' 
              : (isHe ? 'אשר וכנס לקומיוניטי' : 'Confirm & Enter Community')
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
