import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GlassmorphismPhotoCardProps {
  imageSrc: string;
  imageAlt: string;
  stats?: Array<{ value: string; label: string; position: 'top-right' | 'bottom-left' }>;
  className?: string;
}

export const GlassmorphismPhotoCard: React.FC<GlassmorphismPhotoCardProps> = ({
  imageSrc,
  imageAlt,
  stats = [],
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring animations for smooth movement
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), {
    stiffness: 300,
    damping: 30
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), {
    stiffness: 300,
    damping: 30
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = (event.clientX - centerX) / (rect.width / 2);
    const mouseY = (event.clientY - centerY) / (rect.height / 2);

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative group cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d"
      }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.4), rgba(118, 75, 162, 0.4))'
        }}
        animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Main card container */}
      <motion.div
        className="relative glass-heavy rounded-3xl p-8 shadow-glass group-hover:shadow-glass-lg transition-all duration-500"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        animate={isHovered ? { z: 50 } : { z: 0 }}
      >
        {/* Enhanced glass reflection */}
        <motion.div
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            animate={isHovered ? {
              background: [
                'linear-gradient(45deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)'
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Image container */}
        <motion.div 
          className="relative overflow-hidden rounded-2xl"
          style={{ transformStyle: "preserve-3d" }}
          animate={isHovered ? { z: 20 } : { z: 0 }}
        >
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-96 object-cover"
            style={{ transformStyle: "preserve-3d" }}
            animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          
          {/* Image overlay glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-liquid-blue/20 via-transparent to-liquid-purple/20 opacity-0"
            animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Floating stats */}
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className={`absolute glass-ultra rounded-2xl p-4 shadow-glass border-iridescent ${
              stat.position === 'top-right' ? '-top-4 -right-4' : '-bottom-4 -left-4'
            }`}
            style={{ transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              z: isHovered ? 30 : 10
            }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ 
              scale: 1.1,
              z: 40,
              rotateZ: stat.position === 'top-right' ? 5 : -5
            }}
          >
            <div className="text-center">
              <motion.div 
                className="text-2xl font-bold text-liquid-blue"
                animate={isHovered ? { 
                  textShadow: "0 0 20px rgba(103, 126, 234, 0.5)" 
                } : {}}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs text-text-muted">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};