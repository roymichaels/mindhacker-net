import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

export default function CorrectionsSection() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    try {
      sessionStorage.setItem(
        'aion.brain_focus',
        JSON.stringify({ intent: 'correct', prompt: text.trim() }),
      );
    } catch {}
    navigate('/aurora');
  };
  return (
    <section className="space-y-2 px-1">
      <h3 className="text-[10px] tracking-[0.32em] uppercase text-foreground/45">
        {isHe ? 'תיקונים' : 'Corrections'}
      </h3>
      <div className="rounded-2xl bg-foreground/[0.03] border border-white/[0.05] p-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder={
            isHe ? 'ספר ל-AION משהו…' : 'Tell AION something…'
          }
          className="w-full bg-transparent text-[13px] text-foreground placeholder:text-foreground/35 outline-none resize-none"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={send}
            disabled={!text.trim()}
            className="text-[12px] text-foreground/70 hover:text-foreground disabled:opacity-30 transition-colors"
          >
            {isHe ? 'שלח' : 'Send'} →
          </button>
        </div>
      </div>
    </section>
  );
}
