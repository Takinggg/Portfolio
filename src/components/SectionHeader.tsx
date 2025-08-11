import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';

interface SectionHeaderProps {
  eyebrow?: string;
  titleFirst: string;
  titleSecond: string;
  description: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  titleFirst,
  titleSecond,
  description,
  stats,
  className = ""
}) => {
  return (
    <div className={`text-center mb-16 ${className}`}>
      {/* Background gradient with subtle halos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Eyebrow (optional chip) */}
      {eyebrow && (
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="flex items-center gap-2 px-4 py-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full" />
            <span className="text-text-soft">{eyebrow}</span>
          </GlassCard>
        </motion.div>
      )}
      
      {/* Main Title - Split over two lines with proper Safari support */}
      <h2 className="text-5xl md:text-7xl font-black mb-8 relative z-10">
        <motion.span 
          className="block text-text-DEFAULT mb-2"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {titleFirst}
        </motion.span>
        <motion.span 
          className="block bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
          style={{ 
            background: 'linear-gradient(90deg, var(--primary-600, #7c3aed) 0%, #8b5cf6 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {titleSecond}
        </motion.span>
      </h2>
      
      {/* Description */}
      <motion.p 
        className="text-xl text-text-soft max-w-4xl mx-auto leading-relaxed mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {description}
      </motion.p>

      {/* Optional Stats Row */}
      {stats && stats.length > 0 && (
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-text-DEFAULT mb-1">{stat.value}</div>
              <div className="text-sm text-text-soft">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};