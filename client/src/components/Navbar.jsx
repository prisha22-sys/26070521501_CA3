import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  RotateCcw,
  LayoutDashboard,
  Package,
  Wrench,
  User as UserIcon,
  LogOut,
  Database,
  ExternalLink,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, dbStatus } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="brand-logo">
          <div className="brand-icon-wrapper">
            <RotateCcw size={22} strokeWidth={2.5} />
          </div>
          <span className="brand-name">KeepLoop</span>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/items"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Package size={18} />
                <span>Items</span>
              </NavLink>
              <NavLink
                to="/maintenance"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Wrench size={18} />
                <span>Maintenance</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" className="nav-link">
                Home
              </NavLink>
              <NavLink to="/atlas-guide" className="nav-link">
                Database
              </NavLink>
            </>
          )}

          {/* Database Status Pill */}
          <Link
            to="/atlas-guide"
            title={
              dbStatus.connected
                ? `${dbStatus.type || 'MongoDB'} is connected and active`
                : 'Database is not connected. Click for setup instructions.'
            }
            className={`atlas-pill ${dbStatus.connected ? 'connected' : 'disconnected'}`}
          >
            <span className="pulse-dot"></span>
            <Database size={13} />
            <span>
              {dbStatus.connected
                ? (dbStatus.type?.includes('Local') ? 'Local DB Active' : 'Atlas Connected')
                : 'DB Setup'}
            </span>
          </Link>

          {/* Auth Action / User Profile */}
          {isAuthenticated ? (
            <div className="nav-user">
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <UserIcon size={18} />
                <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

