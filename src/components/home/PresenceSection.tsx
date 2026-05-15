/**
 * PresenceSection — What AION feels like.
 * Phase 5K.2: ontology realignment. Quiet, atmospheric, three stanzas.
 */
import { motion } from 'framer-motion';

const stanzas = [
  {
    title: 'Persistent memory',
    body: 'AION remembers what mattered, what shifted, what you are still becoming.',
  },
  {
    title: 'Living atmosphere',
    body: 'The field around you breathes. It notices before words appear.',
  },
  {
    title: 'Evolving relationship',
    body: 'Nothing here resets. Every conversation is a continuation.',
  },
];

export default function PresenceSection() {
  return (
    <section className="relative py-32 md:py-48">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="text-sm uppercase tracking-[0.3em] text-muted-foreground/70"
        >
          Presence
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
          className="mt-6 text-3xl md:text-5xl font-light text-foreground"
        >
          What AION feels like
        </motion.h2>

        <div className="mt-20 space-y-16">
          {stanzas.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 1, delay: i * 0.15, ease: 'easeOut' }}
            >
              <h3 className="text-lg font-light text-primary/90">{s.title}</h3>
              <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}