import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface PrimaryCTAProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: 'arrow-down' | 'arrow-right' | 'none';
  className?: string;
  disabled?: boolean;
  'data-track'?: string;
}

export const PrimaryCTA: React.FC<PrimaryCTAProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon = 'none',
  className,
  disabled = false,
  'data-track': dataTrack,
}) => {
  const IconComponent = icon === 'arrow-down' ? ArrowDown : icon === 'arrow-right' ? ArrowRight : null;

  const baseClasses = clsx(
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    {
      // Size variants
      'px-4 py-2 text-sm': size === 'sm',
      'px-6 py-3 text-base': size === 'md', 
      'px-8 py-4 text-lg': size === 'lg',
      
      // Color variants with improved contrast
      'bg-primary-600 text-white shadow-card hover:bg-primary-700 hover:shadow-lg focus-visible:ring-primary-300': variant === 'primary',
      'bg-surface-base text-primary-600 border-2 border-primary-600 hover:bg-primary-50 focus-visible:ring-primary-300': variant === 'secondary',
      
      // Disabled state
      'opacity-50 cursor-not-allowed': disabled,
      'cursor-pointer': !disabled,
    }
  );

  const iconClasses = clsx(
    'transition-transform duration-300',
    {
      'ml-2': icon === 'arrow-right',
      'ml-2 group-hover:translate-y-1': icon === 'arrow-down',
      'group-hover:translate-x-1': icon === 'arrow-right',
    }
  );

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      className={clsx(baseClasses, 'group', className)}
      data-track={dataTrack}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled}
      // Accessibility
      role="button"
      tabIndex={0}
    >
      {/* Background overlay for hover effect on primary variant - simplified */}
      {variant === 'primary' && !disabled && (
        <motion.div
          className="absolute inset-0 bg-primary-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center">
        {children}
        {IconComponent && (
          <IconComponent 
            size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} 
            className={iconClasses}
          />
        )}
      </span>
    </motion.button>
  );
};