import { useState, useEffect } from 'react';
import { Bell, Pill, Stethoscope, ShieldCheck, Pencil, Trash2, Play, Pause, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import { Loading, EmptyState, ConfirmModal, PageHeader } from '../common/UI';
import { toast } from 'sonner';

const REMINDER_TYPES = [
  { value: 'MEDICINE',      label: 'Medicine',       icon: Pill,         color: 'var(--mint-200)' },
  { value: 'APPOINTMENT',   label: 'Appointment',    icon: Stethoscope,  color: '#dbeafe' },
  { value: 'POLICY_RENEWAL',label: 'Policy Renewal', icon: ShieldCheck,  color: '#dcfce7' },
];

const RECURRENCE = ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'];

const EMPTY_FORM = {
  type: 'MEDICINE', title: '', description: '', reminderDate: '', recurrence: 'ONCE', enabled: true,
};

function formatDate(val) {
  if (!val) return '—';
  try { return new Date(val + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return val; }
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editReminder, setEditReminder] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const openAdd = () => { setEditReminder(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (r) => {
    setEditReminder(r);
    setForm({
      type: r.reminderType || r.type || 'MEDICINE',
      title: r.title || '',
      description: r.description || '',
      reminderDate: r.reminderDate || '',
      recurrence: r.dosageOrFrequency || r.recurrence || 'ONCE',
      enabled: r.active !== undefined ? r.active : (r.enabled !== false),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        reminderType: form.type || 'MEDICINE',
        title: form.title,
        description: form.description || null,
        reminderDate: form.reminderDate,
        dosageOrFrequency: form.recurrence || 'Daily',
        active: form.enabled !== false,
      };

      if (editReminder) {
        await api.put(`/reminders/${editReminder.id}`, payload);
        toast.success('Reminder updated!');
      } else {
        await api.post('/reminders', payload);
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
      const currentActive = r.active !== undefined ? r.active : r.enabled;
      await api.put(`/reminders/${r.id}`, {
        ...r,
        reminderType: r.reminderType || r.type,
        active: !currentActive
      });
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

  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  if (loading) return <Loading />;

  const activeCount = reminders.filter(r => (r.active !== undefined ? r.active : r.enabled)).length;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Notifications"
        title="Reminders"
        description="Medicine, appointment and policy renewal reminders."
        action={
          <button className="button button-primary" onClick={openAdd}>
            <PlusCircle size={16} /> Add Reminder
          </button>
        }
      />

      {/* Summary strip */}
      {reminders.length > 0 && (
        <div className="notification-strip">
          <Bell size={16} />
          <span><strong>{activeCount}</strong> active reminder{activeCount !== 1 ? 's' : ''}</span>
          <span className="strip-divider" />
          {REMINDER_TYPES.map(t => {
            const count = reminders.filter(r => (r.reminderType || r.type) === t.value).length;
            if (!count) return null;
            const Icon = t.icon;
            return (
              <span key={t.value} className="strip-type">
                <Icon size={13} /> {count} {t.label}
              </span>
            );
          })}
        </div>
      )}

      {reminders.length === 0 ? (
        <EmptyState
          title="No reminders set up"
          description="Set up reminders for medicines, appointments and policy renewals."
          action={<button className="button button-primary" onClick={openAdd}>Add First Reminder</button>}
        />
      ) : (
        <div className="reminder-list">
          {REMINDER_TYPES.map(({ value, label, icon: Icon, color }) => {
            const group = reminders.filter(r => (r.reminderType || r.type) === value);
            if (!group.length) return null;
            return (
              <div key={value} className="reminder-group">
                <div className="reminder-group-heading">
                  <span className="reminder-group-icon" style={{ background: color }}><Icon size={14} /></span>
                  {label}
                </div>
                {group.map(r => {
                  const isActive = r.active !== undefined ? r.active : r.enabled;
                  return (
                    <div key={r.id} className={`reminder-item${isActive ? '' : ' reminder-paused'}`}>
                      <div className="reminder-item-info">
                        <div className="reminder-title">{r.title}</div>
                        <div className="reminder-meta muted">
                          {formatDate(r.reminderDate)}
                          {r.dosageOrFrequency || (r.recurrence !== 'ONCE' ? ` · ${r.recurrence}` : '')}
                        </div>
                        {r.description && <div className="reminder-desc muted">{r.description}</div>}
                      </div>
                      <div className="reminder-item-actions">
                        <span className={`badge${isActive ? ' badge-success' : ' badge-neutral'}`}>
                          {isActive ? 'Active' : 'Paused'}
                        </span>
                        <button
                          className="icon-button"
                          title={isActive ? 'Pause' : 'Resume'}
                          onClick={() => toggleEnabled(r)}
                        >
                          {isActive ? <Pause size={15} /> : <Play size={15} />}
                        </button>
                        <button className="icon-button" title="Edit" onClick={() => openEdit(r)}>
                          <Pencil size={15} />
                        </button>
                        <button className="icon-button danger-text" title="Delete" onClick={() => setDeleteTarget(r)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-inner" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editReminder ? 'Edit Reminder' : 'Add Reminder'}</h2>
              <button className="icon-button" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body form-stack">
                <div className="field">
                  <span>Reminder Type <span className="required">*</span></span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {REMINDER_TYPES.map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.value} type="button"
                          className={`button button-small${form.type === t.value ? ' button-primary' : ' button-secondary'}`}
                          onClick={() => set({ type: t.value })}
                        >
                          <Icon size={14} /> {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label className="field">
                  <span>Title <span className="required">*</span></span>
                  <input type="text" placeholder="e.g. Take Metformin 500mg after breakfast"
                    value={form.title} onChange={e => set({ title: e.target.value })} required />
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea placeholder="Additional details…"
                    value={form.description} onChange={e => set({ description: e.target.value })} />
                </label>
                <div className="form-grid">
                  <label className="field">
                    <span>Date</span>
                    <input type="date" value={form.reminderDate} onChange={e => set({ reminderDate: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Recurrence</span>
                    <select value={form.recurrence} onChange={e => set({ recurrence: e.target.value })}>
                      {RECURRENCE.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </label>
                </div>
                <label className="consent-row">
                  <input type="checkbox" checked={form.enabled} onChange={e => set({ enabled: e.target.checked })} />
                  <span>Reminder is active</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="button button-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Reminder'}
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
