/**
 * SoulAvatarMintWizard — 5-step cinematic wizard for AION Web3 onboarding + NFT minting.
 * Steps: Welcome → What is Web3 → Create Wallet → Mint AION → Play2Earn
 * NOTE: File keeps legacy name for import compatibility. The UI already uses AION branding.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useSoulWallet } from '@/hooks/useSoulWallet';
import { useSoulAvatarWizard } from '@/contexts/SoulAvatarContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Sparkles, Shield, Coins, ChevronRight, ChevronLeft,
  Wallet, Globe, Gem, PartyPopper, Loader2, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function SoulAvatarMintWizard() {
  const { wizardOpen, closeWizard } = useSoulAvatarWizard();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [step, setStep] = useState(0);
  const { createWallet, mintAvatar, isMinted, walletAddress, hasSession } = useSoulWallet();
  const { openAuthModal, isAuthenticating } = useAuthModal();
  const [localWallet, setLocalWallet] = useState<string | null>(walletAddress);
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(isMinted);

  const handleCreateWallet = async () => {
    try {
      if (!hasSession) {
        openAuthModal('login');
        toast.error(isHe ? 'יש להתחבר לפני יצירת הארנק' : 'Please sign in before creating the wallet');
        return;
      }

      // Generate a simulated Web3Auth wallet address
      // In production, this would call Web3Auth SDK
      const simulatedAddress = '0x' + Array.from(
        crypto.getRandomValues(new Uint8Array(20)),
        b => b.toString(16).padStart(2, '0')
      ).join('');

      await createWallet.mutateAsync({
        walletAddress: simulatedAddress,
        provider: 'web3auth',
      });
      setLocalWallet(simulatedAddress);
      toast.success(isHe ? 'ארנק נוצר בהצלחה!' : 'Wallet created successfully!');
      // Auto-advance
      setTimeout(() => setStep(3), 800);
    } catch {
      toast.error(isHe ? 'שגיאה ביצירת ארנק' : 'Error creating wallet');
    }
  };

  const handleMint = async () => {
    setMinting(true);
    try {
      await mintAvatar.mutateAsync({});
      setMinted(true);
      // Auto-advance after animation
      setTimeout(() => setStep(4), 1500);
    } catch {
      toast.error(isHe ? 'שגיאה ב-Mint' : 'Minting failed');
    } finally {
      setMinting(false);
    }
  };

  const handleFinish = () => {
    setStep(0);
    closeWizard();
  };

  const steps = [
    // Step 0: Welcome
    <StepWelcome key="welcome" isHe={isHe} onNext={() => setStep(1)} />,
    // Step 1: What is Web3
    <StepExplainWeb3 key="web3" isHe={isHe} onNext={() => setStep(2)} onBack={() => setStep(0)} />,
    // Step 2: Create Wallet
    <StepCreateWallet
      key="wallet"
      isHe={isHe}
      hasSession={hasSession}
      isAuthenticating={isAuthenticating}
      walletAddress={localWallet}
      isCreating={createWallet.isPending}
      onCreateWallet={handleCreateWallet}
      onNext={() => setStep(3)}
      onBack={() => setStep(1)}
    />,
    // Step 3: Mint
    <StepMint
      key="mint"
      isHe={isHe}
      isMinting={minting}
      isMinted={minted}
      onMint={handleMint}
      onBack={() => setStep(2)}
    />,
    // Step 4: Play2Earn
    <StepPlay2Earn key="p2e" isHe={isHe} onFinish={handleFinish} />,
  ];

  return (
    <Dialog open={wizardOpen} onOpenChange={(open) => !open && closeWizard()}>
      <DialogContent
        className="max-w-lg w-full p-0 gap-0 overflow-hidden bg-background border-primary/20"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-5 pb-2">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i === step ? 'w-6 bg-primary' : i < step ? 'bg-primary/60' : 'bg-muted'
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Step Components ─── */

function StepWelcome({ isHe, onNext }: { isHe: boolean; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center py-4">
      <div className="relative">
        <div className="absolute -inset-8 rounded-full bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-xl" />
        <PersonalizedOrb size={120} state="listening" />
      </div>
      <div className="space-y-2">
         <h2 className="text-2xl font-black bg-gradient-to-r from-primary via-violet-400 to-accent bg-clip-text text-transparent">
          {isHe ? 'ברוכים הבאים ל-AION' : 'Enter AION'}
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {isHe
            ? 'הצמיחה שלך עומדת להפוך לנצחית. צור את ה-AION שלך — הזהות הדיגיטלית המתפתחת שלך.'
            : 'Your growth is about to become permanent. Create your AION — your evolving digital identity.'}
        </p>
      </div>
      <Button onClick={onNext} size="lg" className="gap-2 px-8">
        {isHe ? 'בואו נתחיל' : "Let's Begin"}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function StepExplainWeb3({ isHe, onNext, onBack }: { isHe: boolean; onNext: () => void; onBack: () => void }) {
  const features = isHe
    ? [
      { icon: <Shield className="w-5 h-5 text-primary" />, title: 'בעלות דיגיטלית', desc: 'ה-AION שלך שייך רק לך, לנצח.' },
      { icon: <Coins className="w-5 h-5 text-amber-400" />, title: 'הרווח אמיתי', desc: 'צבור MOS tokens עם ערך אמיתי דרך פעילות.' },
      { icon: <Globe className="w-5 h-5 text-emerald-400" />, title: 'זהות Web3', desc: 'ארנק קריפטו אישי — בלי סיסמאות מסובכות.' },
    ]
    : [
      { icon: <Shield className="w-5 h-5 text-primary" />, title: 'Digital Ownership', desc: 'Your AION belongs to you, forever.' },
      { icon: <Coins className="w-5 h-5 text-amber-400" />, title: 'Real Rewards', desc: 'Earn MOS tokens with real value through your activity.' },
      { icon: <Globe className="w-5 h-5 text-emerald-400" />, title: 'Web3 Identity', desc: 'A personal crypto wallet — no complicated passwords.' },
    ];

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-foreground">
          {isHe ? 'מה זה Web3?' : 'What is Web3?'}
        </h2>
        <p className="text-xs text-muted-foreground">
          {isHe ? 'העתיד של הבעלות הדיגיטלית — פשוט ונגיש' : 'The future of digital ownership — simple and accessible'}
        </p>
      </div>

      <div className="space-y-3">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
          >
            <div className="mt-0.5">{f.icon}</div>
            <div>
              <p className="text-sm font-bold text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> {isHe ? 'חזרה' : 'Back'}
        </Button>
        <Button onClick={onNext} className="gap-2">
          {isHe ? 'יצירת ארנק' : 'Create Wallet'}
          <Wallet className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function StepCreateWallet({
  isHe, hasSession, isAuthenticating, walletAddress, isCreating, onCreateWallet, onNext, onBack
}: {
  isHe: boolean; walletAddress: string | null; isCreating: boolean;
  hasSession: boolean; isAuthenticating: boolean;
  onCreateWallet: () => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Wallet className="w-8 h-8 text-primary" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-black text-foreground">
          {isHe ? 'יצירת ארנק Web3' : 'Create Your Web3 Wallet'}
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          {isHe
            ? 'ארנק קריפטו מאובטח — בלי seed phrases, בלי סיבוכים. הכל מוגן עם החשבון שלך.'
            : 'A secure crypto wallet — no seed phrases, no complexity. Everything protected with your account.'}
        </p>
      </div>

      {walletAddress ? (
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">
              {isHe ? 'ארנק נוצר!' : 'Wallet Created!'}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] font-mono text-muted-foreground break-all">{walletAddress}</p>
          </div>
          <Button onClick={onNext} className="w-full gap-2">
            {isHe ? 'המשך ל-Mint' : 'Continue to Mint'}
            <Gem className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="w-full space-y-3">
          {!hasSession && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {isAuthenticating
                ? (isHe ? 'האימות עדיין מושלם...' : 'Authentication is still completing...')
                : (isHe ? 'צריך חיבור פעיל לפני יצירת הארנק.' : 'A live authenticated session is required before wallet creation.')}
            </div>
          )}
          <Button onClick={onCreateWallet} disabled={isCreating || !hasSession} size="lg" className="gap-2 px-8">
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isHe ? 'צור ארנק עכשיו' : 'Create Wallet Now'}
          </Button>
        </div>
      )}

      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
        <ChevronLeft className="w-4 h-4" /> {isHe ? 'חזרה' : 'Back'}
      </Button>
    </div>
  );
}

function StepMint({
  isHe, isMinting, isMinted, onMint, onBack
}: {
  isHe: boolean; isMinting: boolean; isMinted: boolean;
  onMint: () => void; onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 text-center py-2">
      <div className="relative">
        {isMinting && (
          <motion.div
            className="absolute -inset-6 rounded-full border-2 border-primary/60"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {isMinted && (
          <motion.div
            className="absolute -inset-4 rounded-full bg-primary/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          />
        )}
        <PersonalizedOrb size={100} state={isMinting ? 'listening' : 'idle'} />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-black text-foreground">
          {isMinted
            ? (isHe ? '🎉 AION Minted!' : '🎉 AION Minted!')
            : (isHe ? 'Mint AION' : 'Mint Your AION')}
        </h2>
        <p className="text-xs text-muted-foreground">
          {isMinted
            ? (isHe ? 'ה-AION שלך חי עכשיו על הבלוקצ\'יין!' : 'Your AION now lives on-chain!')
            : (isHe ? 'הפוך את ה-Orb שלך ל-NFT ייחודי שמייצג את המסע שלך' : 'Transform your Orb into a unique NFT representing your journey')}
        </p>
      </div>

      {!isMinted && (
        <Button onClick={onMint} disabled={isMinting} size="lg" className="gap-2 px-8 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90">
          {isMinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gem className="w-4 h-4" />}
          {isMinting
            ? (isHe ? 'מבצע Mint...' : 'Minting...')
            : (isHe ? 'Mint עכשיו — חינם!' : 'Mint Now — Free!')}
        </Button>
      )}

      {!isMinted && (
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> {isHe ? 'חזרה' : 'Back'}
        </Button>
      )}
    </div>
  );
}

function StepPlay2Earn({ isHe, onFinish }: { isHe: boolean; onFinish: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <PartyPopper className="w-16 h-16 text-amber-400" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-primary to-violet-400 bg-clip-text text-transparent">
          {isHe ? 'ברוכים הבאים ל-Play2Earn!' : 'Welcome to Play2Earn!'}
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {isHe
            ? 'עכשיו אתה חלק מהמרקט. צבור MOS, השלם באונטיז, סחור — הכל שלך.'
            : 'You\'re now part of the Market. Earn MOS, complete bounties, trade — it\'s all yours.'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        {[
          { icon: <Coins className="w-5 h-5 text-amber-400" />, label: isHe ? 'צבור MOS' : 'Earn MOS' },
          { icon: <Gem className="w-5 h-5 text-violet-400" />, label: isHe ? 'באונטיז' : 'Bounties' },
          { icon: <Sparkles className="w-5 h-5 text-primary" />, label: isHe ? 'הישגים' : 'Achievements' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
            {item.icon}
            <span className="text-[10px] font-bold text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      <Button onClick={onFinish} size="lg" className="gap-2 px-8 w-full">
        {isHe ? 'בוא נתחיל לשחק!' : "Let's Play!"}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
