/**
 * TransformationReportCard — AI-generated transformation report with export to PDF/share.
 * Persists to ai_generations table and loads saved report on mount.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Share2, Loader2, Sparkles, ChevronDown, ChevronUp, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PillarScore {
  current: number;
  initial: number;
}

interface ReportStats {
  level: number;
  xp: number;
  streak: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  pillarScores: Record<string, PillarScore>;
  userName: string;
  joinDate: string;
}

export function TransformationReportCard() {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const isHe = language === 'he';
  const [report, setReport] = useState<string | null>(null);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Load saved report on mount
  useEffect(() => {
    if (!user?.id) return;
    const loadSaved = async () => {
      const { data } = await supabase
        .from('ai_generations')
        .select('content, metadata, updated_at')
        .eq('user_id', user.id)
        .eq('generation_type', 'transformation_report')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.content) {
        setReport(data.content);
        setStats(data.metadata as unknown as ReportStats);
        setLastGenerated(data.updated_at);
      }
    };
    loadSaved();
  }, [user?.id]);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-transformation-report', {
        body: { language },
      });
      if (error) throw error;
      setReport(data.report);
      setStats(data.stats);
      setLastGenerated(new Date().toISOString());
      setIsExpanded(true);
    } catch (err) {
      console.error('Failed to generate report:', err);
      toast.error(isHe ? 'שגיאה ביצירת הדו"ח' : 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    try {
      toast.info(isHe ? 'מייצר PDF...' : 'Generating PDF...');
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`transformation-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(isHe ? 'PDF נוצר בהצלחה!' : 'PDF exported!');
    } catch {
      toast.error(isHe ? 'שגיאה ביצוא' : 'Export failed');
    }
  };

  const shareReport = async () => {
    if (!report || !stats) return;
    const shareText = isHe
      ? `🌟 דו"ח הטרנספורמציה שלי מ-MindOS\n\n📊 רמה ${stats.level} | ${stats.completedTasks} משימות הושלמו | רצף ${stats.streak} ימים\n\n${report.slice(0, 200)}...`
      : `🌟 My MindOS Transformation Report\n\n📊 Level ${stats.level} | ${stats.completedTasks} tasks completed | ${stats.streak} day streak\n\n${report.slice(0, 200)}...`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Transformation Report', text: shareText });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success(isHe ? 'הועתק ללוח!' : 'Copied to clipboard!');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(isHe ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' });
  };

  const PILLAR_LABELS: Record<string, { he: string; en: string }> = {
    consciousness: { he: 'תודעה', en: 'Consciousness' },
    presence: { he: 'נוכחות', en: 'Presence' },
    power: { he: 'כוח', en: 'Power' },
    vitality: { he: 'חיוניות', en: 'Vitality' },
    focus: { he: 'מיקוד', en: 'Focus' },
    combat: { he: 'לחימה', en: 'Combat' },
    expansion: { he: 'התרחבות', en: 'Expansion' },
    career: { he: 'קריירה', en: 'Career' },
    finance: { he: 'כספים', en: 'Finance' },
    relationships: { he: 'יחסים', en: 'Relationships' },
    social: { he: 'חברתי', en: 'Social' },
    creativity: { he: 'יצירתיות', en: 'Creativity' },
    environment: { he: 'סביבה', en: 'Environment' },
    purpose: { he: 'ייעוד', en: 'Purpose' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
    >
      <button
        onClick={report ? () => setIsExpanded(!isExpanded) : generateReport}
        disabled={isLoading}
        className="w-full flex items-center justify-between gap-3 p-4 text-start hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              {isHe ? 'דו"ח טרנספורמציה' : 'Transformation Report'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {report && lastGenerated
                ? (isHe ? `עודכן ${formatDate(lastGenerated)}` : `Updated ${formatDate(lastGenerated)}`)
                : (isHe ? 'לפני/אחרי עם ניתוח AI' : 'Before/after with AI analysis')}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : report ? (
            isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Sparkles className="h-4 w-4 text-emerald-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && report && stats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div ref={reportRef} className="px-4 pb-4 border-t border-border/30 pt-3 space-y-4">
              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-2 text-center">
                  <p className="text-lg font-black text-primary">{stats.level}</p>
                  <p className="text-[10px] text-muted-foreground">{isHe ? 'רמה' : 'Level'}</p>
                </div>
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2 text-center">
                  <p className="text-lg font-black text-emerald-400">{stats.completionRate}%</p>
                  <p className="text-[10px] text-muted-foreground">{isHe ? 'ביצוע' : 'Done'}</p>
                </div>
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-2 text-center">
                  <p className="text-lg font-black text-amber-400">{stats.streak}</p>
                  <p className="text-[10px] text-muted-foreground">{isHe ? 'רצף' : 'Streak'}</p>
                </div>
              </div>

              {/* Pillar before/after */}
              {Object.keys(stats.pillarScores).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {isHe ? 'לפני → אחרי' : 'Before → After'}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(stats.pillarScores).map(([pillar, scores]) => {
                      const label = PILLAR_LABELS[pillar];
                      const diff = scores.current - scores.initial;
                      return (
                        <div key={pillar} className="flex items-center justify-between rounded-md bg-muted/30 px-2.5 py-1.5">
                          <span className="text-[11px] text-muted-foreground">
                            {isHe ? label?.he || pillar : label?.en || pillar}
                          </span>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-muted-foreground">{scores.initial}</span>
                            <span className="text-muted-foreground/50">→</span>
                            <span className="font-bold text-foreground">{scores.current}</span>
                            {diff > 0 && (
                              <span className="text-emerald-400 text-[10px]">+{diff}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Report */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-muted-foreground" dir={isRTL ? 'rtl' : 'ltr'}>
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={exportPDF} className="text-xs gap-1.5">
                  <Download className="h-3 w-3" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={shareReport} className="text-xs gap-1.5">
                  <Share2 className="h-3 w-3" />
                  {isHe ? 'שתף' : 'Share'}
                </Button>
                <Button variant="ghost" size="sm" onClick={generateReport} disabled={isLoading} className="text-xs gap-1.5 ms-auto text-emerald-400 hover:text-emerald-300">
                  <RefreshCw className="h-3 w-3" />
                  {isHe ? 'עדכן' : 'Refresh'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
