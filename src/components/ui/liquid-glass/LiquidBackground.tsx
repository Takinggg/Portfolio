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
  subtle: 'from-slate-50 via-blue-50 to-purple-50',
  vibrant: 'from-liquid-blue/20 via-liquid-purple/20 to-liquid-pink/20',
  calm: 'from-blue-50 via-indigo-50 to-violet-50'
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
          {/* Large floating orb */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 liquid-shape liquid-gradient opacity-30 blur-3xl"
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

          {/* Medium floating orb */}
          <motion.div
            className="absolute top-3/4 right-1/4 w-64 h-64 liquid-shape-alt bg-gradient-to-r from-liquid-cyan/40 to-liquid-pink/40 blur-2xl"
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

          {/* Small floating orb */}
          <motion.div
            className="absolute top-1/2 right-1/3 w-32 h-32 liquid-shape bg-gradient-to-r from-liquid-purple/50 to-liquid-blue/50 blur-xl"
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

          {/* Additional ambient particles */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                'absolute w-16 h-16 rounded-full opacity-20 blur-sm',
                i % 2 === 0 ? 'bg-liquid-blue/60' : 'bg-liquid-pink/60'
              )}
              style={{
                top: `${20 + (i * 15)}%`,
                left: `${10 + (i * 12)}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
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

      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10" />
      
      {/* Noise texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default LiquidBackground;