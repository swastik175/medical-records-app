import { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingOverlay, EmptyState, ConfirmModal } from '../common/UI';
import { useToast, ToastContainer } from '../common/Toast';

const EMPTY_FORM = {
  companyName: '', policyNumber: '', policyholderName: '',
  insuredMembersSummary: '', startDate: '', expiryDate: '',
  sumInsured: '', roomRentLimit: '', tpaName: '',
  cashlessPortalUrl: '', customerCareNumber: '',
  renewalReminderDays: 30, active: true
};

export default function InsurancePoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPolicy, setEditPolicy] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [policyFile, setPolicyFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const res = await api.get('/policies');
      setPolicies(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditPolicy(null);
    setForm(EMPTY_FORM);
    setPolicyFile(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditPolicy(p);
    setForm({
      companyName: p.companyName || '', policyNumber: p.policyNumber || '',
      policyholderName: p.policyholderName || '', insuredMembersSummary: p.insuredMembersSummary || '',
      startDate: p.startDate || '', expiryDate: p.expiryDate || '',
      sumInsured: p.sumInsured || '', roomRentLimit: p.roomRentLimit || '',
      tpaName: p.tpaName || '', cashlessPortalUrl: p.cashlessPortalUrl || '',
      customerCareNumber: p.customerCareNumber || '',
      renewalReminderDays: p.renewalReminderDays || 30, active: p.active !== false
    });
    setPolicyFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') formData.append(k, v.toString()); });
      if (policyFile) formData.append('policyDocument', policyFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editPolicy) {
        await api.put(`/policies/${editPolicy.id}`, formData, config);
        toast.success('Policy updated!');
      } else {
        await api.post('/policies', formData, config);
        toast.success('Policy added!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/policies/${deleteTarget.id}`);
      toast.success('Policy deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete policy');
      setDeleteTarget(null);
    }
  };

  const getDaysColor = (days) => {
    if (days <= 30) return 'badge-danger';
    if (days <= 60) return 'badge-warning';
    return 'badge-success';
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />

      <div className="page-header">
        <div className="page-title">
          <h1>🛡️ Insurance Policies</h1>
          <p>Manage your health insurance policies and renewal dates</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Policy</button>
      </div>

      {policies.length === 0 ? (
        <EmptyState
          icon="🛡️"
          title="No insurance policies added"
          description="Add your health insurance policies to track renewals and claim documents."
          action={<button className="btn btn-primary" onClick={openAdd}>Add First Policy</button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {policies.map(p => (
            <div key={p.id} className="policy-card">
              <div className="policy-card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{p.companyName}</div>
                    <div style={{ fontSize: '0.8125rem', opacity: 0.85, marginTop: '0.2rem' }}>Policy #{p.policyNumber}</div>
                  </div>
                  <span className={`badge ${p.active ? 'badge-success' : 'badge-neutral'}`}
                    style={{ background: p.active ? '#bbf7d0' : '#e5e7eb', color: p.active ? '#14532d' : '#6b7280' }}>
                    {p.active ? '✅ Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="policy-card-body">
                <div className="policy-grid">
                  <div className="policy-field">
                    <div className="policy-field-label">Policyholder</div>
                    <div className="policy-field-value">{p.policyholderName}</div>
                  </div>
                  <div className="policy-field">
                    <div className="policy-field-label">Sum Insured</div>
                    <div className="policy-field-value">{p.sumInsured ? `₹${Number(p.sumInsured).toLocaleString('en-IN')}` : '—'}</div>
                  </div>
                  <div className="policy-field">
                    <div className="policy-field-label">Start Date</div>
                    <div className="policy-field-value">{p.startDate}</div>
                  </div>
                  <div className="policy-field">
                    <div className="policy-field-label">Expiry Date</div>
                    <div className="policy-field-value" style={{ color: p.daysUntilExpiry <= 30 ? 'var(--danger)' : 'inherit' }}>
                      {p.expiryDate}
                    </div>
                  </div>
                </div>

                {p.insuredMembersSummary && (
                  <div className="policy-field">
                    <div className="policy-field-label">Insured Members</div>
                    <div className="policy-field-value">{p.insuredMembersSummary}</div>
                  </div>
                )}

                {p.tpaName && (
                  <div className="policy-field">
                    <div className="policy-field-label">TPA</div>
                    <div className="policy-field-value">{p.tpaName}</div>
                  </div>
                )}

                {p.roomRentLimit && (
                  <div className="policy-field">
                    <div className="policy-field-label">Room Rent Limit</div>
                    <div className="policy-field-value">{p.roomRentLimit}</div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                  <span className={`badge ${getDaysColor(p.daysUntilExpiry)}`}>
                    {p.daysUntilExpiry <= 0 ? '⚠️ Expired' : `⏳ ${p.daysUntilExpiry} days left`}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {p.cashlessPortalUrl && (
                      <a href={p.cashlessPortalUrl} target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm">🔗 Portal</a>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(p)}>🗑️</button>
                  </div>
                </div>

                {p.customerCareNumber && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    📞 Customer Care: <strong>{p.customerCareNumber}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3>{editPolicy ? '✏️ Edit Policy' : '🛡️ Add Insurance Policy'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Insurance Company <span className="required">*</span></label>
                    <input type="text" className="form-input" placeholder="e.g. Star Health Insurance"
                      value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Policy Number <span className="required">*</span></label>
                    <input type="text" className="form-input" placeholder="e.g. SH-2024-001"
                      value={form.policyNumber} onChange={e => setForm({ ...form, policyNumber: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Policyholder Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={form.policyholderName}
                      onChange={e => setForm({ ...form, policyholderName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sum Insured (₹)</label>
                    <input type="number" className="form-input" placeholder="e.g. 500000"
                      value={form.sumInsured} onChange={e => setForm({ ...form, sumInsured: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Insured Family Members</label>
                  <input type="text" className="form-input" placeholder="e.g. Rajesh Sharma, Sunita Sharma"
                    value={form.insuredMembersSummary} onChange={e => setForm({ ...form, insuredMembersSummary: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Policy Start Date <span className="required">*</span></label>
                    <input type="date" className="form-input" value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Policy Expiry Date <span className="required">*</span></label>
                    <input type="date" className="form-input" value={form.expiryDate}
                      onChange={e => setForm({ ...form, expiryDate: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Room Rent Limit</label>
                    <input type="text" className="form-input" placeholder="e.g. 1% of SI per day"
                      value={form.roomRentLimit} onChange={e => setForm({ ...form, roomRentLimit: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">TPA Name</label>
                    <input type="text" className="form-input" placeholder="e.g. MD India Health"
                      value={form.tpaName} onChange={e => setForm({ ...form, tpaName: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Cashless Hospital Portal URL</label>
                    <input type="url" className="form-input" placeholder="https://..."
                      value={form.cashlessPortalUrl} onChange={e => setForm({ ...form, cashlessPortalUrl: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer Care Number</label>
                    <input type="text" className="form-input" placeholder="1800-xxx-xxxx"
                      value={form.customerCareNumber} onChange={e => setForm({ ...form, customerCareNumber: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Renewal Reminder (days before)</label>
                    <select className="form-select" value={form.renewalReminderDays}
                      onChange={e => setForm({ ...form, renewalReminderDays: Number(e.target.value) })}>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Upload Policy Document</label>
                    <input type="file" className="form-input" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => setPolicyFile(e.target.files[0])} style={{ padding: '0.5rem' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.active}
                      onChange={e => setForm({ ...form, active: e.target.checked })}
                      style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                    <span className="form-label" style={{ margin: 0 }}>Policy is currently active</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Policy"
          message={`Delete policy "${deleteTarget.companyName} - ${deleteTarget.policyNumber}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
