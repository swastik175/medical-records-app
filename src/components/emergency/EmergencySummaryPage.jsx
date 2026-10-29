import { useState, useEffect } from 'react';
import { Printer, Siren, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { Loading, EmptyState, PageHeader } from '../common/UI';
import { toast } from 'sonner';

function formatDate(val) {
  if (!val) return '—';
  try { return new Date(val + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return val; }
}

function formatMoney(val) {
  if (!val) return '—';
  return '₹' + Number(val).toLocaleString('en-IN');
}

export default function EmergencySummaryPage() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);

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

  if (loadingMembers) return <Loading />;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Emergency"
        title="Emergency Summary"
        description="Printable health card for hospital visits and emergencies."
        action={
          summary && (
            <button className="button button-primary no-print" onClick={handlePrint}>
              <Printer size={16} /> Print
            </button>
          )
        }
      />

      {members.length === 0 ? (
        <EmptyState
          title="No family members added"
          description="Add family members and their health details to generate an emergency summary."
        />
      ) : (
        <>
          {/* Member selector */}
          <div className="summary-selector no-print">
            <label className="field" style={{ flex: 1, minWidth: 200 }}>
              <span>Select Family Member</span>
              <select value={selectedMember}
                onChange={e => { setSelectedMember(e.target.value); setSummary(null); }}>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} ({m.relationship})</option>
                ))}
              </select>
            </label>
            <button className="button button-primary" onClick={fetchSummary} disabled={loading || !selectedMember}>
              {loading ? 'Generating…' : 'Generate Summary'}
            </button>
          </div>

          <div className="attention-strip no-print" style={{ gap: 10 }}>
            <AlertTriangle size={16} />
            <span>
              The emergency summary includes allergies, medications, and active insurance for the selected member.
              Print it to carry during hospital visits.
            </span>
          </div>

          {loading && <Loading message="Generating emergency summary…" />}

          {summary && (
            <div className="emergency-sheet">
              {/* Sheet header */}
              <div className="emergency-sheet-header">
                <Siren size={28} />
                <div>
                  <h2 style={{ margin: 0, fontFamily: 'var(--display)' }}>Emergency Health Summary</h2>
                  <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                    My Friend Insurancewala · My Family Medical Records
                  </p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                    Generated: {new Date(summary.generatedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Patient Info */}
              <div className="emergency-section">
                <div className="emergency-section-title">Patient Information</div>
                <dl className="emergency-dl">
                  {summary.fullName && <><dt>Full Name</dt><dd>{summary.fullName}</dd></>}
                  {summary.relationship && <><dt>Relationship</dt><dd>{summary.relationship}</dd></>}
                  {summary.age && <><dt>Age</dt><dd>{summary.age} years</dd></>}
                  {summary.dateOfBirth && <><dt>Date of Birth</dt><dd>{formatDate(summary.dateOfBirth)}</dd></>}
                  {summary.gender && <><dt>Gender</dt><dd>{summary.gender}</dd></>}
                  {summary.bloodGroup && <><dt>Blood Group</dt><dd style={{ fontWeight: 700 }}>{summary.bloodGroup}</dd></>}
                  {summary.abhaAddress && <><dt>ABHA Address</dt><dd>{summary.abhaAddress}</dd></>}
                </dl>
              </div>

              {/* Critical Medical Info */}
              {(summary.allergies || summary.chronicConditions) && (
                <div className="emergency-section emergency-section-critical">
                  <div className="emergency-section-title">⚠ Critical Medical Information</div>
                  <dl className="emergency-dl">
                    {summary.allergies && (
                      <><dt>Known Allergies</dt><dd className="danger-text">{summary.allergies}</dd></>
                    )}
                    {summary.chronicConditions && (
                      <><dt>Chronic Conditions</dt><dd>{summary.chronicConditions}</dd></>
                    )}
                  </dl>
                </div>
              )}

              {/* Ongoing Medications */}
              {summary.ongoingMedications?.length > 0 && (
                <div className="emergency-section">
                  <div className="emergency-section-title">Ongoing Medications</div>
                  <ul className="emergency-list">
                    {summary.ongoingMedications.map((med, i) => <li key={i}>{med}</li>)}
                  </ul>
                </div>
              )}

              {/* Recent Prescriptions */}
              {summary.recentPrescriptions?.length > 0 && (
                <div className="emergency-section">
                  <div className="emergency-section-title">Recent Prescriptions</div>
                  <ul className="emergency-list">
                    {summary.recentPrescriptions.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}

              {/* Emergency Contact */}
              {(summary.clientMobile || summary.emergencyContactName) && (
                <div className="emergency-section">
                  <div className="emergency-section-title">Emergency Contacts</div>
                  <dl className="emergency-dl">
                    {summary.clientMobile && <><dt>Primary Mobile</dt><dd>{summary.clientMobile}</dd></>}
                    {summary.emergencyContactName && (
                      <><dt>Emergency Contact</dt><dd>{summary.emergencyContactName}{summary.emergencyContactRelation ? ` (${summary.emergencyContactRelation})` : ''}</dd></>
                    )}
                    {summary.emergencyContactPhone && <><dt>Contact Phone</dt><dd>{summary.emergencyContactPhone}</dd></>}
                  </dl>
                </div>
              )}

              {/* Active Policies */}
              {summary.activePolicies?.length > 0 && (
                <div className="emergency-section">
                  <div className="emergency-section-title">Active Insurance Policies</div>
                  {summary.activePolicies.map((p, i) => (
                    <div key={i} className="emergency-policy-card">
                      <dl className="emergency-dl">
                        <dt>Company</dt><dd>{p.companyName}</dd>
                        <dt>Policy No.</dt><dd>{p.policyNumber}</dd>
                        {p.tpaName && <><dt>TPA</dt><dd>{p.tpaName}</dd></>}
                        {p.sumInsured && <><dt>Sum Insured</dt><dd>{formatMoney(p.sumInsured)}</dd></>}
                        {p.customerCareNumber && <><dt>Helpline</dt><dd>{p.customerCareNumber}</dd></>}
                      </dl>
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              {summary.disclaimer && (
                <div className="emergency-disclaimer">
                  <strong>Disclaimer:</strong> {summary.disclaimer}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
