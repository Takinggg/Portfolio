import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'subtle' | 'elevated';
  as?: keyof JSX.IntrinsicElements;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  as: Component = 'div',
}) => {
  const variants = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl',
    hover: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300',
    subtle: 'bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-xl',
    elevated: 'bg-white/70 dark:bg-gray-800/70 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] rounded-xl',
  };

  return (
    <Component
      className={cn(
        variants[variant as keyof typeof variants],
        className
      )}
    >
      {children}
    </Component>
  );
};