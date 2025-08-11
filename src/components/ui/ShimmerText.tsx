import React from 'react';
import { motion } from 'framer-motion';

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({ 
  children, 
  className = '',
  delay = 0 
}) => {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
    >
      {/* Background text */}
      <span className="relative z-10">{children}</span>
      
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 -z-0"
        style={{
          background: 'linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.4) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['-200% 0', '200% 0'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          delay: delay + 1
        }}
      />
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 -z-10 blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.3), rgba(118, 75, 162, 0.3))',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 0.5
        }}
      />
    </motion.div>
  );
};