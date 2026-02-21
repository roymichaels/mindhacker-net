import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import UsernameGate from '@/components/community/UsernameGate';
import CommunityHeader from '@/components/community/CommunityHeader';
import PillarTabs from '@/components/community/PillarTabs';
import CreateThreadModal from '@/components/community/CreateThreadModal';
import CommunityMiniProfile from '@/components/community/CommunityMiniProfile';

const Community = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { setActivePillar, setIsChatExpanded } = useAuroraChatContext();
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

  // Set pillar context for the dock and auto-expand
  useEffect(() => {
    setActivePillar(selectedPillar);
    setIsChatExpanded(true);
    return () => {
      setActivePillar(null);
      setIsChatExpanded(false);
    };
  }, [selectedPillar, setActivePillar, setIsChatExpanded]);

  const handlePillarSelect = (pillar: string) => {
    setSelectedPillar(pillar);
  };

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
      <div className="bg-background pb-20">
        <CommunityHeader onCreateThread={() => setCreateOpen(true)} />
        <PillarTabs
          selected={selectedPillar}
          onSelect={handlePillarSelect}
        />
        {/* The AuroraDock at the bottom handles the chat — 
            it reads activePillar from context and shows pillar-scoped conversation */}
        <CreateThreadModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          defaultPillar={selectedPillar}
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
