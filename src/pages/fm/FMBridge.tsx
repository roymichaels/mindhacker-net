/**
 * Phase 4: Solana SPL Bridge — UI scaffold (no live integration yet).
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Copy, Link2, Info, ArrowRightLeft, Shield, Zap, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMWallet } from '@/hooks/useFMWallet';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const MOS_TO_USD = 0.01;

type BridgeStep = 'overview' | 'connect' | 'transfer' | 'history';

// Mock on-chain history
const MOCK_BRIDGE_HISTORY = [
  { id: '1', direction: 'out', amount: 10000, tx_hash: '5xYz...9AbC', status: 'confirmed', created_at: '2026-02-25T12:00:00Z' },
  { id: '2', direction: 'in', amount: 3000, tx_hash: '8dEf...3GhI', status: 'pending', created_at: '2026-03-04T09:15:00Z' },
];

export default function FMBridge() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { wallet } = useFMWallet();
  const navigate = useNavigate();
  const [step, setStep] = useState<BridgeStep>('overview');
  const [direction, setDirection] = useState<'to_chain' | 'from_chain'>('to_chain');
  const [amount, setAmount] = useState('');
  const [walletConnected] = useState(false); // Placeholder

  const balance = wallet?.mos_balance ?? 0;
  const solAddress = wallet?.solana_address;
  const amountNum = parseInt(amount) || 0;

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-violet-500" />
            {isHe ? 'גשר Solana' : 'Solana Bridge'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isHe ? 'העבר MOS לטוקן SPL על שרשרת Solana' : 'Bridge MOS to SPL token on Solana blockchain'}
          </p>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-xl p-1">
        {([
          { id: 'overview' as BridgeStep, en: 'Overview', he: 'סקירה' },
          { id: 'connect' as BridgeStep, en: 'Wallet', he: 'ארנק' },
          { id: 'transfer' as BridgeStep, en: 'Bridge', he: 'גשר' },
          { id: 'history' as BridgeStep, en: 'History', he: 'היסטוריה' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setStep(t.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${step === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {isHe ? t.he : t.en}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {step === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Info banner */}
          <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isHe ? 'MOS → Solana SPL Token' : 'MOS → Solana SPL Token'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isHe
                  ? 'הגשר יאפשר לך להעביר MOS מהארנק הפנימי לטוקן SPL על בלוקצ׳יין Solana. שלב זה נמצא בפיתוח.'
                  : 'The bridge will allow you to transfer MOS from your internal wallet to an SPL token on the Solana blockchain. This feature is under development.'}
              </p>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Zap className="w-5 h-5" />, en: 'Fast Transfers', he: 'העברות מהירות', descEn: '< 5 second finality', descHe: 'סיום ב-5 שניות', cls: 'text-amber-500' },
              { icon: <Shield className="w-5 h-5" />, en: 'Secure Bridge', he: 'גשר מאובטח', descEn: 'Audited smart contracts', descHe: 'חוזים חכמים מבוקרים', cls: 'text-emerald-500' },
              { icon: <ArrowRightLeft className="w-5 h-5" />, en: 'Two-Way', he: 'דו-כיווני', descEn: 'Bridge in & out', descHe: 'העברה פנימה והחוצה', cls: 'text-violet-500' },
              { icon: <Link2 className="w-5 h-5" />, en: 'DeFi Ready', he: 'מוכן ל-DeFi', descEn: 'Use MOS in DeFi apps', descHe: 'השתמש ב-MOS באפליקציות DeFi', cls: 'text-blue-500' },
            ].map((f, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className={f.cls}>{f.icon}</div>
                <p className="text-sm font-semibold text-foreground">{isHe ? f.he : f.en}</p>
                <p className="text-[11px] text-muted-foreground">{isHe ? f.descHe : f.descEn}</p>
              </div>
            ))}
          </div>

          {/* Roadmap */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{isHe ? 'מפת דרכים' : 'Roadmap'}</h3>
            {[
              { en: 'Internal ledger (MOS)', he: 'ספר חשבונות פנימי (MOS)', done: true },
              { en: 'Settlement outbox', he: 'תור סטלמנט', done: true },
              { en: 'SPL token deployment', he: 'הנפקת טוקן SPL', done: false },
              { en: 'Bridge smart contract', he: 'חוזה חכם לגשר', done: false },
              { en: 'Public launch', he: 'השקה פומבית', done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.done ? 'bg-emerald-500/20' : 'bg-muted'}`}>
                  {item.done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    : <span className="text-[10px] text-muted-foreground font-medium">{i + 1}</span>
                  }
                </div>
                <span className={`text-sm ${item.done ? 'text-foreground line-through opacity-60' : 'text-foreground'}`}>{isHe ? item.he : item.en}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ WALLET CONNECT ═══ */}
      {step === 'connect' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">{isHe ? 'חבר ארנק Solana' : 'Connect Solana Wallet'}</h3>

            {walletConnected && solAddress ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-emerald-500/10 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-foreground font-medium">{isHe ? 'ארנק מחובר' : 'Wallet Connected'}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2.5">
                  <code className="text-[11px] text-muted-foreground flex-1 truncate font-mono">{solAddress}</code>
                  <button onClick={() => { navigator.clipboard.writeText(solAddress); toast.success('Copied!'); }} className="p-1 hover:bg-muted rounded transition-colors">
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <a href={`https://explorer.solana.com/address/${solAddress}`} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-muted rounded transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {isHe
                    ? 'חבר ארנק Solana כדי להעביר טוקני MOS לבלוקצ׳יין. נתמכים: Phantom, Solflare, Backpack.'
                    : 'Connect a Solana wallet to bridge MOS tokens on-chain. Supported: Phantom, Solflare, Backpack.'}
                </p>
                {['Phantom', 'Solflare', 'Backpack'].map(w => (
                  <Button
                    key={w}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => toast.info(isHe ? `חיבור ${w} יהיה זמין בקרוב` : `${w} connection coming soon`)}
                  >
                    <span className="font-medium">{w}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ TRANSFER ═══ */}
      {step === 'transfer' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            {/* Direction toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setDirection('to_chain')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors ${direction === 'to_chain' ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30' : 'bg-muted/30 text-muted-foreground'}`}
              >
                {isHe ? 'MOS → Solana' : 'MOS → Solana'}
              </button>
              <button
                onClick={() => setDirection('from_chain')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors ${direction === 'from_chain' ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30' : 'bg-muted/30 text-muted-foreground'}`}
              >
                {isHe ? 'Solana → MOS' : 'Solana → MOS'}
              </button>
            </div>

            {/* Amount input */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                {direction === 'to_chain'
                  ? (isHe ? 'כמות MOS לגשר' : 'MOS Amount to Bridge')
                  : (isHe ? 'כמות SPL-MOS לייבא' : 'SPL-MOS Amount to Import')
                }
              </label>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {direction === 'to_chain' && (
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{isHe ? 'יתרה:' : 'Balance:'} {balance.toLocaleString()} MOS</span>
                  <button className="text-accent hover:underline" onClick={() => setAmount(String(balance))}>Max</button>
                </div>
              )}
            </div>

            {/* Summary */}
            {amountNum > 0 && (
              <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{isHe ? 'כמות' : 'Amount'}</span>
                  <span className="text-foreground">{amountNum.toLocaleString()} MOS</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{isHe ? 'עמלת רשת' : 'Network fee'}</span>
                  <span className="text-muted-foreground">~0.00025 SOL</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{isHe ? 'שווי' : 'Value'}</span>
                  <span className="text-foreground">≈ ${(amountNum * MOS_TO_USD).toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!walletConnected || amountNum <= 0}
              onClick={() => toast.info(isHe ? 'גשר Solana יהיה זמין בקרוב' : 'Solana bridge coming soon')}
            >
              <ArrowRightLeft className="w-4 h-4" />
              {!walletConnected
                ? (isHe ? 'חבר ארנק תחילה' : 'Connect Wallet First')
                : (isHe ? 'גשר טוקנים' : 'Bridge Tokens')
              }
            </Button>
          </div>
        </motion.div>
      )}

      {/* ═══ BRIDGE HISTORY ═══ */}
      {step === 'history' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">{isHe ? 'היסטוריית גשר' : 'Bridge History'}</h3>
          {MOCK_BRIDGE_HISTORY.map(h => (
            <div key={h.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${h.status === 'confirmed' ? 'bg-emerald-500/10' : 'bg-yellow-500/10'}`}>
                {h.status === 'confirmed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {h.direction === 'out' ? '→ Solana' : '← MindOS'} · {h.amount.toLocaleString()} MOS
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">{h.tx_hash}</p>
              </div>
              <a
                href={`https://explorer.solana.com/tx/${h.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-muted rounded transition-colors"
                onClick={(e) => { e.preventDefault(); toast.info('Explorer link — mock data'); }}
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
