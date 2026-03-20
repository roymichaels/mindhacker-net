import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getStoredAffiliateCode } from '@/components/AffiliateTracker';
import { Loader2, CheckCircle } from 'lucide-react';

const FoundingApplyForm = () => {
  const [form, setForm] = useState({
    name: '',
    social_handle: '',
    occupation: '',
    why_join: '',
    how_contribute: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('נא למלא שם');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const referralCode = getStoredAffiliateCode();
      const { error: dbError } = await supabase
        .from('founding_applications' as any)
        .insert({
          name: form.name.trim(),
          social_handle: form.social_handle.trim() || null,
          occupation: form.occupation.trim() || null,
          why_join: form.why_join.trim() || null,
          how_contribute: form.how_contribute.trim() || null,
          referral_code: referralCode || null,
        } as any);

      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err: any) {
      setError('שגיאה בשליחה. נסה שוב.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 text-base backdrop-blur-sm';

  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] px-6 relative z-10 pb-32" dir="rtl">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center flex flex-col items-center gap-6"
          >
            <div className="p-4 rounded-full" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">הבקשה נשלחה!</h3>
            <p className="text-white/50 max-w-sm">
              אם התקבלת — ניצור איתך קשר בקרוב.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-5"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              הגש בקשה להצטרף
            </h2>

            <input
              className={inputClass}
              placeholder="שם *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder="אינסטגרם / טלגרם"
              value={form.social_handle}
              onChange={(e) => setForm((f) => ({ ...f, social_handle: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder="מה אתה עושה היום?"
              value={form.occupation}
              onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
            />
            <textarea
              className={`${inputClass} min-h-[80px] resize-none`}
              placeholder="למה אתה רוצה להצטרף?"
              value={form.why_join}
              onChange={(e) => setForm((f) => ({ ...f, why_join: e.target.value }))}
            />
            <textarea
              className={`${inputClass} min-h-[80px] resize-none`}
              placeholder="איך היית לוקח חלק?"
              value={form.how_contribute}
              onChange={(e) => setForm((f) => ({ ...f, how_contribute: e.target.value }))}
            />

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <motion.button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                boxShadow: '0 0 30px rgba(124,58,237,0.4)',
              }}
              whileTap={{ scale: 0.97 }}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'שלח בקשה'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoundingApplyForm;
