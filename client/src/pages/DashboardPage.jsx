import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Package,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  DollarSign,
  Plus,
  ArrowRight,
  Clock,
  Tag,
  AlertTriangle,
  Layers,
  Database,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import WarrantyBadge from '../components/WarrantyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';

export default function DashboardPage() {
  const { user, dbStatus } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container page-content">
        <LoadingSpinner text="Computing real database statistics from MongoDB Atlas..." />
      </div>
    );
  }

  const summary = stats?.summary || {
    totalItems: 0,
    totalAssetValue: 0,
    activeWarranties: 0,
    expiringSoonWarranties: 0,
    expiredWarranties: 0,
    totalMaintenanceCount: 0,
    totalMaintenanceCost: 0,
    currency: user?.currency || 'USD',
  };

  const isDbIssue = !dbStatus.connected || error.toLowerCase().includes('database') || error.toLowerCase().includes('mongo');

  return (
    <div className="container page-content">
      {/* Welcome & Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
            Welcome back, {user?.name || 'User'} 👋
          </h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.925rem', marginTop: '0.2rem' }}>
            Here is what's happening with your inventory, warranties, and maintenance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/items/new" className="btn btn-primary">
            <Plus size={16} />
            <span>Add Item</span>
          </Link>
          <Link to="/maintenance" className="btn btn-secondary">
            <Wrench size={16} />
            <span>Log Service</span>
          </Link>
        </div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} isDatabaseError={isDbIssue} />

      {/* Atlas Connection Alert if DB not connected */}
      {!dbStatus.connected && (
        <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
          <Database size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              MongoDB Atlas Not Connected
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '3px' }}>
              KeepLoop requires a cloud MongoDB Atlas database connection. Please add your <code>MONGODB_URI</code> to <code>server/.env</code>.
            </div>
          </div>
          <Link to="/atlas-guide" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
            Setup Atlas Now
          </Link>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="stats-grid">
        {/* Total Items */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Possessions</span>
            <div className="stat-value">{summary.totalItems}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
              Valued at {summary.currency} {summary.totalAssetValue.toLocaleString()}
            </div>
          </div>
          <div className="stat-icon blue">
            <Package size={24} />
          </div>
        </div>

        {/* Active Warranties */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Warranties</span>
            <div className="stat-value" style={{ color: 'var(--success-dark)' }}>
              {summary.activeWarranties}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
              Full protection active
            </div>
          </div>
          <div className="stat-icon green">
            <ShieldCheck size={24} />
          </div>
        </div>

        {/* Expiring Soon Warranties */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Expiring Soon</span>
            <div
              className="stat-value"
              style={{
                color: summary.expiringSoonWarranties > 0 ? 'var(--warning-dark)' : 'var(--neutral-800)',
              }}
            >
              {summary.expiringSoonWarranties}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
              Within next 30 days
            </div>
          </div>
          <div className="stat-icon amber">
            <ShieldAlert size={24} />
          </div>
        </div>

        {/* Maintenance Spend */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Maintenance Logged</span>
            <div className="stat-value">{summary.totalMaintenanceCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
              Total spend: {summary.currency} {summary.totalMaintenanceCost.toLocaleString()}
            </div>
          </div>
          <div className="stat-icon purple">
            <Wrench size={24} />
          </div>
        </div>
      </div>

      {/* Warranty Expiring Soon Radar */}
      {stats?.warrantyAlerts && stats.warrantyAlerts.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            borderLeft: '4px solid var(--warning)',
            backgroundColor: '#fffdf5',
          }}
        >
          <div className="card-header" style={{ borderBottomColor: 'var(--warning-border)' }}>
            <div className="card-title" style={{ color: 'var(--warning-dark)' }}>
              <ShieldAlert size={20} />
              <span>Warranty Attention Required ({stats.warrantyAlerts.length})</span>
            </div>
            <span style={{ fontSize: '0.825rem', color: 'var(--warning-dark)', fontWeight: 600 }}>
              Action needed before expiration
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {stats.warrantyAlerts.map((alert) => (
              <div
                key={alert.itemId}
                style={{
                  background: '#ffffff',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--warning-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--neutral-900)' }}>
                    {alert.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>
                    {alert.brand ? `${alert.brand} • ` : ''}{alert.category}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--warning-dark)', marginTop: '0.25rem' }}>
                    Expires in {alert.daysLeft} {alert.daysLeft === 1 ? 'day' : 'days'} ({new Date(alert.expiryDate).toLocaleDateString()})
                  </div>
                </div>
                <Link to={`/items/${alert.itemId}`} className="btn btn-secondary btn-sm">
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Categories & Recent Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Left Column: Category Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} />
              <span>Category Distribution</span>
            </div>
            <Link to="/items" style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All Items →
            </Link>
          </div>

          {stats?.categoryStats && stats.categoryStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {stats.categoryStats.map((cat) => {
                const percentage = Math.round((cat.count / summary.totalItems) * 100);
                return (
                  <div key={cat._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>{cat._id}</span>
                      <span style={{ color: 'var(--neutral-500)' }}>
                        {cat.count} {cat.count === 1 ? 'item' : 'items'} ({summary.currency} {cat.totalValue.toLocaleString()})
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--neutral-100)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                          borderRadius: '999px',
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No categories yet"
              description="Add your first item to see category breakdowns and value statistics."
              actionText="Add Item"
              actionLink="/items/new"
            />
          )}
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={18} />
              <span>Recent Lifecycle Events</span>
            </div>
          </div>

          {stats?.recentEvents && stats.recentEvents.length > 0 ? (
            <div className="timeline">
              {stats.recentEvents.map((event) => (
                <div key={event._id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-date">
                    {new Date(event.date || event.createdAt).toLocaleDateString()}
                  </div>
                  <div className="timeline-title">
                    {event.title}
                    {event.item?.name && (
                      <span style={{ fontWeight: 400, color: 'var(--neutral-500)', fontSize: '0.85rem' }}>
                        {' '}• {event.item.name}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <div className="timeline-desc">{event.description}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No activity recorded"
              description="Item purchases, warranty registrations, and repairs will appear here in chronological order."
            />
          )}
        </div>
      </div>

      {/* Recent Items Shelf */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Package size={18} />
            <span>Recently Added Possessions</span>
          </div>
          <Link to="/items" className="btn btn-secondary btn-sm">
            View All ({summary.totalItems})
          </Link>
        </div>

        {stats?.recentItems && stats.recentItems.length > 0 ? (
          <div className="items-grid">
            {stats.recentItems.map((item) => (
              <div key={item._id} className="item-card">
                <div className="item-card-top">
                  <div>
                    {item.brand && <div className="item-brand">{item.brand}</div>}
                    <h3 className="item-title">{item.name}</h3>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="item-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Tag size={13} /> {item.category}
                  </span>
                  {item.purchasePrice > 0 && (
                    <span>
                      {item.currency || 'USD'} {item.purchasePrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="warranty-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--neutral-500)', fontSize: '0.775rem' }}>Warranty:</span>
                    <WarrantyBadge item={item} />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--neutral-100)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your inventory is empty"
            description="Start building your personal inventory to track warranties and maintenance effortlessly."
            actionText="Create First Item"
            actionLink="/items/new"
          />
        )}
      </div>
    </div>
  );
}

