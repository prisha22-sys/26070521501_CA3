import React from 'react';
import { Link } from 'react-router-dom';
import { Database, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div>
          <div style={{ fontWeight: 700, color: 'var(--neutral-900)', marginBottom: '0.25rem' }}>
            KeepLoop Asset & Lifecycle Management
          </div>
          <p style={{ fontSize: '0.825rem' }}>
            Empowering mindful ownership, warranty longevity, and repair history.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
          <Link to="/atlas-guide" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Database size={15} /> MongoDB Atlas Setup
          </Link>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--neutral-500)' }}>
            <ShieldCheck size={15} /> Isolated Cloud Storage
          </span>
        </div>
      </div>
    </footer>
  );
}

