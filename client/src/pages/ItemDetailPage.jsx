import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Wrench,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  Building,
  Hash,
  MapPin,
  Clock,
  Plus,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import WarrantyBadge from '../components/WarrantyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import Modal from '../components/Modal';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, dbStatus } = useAuth();

  const [item, setItem] = useState(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [lifecycleEvents, setLifecycleEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Form states for Maintenance Modal
  const [mTitle, setMTitle] = useState('');
  const [mType, setMType] = useState('Repair');
  const [mDate, setMDate] = useState(new Date().toISOString().split('T')[0]);
  const [mCost, setMCost] = useState('');
  const [mProvider, setMProvider] = useState('');
  const [mStatus, setMStatus] = useState('Completed');
  const [mCovered, setMCovered] = useState(false);
  const [mNotes, setMNotes] = useState('');
  const [mSubmitting, setMSubmitting] = useState(false);

  // Form states for Lifecycle Event Modal
  const [eTitle, setETitle] = useState('');
  const [eType, setEType] = useState('CustomNote');
  const [eDesc, setEDesc] = useState('');
  const [eDate, setEDate] = useState(new Date().toISOString().split('T')[0]);
  const [eSubmitting, setESubmitting] = useState(false);

  const fetchItemData = async () => {
    try {
      setLoading(true);
      setError('');
      const [itemRes, maintRes, lifeRes] = await Promise.all([
        api.getItem(id),
        api.getMaintenance({ itemId: id }),
        api.getItemLifecycle(id),
      ]);

      if (itemRes.success) setItem(itemRes.data);
      if (maintRes.success) setMaintenanceRecords(maintRes.data || []);
      if (lifeRes.success) setLifecycleEvents(lifeRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch item information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemData();
  }, [id]);

  const handleDeleteItem = async () => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" and all associated history?`)) {
      return;
    }
    try {
      await api.deleteItem(id);
      navigate('/items');
    } catch (err) {
      alert(`Error deleting item: ${err.message}`);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.updateItem(id, { status: newStatus });
      if (res.success) {
        setItem(res.data);
        // Refresh lifecycle
        const lifeRes = await api.getItemLifecycle(id);
        if (lifeRes.success) setLifecycleEvents(lifeRes.data);
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    if (!mTitle) return;

    try {
      setMSubmitting(true);
      const res = await api.createMaintenance({
        item: id,
        title: mTitle,
        serviceType: mType,
        serviceDate: mDate,
        cost: mCost ? Number(mCost) : 0,
        provider: mProvider,
        status: mStatus,
        coveredByWarranty: mCovered,
        notes: mNotes,
      });

      if (res.success) {
        setIsMaintenanceModalOpen(false);
        setMTitle('');
        setMCost('');
        setMProvider('');
        setMNotes('');
        await fetchItemData();
      }
    } catch (err) {
      alert(`Failed to record maintenance: ${err.message}`);
    } finally {
      setMSubmitting(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eTitle) return;

    try {
      setESubmitting(true);
      const res = await api.createLifecycleEvent({
        item: id,
        title: eTitle,
        eventType: eType,
        description: eDesc,
        date: eDate,
      });

      if (res.success) {
        setIsEventModalOpen(false);
        setETitle('');
        setEDesc('');
        const lifeRes = await api.getItemLifecycle(id);
        if (lifeRes.success) setLifecycleEvents(lifeRes.data);
      }
    } catch (err) {
      alert(`Failed to create milestone event: ${err.message}`);
    } finally {
      setESubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-content">
        <LoadingSpinner text="Loading item details from database..." />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container page-content">
        <ErrorAlert message={error || 'Item not found.'} />
        <Link to="/items" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Items
        </Link>
      </div>
    );
  }

  // Warranty calculations for progress bar
  let warrantyPercent = 0;
  let daysRemaining = null;
  if (item.hasWarranty && item.warrantyExpiryDate && item.purchaseDate) {
    const start = new Date(item.purchaseDate).getTime();
    const end = new Date(item.warrantyExpiryDate).getTime();
    const now = new Date().getTime();
    const totalDuration = end - start;
    const elapsed = now - start;

    if (totalDuration > 0) {
      warrantyPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    }
    daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="container page-content">
      {/* Top Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/items" className="btn btn-secondary btn-sm">
          <ArrowLeft size={15} /> Back to Possessions
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/items/${item._id}/edit`} className="btn btn-secondary btn-sm">
            <Edit size={14} /> Edit
          </Link>
          <button onClick={handleDeleteItem} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Main Header Banner */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            {item.brand && <div className="item-brand">{item.brand}</div>}
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
              {item.name}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.4rem', fontSize: '0.875rem', color: 'var(--neutral-600)' }}>
              <span>Category: <strong>{item.category}</strong></span>
              {item.modelNumber && <span>Model: <code>{item.modelNumber}</code></span>}
              {item.serialNumber && <span>Serial: <code>{item.serialNumber}</code></span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--neutral-500)', fontWeight: 600 }}>Status:</span>
              <StatusBadge status={item.status} />
            </div>

            {/* Status Quick-change select */}
            <select
              className="form-select"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', width: 'auto' }}
              value={item.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="In Repair">In Repair</option>
              <option value="Storage">In Storage</option>
              <option value="Sold">Sold</option>
              <option value="Donated">Donated</option>
              <option value="Recycled">Recycled</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>
        </div>

        {/* Spec Overview Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--neutral-100)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', fontWeight: 700 }}>
              Purchase Price
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--neutral-900)', marginTop: '0.2rem' }}>
              {item.currency || 'USD'} {item.purchasePrice ? item.purchasePrice.toLocaleString() : '0'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', fontWeight: 700 }}>
              Purchase Date
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--neutral-800)', marginTop: '0.25rem' }}>
              {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', fontWeight: 700 }}>
              Purchased From
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--neutral-800)', marginTop: '0.25rem' }}>
              {item.purchaseStore || 'Not specified'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', fontWeight: 700 }}>
              Location / Stored At
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--neutral-800)', marginTop: '0.25rem' }}>
              {item.location || 'Not specified'}
            </div>
          </div>
        </div>

        {item.notes && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--neutral-100)', fontSize: '0.9rem', color: 'var(--neutral-700)' }}>
            <strong>Notes:</strong> {item.notes}
          </div>
        )}
      </div>

      {/* Warranty Tracking Radar Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title">
            <ShieldCheck size={20} color="var(--primary)" />
            <span>Warranty Coverage Tracking</span>
          </div>
          <WarrantyBadge item={item} />
        </div>

        {item.hasWarranty ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', fontWeight: 600 }}>Coverage Provider</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                  {item.warrantyProvider || 'Manufacturer Warranty'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', fontWeight: 600 }}>Duration</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                  {item.warrantyDurationMonths} Months
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', fontWeight: 600 }}>Expiration Date</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                  {item.warrantyExpiryDate ? new Date(item.warrantyExpiryDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', fontWeight: 600 }}>Days Remaining</span>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color:
                      daysRemaining < 0
                        ? 'var(--danger)'
                        : daysRemaining <= 30
                        ? 'var(--warning-dark)'
                        : 'var(--success-dark)',
                  }}
                >
                  {daysRemaining !== null
                    ? daysRemaining < 0
                      ? `Expired (${Math.abs(daysRemaining)} days ago)`
                      : `${daysRemaining} days remaining`
                    : 'N/A'}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: '0.35rem' }}>
                <span>Coverage Lifecycle Elapsed ({warrantyPercent}%)</span>
                <span>{item.warrantyExpiryDate ? new Date(item.warrantyExpiryDate).toLocaleDateString() : ''}</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'var(--neutral-100)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${warrantyPercent}%`,
                    height: '100%',
                    background:
                      daysRemaining < 0
                        ? 'var(--danger)'
                        : daysRemaining <= 30
                        ? 'var(--warning)'
                        : 'var(--success)',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease',
                  }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>
            No warranty coverage was registered for this item. You can edit this item anytime to add warranty details.
          </div>
        )}
      </div>

      {/* Two Column Layout: Maintenance Records & Lifecycle Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Maintenance Records Column */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Wrench size={18} />
              <span>Service & Maintenance ({maintenanceRecords.length})</span>
            </div>
            <button
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} /> Log Service
            </button>
          </div>

          {maintenanceRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--neutral-500)' }}>
              No maintenance records logged yet. Click "Log Service" to record repairs, part replacements, or tune-ups.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {maintenanceRecords.map((m) => (
                <div
                  key={m._id}
                  style={{
                    border: '1px solid var(--neutral-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    background: 'var(--neutral-50)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--neutral-900)' }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginTop: '2px' }}>
                        {new Date(m.serviceDate).toLocaleDateString()} • {m.serviceType}
                        {m.provider && ` • By ${m.provider}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--neutral-900)', fontSize: '0.95rem' }}>
                        {item.currency || 'USD'} {m.cost}
                      </div>
                      {m.coveredByWarranty && (
                        <span style={{ fontSize: '0.725rem', color: 'var(--success-dark)', fontWeight: 600 }}>
                          Warranty Covered
                        </span>
                      )}
                    </div>
                  </div>
                  {m.notes && (
                    <div style={{ fontSize: '0.825rem', color: 'var(--neutral-600)', marginTop: '0.5rem' }}>
                      {m.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lifecycle Events Column */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <RotateCcw size={18} />
              <span>Lifecycle History Timeline</span>
            </div>
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={15} /> Add Milestone
            </button>
          </div>

          {lifecycleEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--neutral-500)' }}>
              No lifecycle milestones recorded.
            </div>
          ) : (
            <div className="timeline">
              {lifecycleEvents.map((evt) => (
                <div key={evt._id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-date">
                    {new Date(evt.date || evt.createdAt).toLocaleDateString()}
                  </div>
                  <div className="timeline-title">{evt.title}</div>
                  {evt.description && (
                    <div className="timeline-desc">{evt.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Modal */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title={`Log Maintenance for "${item.name}"`}
      >
        <form onSubmit={handleCreateMaintenance}>
          <div className="form-group">
            <label className="form-label">Service Title / Description *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Battery Replacement, Screen Fix, Annual Tune-Up"
              value={mTitle}
              onChange={(e) => setMTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Service Type</label>
              <select className="form-select" value={mType} onChange={(e) => setMType(e.target.value)}>
                <option value="Repair">Repair</option>
                <option value="Preventive">Preventive</option>
                <option value="Upgrade">Upgrade</option>
                <option value="Inspection">Inspection</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Battery Replacement">Battery Replacement</option>
                <option value="Software Update">Software Update</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Service</label>
              <input
                type="date"
                className="form-input"
                value={mDate}
                onChange={(e) => setMDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cost ({item.currency || 'USD'})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="0.00"
                value={mCost}
                onChange={(e) => setMCost(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Service Provider / Workshop</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apple Genius Bar, DIY, Local Mechanic"
                value={mProvider}
                onChange={(e) => setMProvider(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <input
              type="checkbox"
              id="coveredByWarranty"
              checked={mCovered}
              onChange={(e) => setMCovered(e.target.checked)}
            />
            <label htmlFor="coveredByWarranty" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              Covered under warranty ($0 out-of-pocket)
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Service Notes & Replaced Parts</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Details about parts replaced, diagnosis, or invoice number..."
              value={mNotes}
              onChange={(e) => setMNotes(e.target.value)}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsMaintenanceModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={mSubmitting}>
              {mSubmitting ? 'Recording...' : 'Save Maintenance Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lifecycle Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Record Lifecycle Milestone"
      >
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label">Milestone Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Passed down to sibling, Relocated to storage unit"
              value={eTitle}
              onChange={(e) => setETitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Milestone Type</label>
              <select className="form-select" value={eType} onChange={(e) => setEType(e.target.value)}>
                <option value="CustomNote">Custom Note / Milestone</option>
                <option value="LocationChanged">Location Changed</option>
                <option value="StatusChanged">Status Changed</option>
                <option value="Sold">Sold</option>
                <option value="Donated">Donated</option>
                <option value="Disposed">Disposed / Recycled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={eDate}
                onChange={(e) => setEDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Remarks</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Additional details about this milestone..."
              value={eDesc}
              onChange={(e) => setEDesc(e.target.value)}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={eSubmitting}>
              {eSubmitting ? 'Adding...' : 'Add Milestone to Timeline'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

