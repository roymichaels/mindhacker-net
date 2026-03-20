import { motion } from 'framer-motion';

const FoundingMembers = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] px-6 text-center relative z-10" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <div className="text-7xl md:text-9xl font-black text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
          100
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl md:text-4xl font-bold text-white mb-6"
      >
        לא משתמשים — מייסדים
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-md space-y-4"
      >
        <p className="text-white/60 text-lg leading-relaxed">
          המעגל הראשון מוגבל ל-100 אנשים בלבד.
        </p>
        <p className="text-white/60 text-lg leading-relaxed">
          אלה לא משתמשים רגילים — אלה השותפים הראשונים שבונים את המערכת מאפס.
        </p>
        <p className="text-white/40 text-base">
          הכניסה דרך בקשה בלבד.
        </p>
      </motion.div>
    </div>
  );
};

export default FoundingMembers;
