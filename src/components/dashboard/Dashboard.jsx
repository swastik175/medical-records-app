import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Files, ShieldCheck, Bell, Siren, FilePlus2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { Loading } from '../common/UI';
import { authService } from '../../services/authService';
import { toast } from 'sonner';

const CATEGORY_LABEL = {
  PRESCRIPTION: 'Prescription', LAB_REPORT: 'Lab Report', RADIOLOGY: 'Radiology',
  HOSPITAL_DISCHARGE: 'Discharge', MEDICAL_BILL: 'Bill', VACCINATION: 'Vaccination',
  ALLERGY_MEDICINE: 'Allergy / Medicine',
};

function formatDate(val) {
  if (!val) return '—';
  try { return new Date(val + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return val; }
}

export default function Dashboard() {
  const [data, setData] = useState({ family: [], records: [], policies: [], reminders: [] });
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    Promise.all([
      api.get('/family').catch(() => ({ data: [] })),
      api.get('/records').catch(() => ({ data: [] })),
      api.get('/policies').catch(() => ({ data: [] })),
      api.get('/reminders').catch(() => ({ data: [] })),
    ]).then(([f, r, p, rem]) => {
      setData({
        family: Array.isArray(f.data) ? f.data : [],
        records: Array.isArray(r.data) ? r.data : [],
        policies: Array.isArray(p.data) ? p.data : [],
        reminders: Array.isArray(rem.data) ? rem.data : [],
      });
    }).catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading message="Loading dashboard…" />;

  const { family, records, policies, reminders } = data;
  const activePolicies = policies.filter(p => p.active);
  const expiringPolicies = activePolicies.filter(p => p.daysUntilExpiry != null && p.daysUntilExpiry <= 30);
  const activeReminders = reminders.filter(r => (r.active !== undefined ? r.active : r.enabled));
  const recentRecords = [...records].sort((a, b) => new Date(b.recordDate || 0) - new Date(a.recordDate || 0)).slice(0, 5);

  const LEDGER = [
    { to: '/family',    icon: Users,       label: 'Family members', value: family.length },
    { to: '/records',   icon: Files,       label: 'Medical records', value: records.length },
    { to: '/policies',  icon: ShieldCheck, label: 'Active policies', value: activePolicies.length },
    { to: '/reminders', icon: Bell,        label: 'Active reminders', value: activeReminders.length },
  ];

  return (
    <div className="page-stack">
      {/* Welcome */}
      <div className="page-header">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1 className="page-title">
            Welcome back, {user?.fullName?.split(' ')[0] || 'there'}
          </h1>
          <p className="muted" style={{ marginBottom: 0 }}>Here's a quick overview of your family's health records.</p>
        </div>
        <Link to="/emergency" className="button button-secondary">
          <Siren size={16} /> Emergency Card
        </Link>
      </div>

      {/* Expiring alert */}
      {expiringPolicies.length > 0 && (
        <div className="attention-strip">
          <AlertTriangle size={18} />
          <span>
            <strong>{expiringPolicies.length} insurance {expiringPolicies.length === 1 ? 'policy' : 'policies'}</strong> expiring within 30 days.{' '}
            <Link to="/policies" style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline' }}>Review →</Link>
          </span>
        </div>
      )}

      {/* Overview ledger */}
      <div className="overview-ledger">
        {LEDGER.map(({ to, icon: Icon, label, value }) => (
          <Link to={to} key={label} className="ledger-item">
            <div className="ledger-icon"><Icon size={20} /></div>
            <div className="ledger-value">{value}</div>
            <div className="ledger-label">{label}</div>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Recent records */}
        <div className="panel">
          <div className="panel-header">
            <span className="eyebrow" style={{ marginBottom: 0 }}>Recent</span>
            <h2 className="panel-title">Medical Records</h2>
          </div>
          {recentRecords.length === 0 ? (
            <div className="panel-empty">
              <FilePlus2 size={28} className="muted" />
              <p className="muted">No records yet.</p>
              <Link to="/records" className="button button-primary button-small">Add Record</Link>
            </div>
          ) : (
            <ul className="record-list">
              {recentRecords.map(r => {
                const member = family.find(m => m.id?.toString() === r.familyMemberId?.toString());
                return (
                  <li key={r.id} className="record-item">
                    <div className="record-date-block">
                      <span className="record-day">{r.recordDate ? new Date(r.recordDate + 'T00:00:00').getDate() : '—'}</span>
                      <span className="record-month">{r.recordDate ? new Date(r.recordDate + 'T00:00:00').toLocaleString('en-IN', { month: 'short' }).toUpperCase() : ''}</span>
                    </div>
                    <div className="record-info">
                      <div className="record-title">{r.title}</div>
                      <div className="record-meta muted">
                        {CATEGORY_LABEL[r.category] || r.category}
                        {member ? ` · ${member.fullName}` : ''}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="panel-footer">
            <Link to="/records" className="text-link">View all records →</Link>
          </div>
        </div>

        {/* Attention panel */}
        <div>
          {/* Active reminders */}
          <div className="panel" style={{ marginBottom: '1.25rem' }}>
            <div className="panel-header">
              <h2 className="panel-title">Active Reminders</h2>
            </div>
            {activeReminders.length === 0 ? (
              <div className="panel-empty" style={{ padding: '1.25rem' }}>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>No active reminders.</p>
              </div>
            ) : (
              <ul className="record-list">
                {activeReminders.slice(0, 4).map(r => (
                  <li key={r.id} className="record-item">
                    <div className="reminder-type-dot" data-type={r.reminderType || r.type} />
                    <div className="record-info">
                      <div className="record-title">{r.title}</div>
                      <div className="record-meta muted">{(r.reminderType || r.type)?.replace('_', ' ')} · {formatDate(r.reminderDate)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="panel-footer">
              <Link to="/reminders" className="text-link">Manage reminders →</Link>
            </div>
          </div>

          {/* Emergency callout */}
          <div className="emergency-callout">
            <Siren size={22} />
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Emergency Summary</div>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                Generate a printable health card for hospital visits with critical information at a glance.
              </p>
            </div>
            <Link to="/emergency" className="button button-small button-secondary" style={{ marginTop: 8, alignSelf: 'flex-start' }}>
              Open →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
