/**
 * PresenceBand — top of SelfWorld. Canonical AION as the living guide.
 * Reuses the already-shipped AionPresenceHero so the visual stays
 * consistent with the rest of the app.
 */
import AionPresenceHero from '@/components/self/sections/AionPresenceHero';

export default function PresenceBand() {
  return (
    <section className="px-1">
      <AionPresenceHero />
    </section>
  );
}
