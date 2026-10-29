import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({ mobileNumber: '', password: '' });

  // Register form state
  const [regData, setRegData] = useState({
    fullName: '', mobileNumber: '', email: '', password: '', confirmPassword: '',
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
    consentGiven: false, allowAdvisorAccess: false
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(loginData.mobileNumber, loginData.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid mobile number or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!regData.consentGiven) {
      setError('You must provide consent to store medical records');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = regData;
      await authService.register(payload);
      setTab('login');
      setLoginData({ mobileNumber: regData.mobileNumber, password: '' });
      setError('');
      alert('Registration successful! Please sign in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">💊</div>
          <h1 style={{ fontSize: '1.375rem', marginBottom: '0.25rem' }}>My Family Medical Records</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>by My Friend Insurancewala</p>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
            Sign In
          </button>
          <button className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
            Register
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Mobile Number <span className="required">*</span></label>
              <input
                type="tel"
                className="form-input"
                placeholder="10-digit mobile number"
                value={loginData.mobileNumber}
                onChange={e => setLoginData({ ...loginData, mobileNumber: e.target.value })}
                required
                maxLength={10}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? '⏳ Signing In...' : '🔐 Sign In'}
            </button>
            <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--info-light)', borderRadius: 'var(--radius)', fontSize: '0.8125rem' }}>
              <strong>Demo credentials:</strong><br />
              Mobile: <code>9876543210</code> · Password: <code>Password@123</code>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="Your full name"
                value={regData.fullName} onChange={e => setRegData({ ...regData, fullName: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mobile Number <span className="required">*</span></label>
                <input type="tel" className="form-input" placeholder="10-digit mobile"
                  value={regData.mobileNumber} onChange={e => setRegData({ ...regData, mobileNumber: e.target.value })}
                  required maxLength={10} pattern="[0-9]{10}" />
              </div>
              <div className="form-group">
                <label className="form-label">Email (Optional)</label>
                <input type="email" className="form-input" placeholder="your@email.com"
                  value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <input type="password" className="form-input" placeholder="Min 8 characters"
                  value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password <span className="required">*</span></label>
                <input type="password" className="form-input" placeholder="Repeat password"
                  value={regData.confirmPassword} onChange={e => setRegData({ ...regData, confirmPassword: e.target.value })} required />
              </div>
            </div>

            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Emergency Contact (Optional)
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Name</label>
                <input type="text" className="form-input" placeholder="Contact person name"
                  value={regData.emergencyContactName} onChange={e => setRegData({ ...regData, emergencyContactName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input type="tel" className="form-input" placeholder="Phone number"
                  value={regData.emergencyContactPhone} onChange={e => setRegData({ ...regData, emergencyContactPhone: e.target.value })} />
              </div>
            </div>

            <div className="consent-box">
              <input type="checkbox" id="consent"
                checked={regData.consentGiven}
                onChange={e => setRegData({ ...regData, consentGiven: e.target.checked })} />
              <label htmlFor="consent" className="consent-text">
                <strong>I give consent</strong> to store my family's medical records securely under the privacy notice of My Friend Insurancewala. I understand my records are private and will only be accessed with my permission.
                <span className="required"> *</span>
              </label>
            </div>

            <div className="consent-box" style={{ marginBottom: '1.25rem' }}>
              <input type="checkbox" id="advisorAccess"
                checked={regData.allowAdvisorAccess}
                onChange={e => setRegData({ ...regData, allowAdvisorAccess: e.target.checked })} />
              <label htmlFor="advisorAccess" className="consent-text">
                Allow my advisor at My Friend Insurancewala to view my insurance documents to help with claims and renewals.
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? '⏳ Registering...' : '✅ Create Account'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', padding: '0.875rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          🔒 Your medical records are stored securely and privately. We do not share your health information without your explicit consent.
        </div>
      </div>
    </div>
  );
}
