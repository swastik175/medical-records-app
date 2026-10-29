import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LoadingOverlay } from '../common/UI';
import { authService } from '../../services/authService';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    Promise.all([
      api.get('/family').catch(() => ({ data: [] })),
      api.get('/records').catch(() => ({ data: [] })),
      api.get('/policies').catch(() => ({ data: [] })),
      api.get('/reminders').catch(() => ({ data: [] })),
    ]).then(([family, records, pols, rems]) => {
      const familyData = Array.isArray(family.data) ? family.data : [];
      const recordsData = Array.isArray(records.data) ? records.data : [];
      const policiesData = Array.isArray(pols.data) ? pols.data : [];
      const remindersData = Array.isArray(rems.data) ? rems.data : [];

      setStats({
        familyCount: familyData.length,
        recordCount: recordsData.length,
        policyCount: policiesData.filter(p => p.active).length,
        upcomingReminders: remindersData.filter(r => r.enabled).length,
        expiringPolicies: policiesData.filter(p => p.active && p.daysUntilExpiry <= 30).length,
      });
      setPolicies(policiesData.filter(p => p.active).slice(0, 3));
      setReminders(remindersData.filter(r => r.enabled).slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingOverlay message="Loading dashboard..." />;

  const STAT_CARDS = [
    { icon: '👨‍👩‍👧‍👦', label: 'Family Members', value: stats?.familyCount ?? 0, color: '#ede9fe', iconColor: '#7c3aed', to: '/family' },
    { icon: '📋', label: 'Medical Records', value: stats?.recordCount ?? 0, color: '#dbeafe', iconColor: '#2563eb', to: '/records' },
    { icon: '🛡️', label: 'Active Policies', value: stats?.policyCount ?? 0, color: '#dcfce7', iconColor: '#16a34a', to: '/policies' },
    { icon: '🔔', label: 'Active Reminders', value: stats?.upcomingReminders ?? 0, color: '#fef3c7', iconColor: '#d97706', to: '/reminders' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
          Welcome back, {user?.fullName?.split(' ')[0] || 'there'} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's a quick overview of your family's health records.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STAT_CARDS.map(({ icon, label, value, color, iconColor, to }) => (
          <Link to={to} key={label} style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
            >
              <div className="stat-icon" style={{ background: color }}>
                <span style={{ fontSize: '1.3rem' }}>{icon}</span>
              </div>
              <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ color: iconColor }}>{value}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Expiring soon alert */}
      {stats?.expiringPolicies > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>
            <strong>{stats.expiringPolicies} insurance policy</strong> is expiring within 30 days.
            {' '}<Link to="/policies" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>Review policies →</Link>
          </span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Recent Policies */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>🛡️ Active Insurance Policies</h3>
            <Link to="/policies" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {policies.length === 0 ? (
            <div className="card-body">
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
                <p>No policies added yet.</p>
                <Link to="/policies" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                  Add Policy
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {policies.map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)'
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius)',
                    background: 'var(--secondary-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
                  }}>🛡️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.companyName}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Policy #{p.policyNumber} · Expires {p.expiryDate}
                    </div>
                  </div>
                  {p.daysUntilExpiry <= 30 ? (
                    <span className="badge badge-danger">Expiring Soon</span>
                  ) : (
                    <span className="badge badge-success">Active</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>🔔 Reminders</h3>
            <Link to="/reminders" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {reminders.length === 0 ? (
            <div className="card-body">
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <p style={{ fontSize: '0.875rem' }}>No active reminders.</p>
              </div>
            </div>
          ) : (
            <div>
              {reminders.map(r => {
                const icons = { MEDICINE: '💊', APPOINTMENT: '🏥', POLICY_RENEWAL: '🛡️' };
                const colors = { MEDICINE: '#fce7f3', APPOINTMENT: '#dbeafe', POLICY_RENEWAL: '#dcfce7' };
                return (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-light)'
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius)',
                      background: colors[r.type] || 'var(--border-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                    }}>
                      {icons[r.type] || '🔔'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.reminderDate || r.dueDate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 style={{ margin: 0 }}>⚡ Quick Actions</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/records" className="btn btn-secondary">📋 Add Medical Record</Link>
          <Link to="/family" className="btn btn-secondary">👤 Add Family Member</Link>
          <Link to="/policies" className="btn btn-secondary">🛡️ Add Insurance Policy</Link>
          <Link to="/claims" className="btn btn-secondary">📄 Manage Claim Docs</Link>
          <Link to="/emergency" className="btn btn-secondary">🚨 Emergency Summary</Link>
        </div>
      </div>
    </div>
  );
}
