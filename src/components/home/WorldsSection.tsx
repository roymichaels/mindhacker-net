/**
 * WorldsSection — Realms you enter.
 * Phase 5K.2: replaces app-category framing with cognitive-realm tiles.
 */
import { motion } from 'framer-motion';

const realms = [
  { name: 'Self',    line: 'Who you are, in motion.' },
  { name: 'Journey', line: 'Where you are going.' },
  { name: 'Brain',   line: 'How AION thinks alongside you.' },
  { name: 'World',   line: 'The field around your life.' },
  { name: 'Chat',    line: 'A continuous conversation.' },
];

export default function WorldsSection() {
  return (
    <section className="relative py-32 md:py-48">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/70">Worlds</p>
          <h2 className="mt-6 text-3xl md:text-5xl font-light text-foreground">
            Realms you enter
          </h2>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Not screens. Not tabs. Living regions of a single intelligence.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {realms.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
              className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md px-5 py-8 text-center"
            >
              <div className="text-xs uppercase tracking-[0.25em] text-primary/70">
                {r.name}
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {r.line}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}