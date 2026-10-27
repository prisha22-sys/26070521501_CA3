import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ErrorAlert({ message, onClose, isDatabaseError = false }) {
  if (!message) return null;

  return (
    <div className="alert alert-danger" role="alert">
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '2px' }}>
          {isDatabaseError ? 'MongoDB Atlas Connection Required' : 'An error occurred'}
        </div>
        <div>{message}</div>
        {isDatabaseError && (
          <div style={{ marginTop: '0.5rem' }}>
            <Link to="/atlas-guide" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.6rem' }}>
              View Atlas Setup Guide →
            </Link>
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          aria-label="Close alert"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

