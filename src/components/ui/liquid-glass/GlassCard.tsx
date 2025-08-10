import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { GlassCardProps } from '../../../types/portfolio';

interface GlassCardVariants {
  light: string;
  medium: string;
  heavy: string;
}

const glassVariants: GlassCardVariants = {
  light: 'glass-base',
  medium: 'glass-medium', 
  heavy: 'glass-heavy'
};

const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'light',
  className,
  children,
  animate = true,
  magnetic = false,
  shine = false
}) => {
  const baseClasses = cn(
    'rounded-xl shadow-glass transition-all duration-300 relative overflow-hidden',
    glassVariants[variant],
    {
      'hover:shadow-glass-lg hover:scale-102': animate,
      'magnetic': magnetic,
      'glass-shine': shine
    },
    className
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
          scale: 1.02,
          transition: { duration: 0.3 }
        } : undefined}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

export default GlassCard;