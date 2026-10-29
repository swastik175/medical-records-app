import { useState, useEffect } from 'react';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Loading, EmptyState, ConfirmModal, PageHeader } from '../common/UI';
import { toast } from 'sonner';

const RELATIONSHIPS = ['SELF', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'SIBLING', 'GRANDPARENT', 'OTHER'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const EMPTY_FORM = {
  fullName: '', relationship: 'SELF', dateOfBirth: '',
  gender: 'Male', bloodGroup: '', abhaAddress: '',
  allergies: '', chronicConditions: '', notes: '',
};

function getAge(dob) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function formatDate(val) {
  if (!val) return '—';
  try { return new Date(val + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return val; }
}

export default function FamilyMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const openAdd = () => { setEditMember(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (m) => {
    setEditMember(m);
    setForm({
      fullName: m.fullName || '', relationship: m.relationship || 'SELF',
      dateOfBirth: m.dateOfBirth || '', gender: m.gender || 'Male',
      bloodGroup: m.bloodGroup || '', abhaAddress: m.abhaAddress || '',
      allergies: m.allergies || '', chronicConditions: m.chronicConditions || '',
      notes: m.notes || '',
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

  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  if (loading) return <Loading />;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="My Family"
        title="Family Members"
        description="Manage profiles for each family member."
        action={
          <button className="button button-primary" onClick={openAdd}>
            <UserPlus size={16} /> Add Member
          </button>
        }
      />

      {members.length === 0 ? (
        <EmptyState
          title="No family members added yet"
          description="Add your family members to organise their medical records separately."
          action={<button className="button button-primary" onClick={openAdd}>Add First Member</button>}
        />
      ) : (
        <div className="family-grid">
          {members.map(m => {
            const age = getAge(m.dateOfBirth);
            return (
              <div key={m.id} className="family-profile">
                <div className="profile-avatar">{getInitials(m.fullName)}</div>
                <div className="profile-name">{m.fullName}</div>
                <div className="profile-rel">{m.relationship}</div>

                <dl className="profile-dl">
                  {m.dateOfBirth && <><dt>Date of Birth</dt><dd>{formatDate(m.dateOfBirth)}{age ? ` (${age} yrs)` : ''}</dd></>}
                  {m.gender && <><dt>Gender</dt><dd>{m.gender}</dd></>}
                  {m.bloodGroup && <><dt>Blood Group</dt><dd>{m.bloodGroup}</dd></>}
                  {m.abhaAddress && <><dt>ABHA Address</dt><dd>{m.abhaAddress}</dd></>}
                  {m.allergies && <><dt>Allergies</dt><dd className="danger-text">{m.allergies}</dd></>}
                  {m.chronicConditions && <><dt>Chronic Conditions</dt><dd>{m.chronicConditions}</dd></>}
                </dl>

                <div className="profile-actions">
                  <button className="button button-secondary button-small" onClick={() => openEdit(m)}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="button button-danger button-small" onClick={() => setDeleteTarget(m)}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-inner" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editMember ? 'Edit Family Member' : 'Add Family Member'}</h2>
              <button className="icon-button" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body form-stack">
                <div className="form-grid">
                  <label className="field">
                    <span>Full Name <span className="required">*</span></span>
                    <input type="text" value={form.fullName} onChange={e => set({ fullName: e.target.value })} required />
                  </label>
                  <label className="field">
                    <span>Relationship <span className="required">*</span></span>
                    <select value={form.relationship} onChange={e => set({ relationship: e.target.value })}>
                      {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </label>
                </div>
                <div className="form-grid">
                  <label className="field">
                    <span>Date of Birth</span>
                    <input type="date" value={form.dateOfBirth} onChange={e => set({ dateOfBirth: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Gender</span>
                    <select value={form.gender} onChange={e => set({ gender: e.target.value })}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </label>
                </div>
                <div className="form-grid">
                  <label className="field">
                    <span>Blood Group</span>
                    <select value={form.bloodGroup} onChange={e => set({ bloodGroup: e.target.value })}>
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                    </select>
                  </label>
                  <label className="field">
                    <span>ABHA Address</span>
                    <input type="text" placeholder="e.g. name@abdm"
                      value={form.abhaAddress} onChange={e => set({ abhaAddress: e.target.value })} />
                  </label>
                </div>
                <label className="field">
                  <span>Known Allergies</span>
                  <input type="text" placeholder="e.g. Penicillin, Peanuts"
                    value={form.allergies} onChange={e => set({ allergies: e.target.value })} />
                </label>
                <label className="field">
                  <span>Chronic Conditions</span>
                  <input type="text" placeholder="e.g. Type 2 Diabetes, Hypertension"
                    value={form.chronicConditions} onChange={e => set({ chronicConditions: e.target.value })} />
                </label>
                <label className="field">
                  <span>Notes</span>
                  <textarea placeholder="Any additional notes…"
                    value={form.notes} onChange={e => set({ notes: e.target.value })} />
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="button button-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Remove Family Member"
          message={`Remove ${deleteTarget.fullName} and all their records? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          confirmText="Remove"
        />
      )}
    </div>
  );
}
