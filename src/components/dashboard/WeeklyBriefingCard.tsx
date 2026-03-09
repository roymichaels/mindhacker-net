/**
 * WeeklyBriefingCard — Dashboard card showing the latest weekly AI briefing.
 * Fetches or generates the briefing on demand.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Rocket, Target, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function getWeekStart(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

export function WeeklyBriefingCard() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const weekStart = getWeekStart();

  const { data: briefing, isLoading } = useQuery({
    queryKey: ["weekly-briefing", weekStart],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data } = await supabase
        .from("weekly_briefings")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("week_start", weekStart)
        .maybeSingle();

      return data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("generate-weekly-briefing", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-briefing"] });
    },
  });

  const handleReadAloud = async () => {
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      return;
    }
    if (!briefing?.summary_text) return;

    const utterance = new SpeechSynthesisUtterance(briefing.summary_text);
    utterance.lang = "he-IL";
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis?.speak(utterance);
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="h-20 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">Loading briefing...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!briefing) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
        <CardContent className="p-6 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-primary mx-auto" />
          <div>
            <h3 className="font-semibold text-foreground">Weekly Forecast</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get an AI-generated briefing of your week ahead
            </p>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="gap-2"
            size="sm"
          >
            {generateMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate Briefing
          </Button>
        </CardContent>
      </Card>
    );
  }

  const risks = briefing.risks || [];
  const opportunities = briefing.opportunities || [];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {briefing.title || "Weekly Forecast"}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleReadAloud}
              title={isPlaying ? "Stop" : "Read aloud"}
            >
              {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              title="Regenerate"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", generateMutation.isPending && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Key Focus */}
        {briefing.key_focus && (
          <div className="flex items-start gap-2 bg-primary/10 rounded-lg p-2.5">
            <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-foreground">{briefing.key_focus}</p>
          </div>
        )}

        {/* Summary (collapsible) */}
        <div
          className={cn(
            "text-sm text-muted-foreground leading-relaxed transition-all cursor-pointer",
            !expanded && "line-clamp-3"
          )}
          onClick={() => setExpanded(!expanded)}
        >
          {briefing.summary_text}
        </div>

        {!expanded && (
          <button
            className="text-xs text-primary hover:underline"
            onClick={() => setExpanded(true)}
          >
            Read more
          </button>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* Risks */}
              {risks.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Risks
                  </h4>
                  {risks.map((risk: string, i: number) => (
                    <div key={i} className="text-xs text-muted-foreground pl-4 flex items-start gap-1.5">
                      <span className="text-destructive/60 mt-0.5">•</span>
                      {risk}
                    </div>
                  ))}
                </div>
              )}

              {/* Opportunities */}
              {opportunities.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                    <Rocket className="w-3 h-3" /> Opportunities
                  </h4>
                  {opportunities.map((opp: string, i: number) => (
                    <div key={i} className="text-xs text-muted-foreground pl-4 flex items-start gap-1.5">
                      <span className="text-emerald-500/60 mt-0.5">•</span>
                      {opp}
                    </div>
                  ))}
                </div>
              )}

              <button
                className="text-xs text-primary hover:underline"
                onClick={() => setExpanded(false)}
              >
                Show less
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Week badge */}
        <div className="flex items-center gap-2 pt-1">
          <Badge variant="outline" className="text-[10px]">
            Week of {new Date(briefing.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
