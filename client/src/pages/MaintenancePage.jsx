import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Tag,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function MaintenancePage() {
  const { user, dbStatus } = useAuth();
  const [records, setRecords] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [serviceType, setServiceType] = useState('All');
  const [status, setStatus] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [mTitle, setMTitle] = useState('');
  const [mType, setMType] = useState('Repair');
  const [mDate, setMDate] = useState(new Date().toISOString().split('T')[0]);
  const [mCost, setMCost] = useState('');
  const [mProvider, setMProvider] = useState('');
  const [mStatus, setMStatus] = useState('Completed');
  const [mCovered, setMCovered] = useState(false);
  const [mNotes, setMNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (serviceType !== 'All') params.serviceType = serviceType;
      if (status !== 'All') params.status = status;

      const [mRes, iRes] = await Promise.all([
        api.getMaintenance(params),
        api.getItems(),
      ]);

      if (mRes.success) setRecords(mRes.data || []);
      if (iRes.success) {
        setItems(iRes.data || []);
        if (iRes.data && iRes.data.length > 0 && !selectedItemId) {
          setSelectedItemId(iRes.data[0]._id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch maintenance history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [serviceType, status]);

  const handleDeleteRecord = async (id, title) => {
    if (!window.confirm(`Delete record "${title}"?`)) return;
    try {
      await api.deleteMaintenance(id);
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(`Error deleting record: ${err.message}`);
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !mTitle) {
      alert('Please select an item and provide a title.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createMaintenance({
        item: selectedItemId,
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
        setIsModalOpen(false);
        setMTitle('');
        setMCost('');
        setMProvider('');
        setMNotes('');
        await fetchData();
      }
    } catch (err) {
      alert(`Error creating maintenance record: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
  const isDbIssue = !dbStatus.connected || error.toLowerCase().includes('database') || error.toLowerCase().includes('mongo');

  return (
    <div className="container page-content">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
            Maintenance & Repairs
          </h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.925rem', marginTop: '0.2rem' }}>
            Track service visits, component repairs, tune-ups, and cost of ownership.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" disabled={items.length === 0}>
          <Plus size={18} />
          <span>Log New Service</span>
        </button>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} isDatabaseError={isDbIssue} />

      {/* Summary Banner */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Services</span>
            <div className="stat-value">{records.length}</div>
          </div>
          <div className="stat-icon purple">
            <Wrench size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Repair Expenditure</span>
            <div className="stat-value">
              {user?.currency || 'USD'} {totalCost.toLocaleString()}
            </div>
          </div>
          <div className="stat-icon blue">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
            <Filter size={16} /> Filters:
          </div>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            <option value="All">All Service Types</option>
            <option value="Repair">Repair</option>
            <option value="Preventive">Preventive</option>
            <option value="Upgrade">Upgrade</option>
            <option value="Inspection">Inspection</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Battery Replacement">Battery Replacement</option>
            <option value="Software Update">Software Update</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Records List */}
      {loading ? (
        <LoadingSpinner text="Retrieving service logs..." />
      ) : records.length === 0 ? (
        <EmptyState
          title="No service records found"
          description={
            items.length === 0
              ? 'Add an item first before logging maintenance.'
              : 'Keep track of repairs, battery replacements, or cleaning by logging your first service.'
          }
          actionText={items.length === 0 ? 'Catalog an Item First' : 'Log Maintenance'}
          actionLink={items.length === 0 ? '/items/new' : undefined}
          onAction={items.length > 0 ? () => setIsModalOpen(true) : undefined}
          icon={Wrench}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {records.map((r) => (
            <div
              key={r._id}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                    }}
                  >
                    {r.serviceType}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
                    {new Date(r.serviceDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                  {r.title}
                </h3>

                {r.item && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--neutral-600)', marginTop: '0.25rem' }}>
                    Asset:{' '}
                    <Link to={`/items/${r.item._id}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {r.item.name}
                    </Link>{' '}
                    {r.item.brand && `(${r.item.brand})`}
                  </div>
                )}

                {r.provider && (
                  <div style={{ fontSize: '0.825rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
                    Provider: <strong>{r.provider}</strong>
                  </div>
                )}

                {r.notes && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', marginTop: '0.5rem', maxWidth: '600px' }}>
                    {r.notes}
                  </p>
                )}
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                  {user?.currency || 'USD'} {r.cost ? r.cost.toLocaleString() : '0'}
                </div>

                {r.coveredByWarranty && (
                  <span className="badge badge-active">
                    <CheckCircle size={12} /> Warranty Covered
                  </span>
                )}

                <button
                  onClick={() => handleDeleteRecord(r._id, r.title)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--danger)', marginTop: '0.5rem' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding maintenance */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Service or Repair"
      >
        <form onSubmit={handleCreateMaintenance}>
          <div className="form-group">
            <label className="form-label">Select Possession *</label>
            <select
              className="form-select"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              required
            >
              {items.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.name} {i.brand ? `(${i.brand})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Service Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Broken screen repair, Oil change, New tires, Firmware update"
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
              <label className="form-label">Service Date</label>
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
              <label className="form-label">Total Cost ({user?.currency || 'USD'})</label>
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
              <label className="form-label">Service Provider</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Authorized Store, DIY, Garage"
                value={mProvider}
                onChange={(e) => setMProvider(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <input
              type="checkbox"
              id="coveredByWarrantyModal"
              checked={mCovered}
              onChange={(e) => setMCovered(e.target.checked)}
            />
            <label htmlFor="coveredByWarrantyModal" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              Covered under warranty ($0 out-of-pocket)
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Invoices</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Replaced part serials, technician recommendations, next inspection date..."
              value={mNotes}
              onChange={(e) => setMNotes(e.target.value)}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Record Maintenance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

