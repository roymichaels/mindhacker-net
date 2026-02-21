import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

import CombatHeader from '@/components/combat-community/CombatHeader';
import CombatCategoryTabs from '@/components/combat-community/CombatCategoryTabs';
import CombatThreadList from '@/components/combat-community/CombatThreadList';
import CreateThreadModal from '@/components/combat-community/CreateThreadModal';
import CombatMiniProfile from '@/components/combat-community/CombatMiniProfile';

const CombatCommunity = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
        <CombatHeader onCreateThread={() => setCreateOpen(true)} />
        <CombatCategoryTabs 
          selected={selectedCategory} 
          onSelect={setSelectedCategory} 
        />
        <CombatThreadList 
          categoryFilter={selectedCategory}
          onProfileClick={(uid) => setProfileUserId(uid)}
        />
        <CreateThreadModal 
          open={createOpen} 
          onOpenChange={setCreateOpen} 
        />
        <CombatMiniProfile
          userId={profileUserId}
          open={!!profileUserId}
          onClose={() => setProfileUserId(null)}
        />
    </div>
  );
};

export default CombatCommunity;
