import { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingOverlay, EmptyState, ConfirmModal } from '../common/UI';
import { useToast, ToastContainer } from '../common/Toast';

const REMINDER_TYPES = [
  { value: 'MEDICINE', label: 'Medicine Reminder', icon: '💊', color: '#fce7f3' },
  { value: 'APPOINTMENT', label: 'Doctor Appointment', icon: '🏥', color: '#dbeafe' },
  { value: 'POLICY_RENEWAL', label: 'Policy Renewal', icon: '🛡️', color: '#dcfce7' },
];

const RECURRENCE = ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'];

const EMPTY_FORM = {
  type: 'MEDICINE', title: '', description: '', reminderDate: '',
  recurrence: 'ONCE', enabled: true
};

const TYPE_MAP = Object.fromEntries(REMINDER_TYPES.map(t => [t.value, t]));

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editReminder, setEditReminder] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const res = await api.get('/reminders');
      setReminders(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditReminder(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditReminder(r);
    setForm({
      type: r.type || 'MEDICINE',
      title: r.title || '',
      description: r.description || '',
      reminderDate: r.reminderDate || '',
      recurrence: r.recurrence || 'ONCE',
      enabled: r.enabled !== false
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editReminder) {
        await api.put(`/reminders/${editReminder.id}`, form);
        toast.success('Reminder updated!');
      } else {
        await api.post('/reminders', form);
        toast.success('Reminder created!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save reminder');
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (r) => {
    try {
      await api.put(`/reminders/${r.id}`, { ...r, enabled: !r.enabled });
      load();
    } catch {
      toast.error('Failed to update reminder');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/reminders/${deleteTarget.id}`);
      toast.success('Reminder deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete reminder');
      setDeleteTarget(null);
    }
  };

  const groupedReminders = REMINDER_TYPES.reduce((acc, t) => {
    acc[t.value] = reminders.filter(r => r.type === t.value);
    return acc;
  }, {});

  if (loading) return <LoadingOverlay />;

  const activeCount = reminders.filter(r => r.enabled).length;

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />

      <div className="page-header">
        <div className="page-title">
          <h1>🔔 Reminders</h1>
          <p>Medicine, appointments and policy renewal reminders</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Reminder</button>
      </div>

      {/* Summary */}
      {reminders.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--primary-light)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
            🔔 <strong>{activeCount}</strong> active reminder{activeCount !== 1 ? 's' : ''}
          </div>
          {REMINDER_TYPES.map(t => groupedReminders[t.value].length > 0 && (
            <div key={t.value} style={{ background: t.color, padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
              {t.icon} <strong>{groupedReminders[t.value].length}</strong> {t.label}
            </div>
          ))}
        </div>
      )}

      {reminders.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No reminders set up"
          description="Set up reminders for medicines, doctor appointments and policy renewals."
          action={<button className="btn btn-primary" onClick={openAdd}>Add First Reminder</button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {REMINDER_TYPES.map(t => {
            const group = groupedReminders[t.value];
            if (group.length === 0) return null;
            return (
              <div key={t.value} className="card">
                <div className="card-header">
                  <h3 style={{ margin: 0 }}>{t.icon} {t.label}</h3>
                  <span className="badge badge-neutral">{group.length}</span>
                </div>
                <div>
                  {group.map(r => (
                    <div key={r.id} className="reminder-item">
                      <div className="reminder-icon" style={{ background: t.color }}>
                        {t.icon}
                      </div>
                      <div className="reminder-body">
                        <div className="reminder-title" style={{ color: r.enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {r.title}
                        </div>
                        {r.description && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{r.description}</div>
                        )}
                        <div className="reminder-date">
                          {r.reminderDate && `📅 ${r.reminderDate}`}
                          {r.recurrence && r.recurrence !== 'ONCE' && ` · 🔄 ${r.recurrence}`}
                        </div>
                      </div>
                      <div className="reminder-toggle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Toggle */}
                        <label className="toggle" title={r.enabled ? 'Disable reminder' : 'Enable reminder'}>
                          <input type="checkbox" checked={r.enabled} onChange={() => toggleEnabled(r)} />
                          <div className="toggle-track">
                            <div className="toggle-thumb" style={{ transform: r.enabled ? 'translateX(20px)' : 'none' }} />
                          </div>
                        </label>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(r)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>{editReminder ? '✏️ Edit Reminder' : '🔔 Add Reminder'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Reminder Type <span className="required">*</span></label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {REMINDER_TYPES.map(t => (
                      <button
                        key={t.value} type="button"
                        onClick={() => setForm({ ...form, type: t.value })}
                        className={`btn btn-sm ${form.type === t.value ? 'btn-primary' : 'btn-ghost'}`}
                      >
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reminder Title <span className="required">*</span></label>
                  <input type="text" className="form-input" placeholder="e.g. Take Metformin 500mg after breakfast"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Additional details..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={form.reminderDate}
                      onChange={e => setForm({ ...form, reminderDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recurrence</label>
                    <select className="form-select" value={form.recurrence}
                      onChange={e => setForm({ ...form, recurrence: e.target.value })}>
                      {RECURRENCE.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.enabled}
                      onChange={e => setForm({ ...form, enabled: e.target.checked })}
                      style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                    <span className="form-label" style={{ margin: 0 }}>Reminder is active</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Reminder"
          message={`Delete reminder "${deleteTarget.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
