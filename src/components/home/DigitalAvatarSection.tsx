/**
 * DigitalAvatarSection - Explains that the avatar is a personalized digital identity
 * that evolves with the user (colors, shapes, textures)
 * Note: We avoid using "orb" (אורב) in Hebrew - instead using "avatar" (אווטר)
 */

import { motion } from 'framer-motion';
import { Palette, Sparkles, Layers, User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Orb } from '@/components/orb';
import { EGO_STATES } from '@/lib/egoStates';

const DigitalAvatarSection = () => {
  const { t, isRTL } = useTranslation();

  // Features: Colors, Shapes, Textures
  const features = [
    {
      icon: Palette,
      title: t('avatar.colors'),
      description: t('avatar.colorsDesc'),
      color: 'from-primary to-cyan-500',
    },
    {
      icon: Sparkles,
      title: t('avatar.shapes'),
      description: t('avatar.shapesDesc'),
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: Layers,
      title: t('avatar.textures'),
      description: t('avatar.texturesDesc'),
      color: 'from-emerald-500 to-green-500',
    },
  ];

  // Mini avatars showcase - different ego states
  const egoStateShowcase = [
    { id: 'guardian', state: EGO_STATES.guardian },
    { id: 'warrior', state: EGO_STATES.warrior },
    { id: 'healer', state: EGO_STATES.healer },
    { id: 'mystic', state: EGO_STATES.mystic },
    { id: 'sage', state: EGO_STATES.sage },
  ];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30 text-primary text-sm font-semibold shadow-lg shadow-primary/10">
            <User className="w-4 h-4" />
            {t('avatar.badge')}
          </span>
        </motion.div>

        {/* Central Avatar Demo - Larger and more prominent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-cyan-400/30 to-primary/40 rounded-full blur-3xl scale-[1.8] animate-pulse" />
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-cyan-500/50 rounded-full blur-xl scale-125" />
            <Orb 
              size={200} 
              state="idle" 
              egoState="guardian"
              showGlow={true}
              className="relative z-10"
            />
          </div>
        </motion.div>

        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5">
            {t('avatar.title')}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('avatar.subtitle')}
          </p>
        </motion.div>

        {/* 3-Column Features Grid - Enhanced cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative p-8 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm hover:border-primary/40 hover:bg-card/90 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Icon with gradient background */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mini Avatars Showcase - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-base text-muted-foreground mb-8 font-medium">
            {t('avatar.evolution')}
          </p>
          <div className={`flex items-center justify-center gap-6 sm:gap-8 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
            {egoStateShowcase.map((ego, index) => (
              <motion.div
                key={ego.id}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.7 + index * 0.1,
                  type: 'spring',
                  stiffness: 200
                }}
                whileHover={{ scale: 1.15 }}
                className="flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-full blur-xl opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300"
                    style={{ backgroundColor: ego.state.colors.primary }}
                  />
                  <Orb 
                    size={56} 
                    state="idle" 
                    egoState={ego.id}
                    showGlow={false}
                    className="relative z-10"
                  />
                </div>
                <span className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                  {ego.state.icon} {isRTL ? ego.state.nameHe : ego.state.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DigitalAvatarSection;
