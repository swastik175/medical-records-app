import { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingOverlay, EmptyState, ConfirmModal } from '../common/UI';
import { useToast, ToastContainer } from '../common/Toast';

const CATEGORIES = [
  { value: 'PRESCRIPTION', label: 'Prescriptions', icon: '💊' },
  { value: 'LAB_REPORT', label: 'Lab Reports', icon: '🧪' },
  { value: 'RADIOLOGY', label: 'Radiology (X-ray/CT/MRI)', icon: '🔬' },
  { value: 'HOSPITAL_DISCHARGE', label: 'Hospital Discharge', icon: '🏥' },
  { value: 'MEDICAL_BILL', label: 'Medical Bills', icon: '🧾' },
  { value: 'VACCINATION', label: 'Vaccination Records', icon: '💉' },
  { value: 'ALLERGY_MEDICINE', label: 'Allergies & Medicines', icon: '⚕️' },
];

const EMPTY_FORM = {
  familyMemberId: '', category: 'PRESCRIPTION', title: '',
  doctorOrHospitalName: '', recordDate: '', notes: '', tags: '', billAmount: ''
};

const CATEGORY_ICONS = Object.fromEntries(CATEGORIES.map(c => [c.value, c.icon]));
const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterMember, setFilterMember] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const toast = useToast();

  const load = async () => {
    try {
      const [recsRes, memRes] = await Promise.all([
        api.get('/records'),
        api.get('/family')
      ]);
      setRecords(Array.isArray(recsRes.data) ? recsRes.data : []);
      setMembers(Array.isArray(memRes.data) ? memRes.data : []);
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditRecord(null);
    setForm({ ...EMPTY_FORM, familyMemberId: members[0]?.id?.toString() || '' });
    setFile(null);
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditRecord(r);
    setForm({
      familyMemberId: r.familyMemberId?.toString() || '',
      category: r.category || 'PRESCRIPTION',
      title: r.title || '',
      doctorOrHospitalName: r.doctorOrHospitalName || '',
      recordDate: r.recordDate || '',
      notes: r.notes || '',
      tags: r.tags || '',
      billAmount: r.billAmount || ''
    });
    setFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') formData.append(k, v); });
      if (file) formData.append('file', file);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editRecord) {
        await api.put(`/records/${editRecord.id}`, formData, config);
        toast.success('Record updated!');
      } else {
        await api.post('/records', formData, config);
        toast.success('Record added!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/records/${deleteTarget.id}`);
      toast.success('Record deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete record');
      setDeleteTarget(null);
    }
  };

  const handleDownload = async (r) => {
    try {
      const res = await api.get(`/records/${r.id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = r.originalFileName || 'document';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download file');
    }
  };

  const filtered = records.filter(r => {
    if (filterMember && r.familyMemberId?.toString() !== filterMember) return false;
    if (filterCategory && r.category !== filterCategory) return false;
    if (search && !r.title?.toLowerCase().includes(search.toLowerCase()) &&
        !r.doctorOrHospitalName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <LoadingOverlay />;

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />

      <div className="page-header">
        <div className="page-title">
          <h1>📋 Medical Records</h1>
          <p>Prescriptions, reports, bills and all health documents</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} disabled={members.length === 0}>
          ➕ Add Record
        </button>
      </div>

      {members.length === 0 && (
        <div className="alert alert-warning">
          ⚠️ Please add a <strong>family member</strong> first before adding medical records.
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <input className="search-input" placeholder="🔍 Search by title or hospital..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filterMember} onChange={e => setFilterMember(e.target.value)}>
          <option value="">All Members</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
        </select>
        <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
        </select>
        {(filterMember || filterCategory || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterMember(''); setFilterCategory(''); setSearch(''); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Records List */}
      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No records found"
            description={records.length === 0 ? 'Add your first medical record to get started.' : 'No records match your filters.'}
            action={records.length === 0 && members.length > 0 && (
              <button className="btn btn-primary" onClick={openAdd}>Add First Record</button>
            )}
          />
        ) : (
          filtered.map(r => (
            <div key={r.id} className="record-item">
              <div className="record-icon">{CATEGORY_ICONS[r.category] || '📋'}</div>
              <div className="record-body">
                <div className="record-title">{r.title}</div>
                <div className="record-meta">
                  <span className="badge badge-primary">{CATEGORY_LABELS[r.category]}</span>
                  <span>👤 {r.familyMemberName}</span>
                  {r.doctorOrHospitalName && <span>🏥 {r.doctorOrHospitalName}</span>}
                  <span>📅 {r.recordDate}</span>
                  {r.billAmount && <span>💰 ₹{r.billAmount}</span>}
                  {r.originalFileName && <span>📎 {r.originalFileName}</span>}
                </div>
                {r.notes && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{r.notes}</div>}
              </div>
              <div className="record-actions">
                {r.storedFileName && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDownload(r)} title="Download">⬇️</button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(r)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>{editRecord ? '✏️ Edit Record' : '📋 Add Medical Record'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Family Member <span className="required">*</span></label>
                    <select className="form-select" value={form.familyMemberId}
                      onChange={e => setForm({ ...form, familyMemberId: e.target.value })} required>
                      <option value="">Select member</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.fullName} ({m.relationship})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Document Category <span className="required">*</span></label>
                    <select className="form-select" value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Document Title <span className="required">*</span></label>
                  <input type="text" className="form-input" placeholder="e.g. Blood Sugar Test - June 2024"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Doctor / Hospital Name</label>
                    <input type="text" className="form-input" placeholder="Dr. Name or Hospital"
                      value={form.doctorOrHospitalName} onChange={e => setForm({ ...form, doctorOrHospitalName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Record <span className="required">*</span></label>
                    <input type="date" className="form-input" value={form.recordDate}
                      onChange={e => setForm({ ...form, recordDate: e.target.value })} required />
                  </div>
                </div>
                {(form.category === 'MEDICAL_BILL') && (
                  <div className="form-group">
                    <label className="form-label">Bill Amount (₹)</label>
                    <input type="number" className="form-input" placeholder="0.00" step="0.01"
                      value={form.billAmount} onChange={e => setForm({ ...form, billAmount: e.target.value })} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Upload Document (PDF / JPG / PNG — max 25 MB)</label>
                  <input type="file" className="form-input" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files[0])}
                    style={{ padding: '0.5rem' }} />
                  {editRecord?.originalFileName && !file && (
                    <span className="form-hint">Current file: {editRecord.originalFileName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Any additional notes about this record..."
                    value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tags</label>
                  <input type="text" className="form-input" placeholder="e.g. diabetes, annual checkup"
                    value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Record"
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
