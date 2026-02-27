import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { UserBuild } from '@/services/mapleStory';

interface TalentBoardProps {
  build: UserBuild | null | undefined;
  language: string;
}

export default function TalentBoard({ build, language }: TalentBoardProps) {
  const isHe = language === 'he';
  const { user } = useAuth();

  const { data: skills } = useQuery({
    queryKey: ['user-skills', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_skill_progress')
        .select('skill_id, current_xp, current_level')
        .eq('user_id', user!.id)
        .order('current_xp', { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const multipliers = build?.build_data?.skill_multipliers || {};
  const boostedSkills = Object.keys(multipliers).filter(k => multipliers[k] > 1);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">{isHe ? 'לוח כישורים' : 'Talent Board'}</h2>

      {!skills || skills.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          {isHe ? 'השלם קוויסטים כדי לפתח כישורים' : 'Complete quests to develop skills'}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {skills.map((skill: any, i: number) => {
            const isBoosted = boostedSkills.includes(skill.skill_id);
            const mult = multipliers[skill.skill_id];
            const xpInLevel = skill.current_xp % 100;

            return (
              <motion.div
                key={skill.skill_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border p-3 space-y-2 ${
                  isBoosted
                    ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium capitalize truncate">{skill.skill_id.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-bold text-primary">Lv.{skill.current_level}</span>
                </div>

                {/* XP bar */}
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpInLevel}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  />
                </div>

                {isBoosted && mult && (
                  <p className="text-[10px] text-primary font-semibold">
                    ↑ {(mult * 100 - 100).toFixed(0)}% {isHe ? 'בוסט' : 'boost'}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
