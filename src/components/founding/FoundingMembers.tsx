import { motion } from 'framer-motion';

const FoundingMembers = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85svh] px-6 text-center relative z-10" dir="rtl">
      {/* Ambient glow behind number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-6"
      >
        <div className="text-8xl md:text-[10rem] font-black text-transparent bg-clip-text leading-none"
          style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
          100
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-4xl font-bold text-white mb-4"
      >
        לא משתמשים — מייסדים
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-white/50 text-lg mb-8 max-w-md"
      >
        אנחנו פותחים עכשיו את המעגל הראשון.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 max-w-sm w-full"
      >
        {[
          { text: 'קבוצה קטנה של 100 אנשים', icon: '🎯' },
          { text: 'כניסה דרך בקשה בלבד', icon: '🔐' },
          { text: 'לא כולם מתקבלים', icon: '⚡' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 + i * 0.15 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-white/8"
            style={{ background: 'rgba(124,58,237,0.05)' }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-white/70 text-base">{item.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FoundingMembers;
