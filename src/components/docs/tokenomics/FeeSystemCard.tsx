import { motion } from 'framer-motion';
import { tokenomicsConfig } from '@/config/tokenomics';

type FeeConfig = typeof tokenomicsConfig.platformFee;

interface Props {
  fee: FeeConfig;
  isHe: boolean;
}

export function FeeSystemCard({ fee, isHe }: Props) {
  const t = (en: string, he: string) => isHe ? he : en;

  return (
    <div className="rounded-xl border border-border bg-card/50 p-5 space-y-5">
      <p className="text-sm text-muted-foreground">
        {t(
          `Every transaction inside the FreeMarket has a ${fee.rate}% platform fee.`,
          `לכל עסקה ב-FreeMarket יש עמלת פלטפורמה של ${fee.rate}%.`,
        )}
      </p>

      {/* Example */}
      <div className="rounded-lg bg-muted/30 border border-border p-4 space-y-3">
        <p className="text-xs font-semibold text-foreground">{t('Example Transaction', 'עסקה לדוגמה')}</p>
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="bg-primary/10 text-primary rounded-md px-2.5 py-1 font-mono font-bold">{fee.example.payment} MOS</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-foreground font-medium">{fee.example.toSeller} MOS {t('to seller', 'למוכר')}</span>
          <span className="text-muted-foreground">+</span>
          <span className="text-foreground font-medium">{fee.example.toFee} MOS {t('fee', 'עמלה')}</span>
        </div>
      </div>

      {/* Fee split */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground">
          {t(`${fee.example.toFee} MOS Fee Split`, `חלוקת ${fee.example.toFee} MOS עמלה`)}
        </p>
        {/* Visual bar */}
        <div className="flex h-3 rounded-full overflow-hidden">
          {fee.allocation.map(a => (
            <motion.div
              key={a.key}
              initial={{ width: 0 }}
              whileInView={{ width: `${a.pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true }}
              style={{ backgroundColor: a.color }}
              className="h-full first:rounded-s-full last:rounded-e-full"
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          {fee.allocation.map(a => (
            <div key={a.key} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: a.color }} />
              <span>{isHe ? a.he : a.en} ({a.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
