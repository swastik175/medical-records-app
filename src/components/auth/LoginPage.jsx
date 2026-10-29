import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Brand } from '../common/UI';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({ mobileNumber: '', password: '' });

  // Register state
  const [regData, setRegData] = useState({
    fullName: '', mobileNumber: '', email: '', password: '', confirmPassword: '',
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
    consentGiven: false, allowAdvisorAccess: false,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(loginData.mobileNumber, loginData.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid mobile number or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!regData.consentGiven) {
      toast.error('You must provide consent to store medical records');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = regData;
      await authService.register(payload);
      setTab('login');
      setLoginData({ mobileNumber: regData.mobileNumber, password: '' });
      toast.success('Account created! Please sign in.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setL = (patch) => setLoginData(d => ({ ...d, ...patch }));
  const setR = (patch) => setRegData(d => ({ ...d, ...patch }));

  return (
    <div className="auth-page">
      {/* ── Form side ── */}
      <div className="auth-form-side">
        <header>
          <Brand />
        </header>

        <main>
          <div className="eyebrow">
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </div>
          <h1>{tab === 'login' ? 'Sign in' : 'Get started'}</h1>
          <p className="auth-description">
            {tab === 'login'
              ? "Access your family's secure health records."
              : "Securely store your family's medical records in one place."}
          </p>

          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab${tab === 'login' ? ' active' : ''}`}
              onClick={() => setTab('login')}
            >Sign in</button>
            <button
              className={`auth-tab${tab === 'register' ? ' active' : ''}`}
              onClick={() => setTab('register')}
            >Register</button>
          </div>

          {tab === 'login' ? (
            <form className="form-stack" onSubmit={handleLogin}>
              <label className="field">
                <span>Mobile Number <span className="required">*</span></span>
                <input
                  type="tel" placeholder="10-digit mobile number" maxLength={10}
                  value={loginData.mobileNumber} onChange={e => setL({ mobileNumber: e.target.value })}
                  required autoFocus
                />
              </label>
              <label className="field">
                <span>Password <span className="required">*</span></span>
                <input
                  type="password" placeholder="Enter your password"
                  value={loginData.password} onChange={e => setL({ password: e.target.value })}
                  required
                />
              </label>
              <button className="button button-primary button-full" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <div className="auth-demo-hint">
                <strong>Demo:</strong> Mobile <code>9876543210</code> · Password <code>Password@123</code>
              </div>
            </form>
          ) : (
            <form className="form-stack" onSubmit={handleRegister}>
              <label className="field">
                <span>Full Name <span className="required">*</span></span>
                <input type="text" placeholder="Your full name"
                  value={regData.fullName} onChange={e => setR({ fullName: e.target.value })} required />
              </label>
              <div className="form-grid">
                <label className="field">
                  <span>Mobile Number <span className="required">*</span></span>
                  <input type="tel" placeholder="10-digit mobile" maxLength={10} pattern="[0-9]{10}"
                    value={regData.mobileNumber} onChange={e => setR({ mobileNumber: e.target.value })} required />
                </label>
                <label className="field">
                  <span>Email (optional)</span>
                  <input type="email" placeholder="your@email.com"
                    value={regData.email} onChange={e => setR({ email: e.target.value })} />
                </label>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Password <span className="required">*</span></span>
                  <input type="password" placeholder="Min 8 characters"
                    value={regData.password} onChange={e => setR({ password: e.target.value })} required />
                </label>
                <label className="field">
                  <span>Confirm Password <span className="required">*</span></span>
                  <input type="password" placeholder="Repeat password"
                    value={regData.confirmPassword} onChange={e => setR({ confirmPassword: e.target.value })} required />
                </label>
              </div>

              <div className="eyebrow" style={{ marginBottom: 0 }}>Emergency Contact (optional)</div>
              <div className="form-grid">
                <label className="field">
                  <span>Contact Name</span>
                  <input type="text" placeholder="Contact person name"
                    value={regData.emergencyContactName} onChange={e => setR({ emergencyContactName: e.target.value })} />
                </label>
                <label className="field">
                  <span>Contact Phone</span>
                  <input type="tel" placeholder="Phone number"
                    value={regData.emergencyContactPhone} onChange={e => setR({ emergencyContactPhone: e.target.value })} />
                </label>
              </div>

              <label className="consent-row">
                <input type="checkbox" checked={regData.consentGiven}
                  onChange={e => setR({ consentGiven: e.target.checked })} />
                <span>
                  <strong>I give consent</strong> to store my family's medical records securely under the privacy
                  notice of My Friend Insurancewala. <span className="required">*</span>
                </span>
              </label>
              <label className="consent-row">
                <input type="checkbox" checked={regData.allowAdvisorAccess}
                  onChange={e => setR({ allowAdvisorAccess: e.target.checked })} />
                <span>Allow my advisor at My Friend Insurancewala to view my insurance documents to help with claims and renewals.</span>
              </label>

              <button className="button button-primary button-full" type="submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}

          <p className="auth-footer">
            🔒 Your records are stored securely. We never share your health data without your explicit consent.
          </p>
        </main>
      </div>

      {/* ── Decorative aside ── */}
      <aside className="auth-aside">
        <div>
          <Brand inverse />
          <blockquote>Your family's health, always at hand.</blockquote>
          <p>
            Store prescriptions, lab reports, insurance policies and more — organised, private and accessible
            whenever your family needs them most.
          </p>
        </div>
        <small>By My Friend Insurancewala</small>
      </aside>
    </div>
  );
}
