import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  RotateCcw,
  Wrench,
  Clock,
  Sparkles,
  Database,
  ArrowRight,
  CheckCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, dbStatus } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-pill">
            <Sparkles size={15} />
            <span>Smart Personal Asset & Warranty Management</span>
          </div>

          <h1 className="hero-title">
            Own with clarity. Never miss a warranty or repair milestone.
          </h1>

          <p className="hero-subtitle">
            KeepLoop is the modern full-stack system to catalog possessions, calculate warranty expirations in real time, record repair histories, and preserve complete item lifecycles with MongoDB Atlas.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Your Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Cataloging Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Cloud Database Notice Card */}
          <div
            style={{
              maxWidth: '680px',
              margin: '2.5rem auto 0',
              padding: '1.25rem 1.5rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--neutral-200)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: dbStatus.connected ? 'var(--success-light)' : 'var(--warning-light)',
                  color: dbStatus.connected ? 'var(--success-dark)' : 'var(--warning-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Database size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--neutral-900)' }}>
                  Database Status:{' '}
                  <span style={{ color: dbStatus.connected ? 'var(--success)' : 'var(--warning-dark)' }}>
                    {dbStatus.connected
                      ? `${dbStatus.type || 'MongoDB'} Connected`
                      : 'Database Setup Required'}
                  </span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--neutral-500)', marginTop: '2px' }}>
                  {dbStatus.connected
                    ? `Operational and ready! Your possessions and warranties persist in ${dbStatus.type || 'MongoDB'}.`
                    : 'Connect using local MongoDB (localhost:27017) or free MongoDB Atlas.'}
                </div>
              </div>
            </div>
            <Link to="/atlas-guide" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
              Atlas Guide →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4.5rem 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--neutral-900)', letterSpacing: '-0.02em' }}>
              Full control throughout every stage of ownership
            </h2>
            <p style={{ color: 'var(--neutral-500)', fontSize: '1rem', marginTop: '0.5rem' }}>
              From initial purchase to repair, resale, or recycling—KeepLoop preserves the narrative of everything you own.
            </p>
          </div>

          <div className="feature-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Automated Warranty Radar
              </h3>
              <p style={{ color: 'var(--neutral-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Calculates precise expiration dates from purchase dates and durations. Flags items expiring within 30 days so you can file claims before coverage lapses.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Wrench size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Maintenance & Repair Records
              </h3>
              <p style={{ color: 'var(--neutral-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Log repairs, service providers, preventive tune-ups, part swaps, and costs. Track total cost of ownership across the life of your gear.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                <RotateCcw size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Item Lifecycle Timeline
              </h3>
              <p style={{ color: 'var(--neutral-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Watch your assets evolve with auto-generated chronological events: Purchase → Warranty Registration → Service → Status Transfers → Retirement.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
                <Database size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Cloud MongoDB Atlas Only
              </h3>
              <p style={{ color: 'var(--neutral-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Zero local database requirements. No local MongoDB community server or Compass installation needed. Always encrypted and accessible anywhere.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Serial & Receipt Indexing
              </h3>
              <p style={{ color: 'var(--neutral-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Never hunt through dusty drawers for serial numbers, model identifiers, purchase store data, or room locations again.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Real-Time Aggregated Stats
              </h3>
              <p style={{ color: 'var(--neutral-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Instant metrics calculating total asset valuation, maintenance expenses, category breakdowns, and warranty urgency gauges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 0', background: 'var(--neutral-100)', borderTop: '1px solid var(--neutral-200)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: '0.75rem' }}>
            Ready to take command of your personal belongings?
          </h2>
          <p style={{ color: 'var(--neutral-600)', marginBottom: '2rem', fontSize: '1rem' }}>
            Join KeepLoop today and build a permanent, organized record of your devices, vehicles, tools, and appliances.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/atlas-guide" className="btn btn-secondary btn-lg">
              Read Atlas Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

