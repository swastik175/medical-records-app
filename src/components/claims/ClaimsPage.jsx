import { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingOverlay, EmptyState, ConfirmModal } from '../common/UI';
import { useToast, ToastContainer } from '../common/Toast';

const CLAIM_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUERY_RAISED', 'APPROVED', 'SETTLED', 'REJECTED'];

const STATUS_COLORS = {
  DRAFT: 'badge-neutral', SUBMITTED: 'badge-info', UNDER_REVIEW: 'badge-warning',
  QUERY_RAISED: 'badge-warning', APPROVED: 'badge-success', SETTLED: 'badge-success', REJECTED: 'badge-danger'
};

const STATUS_ICONS = {
  DRAFT: '📝', SUBMITTED: '📤', UNDER_REVIEW: '🔍',
  QUERY_RAISED: '❓', APPROVED: '✅', SETTLED: '🏆', REJECTED: '❌'
};

const REQUIRED_DOCS = [
  'Duly filled and signed claim form',
  'Original hospital discharge summary',
  'All original bills and payment receipts',
  'Doctor\'s consultation and prescription notes',
  'Diagnostic test reports (blood, urine, X-ray, etc.)',
  'Indoor case papers / nursing notes from hospital',
  'Pre-authorisation approval letter (if cashless was initiated)',
  'Copy of health insurance policy',
  'Photo ID proof of patient',
  'NEFT bank details / cancelled cheque',
  'Pharmacy bills with prescriptions',
  'Any previous hospitalization records (if related)',
];

const EMPTY_FORM = {
  policyId: '', claimReferenceNumber: '', hospitalName: '', admissionDate: '',
  dischargeDate: '', diagnosis: '', totalClaimAmount: '', status: 'DRAFT', notes: ''
};

export default function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editClaim, setEditClaim] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [expandedClaim, setExpandedClaim] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const [claimsRes, polsRes] = await Promise.all([
        api.get('/claims'),
        api.get('/policies')
      ]);
      setClaims(Array.isArray(claimsRes.data) ? claimsRes.data : []);
      setPolicies(Array.isArray(polsRes.data) ? polsRes.data : []);
    } catch {
      toast.error('Failed to load claims data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditClaim(null);
    setForm({ ...EMPTY_FORM, policyId: policies[0]?.id?.toString() || '' });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditClaim(c);
    setForm({
      policyId: c.policyId?.toString() || '',
      claimReferenceNumber: c.claimReferenceNumber || '',
      hospitalName: c.hospitalName || '',
      admissionDate: c.admissionDate || '',
      dischargeDate: c.dischargeDate || '',
      diagnosis: c.diagnosis || '',
      totalClaimAmount: c.totalClaimAmount || '',
      status: c.status || 'DRAFT',
      notes: c.notes || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editClaim) {
        await api.put(`/claims/${editClaim.id}`, payload);
        toast.success('Claim updated!');
      } else {
        await api.post('/claims', payload);
        toast.success('Claim created!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save claim');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/claims/${deleteTarget.id}`);
      toast.success('Claim deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete claim');
      setDeleteTarget(null);
    }
  };

  const toggleDoc = (claimId, doc) => {
    const key = `${claimId}-${doc}`;
    setCheckedDocs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />

      <div className="page-header">
        <div className="page-title">
          <h1>📄 Claim Documents</h1>
          <p>Manage insurance claims and document checklists</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} disabled={policies.length === 0}>
          ➕ New Claim
        </button>
      </div>

      {policies.length === 0 && (
        <div className="alert alert-warning">
          ⚠️ Please add an <strong>insurance policy</strong> first before creating claims.
        </div>
      )}

      {/* Required documents reference */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--info)' }}>
        <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setExpandedClaim(expandedClaim === 'docs' ? null : 'docs')}>
          <h3 style={{ margin: 0 }}>📋 Standard Claim Document Checklist</h3>
          <span>{expandedClaim === 'docs' ? '▲' : '▼'}</span>
        </div>
        {expandedClaim === 'docs' && (
          <div className="card-body">
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              These are the standard documents required by most insurance companies for reimbursement claims.
            </p>
            {REQUIRED_DOCS.map((doc, i) => (
              <div key={i} className="checklist-item">
                <input type="checkbox" className="checkbox" id={`std-${i}`}
                  checked={!!checkedDocs[`std-${i}`]}
                  onChange={() => setCheckedDocs(prev => ({ ...prev, [`std-${i}`]: !prev[`std-${i}`] }))} />
                <label htmlFor={`std-${i}`} className={`checklist-label ${checkedDocs[`std-${i}`] ? 'checked' : ''}`}>
                  {doc}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {claims.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No claims added yet"
          description="Create a claim dossier to track your insurance claim documents and status."
          action={policies.length > 0 && (
            <button className="btn btn-primary" onClick={openAdd}>Create First Claim</button>
          )}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {claims.map(c => {
            const policy = policies.find(p => p.id === c.policyId);
            const checkedCount = REQUIRED_DOCS.filter((_, i) => checkedDocs[`${c.id}-${i}`]).length;
            return (
              <div key={c.id} className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>{STATUS_ICONS[c.status] || '📄'}</span>
                    <div>
                      <h3 style={{ margin: 0 }}>{c.diagnosis || 'Claim'}</h3>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {policy ? `${policy.companyName} · ${policy.policyNumber}` : 'Unknown Policy'}
                        {c.claimReferenceNumber && ` · Ref: ${c.claimReferenceNumber}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge ${STATUS_COLORS[c.status]}`}>{STATUS_ICONS[c.status]} {c.status}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(c)}>🗑️</button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="policy-grid" style={{ marginBottom: '1rem' }}>
                    {c.hospitalName && (
                      <div className="policy-field">
                        <div className="policy-field-label">Hospital</div>
                        <div className="policy-field-value">{c.hospitalName}</div>
                      </div>
                    )}
                    {c.admissionDate && (
                      <div className="policy-field">
                        <div className="policy-field-label">Admission Date</div>
                        <div className="policy-field-value">{c.admissionDate}</div>
                      </div>
                    )}
                    {c.dischargeDate && (
                      <div className="policy-field">
                        <div className="policy-field-label">Discharge Date</div>
                        <div className="policy-field-value">{c.dischargeDate}</div>
                      </div>
                    )}
                    {c.totalClaimAmount && (
                      <div className="policy-field">
                        <div className="policy-field-label">Claim Amount</div>
                        <div className="policy-field-value">₹{Number(c.totalClaimAmount).toLocaleString('en-IN')}</div>
                      </div>
                    )}
                  </div>

                  {c.notes && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      📝 {c.notes}
                    </div>
                  )}

                  {/* Per-claim document checklist */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>📋 Document Checklist</div>
                      <span className="badge badge-info">{checkedCount}/{REQUIRED_DOCS.length} ready</span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: '0.75rem', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        background: checkedCount === REQUIRED_DOCS.length ? 'var(--secondary)' : 'var(--primary)',
                        width: `${(checkedCount / REQUIRED_DOCS.length) * 100}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                      {REQUIRED_DOCS.map((doc, i) => {
                        const key = `${c.id}-${i}`;
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.25rem 0', fontSize: '0.8125rem' }}>
                            <input type="checkbox" className="checkbox" id={key}
                              checked={!!checkedDocs[key]}
                              onChange={() => toggleDoc(c.id, i)} />
                            <label htmlFor={key} style={{ cursor: 'pointer', color: checkedDocs[key] ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: checkedDocs[key] ? 'line-through' : 'none' }}>
                              {doc}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3>{editClaim ? '✏️ Edit Claim' : '📄 New Insurance Claim'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Insurance Policy <span className="required">*</span></label>
                  <select className="form-select" value={form.policyId}
                    onChange={e => setForm({ ...form, policyId: e.target.value })} required>
                    <option value="">Select policy</option>
                    {policies.map(p => (
                      <option key={p.id} value={p.id}>{p.companyName} — #{p.policyNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Claim Reference Number</label>
                    <input type="text" className="form-input" placeholder="As given by insurer"
                      value={form.claimReferenceNumber} onChange={e => setForm({ ...form, claimReferenceNumber: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Claim Status</label>
                    <select className="form-select" value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}>
                      {CLAIM_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Hospital Name</label>
                  <input type="text" className="form-input" placeholder="Hospital where treatment was received"
                    value={form.hospitalName} onChange={e => setForm({ ...form, hospitalName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Diagnosis / Reason for Claim</label>
                  <input type="text" className="form-input" placeholder="e.g. Appendectomy"
                    value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Admission Date</label>
                    <input type="date" className="form-input" value={form.admissionDate}
                      onChange={e => setForm({ ...form, admissionDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discharge Date</label>
                    <input type="date" className="form-input" value={form.dischargeDate}
                      onChange={e => setForm({ ...form, dischargeDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Claim Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="0.00" step="0.01"
                    value={form.totalClaimAmount} onChange={e => setForm({ ...form, totalClaimAmount: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notes / Status Update</label>
                  <textarea className="form-textarea" placeholder="Any notes about the claim progress..."
                    value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Claim"
          message={`Delete claim for "${deleteTarget.diagnosis || 'this claim'}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
