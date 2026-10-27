import React from 'react';

const STATUS_CONFIG = {
  Active: { label: 'Active', bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  'In Repair': { label: 'In Repair', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  Storage: { label: 'In Storage', bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' },
  Sold: { label: 'Sold', bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  Donated: { label: 'Donated', bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe' },
  Recycled: { label: 'Recycled', bg: '#ecfdf5', color: '#047857', border: '#6ee7b7' },
  Disposed: { label: 'Disposed', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bg: '#f8fafc',
    color: '#475569',
    border: '#e2e8f0',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  );
}

