import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'subtle';
  as?: keyof JSX.IntrinsicElements;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  as: Component = 'div',
}) => {
  const variants = {
    default: 'bg-white/10 dark:bg-white/5 backdrop-blur-glass border border-white/20 dark:border-white/10',
    hover: 'bg-white/5 dark:bg-white/5 backdrop-blur-glass border border-white/10 hover:bg-white/20 dark:hover:bg-white/10 hover:border-white/30 transition-all duration-300',
    subtle: 'bg-white/5 dark:bg-white/5 backdrop-blur-xs border border-white/5',
  };

  return (
    <Component
      className={cn(
        'rounded-xl shadow-glass',
        variants[variant],
        className
      )}
    >
      {children}
    </Component>
  );
};