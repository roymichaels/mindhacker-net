/**
 * FMMarket — Market hub with Services, Bounties, and P2P Marketplace.
 * Route: /fm/market
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, Briefcase, ShoppingBag, BookOpen, Image, Gem,
  ArrowRight, Coins, Package, Sparkles
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMBounties } from '@/hooks/useFMWallet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function FMMarket() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  const { data: bounties = [] } = useFMBounties();
  const { data: gigs = [] } = useQuery({
    queryKey: ['fm-gigs-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fm_gigs').select('id').in('status', ['open']).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const RARITY_STYLES: Record<string, { border: string; bg: string; iconBg: string; glow: string; label: { en: string; he: string; color: string } }> = {
    legendary: { border: 'border-amber-500/50', bg: 'from-amber-500/12 to-orange-500/5', iconBg: 'from-amber-500 to-orange-600', glow: 'hover:shadow-amber-500/15', label: { en: 'LEGENDARY', he: 'אגדי', color: 'text-amber-400' } },
    epic: { border: 'border-purple-500/50', bg: 'from-purple-500/12 to-fuchsia-500/5', iconBg: 'from-purple-500 to-fuchsia-600', glow: 'hover:shadow-purple-500/15', label: { en: 'EPIC', he: 'אפי', color: 'text-purple-400' } },
    rare: { border: 'border-sky-500/50', bg: 'from-sky-500/12 to-blue-500/5', iconBg: 'from-sky-500 to-blue-600', glow: 'hover:shadow-sky-500/15', label: { en: 'RARE', he: 'נדיר', color: 'text-sky-400' } },
    uncommon: { border: 'border-emerald-500/50', bg: 'from-emerald-500/12 to-teal-500/5', iconBg: 'from-emerald-500 to-teal-600', glow: 'hover:shadow-emerald-500/15', label: { en: 'UNCOMMON', he: 'לא שכיח', color: 'text-emerald-400' } },
  };

  const cards = [
    {
      id: 'services',
      icon: <Briefcase className="w-6 h-6" />,
      labelEn: 'Services',
      labelHe: 'שירותים',
      descEn: 'Browse & offer freelance services',
      descHe: 'גלה והצע שירותים פרילנס',
      rarity: 'rare',
      statValue: gigs.length,
      statLabelEn: 'open',
      statLabelHe: 'פתוחים',
      onClick: () => navigate('/fm/earn?tab=gigs'),
    },
    {
      id: 'bounties',
      icon: <Target className="w-6 h-6" />,
      labelEn: 'Bounties',
      labelHe: 'באונטיז',
      descEn: 'Complete tasks & earn MOS',
      descHe: 'השלם משימות והרוויח MOS',
      rarity: 'epic',
      statValue: bounties.length,
      statLabelEn: 'available',
      statLabelHe: 'זמינים',
      onClick: () => navigate('/fm/earn?tab=bounties'),
    },
    {
      id: 'marketplace',
      icon: <ShoppingBag className="w-6 h-6" />,
      labelEn: 'Marketplace',
      labelHe: 'מרקטפלייס',
      descEn: 'Trade digital products, courses & NFTs',
      descHe: 'סחרו במוצרים דיגיטליים, קורסים ו-NFTs',
      rarity: 'legendary',
      statValue: 0,
      statLabelEn: 'listings',
      statLabelHe: 'פריטים',
      onClick: () => {},
    },
  ];

  const marketplaceCategories = [
    { icon: BookOpen, labelEn: 'Courses', labelHe: 'קורסים', count: 0, color: 'from-sky-500/15 to-sky-500/5 border-sky-500/25', iconColor: 'text-sky-400' },
    { icon: Package, labelEn: 'Digital Products', labelHe: 'מוצרים דיגיטליים', count: 0, color: 'from-purple-500/15 to-purple-500/5 border-purple-500/25', iconColor: 'text-purple-400' },
    { icon: Image, labelEn: 'NFTs', labelHe: 'NFTs', count: 0, color: 'from-amber-500/15 to-amber-500/5 border-amber-500/25', iconColor: 'text-amber-400' },
    { icon: Sparkles, labelEn: 'Templates', labelHe: 'תבניות', count: 0, color: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/25', iconColor: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-5 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-black text-foreground flex items-center justify-center gap-2 tracking-tight">
          <ShoppingBag className="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
          {isHe ? 'מרקט' : 'Market'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isHe ? 'שירותים, באונטיז ומסחר P2P' : 'Services, bounties & P2P trading'}
        </p>
      </div>

      {/* Main cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => {
          const style = RARITY_STYLES[card.rarity] || RARITY_STYLES.uncommon;
          return (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
              onClick={card.onClick}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 bg-gradient-to-br transition-all hover:scale-[1.03] active:scale-[0.97] hover:shadow-xl ${style.border} ${style.bg} ${style.glow} ${card.id === 'marketplace' ? 'col-span-2' : ''}`}
            >
              <span className={`absolute top-1.5 end-2 text-[7px] font-black uppercase tracking-[0.15em] ${style.label.color}`}>
                {isHe ? style.label.he : style.label.en}
              </span>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.iconBg} flex items-center justify-center shadow-lg`}>
                <span className="text-white/90">{card.icon}</span>
              </div>
              <h3 className="font-bold text-sm text-foreground">{isHe ? card.labelHe : card.labelEn}</h3>
              <p className="text-[10px] text-muted-foreground">{isHe ? card.descHe : card.descEn}</p>
              <span className="text-[11px] text-muted-foreground font-medium">
                {card.statValue} {isHe ? card.statLabelHe : card.statLabelEn}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Marketplace categories */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          {isHe ? 'קטגוריות מרקטפלייס' : 'Marketplace Categories'}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {marketplaceCategories.map((cat) => (
            <button
              key={cat.labelEn}
              className={`flex items-center gap-3 p-3.5 rounded-xl border bg-gradient-to-r ${cat.color} transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <cat.icon className={`w-5 h-5 ${cat.iconColor} flex-shrink-0`} />
              <div className="text-start min-w-0">
                <p className="text-xs font-semibold text-foreground">{isHe ? cat.labelHe : cat.labelEn}</p>
                <p className="text-[10px] text-muted-foreground">{cat.count} {isHe ? 'פריטים' : 'items'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Coming soon banner */}
      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-4 text-center">
        <Gem className="w-5 h-5 text-amber-400 mx-auto mb-2" />
        <p className="text-xs font-semibold text-foreground">
          {isHe ? 'מרקטפלייס P2P בקרוב!' : 'P2P Marketplace Coming Soon!'}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {isHe ? 'סחרו במוצרים דיגיטליים, קורסים ו-NFTs עם משתמשים אחרים' : 'Trade digital products, courses & NFTs with other users'}
        </p>
      </div>
    </div>
  );
}
