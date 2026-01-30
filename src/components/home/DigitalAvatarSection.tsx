/**
 * DigitalAvatarSection - Explains that the orb is a personalized digital avatar
 * that evolves with the user (colors, shapes, textures)
 */

import { motion } from 'framer-motion';
import { Palette, Sparkles, Layers } from 'lucide-react';
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
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      title: t('avatar.shapes'),
      description: t('avatar.shapesDesc'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Layers,
      title: t('avatar.textures'),
      description: t('avatar.texturesDesc'),
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  // Mini orbs showcase - different ego states
  const egoStateShowcase = [
    { id: 'guardian', state: EGO_STATES.guardian },
    { id: 'warrior', state: EGO_STATES.warrior },
    { id: 'healer', state: EGO_STATES.healer },
    { id: 'mystic', state: EGO_STATES.mystic },
    { id: 'sage', state: EGO_STATES.sage },
  ];

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {t('avatar.badge')}
          </span>
        </motion.div>

        {/* Central Orb Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            {/* Glow effect behind orb */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-full blur-2xl scale-150 animate-pulse" />
            <Orb 
              size={180} 
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
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('avatar.title')}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('avatar.subtitle')}
          </p>
        </motion.div>

        {/* 3-Column Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
            >
              {/* Icon with gradient background */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mini Orbs Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-6">
            {t('avatar.evolution')}
          </p>
          <div className={`flex items-center justify-center gap-4 sm:gap-6 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
            {egoStateShowcase.map((ego, index) => (
              <motion.div
                key={ego.id}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.3, 
                  delay: 0.7 + index * 0.1,
                  type: 'spring',
                  stiffness: 200
                }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: ego.state.colors.primary }}
                  />
                  <Orb 
                    size={50} 
                    state="idle" 
                    egoState={ego.id}
                    showGlow={false}
                    className="relative z-10"
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
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
