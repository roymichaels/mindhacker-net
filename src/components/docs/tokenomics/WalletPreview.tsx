import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownRight, ReceiptText } from 'lucide-react';
import { tokenomicsConfig } from '@/config/tokenomics';

type Data = typeof tokenomicsConfig.walletPreview;

interface Props {
  data: Data;
  isHe: boolean;
}

const stats = (data: Data, isHe: boolean) => [
  { icon: Wallet, label: isHe ? 'יתרה' : 'Balance', value: data.balance, color: 'text-primary' },
  { icon: ArrowUpRight, label: isHe ? 'הרווחת' : 'Earned', value: data.earned, color: 'text-[hsl(160,70%,45%)]' },
  { icon: ArrowDownRight, label: isHe ? 'הוצאת' : 'Spent', value: data.spent, color: 'text-[hsl(340,75%,55%)]' },
  { icon: ReceiptText, label: isHe ? 'עמלות' : 'Fees', value: data.fees, color: 'text-[hsl(270,70%,60%)]' },
];

export function WalletPreview({ data, isHe }: Props) {
  const items = stats(data, isHe);

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-border/50 flex items-center gap-2">
        <Wallet className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-foreground">MOS Wallet</span>
        <span className="text-[10px] text-muted-foreground ms-auto">{isHe ? 'תצוגה מקדימה' : 'Preview'}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
            className="bg-card p-4 text-center"
          >
            <item.icon className={`w-4 h-4 mx-auto mb-1 ${item.color}`} />
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="text-lg font-bold text-foreground font-mono">{item.value.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">MOS</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
