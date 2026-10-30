import { useState, useEffect } from 'react';
import { ShieldCheck, Pencil, Trash2, ExternalLink, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import { Loading, EmptyState, ConfirmModal, PageHeader } from '../common/UI';
import { toast } from 'sonner';

const EMPTY_FORM = {
  companyName: '', policyNumber: '', policyholderName: '',
  insuredMembersSummary: '', startDate: '', expiryDate: '',
  sumInsured: '', customerCareNumber: '',
  renewalReminderDays: 30, active: true,
};

function formatDate(val) {
  if (!val) return '—';
  try { return new Date(val + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return val; }
}

function formatMoney(val) {
  if (!val) return '—';
  return '₹' + Number(val).toLocaleString('en-IN');
}

function getDaysBadge(days) {
  if (days == null) return null;
  if (days <= 0) return { label: 'Expired', cls: 'badge-danger' };
  if (days <= 30) return { label: `${days}d left`, cls: 'badge-danger' };
  if (days <= 60) return { label: `${days}d left`, cls: 'badge-warning' };
  return { label: `${days}d left`, cls: 'badge-success' };
}

export default function InsurancePoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPolicy, setEditPolicy] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [policyFile, setPolicyFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const openAdd = () => { setEditPolicy(null); setForm(EMPTY_FORM); setPolicyFile(null); setShowModal(true); };
  const openEdit = (p) => {
    setEditPolicy(p);
    setForm({
      companyName: p.companyName || '', policyNumber: p.policyNumber || '',
      policyholderName: p.policyholderName || '', insuredMembersSummary: p.insuredMembersSummary || '',
      startDate: p.startDate || '', expiryDate: p.expiryDate || '',
      sumInsured: p.sumInsured || '',
      customerCareNumber: p.customerCareNumber || '',
      renewalReminderDays: p.renewalReminderDays || 30, active: p.active !== false,
    });
    setPolicyFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        companyName: form.companyName,
        policyNumber: form.policyNumber,
        policyholderName: form.policyholderName || 'Self',
        insuredMembersSummary: form.insuredMembersSummary || null,
        startDate: form.startDate,
        expiryDate: form.expiryDate,
        sumInsured: form.sumInsured ? Number(form.sumInsured) : null,
        customerCareNumber: form.customerCareNumber || null,
        renewalReminderDays: Number(form.renewalReminderDays) || 30,
        active: form.active
      };

      if (editPolicy) {
        await api.put(`/policies/${editPolicy.id}`, payload);
        toast.success('Policy updated!');
      } else {
        await api.post('/policies', payload);
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

  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  if (loading) return <Loading />;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Insurance"
        title="Insurance Policies"
        description="Manage health insurance policies and renewal dates."
        action={
          <button className="button button-primary" onClick={openAdd}>
            <PlusCircle size={16} /> Add Policy
          </button>
        }
      />

      {policies.length === 0 ? (
        <EmptyState
          title="No insurance policies added"
          description="Add your health insurance policies to track renewals and claims."
          action={<button className="button button-primary" onClick={openAdd}>Add First Policy</button>}
        />
      ) : (
        <div className="policy-list">
          {policies.map(p => {
            const badge = getDaysBadge(p.daysUntilExpiry);
            return (
              <div key={p.id} className={`policy-item${!p.active ? ' policy-inactive' : ''}`}>
                <div className="policy-item-header">
                  <div className="policy-icon-wrap">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="policy-header-info">
                    <div className="policy-company">{p.companyName}</div>
                    <div className="policy-number muted">Policy #{p.policyNumber}</div>
                  </div>
                  {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}
                  {!p.active && <span className="badge badge-neutral">Inactive</span>}
                </div>

                <dl className="policy-dl">
                  {p.policyholderName && <><dt>Policyholder</dt><dd>{p.policyholderName}</dd></>}
                  {p.insuredMembersSummary && <><dt>Insured Members</dt><dd>{p.insuredMembersSummary}</dd></>}
                  {p.startDate && <><dt>Start Date</dt><dd>{formatDate(p.startDate)}</dd></>}
                  {p.expiryDate && <><dt>Expiry Date</dt><dd>{formatDate(p.expiryDate)}</dd></>}
                  {p.sumInsured && <><dt>Sum Insured</dt><dd>{formatMoney(p.sumInsured)}</dd></>}
                  {p.roomRentLimit && <><dt>Room Rent Limit</dt><dd>{p.roomRentLimit}</dd></>}
                  {p.tpaName && <><dt>TPA</dt><dd>{p.tpaName}</dd></>}
                  {p.customerCareNumber && <><dt>Customer Care</dt><dd>{p.customerCareNumber}</dd></>}
                </dl>

                {p.cashlessPortalUrl && (
                  <a href={p.cashlessPortalUrl} target="_blank" rel="noopener noreferrer" className="text-link" style={{ fontSize: 13 }}>
                    <ExternalLink size={13} /> Cashless Hospital Portal
                  </a>
                )}

                <div className="policy-actions">
                  <button className="button button-secondary button-small" onClick={() => openEdit(p)}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="button button-danger button-small" onClick={() => setDeleteTarget(p)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-inner" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editPolicy ? 'Edit Policy' : 'Add Insurance Policy'}</h2>
              <button className="icon-button" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body form-stack">
                <div className="form-grid">
                  <label className="field">
                    <span>Insurance Company <span className="required">*</span></span>
                    <input type="text" placeholder="e.g. Star Health Insurance"
                      value={form.companyName} onChange={e => set({ companyName: e.target.value })} required />
                  </label>
                  <label className="field">
                    <span>Policy Number <span className="required">*</span></span>
                    <input type="text" placeholder="Policy number"
                      value={form.policyNumber} onChange={e => set({ policyNumber: e.target.value })} required />
                  </label>
                </div>
                <div className="form-grid">
                  <label className="field">
                    <span>Policyholder Name</span>
                    <input type="text" placeholder="Primary insured person"
                      value={form.policyholderName} onChange={e => set({ policyholderName: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Sum Insured (₹)</span>
                    <input type="number" placeholder="e.g. 500000"
                      value={form.sumInsured} onChange={e => set({ sumInsured: e.target.value })} />
                  </label>
                </div>
                <label className="field">
                  <span>Insured Members Summary</span>
                  <input type="text" placeholder="e.g. Self, Spouse, 2 children"
                    value={form.insuredMembersSummary} onChange={e => set({ insuredMembersSummary: e.target.value })} />
                </label>
                <div className="form-grid">
                  <label className="field">
                    <span>Policy Start Date <span className="required">*</span></span>
                    <input type="date" value={form.startDate} onChange={e => set({ startDate: e.target.value })} required />
                  </label>
                  <label className="field">
                    <span>Policy Expiry Date <span className="required">*</span></span>
                    <input type="date" value={form.expiryDate} onChange={e => set({ expiryDate: e.target.value })} required />
                  </label>
                </div>
                <div className="form-grid">
                  <label className="field">
                    <span>Customer Care Number</span>
                    <input type="text" placeholder="1800-xxx-xxxx"
                      value={form.customerCareNumber} onChange={e => set({ customerCareNumber: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Renewal Reminder (days before)</span>
                    <select value={form.renewalReminderDays} onChange={e => set({ renewalReminderDays: Number(e.target.value) })}>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                    </select>
                  </label>
                </div>
                <label className="field">
                  <span>Upload Policy Document</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setPolicyFile(e.target.files[0])} />
                </label>
                <label className="consent-row">
                  <input type="checkbox" checked={form.active} onChange={e => set({ active: e.target.checked })} />
                  <span>Policy is currently active</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="button button-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Policy"
          message={`Delete policy "${deleteTarget.companyName} — ${deleteTarget.policyNumber}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
