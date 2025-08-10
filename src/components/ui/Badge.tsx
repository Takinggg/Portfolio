/**
 * Badge Component
 * Small status and category indicators
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-300',
  {
    variants: {
      variant: {
        default: 'bg-surface-alt text-text-DEFAULT border border-border-DEFAULT hover:bg-surface-muted',
        primary: 'bg-primary-50 text-primary-600 border border-primary-100 hover:bg-primary-100',
        secondary: 'bg-secondary-50 text-secondary-600 border border-secondary-100 hover:bg-secondary-100',
        success: 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100',
        warning: 'bg-yellow-50 text-yellow-700 border border-yellow-100 hover:bg-yellow-100',
        error: 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100',
        outline: 'bg-surface-base border border-border-DEFAULT text-text-DEFAULT hover:bg-surface-alt'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };