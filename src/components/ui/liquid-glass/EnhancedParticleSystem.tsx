import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  opacity: number;
  color: string;
  blur: number;
  life: number;
  maxLife: number;
}

interface EnhancedParticleSystemProps {
  particleCount?: number;
  className?: string;
  variant?: 'ambient' | 'interactive' | 'premium';
}

export const EnhancedParticleSystem: React.FC<EnhancedParticleSystemProps> = ({
  particleCount = 80,
  className = '',
  variant = 'ambient'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  const variantSettings = {
    ambient: { 
      colors: [
        'rgba(103, 126, 234, 0.4)',
        'rgba(118, 75, 162, 0.3)',
        'rgba(240, 147, 251, 0.3)',
        'rgba(79, 172, 254, 0.4)'
      ],
      maxSize: 3,
      connectionDistance: 120,
      mouseInfluence: 50
    },
    interactive: {
      colors: [
        'rgba(103, 126, 234, 0.6)',
        'rgba(118, 75, 162, 0.5)',
        'rgba(240, 147, 251, 0.5)',
        'rgba(79, 172, 254, 0.6)',
        'rgba(255, 255, 255, 0.4)'
      ],
      maxSize: 4,
      connectionDistance: 150,
      mouseInfluence: 80
    },
    premium: {
      colors: [
        'rgba(103, 126, 234, 0.7)',
        'rgba(118, 75, 162, 0.6)',
        'rgba(240, 147, 251, 0.6)',
        'rgba(79, 172, 254, 0.7)',
        'rgba(255, 255, 255, 0.5)',
        'rgba(168, 237, 234, 0.5)'
      ],
      maxSize: 5,
      connectionDistance: 180,
      mouseInfluence: 100
    }
  };

  const settings = variantSettings[variant];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 1,
      dy: (Math.random() - 0.5) * 1,
      size: Math.random() * settings.maxSize + 1,
      opacity: Math.random() * 0.8 + 0.2,
      color: settings.colors[Math.floor(Math.random() * settings.colors.length)],
      blur: Math.random() * 2 + 1,
      life: Math.random() * 1000,
      maxLife: 1000 + Math.random() * 500
    }));

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update life
        particle.life += 1;
        if (particle.life > particle.maxLife) {
          particle.life = 0;
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        }

        // Mouse interaction
        const mouseDistance = Math.sqrt(
          Math.pow(particle.x - mouseRef.current.x, 2) +
          Math.pow(particle.y - mouseRef.current.y, 2)
        );

        if (mouseDistance < settings.mouseInfluence) {
          const force = (settings.mouseInfluence - mouseDistance) / settings.mouseInfluence;
          const angle = Math.atan2(
            particle.y - mouseRef.current.y,
            particle.x - mouseRef.current.x
          );
          particle.dx += Math.cos(angle) * force * 0.5;
          particle.dy += Math.sin(angle) * force * 0.5;
        }

        // Update position
        particle.x += particle.dx;
        particle.y += particle.dy;

        // Add some randomness
        particle.dx += (Math.random() - 0.5) * 0.02;
        particle.dy += (Math.random() - 0.5) * 0.02;

        // Damping
        particle.dx *= 0.995;
        particle.dy *= 0.995;

        // Bounce off edges with slight randomness
        if (particle.x <= 0 || particle.x >= canvas.width) {
          particle.dx *= -0.8;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y <= 0 || particle.y >= canvas.height) {
          particle.dy *= -0.8;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Apply glass-like blur effect
        ctx.filter = `blur(${particle.blur}px)`;

        // Draw particle with gradient
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = particle.opacity * (1 - particle.life / particle.maxLife * 0.3);
        ctx.fill();
        ctx.closePath();

        // Reset filter for connections
        ctx.filter = 'none';

        // Connect nearby particles with glass-like lines
        particlesRef.current.slice(index + 1).forEach((otherParticle) => {
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) +
            Math.pow(particle.y - otherParticle.y, 2)
          );

          if (distance < settings.connectionDistance) {
            const connectionStrength = (settings.connectionDistance - distance) / settings.connectionDistance;
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            
            // Glass-like connection gradient
            const lineGradient = ctx.createLinearGradient(
              particle.x, particle.y,
              otherParticle.x, otherParticle.y
            );
            lineGradient.addColorStop(0, particle.color);
            lineGradient.addColorStop(1, otherParticle.color);
            
            ctx.strokeStyle = lineGradient;
            ctx.globalAlpha = connectionStrength * 0.3;
            ctx.lineWidth = connectionStrength * 2;
            ctx.stroke();
            ctx.closePath();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ 
        mixBlendMode: 'screen',
        filter: 'contrast(1.1) brightness(1.1)'
      }}
    />
  );
};

export default EnhancedParticleSystem;