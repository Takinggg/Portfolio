import React from 'react';
import { motion } from 'framer-motion';

interface PulseButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export const PulseButton: React.FC<PulseButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false
}) => {
  const baseClasses = "relative px-6 py-3 rounded-xl font-medium overflow-hidden transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25",
    secondary: "border-2 border-gray-300 dark:border-gray-600 text-text-strong hover:bg-gray-100 dark:hover:bg-gray-800"
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      whileHover={{ 
        scale: 1.02,
        y: -2,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Pulse effect background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0"
        style={{
          transform: 'translateX(-100%)',
        }}
        whileHover={{
          transform: 'translateX(100%)',
          opacity: [0, 1, 0],
          transition: { duration: 0.6, ease: "easeInOut" }
        }}
      />
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
      
      {/* Glow effect for primary variant */}
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.button>
  );
};