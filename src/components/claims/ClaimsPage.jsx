import { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import { Loading, EmptyState, ConfirmModal, PageHeader } from '../common/UI';
import { toast } from 'sonner';

const CLAIM_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUERY_RAISED', 'APPROVED', 'SETTLED', 'REJECTED'];

const STATUS_BADGE = {
  DRAFT:        'badge-neutral',
  SUBMITTED:    'badge-info',
  UNDER_REVIEW: 'badge-warning',
  QUERY_RAISED: 'badge-warning',
  APPROVED:     'badge-success',
  SETTLED:      'badge-success',
  REJECTED:     'badge-danger',
};

const REQUIRED_DOCS = [
  'Duly filled and signed claim form',
  'Original hospital discharge summary',
  'All original bills and payment receipts',
  "Doctor's consultation and prescription notes",
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
  policyId: '', familyMemberId: '', claimReferenceNumber: '', hospitalName: '', admissionDate: '',
  dischargeDate: '', diagnosis: '', totalClaimAmount: '', status: 'DRAFT', notes: '',
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

export default function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editClaim, setEditClaim] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [expandedClaim, setExpandedClaim] = useState(null);

  const load = async () => {
    try {
      const [claimsRes, polsRes, memsRes] = await Promise.all([
        api.get('/claims'),
        api.get('/policies'),
        api.get('/family')
      ]);
      setClaims(Array.isArray(claimsRes.data) ? claimsRes.data : []);
      setPolicies(Array.isArray(polsRes.data) ? polsRes.data : []);
      setMembers(Array.isArray(memsRes.data) ? memsRes.data : []);
    } catch {
      toast.error('Failed to load claims data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditClaim(null);
    setForm({
      ...EMPTY_FORM,
      policyId: policies[0]?.id?.toString() || '',
      familyMemberId: members[0]?.id?.toString() || ''
    });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditClaim(c);
    setForm({
      policyId: c.policyId?.toString() || policies[0]?.id?.toString() || '',
      familyMemberId: c.familyMemberId?.toString() || members[0]?.id?.toString() || '',
      claimReferenceNumber: c.claimReferenceNumber || '',
      hospitalName: c.hospitalName || '',
      admissionDate: c.admissionDate || '',
      dischargeDate: c.dischargeDate || '',
      diagnosis: c.diagnosis || '',
      totalClaimAmount: c.estimatedAmount || c.totalClaimAmount || '',
      status: c.claimStatus || c.status || 'DRAFT',
      notes: c.remarks || c.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        policyId: Number(form.policyId),
        familyMemberId: Number(form.familyMemberId),
        claimReferenceNumber: form.claimReferenceNumber || null,
        hospitalName: form.hospitalName,
        admissionDate: form.admissionDate || null,
        dischargeDate: form.dischargeDate || null,
        estimatedAmount: form.totalClaimAmount ? Number(form.totalClaimAmount) : null,
        claimStatus: form.status || 'DRAFT',
        remarks: form.notes || null,
      };

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

  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  if (loading) return <Loading />;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Claims"
        title="Claim Documents"
        description="Manage insurance claims and document checklists."
        action={
          <button className="button button-primary" onClick={openAdd} disabled={policies.length === 0}>
            <PlusCircle size={16} /> New Claim
          </button>
        }
      />

      {policies.length === 0 && (
        <div className="attention-strip">
          Please add an <strong>insurance policy</strong> first before creating claims.
        </div>
      )}

      {claims.length === 0 ? (
        <EmptyState
          title="No claims yet"
          description="Track insurance claims and manage the required document checklist."
          action={policies.length > 0
            ? <button className="button button-primary" onClick={openAdd}>Create First Claim</button>
            : null}
        />
      ) : (
        <div className="claims-list">
          {claims.map(c => {
            const policy = policies.find(p => p.id?.toString() === c.policyId?.toString());
            const isExpanded = expandedClaim === c.id;
            const checkedCount = REQUIRED_DOCS.filter(d => checkedDocs[`${c.id}-${d}`]).length;

            return (
              <div key={c.id} className="claim-item">
                <div className="claim-item-header">
                  <div className="claim-header-info">
                    <div className="claim-diagnosis">{c.diagnosis || 'Insurance Claim'}</div>
                    <div className="claim-meta muted">
                      {policy ? `${policy.companyName} — #${policy.policyNumber}` : 'Policy'}
                      {c.hospitalName ? ` · ${c.hospitalName}` : ''}
                    </div>
                  </div>
                  <div className="claim-header-right">
                    <span className={`badge ${STATUS_BADGE[c.status] || 'badge-neutral'}`}>{c.status}</span>
                    <div className="claim-header-actions">
                      <button className="icon-button" onClick={() => openEdit(c)} title="Edit"><Pencil size={15} /></button>
                      <button className="icon-button danger-text" onClick={() => setDeleteTarget(c)} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>

                <dl className="claim-dl">
                  {c.claimReferenceNumber && <><dt>Ref #</dt><dd>{c.claimReferenceNumber}</dd></>}
                  {c.admissionDate && <><dt>Admitted</dt><dd>{formatDate(c.admissionDate)}</dd></>}
                  {c.dischargeDate && <><dt>Discharged</dt><dd>{formatDate(c.dischargeDate)}</dd></>}
                  {c.totalClaimAmount && <><dt>Claim Amount</dt><dd>{formatMoney(c.totalClaimAmount)}</dd></>}
                </dl>

                {c.notes && <p className="claim-notes muted">{c.notes}</p>}

                {/* Checklist toggle */}
                <button
                  className="text-link checklist-toggle"
                  onClick={() => setExpandedClaim(isExpanded ? null : c.id)}
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  Document Checklist ({checkedCount}/{REQUIRED_DOCS.length})
                </button>

                {isExpanded && (
                  <ul className="doc-checklist">
                    {REQUIRED_DOCS.map(doc => {
                      const key = `${c.id}-${doc}`;
                      return (
                        <li key={doc} className="doc-checklist-item">
                          <label>
                            <input type="checkbox" checked={!!checkedDocs[key]} onChange={() => toggleDoc(c.id, doc)} />
                            <span style={{ textDecoration: checkedDocs[key] ? 'line-through' : 'none' }}>{doc}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-inner" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editClaim ? 'Edit Claim' : 'New Insurance Claim'}</h2>
              <button className="icon-button" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body form-stack">
                <div className="form-grid">
                  <label className="field">
                    <span>Insurance Policy <span className="required">*</span></span>
                    <select value={form.policyId} onChange={e => set({ policyId: e.target.value })} required>
                      <option value="">Select policy</option>
                      {policies.map(p => <option key={p.id} value={p.id}>{p.companyName} — #{p.policyNumber}</option>)}
                    </select>
                  </label>
                  <label className="field">
                    <span>Family Member (Patient) <span className="required">*</span></span>
                    <select value={form.familyMemberId} onChange={e => set({ familyMemberId: e.target.value })} required>
                      <option value="">Select member</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.fullName} ({m.relationship})</option>)}
                    </select>
                  </label>
                </div>
                <div className="form-grid">
                  <label className="field">
                    <span>Claim Reference Number</span>
                    <input type="text" placeholder="As given by insurer"
                      value={form.claimReferenceNumber} onChange={e => set({ claimReferenceNumber: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Claim Status</span>
                    <select value={form.status} onChange={e => set({ status: e.target.value })}>
                      {CLAIM_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
                <label className="field">
                  <span>Hospital Name</span>
                  <input type="text" placeholder="Hospital where treatment was received"
                    value={form.hospitalName} onChange={e => set({ hospitalName: e.target.value })} />
                </label>
                <label className="field">
                  <span>Diagnosis / Reason</span>
                  <input type="text" placeholder="e.g. Appendectomy"
                    value={form.diagnosis} onChange={e => set({ diagnosis: e.target.value })} />
                </label>
                <div className="form-grid">
                  <label className="field">
                    <span>Admission Date</span>
                    <input type="date" value={form.admissionDate} onChange={e => set({ admissionDate: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Discharge Date</span>
                    <input type="date" value={form.dischargeDate} onChange={e => set({ dischargeDate: e.target.value })} />
                  </label>
                </div>
                <label className="field">
                  <span>Total Claim Amount (₹)</span>
                  <input type="number" placeholder="0.00" step="0.01"
                    value={form.totalClaimAmount} onChange={e => set({ totalClaimAmount: e.target.value })} />
                </label>
                <label className="field">
                  <span>Notes / Status Update</span>
                  <textarea placeholder="Any notes about the claim progress…"
                    value={form.notes} onChange={e => set({ notes: e.target.value })} />
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="button button-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Claim'}
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
