import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import UsernameGate from '@/components/community/UsernameGate';
import CommunityHeader from '@/components/community/CommunityHeader';
import PillarTabs from '@/components/community/PillarTabs';
import ThreadList from '@/components/community/ThreadList';
import CreateThreadModal from '@/components/community/CreateThreadModal';
import CommunityMiniProfile from '@/components/community/CommunityMiniProfile';

const Community = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedPillar, setSelectedPillar] = useState('all');
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
      <div className="min-h-screen bg-background pb-20">
        <CommunityHeader onCreateThread={() => setCreateOpen(true)} />
        <PillarTabs
          selected={selectedPillar}
          onSelect={setSelectedPillar}
        />
        <ThreadList
          pillarFilter={selectedPillar}
          onProfileClick={(uid) => setProfileUserId(uid)}
        />
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
