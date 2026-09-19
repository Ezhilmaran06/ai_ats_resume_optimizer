import React from 'react';
import { cn } from '../../utils';

/**
 * Reusable Badge component for statuses, tags, and score tiers
 */
export function Badge({
  children,
  variant = 'neutral', // 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  icon: Icon,
  className = '',
  ...props
}) {
  const variantClass = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'badge-neutral'
  }[variant] || 'badge-neutral';

  return (
    <span className={cn('badge', variantClass, className)} {...props}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
