import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Lock, Play, RefreshCw, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useActiveProtocol,
  useProtocolBlocks,
  useTodayCompliance,
  useLockProtocol,
  isProtocolLocked,
} from '@/hooks/useLifeProtocol';
import { ProtocolTimeline } from './ProtocolTimeline';
import { ProtocolSetupWizard } from './ProtocolSetupWizard';
import { ProtocolCompileButton } from './ProtocolCompileButton';
import { Button } from '@/components/ui/button';

export function ProtocolCompilerPanel() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: protocol, isLoading } = useActiveProtocol();
  const { data: blocks = [] } = useProtocolBlocks(protocol?.id ?? null, 0);
  const { data: compliance } = useTodayCompliance(protocol?.id ?? null);
  const lockProtocol = useLockProtocol();
  const locked = isProtocolLocked(protocol ?? null);

  const [showSetup, setShowSetup] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No protocol → show setup
  if (!protocol || showSetup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{isHe ? 'מהדר פרוטוקול חיים' : 'Life Protocol Compiler'}</h2>
            <p className="text-xs text-muted-foreground">
              {isHe ? 'הגדר את ארכיטקטורת הזמן שלך. המערכת תבנה לוח זמנים מובנה.' : 'Define your time architecture. The system will compile a structured schedule.'}
            </p>
          </div>
        </div>
        <ProtocolSetupWizard
          onCreated={() => setShowSetup(false)}
        />
      </div>
    );
  }

  // Protocol exists but has no blocks → needs compilation
  if (blocks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{isHe ? 'פרוטוקול מוכן' : 'Protocol Ready'}</h2>
            <p className="text-xs text-muted-foreground">
              {isHe ? 'הפרמטרים הוגדרו. הרץ קומפילציה ליצירת בלוקי זמן.' : 'Parameters set. Run compilation to generate time blocks.'}
            </p>
          </div>
        </div>

        {/* Protocol summary */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="rounded-lg bg-muted/30 p-3 border border-border/40">
            <span className="text-muted-foreground">☀️ {isHe ? 'השכמה' : 'Wake'}</span>
            <p className="text-lg font-bold mt-1">{protocol.wake_time?.slice(0, 5)}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 border border-border/40">
            <span className="text-muted-foreground">🌙 {isHe ? 'שינה' : 'Sleep'}</span>
            <p className="text-lg font-bold mt-1">{protocol.sleep_time?.slice(0, 5)}</p>
          </div>
        </div>

        <ProtocolCompileButton protocolId={protocol.id} />
      </div>
    );
  }

  // Has blocks → show timeline
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-bold">{isHe ? 'פרוטוקול פעיל' : 'Active Protocol'}</h2>
        </div>
        <div className="flex items-center gap-2">
          {!locked && protocol.status !== 'active_locked' && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5"
              onClick={() => lockProtocol.mutate(protocol.id)}
              disabled={lockProtocol.isPending}
            >
              <Lock className="w-3 h-3" />
              {isHe ? 'נעל ל-7 ימים' : 'Lock 7 Days'}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => setShowSetup(true)}
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <ProtocolTimeline
        protocol={protocol}
        blocks={blocks}
        compliance={compliance}
      />
    </div>
  );
}
