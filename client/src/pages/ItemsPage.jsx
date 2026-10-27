import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  ExternalLink,
  Shield,
  Tag,
  DollarSign,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import WarrantyBadge from '../components/WarrantyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  'All',
  'Electronics',
  'Home & Kitchen',
  'Vehicles & Transit',
  'Tools & Machinery',
  'Computing & Office',
  'Audio & Video',
  'Fashion & Wearables',
  'Furniture',
  'Sports & Outdoors',
  'Other',
];

const STATUSES = ['All', 'Active', 'In Repair', 'Storage', 'Sold', 'Donated', 'Recycled', 'Disposed'];

export default function ItemsPage() {
  const { user, dbStatus } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [warrantyStatus, setWarrantyStatus] = useState('All');
  const [sort, setSort] = useState('purchase-new');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;
      if (warrantyStatus !== 'All') params.warrantyStatus = warrantyStatus;
      if (sort) params.sort = sort;

      const res = await api.getItems(params);
      if (res.success) {
        setItems(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch items from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, status, warrantyStatus, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also remove all its maintenance logs and lifecycle history.`)) {
      return;
    }

    try {
      await api.deleteItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(`Error deleting item: ${err.message}`);
    }
  };

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
            Personal Possessions
          </h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.925rem', marginTop: '0.2rem' }}>
            Catalog and monitor your belongings, serials, and warranty lifecycles.
          </p>
        </div>

        <Link to="/items/new" className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Item</span>
        </Link>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} isDatabaseError={isDbIssue} />

      {/* Search and Filters Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ flex: '2 1 240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, brand, model, or serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div style={{ flex: '1 1 160px' }}>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ flex: '1 1 140px' }}>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Warranty Filter */}
          <div style={{ flex: '1 1 160px' }}>
            <select
              className="form-select"
              value={warrantyStatus}
              onChange={(e) => setWarrantyStatus(e.target.value)}
            >
              <option value="All">All Warranties</option>
              <option value="active">Active Only</option>
              <option value="expiring_soon">Expiring Soon (≤30d)</option>
              <option value="expired">Expired</option>
              <option value="none">No Warranty</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div style={{ flex: '1 1 160px' }}>
            <select
              className="form-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="purchase-new">Newest Purchase</option>
              <option value="purchase-old">Oldest Purchase</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="price-high">Highest Price</option>
              <option value="price-low">Lowest Price</option>
              <option value="expiry-soon">Warranty Expiry Soonest</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Search size={16} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Items Display */}
      {loading ? (
        <LoadingSpinner text="Retrieving inventory records..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No items found"
          description={
            search || category !== 'All' || status !== 'All' || warrantyStatus !== 'All'
              ? 'No items matched your search filters. Try clearing your search parameters.'
              : 'You have not cataloged any possessions yet. Add your first item to start tracking!'
          }
          actionText={
            search || category !== 'All' || status !== 'All' || warrantyStatus !== 'All'
              ? 'Reset Filters'
              : 'Add First Item'
          }
          actionLink={
            search || category !== 'All' || status !== 'All' || warrantyStatus !== 'All'
              ? undefined
              : '/items/new'
          }
          onAction={
            search || category !== 'All' || status !== 'All' || warrantyStatus !== 'All'
              ? () => {
                  setSearch('');
                  setCategory('All');
                  setStatus('All');
                  setWarrantyStatus('All');
                  setSort('purchase-new');
                }
              : undefined
          }
        />
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item._id} className="item-card">
              <div className="item-card-top">
                <div>
                  {item.brand && <div className="item-brand">{item.brand}</div>}
                  <h3 className="item-title">
                    <Link to={`/items/${item._id}`} style={{ color: 'inherit' }}>
                      {item.name}
                    </Link>
                  </h3>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="item-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Tag size={13} /> {item.category}
                </span>
                {item.purchasePrice > 0 && (
                  <span style={{ fontWeight: 600 }}>
                    {item.currency || 'USD'} {item.purchasePrice.toLocaleString()}
                  </span>
                )}
                {item.serialNumber && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                    S/N: {item.serialNumber}
                  </span>
                )}
              </div>

              {item.location && (
                <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginBottom: '0.75rem' }}>
                  📍 {item.location}
                </div>
              )}

              <div className="warranty-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--neutral-500)', fontSize: '0.775rem' }}>Warranty:</span>
                  <WarrantyBadge item={item} />
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--neutral-100)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <Link
                    to={`/items/${item._id}/edit`}
                    className="btn btn-secondary btn-sm"
                    title="Edit Item"
                  >
                    <Edit size={14} />
                  </Link>
                  <button
                    onClick={() => handleDeleteItem(item._id, item.name)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)' }}
                    title="Delete Item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <Link to={`/items/${item._id}`} className="btn btn-primary btn-sm">
                  <span>View Details</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

