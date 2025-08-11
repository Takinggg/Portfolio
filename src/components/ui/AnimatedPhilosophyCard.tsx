import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedPhilosophyCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export const AnimatedPhilosophyCard: React.FC<AnimatedPhilosophyCardProps> = ({
  icon: Icon,
  title,
  description,
  gradient,
  delay = 0
}) => {
  return (
    <motion.div
      className="group glass-heavy p-6 rounded-2xl shadow-glass hover:shadow-glass-lg transition-all duration-500 magnetic glass-reflection liquid-spread glass-fragments cursor-pointer"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 100 
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, type: "spring", stiffness: 200 }
      }}
    >
      {/* Animated icon container */}
      <motion.div
        className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-liquid border border-white/20 relative overflow-hidden`}
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -5, 5, 0],
          transition: { 
            scale: { duration: 0.2 },
            rotate: { duration: 0.6, ease: "easeInOut" }
          }
        }}
      >
        {/* Icon glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />
        
        {/* Bounce animation on hover */}
        <motion.div
          whileHover={{
            y: [0, -4, 0],
            transition: { 
              duration: 0.4, 
              ease: "easeInOut",
              repeat: 1
            }
          }}
        >
          <Icon className="text-white relative z-10" size={20} />
        </motion.div>

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-white/50 opacity-0"
          whileHover={{
            scale: [1, 1.3, 1.6],
            opacity: [0, 0.8, 0],
            transition: { duration: 0.6, ease: "easeOut" }
          }}
        />
      </motion.div>

      {/* Title with hover effect */}
      <motion.h4 
        className="font-bold text-text-strong mb-2 relative"
        whileHover={{
          x: [0, 2, 0],
          transition: { duration: 0.3 }
        }}
      >
        {title}
        {/* Underline animation */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-liquid-blue to-liquid-purple"
          initial={{ width: 0 }}
          whileHover={{ 
            width: "100%",
            transition: { duration: 0.3, ease: "easeOut" }
          }}
        />
      </motion.h4>

      {/* Description with stagger animation */}
      <motion.p 
        className="text-sm text-text-soft leading-relaxed"
        initial={{ opacity: 0.8 }}
        whileHover={{ 
          opacity: 1,
          transition: { duration: 0.2 }
        }}
      >
        {description}
      </motion.p>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 3 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-liquid-blue to-liquid-purple rounded-full opacity-0 group-hover:opacity-40"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0, 0.4, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};