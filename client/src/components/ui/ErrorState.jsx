import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

/**
 * Reusable ErrorState component for failed API requests or error boundaries
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  className = ''
}) {
  return (
    <div
      className={`card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-10) var(--space-6)',
        textAlign: 'center',
        backgroundColor: 'var(--danger-bg)',
        borderColor: 'var(--danger-border)'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--danger-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-3)',
          color: 'var(--danger)'
        }}
      >
        <AlertTriangle size={24} />
      </div>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--danger)',
          marginBottom: 'var(--space-1)'
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          maxWidth: '440px',
          marginBottom: onRetry ? 'var(--space-4)' : 0,
          lineHeight: 1.5
        }}
      >
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry} size="sm">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
