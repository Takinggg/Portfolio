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
    default: 'bg-surface-DEFAULT border border-surface-border shadow-card rounded-xl',
    hover: 'bg-surface-DEFAULT border border-surface-border shadow-card rounded-xl hover:shadow-lg transition-shadow duration-300',
    subtle: 'bg-surface-subtle border border-surface-border rounded-xl',
  };

  return (
    <Component
      className={cn(
        variants[variant],
        className
      )}
    >
      {children}
    </Component>
  );
};