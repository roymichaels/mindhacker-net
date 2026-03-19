import { motion } from 'framer-motion';
import { tokenomicsConfig } from '@/config/tokenomics';
import { TokenDistributionChart } from './tokenomics/TokenDistributionChart';
import { EconomicFlowVisual } from './tokenomics/EconomicFlowVisual';
import { FeeSystemCard } from './tokenomics/FeeSystemCard';
import { TokenUtilityGrid } from './tokenomics/TokenUtilityGrid';
import { EarningSourcesVisual } from './tokenomics/EarningSourcesVisual';
import { WalletPreview } from './tokenomics/WalletPreview';
import { SustainabilitySection } from './tokenomics/SustainabilitySection';

interface Props {
  isHe: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function TokenomicsSection({ isHe }: Props) {
  const cfg = tokenomicsConfig;
  const t = (en: string, he: string) => isHe ? he : en;

  return (
    <div className="space-y-10">
      {/* Intro */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[hsl(270,70%,60%)] flex items-center justify-center text-sm font-bold text-white">
            $
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{t('What is MOS?', 'מהו MOS?')}</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t(cfg.token.description.en, cfg.token.description.he)}
        </p>
        <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
          <span>{t('Token', 'טוקן')}: <span className="text-foreground font-semibold">{cfg.token.name}</span></span>
          <span>{t('Total Supply', 'סך היצע')}: <span className="text-foreground font-semibold">{cfg.token.totalSupply.toLocaleString()}</span></span>
          <span>{t('Rate', 'שער')}: <span className="text-foreground font-semibold">100 MOS = $1.00</span></span>
        </div>
      </motion.div>

      {/* Distribution */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">{t('Token Distribution', 'חלוקת טוקנים')}</h3>
        <p className="text-xs text-muted-foreground">{t('Allocation at genesis. Not all tokens are immediately circulating.', 'הקצאה בג׳נסיס. לא כל הטוקנים במחזור מיידי.')}</p>
        <TokenDistributionChart distribution={cfg.distribution} isHe={isHe} />
      </motion.div>

      {/* Economic Flow */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">{t('Economic Flow', 'מחזור כלכלי')}</h3>
        <EconomicFlowVisual isHe={isHe} />
      </motion.div>

      {/* Fee System */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">{t('Marketplace Fee System', 'מערכת עמלות')}</h3>
        <FeeSystemCard fee={cfg.platformFee} isHe={isHe} />
      </motion.div>

      {/* Utility Grid */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">{t('Token Utility', 'שימושי הטוקן')}</h3>
        <TokenUtilityGrid items={cfg.utility} isHe={isHe} />
      </motion.div>

      {/* Earning Sources */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">{t('How to Earn MOS', 'איך מרוויחים MOS')}</h3>
        <EarningSourcesVisual items={cfg.earningSources} isHe={isHe} />
      </motion.div>

      {/* Wallet Preview */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">{t('Wallet Preview', 'תצוגת ארנק')}</h3>
        <WalletPreview data={cfg.walletPreview} isHe={isHe} />
      </motion.div>

      {/* Sustainability */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">{t('Sustainability & Trust', 'קיימות ואמון')}</h3>
        <SustainabilitySection items={cfg.sustainability} isHe={isHe} />
      </motion.div>
    </div>
  );
}
