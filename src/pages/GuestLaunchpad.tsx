import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LaunchpadFlow } from '@/components/launchpad';
import { useSEO } from '@/hooks/useSEO';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const GuestLaunchpad = () => {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  useSEO({
    title: isRTL ? 'מסע טרנספורמציה חינמי | MindOS' : 'Free Transformation Journey | MindOS',
    description: isRTL 
      ? 'גלה את עצמך עם ניתוח תודעה AI, תוכנית 90 יום ופרופיל זהות אישי - חינם!'
      : 'Discover yourself with AI consciousness analysis, 90-day plan and identity profile - free!',
  });

  // Redirect authenticated users to the authenticated launchpad
  useEffect(() => {
    if (authLoading) return;
    
    if (user) {
      navigate('/launchpad', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleComplete = () => {
    navigate('/free-journey/complete');
  };

  const handleClose = () => {
    navigate('/free-journey');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <LaunchpadFlow 
      mode="guest"
      onComplete={handleComplete} 
      onClose={handleClose}
    />
  );
};

export default GuestLaunchpad;
