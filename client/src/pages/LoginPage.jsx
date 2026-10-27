import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Database, AlertCircle } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, dbStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isDbIssue = !dbStatus.connected || error.toLowerCase().includes('database') || error.toLowerCase().includes('mongo');

  return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '440px', width: '100%', padding: '0 1rem' }}>
        {/* Atlas Banner if not connected */}
        {!dbStatus.connected && (
          <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
            <Database size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>MongoDB Atlas Notice:</strong>
              <div style={{ fontSize: '0.825rem', marginTop: '2px' }}>
                Your backend is not connected to MongoDB Atlas yet. To log in or register, set up your connection string in <code>server/.env</code>.
              </div>
              <Link to="/atlas-guide" style={{ fontWeight: 700, textDecoration: 'underline', display: 'inline-block', marginTop: '4px', fontSize: '0.825rem' }}>
                View Quick Atlas Guide →
              </Link>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Sign in to manage your possessions & warranties
            </p>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} isDatabaseError={isDbIssue} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--neutral-200)',
              fontSize: '0.875rem',
              color: 'var(--neutral-600)',
            }}
          >
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

