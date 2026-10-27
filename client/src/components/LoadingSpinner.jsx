import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '0.85rem',
      }}
    >
      <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
      <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', fontWeight: 500 }}>
        {text}
      </p>
    </div>
  );
}

