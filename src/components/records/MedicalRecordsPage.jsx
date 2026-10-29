import { useState, useEffect } from 'react';
import { FilePlus2, Download, Pencil, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Loading, EmptyState, ConfirmModal, PageHeader } from '../common/UI';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'PRESCRIPTION',       label: 'Prescription' },
  { value: 'LAB_REPORT',         label: 'Lab Report' },
  { value: 'RADIOLOGY',          label: 'Radiology (X-ray / CT / MRI)' },
  { value: 'HOSPITAL_DISCHARGE', label: 'Hospital Discharge' },
  { value: 'MEDICAL_BILL',       label: 'Medical Bill' },
  { value: 'VACCINATION',        label: 'Vaccination Record' },
  { value: 'ALLERGY_MEDICINE',   label: 'Allergy & Medicine' },
];

const EMPTY_FORM = {
  familyMemberId: '', category: 'PRESCRIPTION', title: '',
  doctorOrHospitalName: '', recordDate: '', notes: '', tags: '', billAmount: '',
};

function formatDate(val) {
  if (!val) return '—';
  try { return new Date(val + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return val; }
}

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

  const load = async () => {
    try {
      const [recsRes, memRes] = await Promise.all([api.get('/records'), api.get('/family')]);
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
      category: r.category || 'PRESCRIPTION', title: r.title || '',
      doctorOrHospitalName: r.doctorOrHospitalName || '', recordDate: r.recordDate || '',
      notes: r.notes || '', tags: r.tags || '', billAmount: r.billAmount || '',
    });
    setFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const recordPayload = {
        familyMemberId: Number(form.familyMemberId),
        category: form.category,
        title: form.title,
        doctorOrHospitalName: form.doctorOrHospitalName || null,
        recordDate: form.recordDate,
        notes: form.notes || null,
        tags: form.tags || null,
        billAmount: form.billAmount ? Number(form.billAmount) : null
      };

      if (editRecord) {
        try { await api.delete(`/records/${editRecord.id}`); } catch (_) {}
      }

      if (file) {
        const fd = new FormData();
        fd.append('record', JSON.stringify(recordPayload));
        fd.append('file', file);
        await api.post('/records', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/records', recordPayload);
      }
      toast.success(editRecord ? 'Record updated!' : 'Record added!');
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
      a.href = url; a.download = r.originalFileName || 'document'; a.click();
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

  const sorted = [...filtered].sort((a, b) => new Date(b.recordDate || 0) - new Date(a.recordDate || 0));

  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  if (loading) return <Loading />;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Health Records"
        title="Medical Records"
        description="Prescriptions, lab reports, bills and more."
        action={
          <button className="button button-primary" onClick={openAdd}>
            <FilePlus2 size={16} /> Add Record
          </button>
        }
      />

      {/* Filter bar */}
      <div className="filter-bar">
        <input
          className="filter-search"
          type="search" placeholder="Search records…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="filter-select" value={filterMember} onChange={e => setFilterMember(e.target.value)}>
          <option value="">All members</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
        </select>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No records found"
          description={records.length === 0 ? 'Add your first medical record to get started.' : 'Try adjusting your filters.'}
          action={records.length === 0 ? <button className="button button-primary" onClick={openAdd}>Add First Record</button> : null}
        />
      ) : (
        <div className="document-ledger">
          {sorted.map(r => {
            const member = members.find(m => m.id?.toString() === r.familyMemberId?.toString());
            const catLabel = CATEGORIES.find(c => c.value === r.category)?.label || r.category;
            const d = r.recordDate ? new Date(r.recordDate + 'T00:00:00') : null;
            return (
              <div key={r.id} className="record-row">
                <div className="record-date-block">
                  <span className="record-day">{d ? d.getDate() : '—'}</span>
                  <span className="record-month">{d ? d.toLocaleString('en-IN', { month: 'short' }).toUpperCase() : ''}</span>
                  <span className="record-year">{d ? d.getFullYear() : ''}</span>
                </div>
                <div className="record-row-info">
                  <div className="record-row-title">{r.title}</div>
                  <div className="record-row-meta muted">
                    {catLabel}
                    {member ? ` · ${member.fullName}` : ''}
                    {r.doctorOrHospitalName ? ` · ${r.doctorOrHospitalName}` : ''}
                  </div>
                  {r.tags && <div className="record-tags">{r.tags.split(',').map(t => <span key={t} className="tag">{t.trim()}</span>)}</div>}
                </div>
                <div className="record-row-actions">
                  {r.originalFileName && (
                    <button className="icon-button" title="Download" onClick={() => handleDownload(r)}>
                      <Download size={16} />
                    </button>
                  )}
                  <button className="icon-button" title="Edit" onClick={() => openEdit(r)}>
                    <Pencil size={16} />
                  </button>
                  <button className="icon-button danger-text" title="Delete" onClick={() => setDeleteTarget(r)}>
                    <Trash2 size={16} />
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
              <h2 className="modal-title">{editRecord ? 'Edit Record' : 'Add Medical Record'}</h2>
              <button className="icon-button" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body form-stack">
                <div className="form-grid">
                  <label className="field">
                    <span>Family Member <span className="required">*</span></span>
                    <select value={form.familyMemberId} onChange={e => set({ familyMemberId: e.target.value })} required>
                      <option value="">Select member</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.fullName} ({m.relationship})</option>)}
                    </select>
                  </label>
                  <label className="field">
                    <span>Category <span className="required">*</span></span>
                    <select value={form.category} onChange={e => set({ category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </label>
                </div>
                <label className="field">
                  <span>Document Title <span className="required">*</span></span>
                  <input type="text" placeholder="e.g. Blood Sugar Test — June 2024"
                    value={form.title} onChange={e => set({ title: e.target.value })} required />
                </label>
                <div className="form-grid">
                  <label className="field">
                    <span>Doctor / Hospital</span>
                    <input type="text" placeholder="Dr. Name or Hospital"
                      value={form.doctorOrHospitalName} onChange={e => set({ doctorOrHospitalName: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Date of Record <span className="required">*</span></span>
                    <input type="date" value={form.recordDate} onChange={e => set({ recordDate: e.target.value })} required />
                  </label>
                </div>
                {form.category === 'MEDICAL_BILL' && (
                  <label className="field">
                    <span>Bill Amount (₹)</span>
                    <input type="number" placeholder="0.00" step="0.01"
                      value={form.billAmount} onChange={e => set({ billAmount: e.target.value })} />
                  </label>
                )}
                <label className="field">
                  <span>Upload Document (PDF / JPG / PNG — max 25 MB)</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} />
                  {editRecord?.originalFileName && !file && (
                    <span className="muted" style={{ fontSize: 13 }}>Current: {editRecord.originalFileName}</span>
                  )}
                </label>
                <label className="field">
                  <span>Notes</span>
                  <textarea placeholder="Any additional notes about this record…"
                    value={form.notes} onChange={e => set({ notes: e.target.value })} />
                </label>
                <label className="field">
                  <span>Tags</span>
                  <input type="text" placeholder="e.g. diabetes, annual checkup"
                    value={form.tags} onChange={e => set({ tags: e.target.value })} />
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="button button-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Record'}
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
