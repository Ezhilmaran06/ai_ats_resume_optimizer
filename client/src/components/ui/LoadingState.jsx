import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable LoadingState component for async operations, dashboards, and data fetching
 */
export function LoadingState({
  message = 'Loading data...',
  description = 'Please wait while we prepare your information.',
  showSkeletons = false,
  skeletonCount = 3
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6)',
        width: '100%',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
          color: 'var(--primary)'
        }}
      >
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <h4
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-1)'
        }}
      >
        {message}
      </h4>
      {description && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px' }}>
          {description}
        </p>
      )}

      {showSkeletons && (
        <div style={{ width: '100%', maxWidth: '600px', marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: '48px',
                borderRadius: 'var(--radius-md)',
                width: '100%'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
