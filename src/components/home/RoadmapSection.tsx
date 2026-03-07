/**
 * RoadmapSection — Web3-style roadmap for the homepage
 */
import { useTranslation } from '@/hooks/useTranslation';
import { Web3Roadmap } from '@/components/docs/Web3Roadmap';
import { motion } from 'framer-motion';

export default function RoadmapSection() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 block">
            {isHe ? 'מפת דרכים' : 'Roadmap'}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
            {isHe ? 'לאן אנחנו הולכים' : 'Where We\'re Heading'}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            {isHe
              ? 'המסע מ-Beta לאקוסיסטם Web3 מלא'
              : 'The journey from Beta to a full Web3 ecosystem'}
          </p>
        </motion.div>

        <Web3Roadmap isHe={isHe} />
      </div>
    </section>
  );
}
