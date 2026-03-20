import { motion } from 'framer-motion';

const steps = [
  { icon: '🚪', text: 'נכנסים למערכת' },
  { icon: '🧭', text: 'בוחרים כיוון' },
  { icon: '🎯', text: 'מקבלים משימות' },
  { icon: '📈', text: 'מתקדמים' },
  { icon: '💰', text: 'מתחילים להרוויח' },
];

const FoundingSystem = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] px-6 relative z-10" dir="rtl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-4xl font-bold text-white mb-12 text-center"
      >
        איך זה עובד?
      </motion.h2>

      <div className="flex flex-col items-center gap-0 max-w-sm w-full">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.2, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-4 p-4 rounded-2xl w-full"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
              <span className="text-2xl">{step.icon}</span>
              <span className="text-white/90 text-lg font-medium">{step.text}</span>
            </div>
            {i < steps.length - 1 && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.4 + i * 0.2, duration: 0.3 }}
                className="w-px h-8 origin-top"
                style={{ background: 'linear-gradient(to bottom, rgba(124,58,237,0.4), rgba(6,182,212,0.4))' }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FoundingSystem;
