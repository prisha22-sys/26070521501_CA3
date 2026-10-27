import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Lock, Mail, Save, Key, Shield, Database } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

export default function ProfilePage() {
  const { user, updateUser, dbStatus } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');

    try {
      setProfileSubmitting(true);
      const res = await api.updateProfile({ name, bio, currency });
      if (res.success && res.user) {
        updateUser(res.user);
        setProfileMsg('Profile updated successfully!');
      }
    } catch (err) {
      setProfileErr(err.message || 'Failed to update profile.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdErr('');

    if (newPassword.length < 6) {
      setPwdErr('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdErr('New passwords do not match.');
      return;
    }

    try {
      setPwdSubmitting(true);
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPwdMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwdErr(err.message || 'Failed to update password.');
    } finally {
      setPwdSubmitting(false);
    }
  };

  return (
    <div className="container page-content" style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
          Account & Profile
        </h1>
        <p style={{ color: 'var(--neutral-500)', fontSize: '0.925rem', marginTop: '0.2rem' }}>
          Manage your personal settings, currency preferences, and security credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <User size={18} />
              <span>Personal Details</span>
            </div>
          </div>

          {profileMsg && <div className="alert alert-success">{profileMsg}</div>}
          <ErrorAlert message={profileErr} onClose={() => setProfileErr('')} />

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ background: 'var(--neutral-100)', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="CAD">CAD ($ - Canadian Dollar)</option>
                <option value="AUD">AUD ($ - Australian Dollar)</option>
                <option value="JPY">JPY (¥ - Japanese Yen)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="A short note about yourself or your asset management goals..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={profileSubmitting}>
              {profileSubmitting ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Lock size={18} />
              <span>Security & Password</span>
            </div>
          </div>

          {pwdMsg && <div className="alert alert-success">{pwdMsg}</div>}
          <ErrorAlert message={pwdErr} onClose={() => setPwdErr('')} />

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={pwdSubmitting}>
              {pwdSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          {/* Database Info Box */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '1rem',
              background: 'var(--neutral-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--neutral-200)',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--neutral-800)', marginBottom: '0.25rem' }}>
              <Database size={14} /> Database Connection
            </div>
            <div style={{ color: 'var(--neutral-600)' }}>
              Connected to <strong>MongoDB Atlas Cloud</strong>. Password hashes are encrypted using <code>bcrypt</code> salt rounds.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

