import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { LiquidButtonProps } from '../../types/portfolio';

interface ButtonVariants {
  primary: string;
  secondary: string;
  outline: string;
  ghost: string;
}

interface ButtonSizes {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

const buttonVariants: ButtonVariants = {
  primary: 'liquid-button bg-gradient-to-r from-liquid-blue to-liquid-purple text-white',
  secondary: 'glass-base bg-gradient-to-r from-liquid-cyan/80 to-liquid-pink/80 text-white',
  outline: 'glass-base border-iridescent bg-transparent text-text-strong hover:bg-surface-glass',
  ghost: 'bg-transparent text-text-strong hover:bg-surface-glass hover:text-liquid-purple'
};

const buttonSizes: ButtonSizes = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
  xl: 'px-10 py-5 text-xl rounded-2xl'
};

const LiquidButton: React.FC<LiquidButtonProps> = ({
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
  external = false
}) => {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-300 relative overflow-hidden',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    buttonVariants[variant],
    buttonSizes[size],
    {
      'magnetic': magnetic && !disabled,
      'ripple': ripple && !disabled,
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

    // Create ripple effect
    if (ripple && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
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
        background: rgba(255, 255, 255, 0.3);
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
        scale: 1.05,
        transition: { duration: 0.3 }
      } : undefined}
      whileTap={!disabled ? {
        scale: 0.98,
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

      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Component>
  );
};

export default LiquidButton;