import { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingOverlay, EmptyState } from '../common/UI';
import { useToast, ToastContainer } from '../common/Toast';

export default function EmergencySummaryPage() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/family').then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setMembers(data);
      if (data.length > 0) setSelectedMember(data[0].id.toString());
    }).catch(() => {
      toast.error('Failed to load family members');
    }).finally(() => setLoadingMembers(false));
  }, []);

  const fetchSummary = async () => {
    if (!selectedMember) return;
    setLoading(true);
    setSummary(null);
    try {
      const res = await api.get(`/emergency/${selectedMember}`);
      setSummary(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate emergency summary');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  if (loadingMembers) return <LoadingOverlay />;

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />

      <div className="page-header">
        <div className="page-title">
          <h1>🚨 Emergency Summary</h1>
          <p>Printable health card for hospital visits and emergencies</p>
        </div>
        {summary && (
          <button className="btn btn-primary no-print" onClick={handlePrint}>🖨️ Print Summary</button>
        )}
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon="🚨"
          title="No family members added"
          description="Add family members and their health details to generate an emergency summary."
        />
      ) : (
        <>
          {/* Member selector */}
          <div className="card no-print" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                <label className="form-label">Select Family Member</label>
                <select className="form-select" value={selectedMember}
                  onChange={e => { setSelectedMember(e.target.value); setSummary(null); }}>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.relationship})</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={fetchSummary} disabled={loading || !selectedMember}>
                {loading ? '⏳ Generating...' : '📋 Generate Summary'}
              </button>
            </div>
          </div>

          <div className="alert alert-info no-print" style={{ marginBottom: '1.5rem' }}>
            <span>ℹ️</span>
            <span>
              The emergency summary shows health details, allergies, medications, and insurance policies for the selected family member.
              Print it to carry during hospital visits.
            </span>
          </div>

          {loading && <LoadingOverlay message="Generating emergency summary..." />}

          {summary && (
            <div className="emergency-card">
              {/* Header */}
              <div className="emergency-header">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚨</div>
                <h2 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>Emergency Health Summary</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  My Friend Insurancewala · My Family Medical Records
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Generated: {new Date(summary.generatedAt).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Patient Info */}
              <div className="emergency-section">
                <div className="emergency-section-title">👤 Patient Information</div>
                <div className="emergency-field"><span className="emergency-key">Full Name</span><span className="emergency-value">{summary.fullName}</span></div>
                <div className="emergency-field"><span className="emergency-key">Relationship</span><span className="emergency-value">{summary.relationship}</span></div>
                {summary.age && <div className="emergency-field"><span className="emergency-key">Age</span><span className="emergency-value">{summary.age} years</span></div>}
                {summary.gender && <div className="emergency-field"><span className="emergency-key">Gender</span><span className="emergency-value">{summary.gender}</span></div>}
                {summary.bloodGroup && <div className="emergency-field"><span className="emergency-key">Blood Group</span><span className="emergency-value" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--danger)' }}>{summary.bloodGroup}</span></div>}
                {summary.abhaAddress && <div className="emergency-field"><span className="emergency-key">ABHA Address</span><span className="emergency-value">{summary.abhaAddress}</span></div>}
                {summary.dateOfBirth && <div className="emergency-field"><span className="emergency-key">Date of Birth</span><span className="emergency-value">{summary.dateOfBirth}</span></div>}
              </div>

              {/* Emergency Contact */}
              <div className="emergency-section">
                <div className="emergency-section-title">📞 Emergency Contact</div>
                <div className="emergency-field"><span className="emergency-key">Account Holder</span><span className="emergency-value">{summary.clientName}</span></div>
                <div className="emergency-field"><span className="emergency-key">Mobile</span><span className="emergency-value">{summary.clientMobile}</span></div>
                {summary.emergencyContactName && (
                  <>
                    <div className="emergency-field"><span className="emergency-key">Emergency Contact</span><span className="emergency-value">{summary.emergencyContactName} ({summary.emergencyContactRelation})</span></div>
                    <div className="emergency-field"><span className="emergency-key">Contact Phone</span><span className="emergency-value">{summary.emergencyContactPhone}</span></div>
                  </>
                )}
              </div>

              {/* Medical Info */}
              {(summary.allergies || summary.chronicConditions) && (
                <div className="emergency-section">
                  <div className="emergency-section-title">⚕️ Medical Information</div>
                  {summary.allergies && (
                    <div className="emergency-field">
                      <span className="emergency-key">⚠️ Allergies</span>
                      <span className="emergency-value" style={{ color: 'var(--danger)', fontWeight: 600 }}>{summary.allergies}</span>
                    </div>
                  )}
                  {summary.chronicConditions && (
                    <div className="emergency-field">
                      <span className="emergency-key">Chronic Conditions</span>
                      <span className="emergency-value">{summary.chronicConditions}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Current Medications */}
              {summary.ongoingMedications?.length > 0 && (
                <div className="emergency-section">
                  <div className="emergency-section-title">💊 Ongoing Medications</div>
                  {summary.ongoingMedications.map((med, i) => (
                    <div key={i} className="emergency-field">
                      <span className="emergency-key">Medication {i + 1}</span>
                      <span className="emergency-value">{med}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Prescriptions */}
              {summary.recentPrescriptions?.length > 0 && (
                <div className="emergency-section">
                  <div className="emergency-section-title">📋 Recent Prescriptions</div>
                  {summary.recentPrescriptions.map((p, i) => (
                    <div key={i} className="emergency-field">
                      <span className="emergency-key">Prescription {i + 1}</span>
                      <span className="emergency-value">{p}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Insurance Policies */}
              {summary.activePolicies?.length > 0 && (
                <div className="emergency-section">
                  <div className="emergency-section-title">🛡️ Active Insurance Policies</div>
                  {summary.activePolicies.map((p, i) => (
                    <div key={i} style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '0.5rem' }}>
                      <div className="emergency-field"><span className="emergency-key">Company</span><span className="emergency-value">{p.companyName}</span></div>
                      <div className="emergency-field"><span className="emergency-key">Policy No.</span><span className="emergency-value">{p.policyNumber}</span></div>
                      {p.tpaName && <div className="emergency-field"><span className="emergency-key">TPA</span><span className="emergency-value">{p.tpaName}</span></div>}
                      {p.sumInsured && <div className="emergency-field"><span className="emergency-key">Sum Insured</span><span className="emergency-value">₹{Number(p.sumInsured).toLocaleString('en-IN')}</span></div>}
                      {p.customerCareNumber && <div className="emergency-field"><span className="emergency-key">Insurer Helpline</span><span className="emergency-value">{p.customerCareNumber}</span></div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <div style={{
                marginTop: '1.5rem', padding: '0.875rem', background: 'var(--surface-alt)',
                borderRadius: 'var(--radius)', fontSize: '0.75rem', color: 'var(--text-muted)',
                borderTop: '2px solid var(--primary-light)'
              }}>
                <strong>Disclaimer:</strong> {summary.disclaimer}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
