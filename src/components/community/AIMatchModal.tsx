/**
 * AIMatchModal — Location-based player matching via Aurora AI.
 * Flow: Request location → Save → Find matches → Show results
 */
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, MapPin, Users, Loader2, Navigation, CheckCircle2, MessageSquare, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';

interface AIMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'intro' | 'locating' | 'matching' | 'results';

export default function AIMatchModal({ open, onOpenChange }: AIMatchModalProps) {
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('intro');

  // Check if user already has location saved
  const { data: myLocation } = useQuery({
    queryKey: ['my-location', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: open && !!user,
  });

  // Fetch existing matches
  const { data: matches, refetch: refetchMatches } = useQuery({
    queryKey: ['ai-matches', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('ai_matches')
        .select('*')
        .or(`user_id.eq.${user.id},matched_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!data?.length) return [];

      // Fetch profiles for matched users
      const otherIds = data.map(m => m.user_id === user.id ? m.matched_user_id : m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', otherIds);
      const { data: members } = await supabase
        .from('community_members')
        .select('user_id, avatar_url')
        .in('user_id', otherIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const memberMap = new Map(members?.map(m => [m.user_id, m]) || []);

      return data.map(match => {
        const otherId = match.user_id === user.id ? match.matched_user_id : match.user_id;
        return {
          ...match,
          otherProfile: profileMap.get(otherId),
          otherMember: memberMap.get(otherId),
        };
      });
    },
    enabled: open && !!user,
  });

  // Auto-advance to results if we already have location + matches
  useEffect(() => {
    if (open && myLocation && matches?.length) {
      setStep('results');
    } else if (open) {
      setStep('intro');
    }
  }, [open, myLocation, matches?.length]);

  // Save location
  const saveLocationMutation = useMutation({
    mutationFn: async (coords: { latitude: number; longitude: number }) => {
      if (!user) throw new Error('Not authenticated');

      // Reverse geocode city name using a simple approach
      let city = '';
      let country = '';
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&accept-language=${language}`);
        const geo = await res.json();
        city = geo.address?.city || geo.address?.town || geo.address?.village || '';
        country = geo.address?.country || '';
      } catch { /* ignore geocoding errors */ }

      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          latitude: coords.latitude,
          longitude: coords.longitude,
          city,
          country,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      return { city, country };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-location'] });
    },
  });

  // Find matches via edge function
  const findMatchesMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.functions.invoke('ai-match', {
        body: { user_id: user.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetchMatches();
      setStep('results');
      toast.success(isHe ? 'נמצאו התאמות!' : 'Matches found!');
    },
    onError: (err: any) => {
      console.error('Match error:', err);
      setStep('results');
      toast.error(isHe ? 'שגיאה בחיפוש התאמות' : 'Error finding matches');
    },
  });

  const requestLocation = async () => {
    setStep('locating');
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
        });
      });

      await saveLocationMutation.mutateAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      setStep('matching');
      findMatchesMutation.mutate();
    } catch (err) {
      toast.error(isHe ? 'לא הצלחנו לקבל את המיקום שלך' : 'Could not get your location');
      setStep('intro');
    }
  };

  const startMatching = () => {
    setStep('matching');
    findMatchesMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="p-4 pb-2 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Match
            <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              {isHe ? 'חדש' : 'New'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-4">
            <AnimatePresence mode="wait">
              {/* INTRO STEP */}
              {step === 'intro' && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/15 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {isHe ? 'מצא שחקנים שישחיזו אותך' : 'Find Players Who Sharpen You'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-sm mx-auto">
                    {isHe
                      ? 'Aurora תנתח את הפרופיל שלך ותחבר אותך לשחקנים קרובים אליך עם תחומי עניין משותפים — לאימונים, פגישות ושיתופי פעולה'
                      : 'Aurora analyzes your profile and connects you with nearby players sharing your interests — for training, meetups & real-life collaboration'}
                  </p>

                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    {myLocation ? (
                      <>
                        <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isHe ? 'מיקום נשמר' : 'Location saved'}: {myLocation.city || '📍'}</span>
                        </div>
                        <Button onClick={startMatching} className="bg-amber-600 hover:bg-amber-700">
                          <Sparkles className="w-4 h-4 me-2" />
                          {isHe ? 'חפש התאמות' : 'Find Matches'}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={requestLocation} className="bg-amber-600 hover:bg-amber-700">
                        <Navigation className="w-4 h-4 me-2" />
                        {isHe ? 'שתף מיקום והתחל' : 'Share Location & Start'}
                      </Button>
                    )}
                  </div>

                  <p className="text-[10px] text-muted-foreground/60 mt-4">
                    {isHe ? 'המיקום שלך משמש רק להתאמה ולעולם לא ישותף בפומבי' : 'Your location is only used for matching and never shared publicly'}
                  </p>
                </motion.div>
              )}

              {/* LOCATING STEP */}
              {step === 'locating' && (
                <motion.div
                  key="locating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping" />
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <MapPin className="w-7 h-7 text-amber-500" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {isHe ? 'מאתר את המיקום שלך...' : 'Getting your location...'}
                  </p>
                </motion.div>
              )}

              {/* MATCHING STEP */}
              {step === 'matching' && (
                <motion.div
                  key="matching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-4" />
                  <p className="text-sm font-medium text-foreground">
                    {isHe ? 'Aurora מחפשת את ההתאמות הטובות ביותר...' : 'Aurora is finding your best matches...'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isHe ? 'ניתוח פרופילים, עמודי חיים ומיקום' : 'Analyzing profiles, life pillars & location'}
                  </p>
                </motion.div>
              )}

              {/* RESULTS STEP */}
              {step === 'results' && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {!matches?.length ? (
                    <div className="text-center py-10">
                      <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {isHe ? 'עדיין אין התאמות באזור שלך' : 'No matches in your area yet'}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1 mb-4">
                        {isHe ? 'ככל שיותר שחקנים ישתפו מיקום, יופיעו יותר התאמות' : 'As more players share their location, more matches will appear'}
                      </p>
                      <Button variant="outline" size="sm" onClick={startMatching} disabled={findMatchesMutation.isPending}>
                        {findMatchesMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin me-1" /> : <Sparkles className="w-3 h-3 me-1" />}
                        {isHe ? 'חפש שוב' : 'Search Again'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">
                          {matches.length} {isHe ? 'התאמות נמצאו' : 'matches found'}
                        </p>
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={startMatching} disabled={findMatchesMutation.isPending}>
                          {findMatchesMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        </Button>
                      </div>

                      {matches.map((match, i) => (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="rounded-xl border border-border/40 bg-card/60 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-border/40">
                              <PersonalizedOrb size={40} state="idle" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-foreground truncate">
                                {match.otherProfile?.full_name || (isHe ? 'שחקן' : 'Player')}
                              </h4>
                              {match.match_reason && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                  {match.match_reason}
                                </p>
                              )}
                              {match.shared_pillars?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {match.shared_pillars.map((pillar: string) => (
                                    <Badge key={pillar} variant="outline" className="text-[9px] px-1.5 py-0">
                                      {pillar}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-end flex-shrink-0">
                              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                {match.match_score}%
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
