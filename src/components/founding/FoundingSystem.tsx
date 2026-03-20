import { motion } from 'framer-motion';

const steps = [
  { icon: '🚪', text: 'נכנסים למערכת', glow: '#7c3aed' },
  { icon: '🧭', text: 'בוחרים כיוון', glow: '#6366f1' },
  { icon: '🎯', text: 'מקבלים משימות', glow: '#3b82f6' },
  { icon: '📈', text: 'מתקדמים', glow: '#06b6d4' },
  { icon: '💰', text: 'מתחילים להרוויח', glow: '#10b981' },
];

const FoundingSystem = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80svh] px-6 relative z-10" dir="rtl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        className="text-2xl md:text-4xl font-bold text-white mb-12 text-center"
      >
        איך זה עובד?
      </motion.h2>

      <div className="flex flex-col items-center gap-0 max-w-sm w-full">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            <div className="flex items-center gap-4 p-4 rounded-2xl w-full"
              style={{
                background: `linear-gradient(135deg, ${step.glow}12, transparent)`,
                border: `1px solid ${step.glow}25`,
              }}>
              <span className="text-2xl">{step.icon}</span>
              <span className="text-white/90 text-lg font-medium">{step.text}</span>
            </div>
            {i < steps.length - 1 && (
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.12, duration: 0.3 }}
                className="w-px h-8 origin-top"
                style={{ background: `linear-gradient(to bottom, ${step.glow}60, ${steps[i+1].glow}60)` }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FoundingSystem;
