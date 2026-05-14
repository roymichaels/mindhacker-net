/**
 * BrainGraphBand — peer band exposing the cognitive map (brain/atlas)
 * as a top-level SelfWorld layer rather than burying it in settings.
 */
import { useNavigate } from 'react-router-dom';
import LayerCard from '../LayerCard';
import { Network } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useProfileModal } from '@/contexts/ProfileModalContext';

export default function BrainGraphBand() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const profileModal = useProfileModal();

  const open = () => {
    profileModal.closeProfile();
    navigate('/brain');
  };

  return (
    <section className="space-y-3 px-1">
      <div>
        <h3 className="text-[10px] tracking-[0.32em] uppercase text-foreground/45">
          {isHe ? 'מפה קוגניטיבית' : 'Cognitive Map'}
        </h3>
        <p className="text-[11px] text-foreground/45 mt-1">
          {isHe ? 'גרף המוח שלך — איך הכל מתחבר' : 'Your brain graph — how everything connects'}
        </p>
      </div>
      <LayerCard
        icon={Network}
        label={isHe ? 'גרף המוח' : 'Brain Graph'}
        hint={isHe ? 'חקור את הצמתים והקשרים שלך' : 'Explore your nodes and connections'}
        onOpen={open}
      />
    </section>
  );
}
