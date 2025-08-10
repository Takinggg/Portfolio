/**
 * Badge Component
 * Small status and category indicators
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        primary: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
        secondary: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
        success: 'bg-green-100 text-green-700 hover:bg-green-200',
        warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
        error: 'bg-red-100 text-red-700 hover:bg-red-200',
        outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50'
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