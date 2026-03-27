'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html>
      <body style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', fontFamily: 'system-ui, sans-serif',
        background: '#0f0f0f', color: '#fff', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 480, padding: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: '#999', marginBottom: 24 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 28px', borderRadius: 8, border: 'none',
              background: '#e07a3a', color: '#fff', fontSize: 16,
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
