import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Sparkles, Package } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
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

export default function ItemFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [purchaseStore, setPurchaseStore] = useState('');
  const [hasWarranty, setHasWarranty] = useState(true);
  const [warrantyDurationMonths, setWarrantyDurationMonths] = useState(12);
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
  const [warrantyProvider, setWarrantyProvider] = useState('Manufacturer Warranty');
  const [status, setStatus] = useState('Active');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-calculate warranty expiry date whenever purchaseDate or warrantyDurationMonths change
  useEffect(() => {
    if (hasWarranty && purchaseDate && warrantyDurationMonths) {
      const p = new Date(purchaseDate);
      if (!isNaN(p.getTime())) {
        const exp = new Date(p);
        exp.setMonth(exp.getMonth() + parseInt(warrantyDurationMonths, 10));
        setWarrantyExpiryDate(exp.toISOString().split('T')[0]);
      }
    } else if (!hasWarranty) {
      setWarrantyExpiryDate('');
    }
  }, [purchaseDate, warrantyDurationMonths, hasWarranty]);

  // Load existing item data if edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadItem = async () => {
        try {
          setLoading(true);
          const res = await api.getItem(id);
          if (res.success && res.data) {
            const item = res.data;
            setName(item.name || '');
            setBrand(item.brand || '');
            setModelNumber(item.modelNumber || '');
            setSerialNumber(item.serialNumber || '');
            setCategory(item.category || 'Electronics');
            if (item.purchaseDate) {
              setPurchaseDate(new Date(item.purchaseDate).toISOString().split('T')[0]);
            }
            setPurchasePrice(item.purchasePrice !== undefined ? item.purchasePrice : '');
            setCurrency(item.currency || user?.currency || 'USD');
            setPurchaseStore(item.purchaseStore || '');
            setHasWarranty(item.hasWarranty !== undefined ? item.hasWarranty : true);
            setWarrantyDurationMonths(item.warrantyDurationMonths || 12);
            if (item.warrantyExpiryDate) {
              setWarrantyExpiryDate(new Date(item.warrantyExpiryDate).toISOString().split('T')[0]);
            }
            setWarrantyProvider(item.warrantyProvider || 'Manufacturer Warranty');
            setStatus(item.status || 'Active');
            setLocation(item.location || '');
            setNotes(item.notes || '');
          }
        } catch (err) {
          setError(err.message || 'Failed to load item for editing.');
        } finally {
          setLoading(false);
        }
      };
      loadItem();
    }
  }, [id, isEditMode, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide an item name.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        brand: brand.trim(),
        modelNumber: modelNumber.trim(),
        serialNumber: serialNumber.trim(),
        category,
        purchaseDate,
        purchasePrice: purchasePrice ? Number(purchasePrice) : 0,
        currency,
        purchaseStore: purchaseStore.trim(),
        hasWarranty,
        warrantyDurationMonths: hasWarranty ? Number(warrantyDurationMonths) : 0,
        warrantyExpiryDate: hasWarranty && warrantyExpiryDate ? warrantyExpiryDate : null,
        warrantyProvider: hasWarranty ? warrantyProvider.trim() : '',
        status,
        location: location.trim(),
        notes: notes.trim(),
      };

      if (isEditMode) {
        await api.updateItem(id, payload);
        navigate(`/items/${id}`);
      } else {
        const res = await api.createItem(payload);
        navigate(res.data?._id ? `/items/${res.data._id}` : '/items');
      }
    } catch (err) {
      setError(err.message || 'Failed to save item to database.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-content">
        <LoadingSpinner text="Retrieving item details..." />
      </div>
    );
  }

  return (
    <div className="container page-content" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to={isEditMode ? `/items/${id}` : '/items'} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
          {isEditMode ? `Edit "${name || 'Item'}"` : 'Catalog New Possession'}
        </h1>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        {/* Section 1: Basic Information */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '0.5rem' }}>
          1. Basic Details
        </h3>

        <div className="form-group">
          <label className="form-label" htmlFor="item-name">
            Item Name *
          </label>
          <input
            id="item-name"
            type="text"
            className="form-input"
            placeholder="e.g. MacBook Pro 16 M3, Breville Barista Touch, Sony A7 IV"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="item-brand">
              Brand / Manufacturer
            </label>
            <input
              id="item-brand"
              type="text"
              className="form-input"
              placeholder="e.g. Apple, Sony, Dyson, Bosch"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-category">
              Category *
            </label>
            <select
              id="item-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="item-model">
              Model Number / Name
            </label>
            <input
              id="item-model"
              type="text"
              className="form-input"
              placeholder="e.g. A2991, WH-1000XM5"
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-serial">
              Serial Number (S/N)
            </label>
            <input
              id="item-serial"
              type="text"
              className="form-input"
              placeholder="e.g. C02G90XXMD6M"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <div className="form-hint">Useful for warranty validation and insurance claims</div>
          </div>
        </div>

        {/* Section 2: Purchase & Valuation */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2rem 0 1.25rem', color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '0.5rem' }}>
          2. Acquisition & Cost
        </h3>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="item-price">
              Purchase Price
            </label>
            <input
              id="item-price"
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              placeholder="0.00"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-currency">
              Currency
            </label>
            <select
              id="item-currency"
              className="form-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-purchase-date">
              Purchase Date
            </label>
            <input
              id="item-purchase-date"
              type="date"
              className="form-input"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="item-store">
            Purchased From (Store / Retailer)
          </label>
          <input
            id="item-store"
            type="text"
            className="form-input"
            placeholder="e.g. Best Buy, Amazon, Apple Store Fifth Ave, B&H Photo"
            value={purchaseStore}
            onChange={(e) => setPurchaseStore(e.target.value)}
          />
        </div>

        {/* Section 3: Warranty Tracking */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2rem 0 1.25rem', color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '0.5rem' }}>
          3. Warranty Coverage & Expiry
        </h3>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <input
            type="checkbox"
            id="has-warranty-toggle"
            checked={hasWarranty}
            onChange={(e) => setHasWarranty(e.target.checked)}
          />
          <label htmlFor="has-warranty-toggle" style={{ fontWeight: 600, cursor: 'pointer' }}>
            This item has warranty coverage
          </label>
        </div>

        {hasWarranty && (
          <div style={{ background: 'var(--neutral-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)', marginBottom: '1.5rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="warranty-provider">
                  Warranty Provider
                </label>
                <input
                  id="warranty-provider"
                  type="text"
                  className="form-input"
                  placeholder="e.g. AppleCare+, Manufacturer Warranty, Asurion"
                  value={warrantyProvider}
                  onChange={(e) => setWarrantyProvider(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="warranty-duration">
                  Duration (Months)
                </label>
                <input
                  id="warranty-duration"
                  type="number"
                  min="1"
                  max="120"
                  className="form-input"
                  value={warrantyDurationMonths}
                  onChange={(e) => setWarrantyDurationMonths(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="warranty-expiry">
                  Calculated Expiration Date
                </label>
                <input
                  id="warranty-expiry"
                  type="date"
                  className="form-input"
                  value={warrantyExpiryDate}
                  onChange={(e) => setWarrantyExpiryDate(e.target.value)}
                />
                <div className="form-hint">Auto-calculated from purchase date + duration</div>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Status, Location & Notes */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2rem 0 1.25rem', color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '0.5rem' }}>
          4. Status & Current Location
        </h3>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="item-status">
              Current Item Status
            </label>
            <select
              id="item-status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active (In regular use)</option>
              <option value="In Repair">In Repair (Service in progress)</option>
              <option value="Storage">Storage (Kept in closet/storage)</option>
              <option value="Sold">Sold (Transferred ownership)</option>
              <option value="Donated">Donated (Given away)</option>
              <option value="Recycled">Recycled</option>
              <option value="Disposed">Disposed (E-waste / discard)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-location">
              Current Location / Room
            </label>
            <input
              id="item-location"
              type="text"
              className="form-input"
              placeholder="e.g. Master Bedroom, Desk Setup, Garage Shelf 2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="item-notes">
            Notes & Custom Description
          </label>
          <textarea
            id="item-notes"
            className="form-textarea"
            rows={3}
            placeholder="Special care instructions, accessories included, condition, or receipt notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Link to={isEditMode ? `/items/${id}` : '/items'} className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                <span>Saving to Atlas...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{isEditMode ? 'Update Item' : 'Add Item to Inventory'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

