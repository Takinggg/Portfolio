import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface FeaturedRibbonProps {
  className?: string;
  variant?: 'corner' | 'badge';
  animated?: boolean;
}

export const FeaturedRibbon: React.FC<FeaturedRibbonProps> = ({
  className = '',
  variant = 'corner',
  animated = true,
}) => {
  if (variant === 'corner') {
    return (
      <div className={`absolute top-0 right-0 z-20 ${className}`}>
        <motion.div
          className="relative"
          initial={animated ? { scale: 0, rotate: -45 } : false}
          animate={animated ? { scale: 1, rotate: 0 } : false}
          transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
        >
          {/* Corner triangle */}
          <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-t-[40px] border-t-gradient-to-br from-amber-400 to-orange-500">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <Star size={12} className="text-white" />
            </div>
          </div>
          
          {/* Alternative: Simple corner ribbon */}
          <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
            <Star size={12} className="text-white" />
          </div>
        </motion.div>
      </div>
    );
  }

  // Badge variant
  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md ${className}`}
      initial={animated ? { opacity: 0, scale: 0.8 } : false}
      animate={animated ? { opacity: 1, scale: 1 } : false}
      transition={{ type: "spring", duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <Star size={12} className="text-white" />
      <span className="text-xs font-semibold">Mis en avant</span>
    </motion.div>
  );
};