import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuestLaunchpadFlow } from '@/components/launchpad/GuestLaunchpadFlow';
import { useSEO } from '@/hooks/useSEO';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { Loader2 } from 'lucide-react';

const GuestLaunchpad = () => {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { isLaunchpadComplete, isLoading: launchpadLoading } = useLaunchpadProgress();

  useSEO({
    title: isRTL ? 'מסע טרנספורמציה חינמי | MindOS' : 'Free Transformation Journey | MindOS',
    description: isRTL 
      ? 'גלה את עצמך עם ניתוח תודעה AI, תוכנית 90 יום ופרופיל זהות אישי - חינם!'
      : 'Discover yourself with AI consciousness analysis, 90-day plan and identity profile - free!',
  });

  // Redirect authenticated users to their appropriate journey
  useEffect(() => {
    if (authLoading || launchpadLoading) return;
    
    if (user) {
      if (isLaunchpadComplete) {
        // User already completed - go to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // User logged in but not complete - go to authenticated launchpad
        navigate('/launchpad', { replace: true });
      }
    }
  }, [user, authLoading, launchpadLoading, isLaunchpadComplete, navigate]);

  const handleComplete = () => {
    navigate('/free-journey/complete');
  };

  const handleClose = () => {
    navigate('/free-journey');
  };

  // Show loading while checking auth
  if (authLoading || launchpadLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <GuestLaunchpadFlow 
      onComplete={handleComplete} 
      onClose={handleClose}
    />
  );
};

export default GuestLaunchpad;
