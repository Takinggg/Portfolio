import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'particles';
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  variant = 'gradient' 
}) => {
  if (variant === 'particles') {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {Array.from({ length: 15 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-liquid-blue to-liquid-purple rounded-full opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient orbs - reduced opacity to prevent visual interference */}
      <motion.div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.05), rgba(118, 75, 162, 0.05))'
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full blur-3xl"
        style={{
          background: 'linear-gradient(45deg, rgba(240, 147, 251, 0.04), rgba(79, 172, 254, 0.04))'
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      <motion.div 
        className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full blur-3xl"
        style={{
          background: 'linear-gradient(315deg, rgba(103, 126, 234, 0.03), rgba(240, 147, 251, 0.03))'
        }}
        animate={{
          x: [0, -40, 40, 0],
          y: [0, 30, -30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};