import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface LiquidBackgroundProps {
  className?: string;
  variant?: 'subtle' | 'vibrant' | 'calm';
  animate?: boolean;
}

interface BackgroundVariants {
  subtle: string;
  vibrant: string;
  calm: string;
}

const backgroundVariants: BackgroundVariants = {
  subtle: 'from-white via-slate-50 to-gray-50',
  vibrant: 'from-white via-surface-alt to-surface-muted',
  calm: 'from-surface-base via-surface-alt to-white'
};

const LiquidBackground: React.FC<LiquidBackgroundProps> = ({
  className,
  variant = 'subtle',
  animate = true
}) => {
  return (
    <div className={cn('fixed inset-0 -z-10 overflow-hidden', className)}>
      {/* Base gradient background */}
      <motion.div
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          backgroundVariants[variant]
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Floating orbs */}
      {animate && (
        <>
          {/* Large floating orb - WHITE theme */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 liquid-shape opacity-10 blur-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.15), rgba(118, 75, 162, 0.15), rgba(240, 147, 251, 0.15))'
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Medium floating orb - WHITE theme */}
          <motion.div
            className="absolute top-3/4 right-1/4 w-64 h-64 liquid-shape-alt blur-2xl opacity-8"
            style={{
              background: 'linear-gradient(45deg, rgba(79, 172, 254, 0.12), rgba(240, 147, 251, 0.12))'
            }}
            animate={{
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          {/* Small floating orb - WHITE theme */}
          <motion.div
            className="absolute top-1/2 right-1/3 w-32 h-32 liquid-shape blur-xl opacity-10"
            style={{
              background: 'linear-gradient(90deg, rgba(118, 75, 162, 0.15), rgba(103, 126, 234, 0.15))'
            }}
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />

          {/* Additional ambient particles - WHITE theme */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                'absolute w-16 h-16 rounded-full opacity-5 blur-sm'
              )}
              style={{
                top: `${20 + (i * 15)}%`,
                left: `${10 + (i * 12)}%`,
                background: i % 2 === 0 
                  ? 'radial-gradient(circle, rgba(103, 126, 234, 0.08), transparent)'
                  : 'radial-gradient(circle, rgba(240, 147, 251, 0.08), transparent)'
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 1.5,
              }}
            />
          ))}
        </>
      )}

      {/* WHITE theme gradient mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-surface-alt/10" />
      
      {/* Subtle noise texture overlay for depth - WHITE theme */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default LiquidBackground;