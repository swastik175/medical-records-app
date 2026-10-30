import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, CheckCircle2, Lock, KeyRound, X, Mail } from 'lucide-react';
import { authService } from '../../services/authService';
import { Brand } from '../common/UI';
import { toast } from 'sonner';
import docsImage from '../../assets/medical_insurance_docs.png';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.44 7.33 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.15 0 9.99 0 12s.45 3.85 1.25 5.43l4.03-3.14z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.56 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 23 23">
      <path fill="#f35325" d="M1 1h10v10H1z"/>
      <path fill="#81bc06" d="M12 1h10v10H12z"/>
      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
      <path fill="#ffba08" d="M12 12h10v10H12z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 170 170" fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-7.51-11.41-13.04-24.3-16.59-38.68-3.55-14.38-3.55-27.18 0-38.41 3.55-11.23 9.4-20.08 17.57-26.54 8.17-6.46 17.47-9.78 27.91-9.97 4.9 0 10.15 1.16 15.75 3.48 5.6 2.33 9.4 3.55 11.41 3.67 1.64 0 5.63-1.34 11.96-4.02 6.33-2.68 11.9-3.8 16.71-3.37 13.9.77 24.88 5.69 32.93 14.75-11.51 6.94-17.15 16.63-16.92 29.07.24 9.68 4.09 17.82 11.55 24.41 7.46 6.59 16.48 10.45 27.05 11.58-2.28 6.74-5.01 13.53-8.2 20.37zM119.22 31.02c0-7.29 2.58-14.07 7.74-20.35 5.16-6.28 11.75-10.22 19.78-11.83.65 1.52.98 3.1.98 4.74 0 7.39-2.69 14.3-8.06 20.73-5.38 6.43-12.16 10.22-20.35 11.36-.11-1.52-.09-3.07-.09-4.65z"/>
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({ mobileNumber: '', password: '' });

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Forced password change after temporary password login
  const [showForcedChangeModal, setShowForcedChangeModal] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [changeLoading, setChangeLoading] = useState(false);

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
      const res = await authService.login(loginData.mobileNumber, loginData.password);
      if (res.mustChangePassword) {
        toast.info('Temporary password detected. Please set a new secure password.');
        setShowForcedChangeModal(true);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid mobile number or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      toast.error('Please enter your mobile number or email');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authService.forgotPassword(forgotIdentifier.trim());
      toast.success(res.message || 'A temporary password has been sent to your registered email address.');
      setShowForgotModal(false);
      if (/^\d{10}$/.test(forgotIdentifier.trim())) {
        setLoginData(d => ({ ...d, mobileNumber: forgotIdentifier.trim(), password: '' }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send temporary password. Please check your details.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForcedPasswordChange = async (e) => {
    e.preventDefault();
    if (newPasswordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (newPasswordData.newPassword !== newPasswordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangeLoading(true);
    try {
      await authService.changePassword({ newPassword: newPasswordData.newPassword });
      toast.success('Password updated successfully! Welcome to your vault.');
      setShowForcedChangeModal(false);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setChangeLoading(false);
    }
  };

  const handleSSO = (provider) => {
    toast.info(`${provider} Single Sign-On is configured. Redirecting to ${provider} OAuth2 provider...`);
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
          <h1 className="auth-heading">{tab === 'login' ? 'Sign in' : 'Get started'}</h1>
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

              <div className="auth-forgot-row">
                <button
                  type="button"
                  className="auth-forgot-btn"
                  onClick={() => { setForgotIdentifier(loginData.mobileNumber); setShowForgotModal(true); }}
                >
                  Forgot password?
                </button>
              </div>

              <button className="button button-primary button-full" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <div className="auth-demo-hint">
                <span className="demo-chip">DEMO LOGIN</span>
                <div style={{ marginTop: 4 }}>
                  Mobile: <code>9876543210</code> · Password: <code>Password@123</code>
                </div>
              </div>
            </form>
          ) : (
            <div>
              {/* SSO Section */}
              <div className="sso-grid">
                <button type="button" className="sso-btn" onClick={() => handleSSO('Google')} title="Register with Google">
                  <GoogleIcon />
                  <span>Google</span>
                </button>
                <button type="button" className="sso-btn" onClick={() => handleSSO('Microsoft')} title="Register with Microsoft">
                  <MicrosoftIcon />
                  <span>Microsoft</span>
                </button>
                <button type="button" className="sso-btn" onClick={() => handleSSO('Apple')} title="Register with Apple">
                  <AppleIcon />
                  <span>Apple</span>
                </button>
              </div>

              <div className="auth-divider">
                <span>Or register with mobile</span>
              </div>

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
                    <span>Email (required for recovery)</span>
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
            </div>
          )}

          <p className="auth-footer">
            <Lock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Your records are stored securely with 256-bit AES encryption.
          </p>
        </main>
      </div>

      {/* ── Decorative aside with translucent documents image ── */}
      <aside className="auth-aside">
        {/* Translucent background image layer */}
        <div className="auth-aside-bg-layer" style={{ backgroundImage: `url(${docsImage})` }} />
        <div className="auth-aside-gradient-overlay" />

        {/* Content layer */}
        <div className="auth-aside-content">
          <header className="auth-aside-header">
            <Brand inverse />
            <span className="auth-aside-badge">
              <ShieldCheck size={14} /> Vault Active
            </span>
          </header>

          <div className="auth-aside-middle">
            <blockquote>Your family's health, always at hand.</blockquote>
            <p>
              Prescriptions, lab diagnostics, health policies, and emergency summaries — organised in one place.
            </p>

            {/* Floating Glassmorphic Document & Policy Cards */}
            <div className="auth-glass-cards">
              <div className="auth-glass-card auth-glass-card-primary">
                <div className="auth-glass-card-header">
                  <div className="glass-icon-wrap">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="glass-card-title">Family Health Shield</div>
                    <div className="glass-card-subtitle">Policy #POL-8942-A • ₹15,00,000</div>
                  </div>
                  <span className="glass-status-dot" title="Active" />
                </div>
                <div className="glass-card-tags">
                  <span className="glass-tag">Cashless Portal Active</span>
                  <span className="glass-tag">Self • Spouse • 2 Kids</span>
                </div>
              </div>

              <div className="auth-glass-card auth-glass-card-secondary">
                <div className="auth-glass-card-header">
                  <div className="glass-icon-wrap glass-icon-accent">
                    <FileText size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="glass-card-title">Verified Prescription & Lab</div>
                    <div className="glass-card-subtitle">Dr. Arvind Mehta • Complete Review</div>
                  </div>
                  <CheckCircle2 size={16} className="glass-check-icon" />
                </div>
              </div>
            </div>
          </div>

          <footer className="auth-aside-footer">
            <div className="auth-trust-pills">
              <span>🔒 ABDM Compliant</span>
              <span>⚡ Fast Cashless Pre-Auth</span>
              <span>📄 Multi-Member Dossier</span>
            </div>
            <small>By My Friend Insurancewala</small>
          </footer>
        </div>
      </aside>

      {/* ── Forgot Password Modal ── */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-inner" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <KeyRound size={20} />
                </div>
                <h2 className="modal-title" style={{ fontSize: 20 }}>Reset Password</h2>
              </div>
              <button className="icon-button" onClick={() => setShowForgotModal(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleForgotSubmit}>
              <div className="modal-body form-stack">
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Enter your registered mobile number or email address. We will send a secure temporary password to your registered email.
                </p>
                <label className="field">
                  <span>Registered Mobile or Email <span className="required">*</span></span>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210 or your@email.com"
                      value={forgotIdentifier}
                      onChange={e => setForgotIdentifier(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowForgotModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending…' : 'Send Temporary Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Mandatory Change Password Modal (After Temp Password Login) ── */}
      {showForcedChangeModal && (
        <div className="modal-overlay">
          <div className="modal-inner" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={20} />
                </div>
                <div>
                  <h2 className="modal-title" style={{ fontSize: 19 }}>Set New Password</h2>
                  <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>Temporary password login detected</div>
                </div>
              </div>
            </div>
            <form onSubmit={handleForcedPasswordChange}>
              <div className="modal-body form-stack">
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.5 }}>
                  For security reasons, you must replace your temporary password with a new personal password before accessing your health vault.
                </p>
                <label className="field">
                  <span>New Password <span className="required">*</span></span>
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    value={newPasswordData.newPassword}
                    onChange={e => setNewPasswordData(d => ({ ...d, newPassword: e.target.value }))}
                    required
                    autoFocus
                  />
                </label>
                <label className="field">
                  <span>Confirm New Password <span className="required">*</span></span>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={newPasswordData.confirmPassword}
                    onChange={e => setNewPasswordData(d => ({ ...d, confirmPassword: e.target.value }))}
                    required
                  />
                </label>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    authService.logout();
                    setShowForcedChangeModal(false);
                  }}
                >
                  Cancel & Sign Out
                </button>
                <button type="submit" className="button button-primary" disabled={changeLoading}>
                  {changeLoading ? 'Saving Password…' : 'Set Password & Enter Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}