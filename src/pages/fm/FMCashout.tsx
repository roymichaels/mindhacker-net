/**
 * Phase 3: Fiat Cashout via Stripe Connect — UI scaffold (no live integration yet).
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Shield, CheckCircle2, Clock, AlertTriangle, ArrowLeft, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMWallet } from '@/hooks/useFMWallet';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const MOS_TO_USD = 0.01;
const MIN_CASHOUT_MOS = 1000; // $10 minimum
const FEE_PERCENT = 2.5;

type KYCStatus = 'not_started' | 'pending' | 'verified' | 'rejected';
type CashoutStep = 'overview' | 'kyc' | 'request' | 'history';

// Mock data for UI demonstration
const MOCK_HISTORY = [
  { id: '1', amount: 5000, fiat: 50, status: 'completed', created_at: '2026-02-28T10:00:00Z', method: 'bank_transfer' },
  { id: '2', amount: 2000, fiat: 20, status: 'processing', created_at: '2026-03-03T14:30:00Z', method: 'bank_transfer' },
];

export default function FMCashout() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { wallet } = useFMWallet();
  const navigate = useNavigate();
  const [step, setStep] = useState<CashoutStep>('overview');
  const [amount, setAmount] = useState('');
  const [kycStatus] = useState<KYCStatus>('not_started'); // Placeholder

  const balance = wallet?.mos_balance ?? 0;
  const canCashout = balance >= MIN_CASHOUT_MOS;
  const amountNum = parseInt(amount) || 0;
  const fiatAmount = (amountNum * MOS_TO_USD).toFixed(2);
  const fee = (amountNum * MOS_TO_USD * FEE_PERCENT / 100).toFixed(2);
  const netAmount = (parseFloat(fiatAmount) - parseFloat(fee)).toFixed(2);

  const kycBadge = () => {
    const map: Record<KYCStatus, { icon: React.ReactNode; label: string; cls: string }> = {
      not_started: { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: isHe ? 'לא הושלם' : 'Not Started', cls: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400' },
      pending: { icon: <Clock className="w-3.5 h-3.5" />, label: isHe ? 'בבדיקה' : 'Under Review', cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
      verified: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: isHe ? 'מאומת' : 'Verified', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
      rejected: { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: isHe ? 'נדחה' : 'Rejected', cls: 'bg-destructive/15 text-destructive' },
    };
    const s = map[kycStatus];
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.icon} {s.label}</span>;
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Banknote className="w-5 h-5 text-emerald-500" />
            {isHe ? 'משיכה לחשבון בנק' : 'Cash Out to Bank'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isHe ? 'המר MOS לדולרים ומשוך לחשבונך' : 'Convert MOS to USD and withdraw to your account'}
          </p>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-xl p-1">
        {([
          { id: 'overview' as CashoutStep, en: 'Overview', he: 'סקירה' },
          { id: 'kyc' as CashoutStep, en: 'Verification', he: 'אימות' },
          { id: 'request' as CashoutStep, en: 'Withdraw', he: 'משיכה' },
          { id: 'history' as CashoutStep, en: 'History', he: 'היסטוריה' },
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
          {/* Balance card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{isHe ? 'יתרה זמינה למשיכה' : 'Available for Withdrawal'}</span>
              {kycBadge()}
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold text-foreground">{balance.toLocaleString()} MOS</p>
              <p className="text-sm text-muted-foreground">≈ ${(balance * MOS_TO_USD).toFixed(2)} USD</p>
            </div>
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{isHe ? 'מינימום משיכה' : 'Minimum withdrawal'}</span>
                <span className="font-medium text-foreground">{MIN_CASHOUT_MOS.toLocaleString()} MOS (${(MIN_CASHOUT_MOS * MOS_TO_USD).toFixed(0)})</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{isHe ? 'עמלה' : 'Processing fee'}</span>
                <span className="font-medium text-foreground">{FEE_PERCENT}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{isHe ? 'זמן עיבוד' : 'Processing time'}</span>
                <span className="font-medium text-foreground">{isHe ? '3-5 ימי עסקים' : '3-5 business days'}</span>
              </div>
            </div>
          </div>

          {/* Status banner */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isHe ? 'Stripe Connect בקרוב' : 'Stripe Connect Coming Soon'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isHe
                  ? 'משיכות פיאט דרך Stripe Connect נמצאות בפיתוח. השלם את אימות הזהות כדי להיות מוכן ליום ההשקה.'
                  : 'Fiat withdrawals via Stripe Connect are under development. Complete identity verification to be ready for launch day.'}
              </p>
            </div>
          </div>

          <Button
            className="w-full gap-2"
            size="lg"
            disabled={!canCashout || kycStatus !== 'verified'}
            onClick={() => {
              if (kycStatus !== 'verified') {
                toast.info(isHe ? 'יש לאמת זהות תחילה' : 'Please verify your identity first');
                setStep('kyc');
              } else {
                setStep('request');
              }
            }}
          >
            <Banknote className="w-4 h-4" />
            {!canCashout
              ? (isHe ? `נדרשים ${MIN_CASHOUT_MOS} MOS מינימום` : `Need ${MIN_CASHOUT_MOS} MOS minimum`)
              : kycStatus !== 'verified'
                ? (isHe ? 'אמת זהות כדי למשוך' : 'Verify Identity to Withdraw')
                : (isHe ? 'בקש משיכה' : 'Request Withdrawal')
            }
          </Button>
        </motion.div>
      )}

      {/* ═══ KYC / VERIFICATION ═══ */}
      {step === 'kyc' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{isHe ? 'אימות זהות (KYC)' : 'Identity Verification (KYC)'}</h3>
                <p className="text-xs text-muted-foreground">{isHe ? 'נדרש למשיכות פיאט' : 'Required for fiat withdrawals'}</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { en: 'Full legal name', he: 'שם מלא', done: false },
                { en: 'Government-issued ID', he: 'תעודה מזהה', done: false },
                { en: 'Proof of address', he: 'אישור כתובת', done: false },
                { en: 'Bank account details', he: 'פרטי חשבון בנק', done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.done ? 'bg-emerald-500/20' : 'bg-muted'}`}>
                    {item.done
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      : <span className="text-xs text-muted-foreground font-medium">{i + 1}</span>
                    }
                  </div>
                  <span className="text-sm text-foreground">{isHe ? item.he : item.en}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full gap-2"
              onClick={() => toast.info(isHe ? 'אימות זהות יהיה זמין בקרוב עם Stripe Connect' : 'KYC will be available soon via Stripe Connect')}
            >
              <ExternalLink className="w-4 h-4" />
              {isHe ? 'התחל אימות' : 'Start Verification'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* ═══ WITHDRAWAL REQUEST ═══ */}
      {step === 'request' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">{isHe ? 'בקשת משיכה' : 'Withdrawal Request'}</h3>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">{isHe ? 'כמות MOS למשיכה' : 'MOS Amount to Withdraw'}</label>
              <Input
                type="number"
                placeholder={`Min ${MIN_CASHOUT_MOS}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={MIN_CASHOUT_MOS}
                max={balance}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{isHe ? 'זמין:' : 'Available:'} {balance.toLocaleString()} MOS</span>
                <button
                  className="text-accent hover:underline"
                  onClick={() => setAmount(String(balance))}
                >
                  {isHe ? 'משוך הכל' : 'Max'}
                </button>
              </div>
            </div>

            {amountNum > 0 && (
              <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{isHe ? 'סכום ברוטו' : 'Gross amount'}</span>
                  <span className="text-foreground">${fiatAmount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{isHe ? 'עמלה' : 'Fee'} ({FEE_PERCENT}%)</span>
                  <span className="text-destructive">-${fee}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm">
                  <span className="font-medium text-foreground">{isHe ? 'סכום נטו' : 'You receive'}</span>
                  <span className="font-bold text-emerald-500">${netAmount}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full gap-2"
              size="lg"
              disabled={amountNum < MIN_CASHOUT_MOS || amountNum > balance}
              onClick={() => toast.info(isHe ? 'משיכות יהיו זמינות בקרוב' : 'Withdrawals coming soon — Stripe Connect integration pending')}
            >
              <Banknote className="w-4 h-4" />
              {isHe ? 'אשר משיכה' : 'Confirm Withdrawal'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* ═══ HISTORY ═══ */}
      {step === 'history' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">{isHe ? 'היסטוריית משיכות' : 'Withdrawal History'}</h3>
          {MOCK_HISTORY.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Banknote className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{isHe ? 'אין משיכות עדיין' : 'No withdrawals yet'}</p>
            </div>
          ) : (
            MOCK_HISTORY.map(h => (
              <div key={h.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${h.status === 'completed' ? 'bg-emerald-500/10' : 'bg-yellow-500/10'}`}>
                  {h.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{h.amount.toLocaleString()} MOS → ${h.fiat}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${h.status === 'completed' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-yellow-500/15 text-yellow-600'}`}>
                  {h.status === 'completed' ? (isHe ? 'הושלם' : 'Completed') : (isHe ? 'בעיבוד' : 'Processing')}
                </span>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
