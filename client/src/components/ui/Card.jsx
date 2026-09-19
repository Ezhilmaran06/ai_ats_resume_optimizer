import React from 'react';
import { cn } from '../../utils';

/**
 * Reusable Card component with subtle border and clean background
 */
export function Card({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = '',
  ...props
}) {
  return (
    <div className={cn('card', className)} {...props}>
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
            paddingBottom: subtitle ? 'var(--space-3)' : 'var(--space-2)',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  margin: 0
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
