import { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingOverlay, EmptyState, ConfirmModal } from '../common/UI';
import { useToast, ToastContainer } from '../common/Toast';

const RELATIONSHIPS = ['SELF', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'SIBLING', 'GRANDPARENT', 'OTHER'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const EMPTY_FORM = {
  fullName: '', relationship: 'SELF', dateOfBirth: '',
  gender: 'Male', bloodGroup: '', abhaAddress: '',
  allergies: '', chronicConditions: '', notes: ''
};

export default function FamilyMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const res = await api.get('/family');
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditMember(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditMember(m);
    setForm({
      fullName: m.fullName || '', relationship: m.relationship || 'SELF',
      dateOfBirth: m.dateOfBirth || '', gender: m.gender || 'Male',
      bloodGroup: m.bloodGroup || '', abhaAddress: m.abhaAddress || '',
      allergies: m.allergies || '', chronicConditions: m.chronicConditions || '',
      notes: m.notes || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editMember) {
        await api.put(`/family/${editMember.id}`, form);
        toast.success('Family member updated!');
      } else {
        await api.post('/family', form);
        toast.success('Family member added!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/family/${deleteTarget.id}`);
      toast.success('Family member removed');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete');
      setDeleteTarget(null);
    }
  };

  const getAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  if (loading) return <LoadingOverlay />;

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />

      <div className="page-header">
        <div className="page-title">
          <h1>👨‍👩‍👧‍👦 My Family</h1>
          <p>Manage profiles for each family member</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          ➕ Add Family Member
        </button>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon="👨‍👩‍👧‍👦"
          title="No family members added yet"
          description="Add your family members to organize their medical records separately."
          action={<button className="btn btn-primary" onClick={openAdd}>Add First Member</button>}
        />
      ) : (
        <div className="members-grid">
          {members.map(m => (
            <div key={m.id} className="member-card">
              <div className="member-avatar">{getInitials(m.fullName)}</div>
              <div className="member-name">{m.fullName}</div>
              <div>
                <span className="badge badge-primary">{m.relationship}</span>
              </div>
              <div className="member-age">
                {m.gender}{m.dateOfBirth && getAge(m.dateOfBirth) ? ` · ${getAge(m.dateOfBirth)} yrs` : ''}
                {m.bloodGroup && ` · ${m.bloodGroup}`}
              </div>
              {m.allergies && (
                <div style={{ fontSize: '0.75rem', color: 'var(--danger)', background: 'var(--danger-light)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', width: '100%', textAlign: 'center' }}>
                  ⚠️ Allergies: {m.allergies}
                </div>
              )}
              <div className="member-actions">
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(m)}>
                  ✏️ Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(m)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {/* Add new card */}
          <div
            className="member-card"
            style={{ cursor: 'pointer', border: '2px dashed var(--border)', background: 'var(--surface-alt)', justifyContent: 'center' }}
            onClick={openAdd}
          >
            <div style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>➕</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add Member</div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3>{editMember ? '✏️ Edit Family Member' : '➕ Add Family Member'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Relationship <span className="required">*</span></label>
                    <select className="form-select" value={form.relationship}
                      onChange={e => setForm({ ...form, relationship: e.target.value })}>
                      {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-input" value={form.dateOfBirth}
                      onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={form.gender}
                      onChange={e => setForm({ ...form, gender: e.target.value })}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select className="form-select" value={form.bloodGroup}
                      onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">ABHA Address</label>
                    <input type="text" className="form-input" placeholder="e.g. name@abdm"
                      value={form.abhaAddress} onChange={e => setForm({ ...form, abhaAddress: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Known Allergies</label>
                  <input type="text" className="form-input" placeholder="e.g. Penicillin, Peanuts"
                    value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Chronic Conditions</label>
                  <input type="text" className="form-input" placeholder="e.g. Type 2 Diabetes, Hypertension"
                    value={form.chronicConditions} onChange={e => setForm({ ...form, chronicConditions: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Any additional notes..."
                    value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmModal
          title="Remove Family Member"
          message={`Remove ${deleteTarget.fullName} and all their medical records? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          confirmText="Remove"
        />
      )}
    </div>
  );
}
