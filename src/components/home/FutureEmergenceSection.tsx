/**
 * FutureEmergenceSection — What is forming.
 * Phase 5K.2: replaces Play2Earn / FreeMarket / Guild / Roadmap on the public homepage.
 * Soft language. No timelines. No SaaS framing.
 */
import { motion } from 'framer-motion';

const emergences = [
  { label: 'Agents',     line: 'Quiet intelligences will arrive as AION grows.' },
  { label: 'Economy',    line: 'A field is forming around resonance, not transactions.' },
  { label: 'Worlds',     line: 'New realms will open as your trajectory deepens.' },
  { label: 'EvolvVerse', line: 'Many lives, one continuous intelligence.' },
];

export default function FutureEmergenceSection() {
  return (
    <section className="relative py-32 md:py-48">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/70">
            Emergence
          </p>
          <h2 className="mt-6 text-3xl md:text-5xl font-light text-foreground">
            What is forming
          </h2>
          <p className="mt-6 text-base text-muted-foreground/80 italic max-w-xl mx-auto">
            Not a roadmap. A direction the universe is already drifting toward.
          </p>
        </div>

        <div className="mt-20 space-y-10">
          {emergences.map((e, i) => (
            <motion.div
              key={e.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
              className="border-l border-primary/30 pl-6"
            >
              <div className="text-xs uppercase tracking-[0.25em] text-primary/70">
                {e.label}
              </div>
              <p className="mt-2 text-base md:text-lg text-muted-foreground leading-relaxed">
                {e.line}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}