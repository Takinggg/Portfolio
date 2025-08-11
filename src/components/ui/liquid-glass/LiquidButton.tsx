import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { LiquidButtonProps } from '../../../types/portfolio';

interface ButtonVariants {
  primary: string;
  secondary: string;
  outline: string;
  ghost: string;
  premium: string;
}

interface ButtonSizes {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

const buttonVariants: ButtonVariants = {
  primary: 'glass-base bg-gradient-to-r from-white to-surface-alt text-text-strong border border-glass-border-strong hover:bg-gradient-to-r hover:from-surface-alt hover:to-surface-muted',
  secondary: 'glass-medium bg-gradient-to-r from-surface-glass-light to-surface-glass text-text-strong border border-glass-border',
  outline: 'glass-base border-2 border-liquid-blue/30 bg-transparent text-text-strong hover:bg-surface-glass hover:border-liquid-blue/50',
  ghost: 'bg-transparent text-text-strong hover:bg-surface-glass hover:text-liquid-purple',
  premium: 'liquid-button-premium'
};

const buttonSizes: ButtonSizes = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
  xl: 'px-10 py-5 text-xl rounded-2xl'
};

interface EnhancedLiquidButtonProps extends LiquidButtonProps {
  premium?: boolean;
  multiRipple?: boolean;
  liquidSpread?: boolean;
  glassReflection?: boolean;
}

const LiquidButton: React.FC<EnhancedLiquidButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  onClick,
  disabled = false,
  loading = false,
  magnetic = true,
  ripple = true,
  href,
  external = false,
  premium = false,
  multiRipple = false,
  liquidSpread = false,
  glassReflection = false
}) => {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const actualVariant = premium ? 'premium' : variant;

  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-500 relative overflow-hidden',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    premium ? buttonVariants.premium : buttonVariants[variant],
    premium ? 'px-8 py-4 text-lg rounded-2xl' : buttonSizes[size],
    {
      'magnetic': magnetic && !disabled,
      'ripple-multi': (ripple && multiRipple) && !disabled,
      'ripple': (ripple && !multiRipple) && !disabled,
      'liquid-spread': liquidSpread && !disabled,
      'glass-reflection': glassReflection && !disabled,
      'cursor-pointer': !disabled,
      'animate-pulse': loading
    },
    className
  );

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }

    // Enhanced ripple effect for premium buttons
    if (ripple && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      
      if (multiRipple || premium) {
        // Create multiple ripples
        for (let i = 0; i < 2; i++) {
          setTimeout(() => {
            const rippleElement = document.createElement('span');
            const size = Math.max(rect.width, rect.height) * (1.2 + i * 0.3);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            rippleElement.style.cssText = `
              position: absolute;
              width: ${size}px;
              height: ${size}px;
              left: ${x}px;
              top: ${y}px;
              background: ${i === 0 ? 'rgba(103, 126, 234, 0.4)' : 'rgba(118, 75, 162, 0.3)'};
              border-radius: 50%;
              transform: scale(0);
              animation: ripple ${0.8 + i * 0.2}s ease-out;
              pointer-events: none;
              z-index: 10;
            `;

            button.appendChild(rippleElement);
            
            setTimeout(() => {
              if (button.contains(rippleElement)) {
                button.removeChild(rippleElement);
              }
            }, (800 + i * 200));
          }, i * 100);
        }
      } else {
        // Single ripple
        const rippleElement = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        rippleElement.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
          z-index: 10;
        `;

        button.appendChild(rippleElement);
        
        setTimeout(() => {
          if (button.contains(rippleElement)) {
            button.removeChild(rippleElement);
          }
        }, 600);
      }
    }

    onClick?.();
  };

  const MotionComponent = motion[href ? 'a' : 'button'];
  const Component = MotionComponent as any;

  return (
    <Component
      ref={buttonRef}
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      whileHover={magnetic && !disabled ? {
        scale: premium ? 1.05 : 1.03,
        y: premium ? -4 : -2,
        transition: { duration: 0.4, ease: "easeOut" }
      } : undefined}
      whileTap={!disabled ? {
        scale: premium ? 0.98 : 0.97,
        transition: { duration: 0.1 }
      } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      
      <span className="relative z-10">
        {children}
      </span>

      {/* Enhanced glass effects */}
      {glassReflection && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12" />
      )}
    </Component>
  );
};

export default LiquidButton;