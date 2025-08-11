import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { GlassCardProps } from '../../../types/portfolio';
import FloatingGlassParticles from './FloatingGlassParticles';

interface GlassCardVariants {
  light: string;
  medium: string;
  heavy: string;
  ultra: string;
  layered: string;
}

const glassVariants: GlassCardVariants = {
  light: 'glass-base',
  medium: 'glass-medium', 
  heavy: 'glass-heavy',
  ultra: 'glass-ultra',
  layered: 'glass-layered'
};

interface EnhancedGlassCardProps extends Omit<GlassCardProps, 'variant'> {
  variant?: keyof GlassCardVariants;
  premium?: boolean;
  reflection?: boolean;
  distortion?: boolean;
  fragments?: boolean;
  iridescent?: boolean;
  particles?: boolean;
  particleVariant?: 'subtle' | 'medium' | 'intense';
}

const GlassCard: React.FC<EnhancedGlassCardProps> = ({
  variant = 'light',
  className,
  children,
  animate = true,
  magnetic = false,
  shine = false,
  premium = false,
  reflection = false,
  distortion = false,
  fragments = false,
  iridescent = false,
  particles = false,
  particleVariant = 'subtle'
}) => {
  const baseClasses = cn(
    'rounded-xl shadow-glass transition-all duration-500 relative overflow-hidden',
    premium ? 'glass-card-premium' : glassVariants[variant],
    {
      'hover:shadow-glass-lg hover:scale-102': animate && !premium,
      'magnetic': magnetic,
      'glass-reflection': reflection,
      'glass-distortion': distortion,
      'glass-fragments': fragments,
      'border-iridescent-multi': iridescent,
      'liquid-spread': premium
    },
    className
  );

  const content = (
    <>
      {particles && (
        <FloatingGlassParticles 
          particleCount={8} 
          variant={particleVariant}
          className="opacity-60"
        />
      )}
      {children}
    </>
  );

  if (animate) {
    return (
      <motion.div
        className={baseClasses}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={magnetic ? {
          scale: premium ? 1.02 : 1.01,
          y: premium ? -8 : -2,
          transition: { duration: 0.4, ease: "easeOut" }
        } : undefined}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses}>
      {content}
    </div>
  );
};

export default GlassCard;