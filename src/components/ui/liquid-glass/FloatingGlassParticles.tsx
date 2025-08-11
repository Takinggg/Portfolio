import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FloatingParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  direction: number;
  blur: number;
}

interface FloatingGlassParticlesProps {
  particleCount?: number;
  className?: string;
  variant?: 'subtle' | 'medium' | 'intense';
}

export const FloatingGlassParticles: React.FC<FloatingGlassParticlesProps> = ({
  particleCount = 15,
  className = '',
  variant = 'subtle'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<FloatingParticle[]>([]);
  const animationRef = useRef<number>();

  const variantSettings = {
    subtle: { maxSize: 4, maxOpacity: 0.3, maxSpeed: 0.5 },
    medium: { maxSize: 6, maxOpacity: 0.5, maxSpeed: 0.8 },
    intense: { maxSize: 8, maxOpacity: 0.7, maxSpeed: 1.2 }
  };

  const settings = variantSettings[variant];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * containerRect.width,
      y: Math.random() * containerRect.height,
      size: Math.random() * settings.maxSize + 2,
      opacity: Math.random() * settings.maxOpacity + 0.1,
      speed: Math.random() * settings.maxSpeed + 0.2,
      direction: Math.random() * Math.PI * 2,
      blur: Math.random() * 3 + 1
    }));

    const animate = () => {
      const rect = container.getBoundingClientRect();
      
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += Math.cos(particle.direction) * particle.speed;
        particle.y += Math.sin(particle.direction) * particle.speed;

        // Wrap around edges
        if (particle.x < -10) particle.x = rect.width + 10;
        if (particle.x > rect.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = rect.height + 10;
        if (particle.y > rect.height + 10) particle.y = -10;

        // Slight direction change for floating effect
        particle.direction += (Math.random() - 0.5) * 0.02;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, variant]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {particlesRef.current.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-white/40 backdrop-blur-sm border border-white/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
            opacity: particle.opacity,
            filter: `blur(${particle.blur}px)`,
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 70%, transparent 100%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 1.3, particle.opacity]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
};

export default FloatingGlassParticles;