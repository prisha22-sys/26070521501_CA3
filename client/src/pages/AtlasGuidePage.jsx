import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Key,
  Globe,
  Terminal,
  HelpCircle,
} from 'lucide-react';

export default function AtlasGuidePage() {
  const { dbStatus, checkAtlasStatus } = useAuth();
  const [checking, setChecking] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    try {
      setChecking(true);
      setTestResult(null);
      const res = await api.getHealth();
      await checkAtlasStatus();
      setTestResult(res);
    } catch (err) {
      setTestResult({
        status: 'error',
        database: { connected: false, error: err.message },
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="container page-content" style={{ maxWidth: '900px' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Database size={16} /> Cloud Database Setup
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
          MongoDB Atlas Quickstart Guide
        </h1>
        <p style={{ color: 'var(--neutral-600)', fontSize: '1rem', marginTop: '0.35rem' }}>
          KeepLoop runs 100% on MongoDB Atlas cloud database. No local MongoDB Community Server or MongoDB Compass software is required on your computer.
        </p>
      </div>

      {/* Live Status Card */}
      <div
        className="card"
        style={{
          marginBottom: '2.5rem',
          backgroundColor: dbStatus.connected ? '#f0fdf4' : '#fffbeb',
          borderColor: dbStatus.connected ? 'var(--success-border)' : 'var(--warning-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {dbStatus.connected ? (
              <CheckCircle2 size={32} color="var(--success)" />
            ) : (
              <AlertTriangle size={32} color="var(--warning-dark)" />
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--neutral-900)' }}>
                Current Status:{' '}
                <span style={{ color: dbStatus.connected ? 'var(--success-dark)' : 'var(--warning-dark)' }}>
                  {dbStatus.connected ? 'MongoDB Atlas Connected & Ready' : 'Database Disconnected / Not Configured'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', marginTop: '2px' }}>
                {dbStatus.connected
                  ? 'All authentication, possessions, warranties, and maintenance records will persist to your Atlas cluster.'
                  : dbStatus.error || 'Please update your MONGODB_URI in server/.env following the steps below.'}
              </div>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            className="btn btn-secondary btn-sm"
            disabled={checking}
          >
            <RefreshCw size={14} className={checking ? 'spinner' : ''} />
            <span>{checking ? 'Checking Atlas...' : 'Test Connection Again'}</span>
          </button>
        </div>

        {testResult && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            <strong>Server Response:</strong> {JSON.stringify(testResult.database, null, 2)}
          </div>
        )}
      </div>

      {/* Step-by-Step Instructions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Step 1 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              1
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
              Create a Free MongoDB Atlas Account & Cluster
            </h3>
          </div>
          <p style={{ color: 'var(--neutral-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
            Visit the official MongoDB Atlas website and register a free account. No credit card is required.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--neutral-700)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Go to <a href="https://www.mongodb.com/cloud/atlas/register" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>MongoDB Atlas Signup <ExternalLink size={12} style={{ display: 'inline' }} /></a>.</li>
            <li>Click <strong>"Create Deployment"</strong> and select the <strong>M0 (Free Forever)</strong> tier.</li>
            <li>Pick any cloud provider (AWS, Google Cloud, or Azure) in a region geographically closest to you.</li>
            <li>Click <strong>"Create Deployment"</strong>. Atlas will prepare your free cloud database within 1-2 minutes.</li>
          </ul>
        </div>

        {/* Step 2 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              2
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
              Set Up Database User & Password
            </h3>
          </div>
          <p style={{ color: 'var(--neutral-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
            Atlas requires a dedicated database user (which is different from your login email).
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--neutral-700)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>In the left sidebar under <strong>Security</strong>, click <strong>Database Access</strong>.</li>
            <li>Click <strong>"Add New Database User"</strong>.</li>
            <li>Choose <strong>Password</strong> authentication.</li>
            <li>Enter a username (e.g. <code>keeploop_user</code>) and a strong password.</li>
            <li>Under <strong>Database User Privileges</strong>, ensure <strong>"Read and write to any database"</strong> is selected.</li>
            <li>Click <strong>"Add User"</strong>.</li>
          </ul>

          <div className="alert alert-warning" style={{ marginTop: '1rem', marginBottom: 0 }}>
            <div>
              <strong>Special Character Password Notice (URL Encoding):</strong>
              <div style={{ fontSize: '0.825rem', marginTop: '3px' }}>
                If your database password has special characters like <code>@</code>, <code>:</code>, <code>/</code>, <code>#</code>, <code>?</code>, or <code>%</code>, you <strong>MUST</strong> URL-encode them.
                <br />For example:
                <ul style={{ marginTop: '4px', paddingLeft: '1.2rem' }}>
                  <li><code>@</code> becomes <code>%40</code></li>
                  <li><code>#</code> becomes <code>%23</code></li>
                  <li><code>$</code> becomes <code>%24</code></li>
                  <li><code>!</code> becomes <code>%21</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              3
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
              Configure Network Access (IP Whitelist)
            </h3>
          </div>
          <p style={{ color: 'var(--neutral-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
            Atlas has a built-in firewall that blocks all connections by default until you grant access.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--neutral-700)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>In the left sidebar under <strong>Security</strong>, click <strong>Network Access</strong>.</li>
            <li>Click <strong>"Add IP Address"</strong>.</li>
            <li>Click <strong>"Allow Access From Anywhere"</strong> (this adds <code>0.0.0.0/0</code>), or click <strong>"Add Current IP Address"</strong>.</li>
            <li>Click <strong>"Confirm"</strong> and wait 10-20 seconds until the status shows green <strong>"Active"</strong>.</li>
          </ul>
        </div>

        {/* Step 4 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              4
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
              Obtain and Paste Your Connection String
            </h3>
          </div>
          <p style={{ color: 'var(--neutral-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
            Copy the Node.js connection string into your project's <code>server/.env</code> file.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--neutral-700)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>In the left sidebar, click <strong>Database</strong> under Deployments.</li>
            <li>Click the <strong>"Connect"</strong> button next to your cluster.</li>
            <li>Select <strong>"Drivers"</strong>.</li>
            <li>Choose <strong>Node.js</strong> and version <strong>6.7 or later</strong>.</li>
            <li>Copy the connection string format:
              <pre style={{ background: 'var(--neutral-900)', color: '#38bdf8', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem', overflowX: 'auto', fontSize: '0.8rem' }}>
                mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.xxxxx.mongodb.net/keeploop?retryWrites=true&w=majority
              </pre>
            </li>
            <li>Open the file <code>server/.env</code> in VS Code.</li>
            <li>Replace the placeholder <code>MONGODB_URI</code> value with your actual connection string.</li>
            <li>Save the file. Express will automatically connect or reconnect!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

