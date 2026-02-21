import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import UsernameGate from '@/components/community/UsernameGate';
import CommunityHeader from '@/components/community/CommunityHeader';
import PillarTabs from '@/components/community/PillarTabs';
import PillarChat from '@/components/community/PillarChat';
import CreateThreadModal from '@/components/community/CreateThreadModal';
import CommunityMiniProfile from '@/components/community/CommunityMiniProfile';
import { useIsMobile } from '@/hooks/use-mobile';

const Community = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedPillar, setSelectedPillar] = useState('consciousness');
  const [createOpen, setCreateOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  useSEO({
    title: 'MindOS Community',
    description: '13 pillars. One civilization.',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/community');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <UsernameGate>
      <div
        className="flex flex-col bg-background"
        style={{ height: isMobile ? 'calc(100dvh - 56px)' : '100dvh' }}
      >
        {/* Header + Tabs - fixed top */}
        <div className="shrink-0">
          <CommunityHeader onCreateThread={() => setCreateOpen(true)} />
          <PillarTabs
            selected={selectedPillar}
            onSelect={setSelectedPillar}
          />
        </div>

        {/* Chat area - fills remaining space, input docked to bottom */}
        <div className="flex-1 min-h-0">
          <PillarChat key={selectedPillar} pillar={selectedPillar} />
        </div>

        <CreateThreadModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          defaultPillar={selectedPillar !== 'all' ? selectedPillar : undefined}
        />
        <CommunityMiniProfile
          userId={profileUserId}
          open={!!profileUserId}
          onClose={() => setProfileUserId(null)}
        />
      </div>
    </UsernameGate>
  );
};

export default Community;
