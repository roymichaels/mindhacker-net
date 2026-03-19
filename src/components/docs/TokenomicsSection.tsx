import { motion } from 'framer-motion';
import { tokenomicsConfig } from '@/config/tokenomics';
import { TokenDistributionChart } from './tokenomics/TokenDistributionChart';
import { EconomicFlowVisual } from './tokenomics/EconomicFlowVisual';
import { FeeSystemCard } from './tokenomics/FeeSystemCard';
import { TokenUtilityGrid } from './tokenomics/TokenUtilityGrid';
import { EarningSourcesVisual } from './tokenomics/EarningSourcesVisual';
import { DataContributionCard } from './tokenomics/DataContributionCard';
import { SpendingSection } from './tokenomics/SpendingSection';
import { SinkMechanisms } from './tokenomics/SinkMechanisms';
import { RewardControlSection } from './tokenomics/RewardControlSection';
import { ReputationLayer } from './tokenomics/ReputationLayer';
import { WalletPreview } from './tokenomics/WalletPreview';
import { SustainabilitySection } from './tokenomics/SustainabilitySection';

interface Props {
  isHe: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Sub({ num, title, children, isHe }: { num: string; title: string; children: React.ReactNode; isHe: boolean }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
      <h3
        dir={isHe ? 'rtl' : 'ltr'}
        className={`text-xl font-bold text-foreground flex items-baseline gap-2 ${isHe ? 'text-right' : 'text-left'}`}
      >
        {num ? (
          <span dir="ltr" className="text-primary/70 text-base shrink-0">
            {num}
          </span>
        ) : null}
        <span style={{ unicodeBidi: 'plaintext' }}>{title}</span>
      </h3>
      {children}
    </motion.div>
  );
}

export function TokenomicsSection({ isHe }: Props) {
  const cfg = tokenomicsConfig;
  const t = (en: string, he: string) => isHe ? he : en;

  return (
    <div className="space-y-10">
      {/* 19.1 What is MOS */}
      <Sub num="19.1" title={t('What is MOS?', 'מהו MOS?')} isHe={isHe}>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[hsl(270,70%,60%)] flex items-center justify-center text-sm font-bold text-white">
              $
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">MOS</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(cfg.token.description.en, cfg.token.description.he)}
          </p>
          <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
            <span>{t('Token', 'טוקן')}: <span className="text-foreground font-semibold">{cfg.token.name}</span></span>
            <span>{t('Total Supply', 'סך היצע')}: <span className="text-foreground font-semibold">{cfg.token.totalSupply.toLocaleString()}</span></span>
            <span>{t('Rate', 'שער')}: <span className="text-foreground font-semibold">{cfg.token.rate}</span></span>
          </div>
        </div>
      </Sub>

      {/* 19.2 Supply & Distribution */}
      <Sub num="19.2" title={t('Supply & Distribution', 'היצע וחלוקה')} isHe={isHe}>
        <p className="text-xs text-muted-foreground">{t('Allocation at genesis. Not all tokens are immediately circulating.', 'הקצאה בג׳נסיס. לא כל הטוקנים במחזור מיידי.')}</p>
        <TokenDistributionChart distribution={cfg.distribution} isHe={isHe} />
      </Sub>

      {/* 19.3 Token Utility */}
      <Sub num="19.3" title={t('Token Utility', 'שימושי הטוקן')} isHe={isHe}>
        <TokenUtilityGrid items={cfg.utility} isHe={isHe} />
      </Sub>

      {/* 19.4 Earning MOS */}
      <Sub num="19.4" title={t('Earning MOS', 'איך מרוויחים MOS')} isHe={isHe}>
        <EarningSourcesVisual items={cfg.earningSources} isHe={isHe} />
        <DataContributionCard config={cfg.dataContribution} isHe={isHe} />
      </Sub>

      {/* 19.5 Spending MOS */}
      <Sub num="19.5" title={t('Spending MOS', 'הוצאת MOS')} isHe={isHe}>
        <SpendingSection items={cfg.spending} isHe={isHe} />
      </Sub>

      {/* 19.6 Marketplace & Fee System */}
      <Sub num="19.6" title={t('Marketplace & Fee System', 'שוק ומערכת עמלות')} isHe={isHe}>
        <FeeSystemCard fee={cfg.platformFee} isHe={isHe} />
      </Sub>

      {/* 19.7 Economic Loop */}
      <Sub num="19.7" title={t('Economic Loop', 'מחזור כלכלי')} isHe={isHe}>
        <EconomicFlowVisual isHe={isHe} />
      </Sub>

      {/* 19.8 Token Sink Mechanisms */}
      <Sub num="19.8" title={t('Token Sink Mechanisms', 'מנגנוני ספיגת טוקנים')} isHe={isHe}>
        <p className="text-sm text-muted-foreground">{t('Mechanisms that permanently remove tokens from circulation, maintaining long-term balance.', 'מנגנונים שמסירים טוקנים לצמיתות ממחזור, ושומרים על איזון ארוך טווח.')}</p>
        <SinkMechanisms items={cfg.sinkMechanisms} futureNote={cfg.sinkFuture} isHe={isHe} />
      </Sub>

      {/* 19.9 Reward Control System */}
      <Sub num="19.9" title={t('Reward Control System', 'מערכת בקרת תגמולים')} isHe={isHe}>
        <RewardControlSection config={cfg.rewardControl} isHe={isHe} />
      </Sub>

      {/* 19.10 Reputation Layer */}
      <Sub num="19.10" title={t('Reputation Layer', 'שכבת מוניטין')} isHe={isHe}>
        <ReputationLayer config={cfg.reputation} isHe={isHe} />
      </Sub>

      {/* Wallet Preview */}
      <Sub num="" title={t('Wallet Preview', 'תצוגת ארנק')} isHe={isHe}>
        <WalletPreview data={cfg.walletPreview} isHe={isHe} />
      </Sub>

      {/* 19.11 Sustainability */}
      <Sub num="19.11" title={t('Sustainability & Trust', 'קיימות ואמון')} isHe={isHe}>
        <SustainabilitySection items={cfg.sustainability} isHe={isHe} />
      </Sub>
    </div>
  );
}
