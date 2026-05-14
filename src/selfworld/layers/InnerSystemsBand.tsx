/**
 * InnerSystemsBand — explorable layer registry. Most layers are locked
 * placeholders that reveal a presence-aware "AION is preparing this"
 * line on tap. Future phases flip `status: 'live'` per layer.
 */
import { useNavigate } from 'react-router-dom';
import LayerCard from '../LayerCard';
import { COGNITIVE_WORLDS } from '@/worlds/registry';
import { useTranslation } from '@/hooks/useTranslation';
import { useProfileModal } from '@/contexts/ProfileModalContext';

export default function InnerSystemsBand() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const profileModal = useProfileModal();

  // Show all worlds except SelfWorld itself (we are inside it).
  const worlds = COGNITIVE_WORLDS.filter((w) => w.id !== 'self');

  return (
    <section className="space-y-3 px-1">
      <div>
        <h3 className="text-[10px] tracking-[0.32em] uppercase text-foreground/45">
          {isHe ? 'מערכות פנימיות' : 'Inner Systems'}
        </h3>
        <p className="text-[11px] text-foreground/45 mt-1">
          {isHe
            ? 'שכבות שאתה תוכל לחקור ככל ש-AION יכיר אותך'
            : 'Layers you can explore as AION gets to know you'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {worlds.map((world) => {
          const navigable = world.status === 'live' || world.status === 'scaffold';
          return (
            <LayerCard
              key={world.id}
              icon={world.icon}
              label={isHe ? world.labelHe : world.labelEn}
              hint={isHe ? world.hintHe : world.hintEn}
              locked={!navigable}
              onOpen={() => {
                profileModal.closeProfile();
                navigate(`/worlds/${world.id}`);
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
