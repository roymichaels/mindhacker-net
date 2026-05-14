/**
 * InnerSystemsBand — explorable layer registry. Most layers are locked
 * placeholders that reveal a presence-aware "AION is preparing this"
 * line on tap. Future phases flip `status: 'live'` per layer.
 */
import LayerCard from '../LayerCard';
import { SELFWORLD_LAYERS } from '../layerRegistry';
import { useTranslation } from '@/hooks/useTranslation';

export default function InnerSystemsBand() {
  const { language } = useTranslation();
  const isHe = language === 'he';

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
        {SELFWORLD_LAYERS.map((layer) => (
          <LayerCard
            key={layer.id}
            icon={layer.icon}
            label={isHe ? layer.labelHe : layer.labelEn}
            hint={isHe ? layer.hintHe : layer.hintEn}
            locked={layer.status !== 'live'}
          />
        ))}
      </div>
    </section>
  );
}
