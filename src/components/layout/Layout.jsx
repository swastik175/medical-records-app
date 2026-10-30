import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Files, ShieldCheck,
  BriefcaseMedical, Bell, Siren, LogOut, Menu, X, KeyRound, Lock
} from 'lucide-react';
import { Brand } from '../common/UI';
import { authService } from '../../services/authService';
import { toast } from 'sonner';
import familyPhoto from '../../assets/family_photo.jpg';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/family',    icon: Users,           label: 'Family' },
  { to: '/records',   icon: Files,           label: 'Records' },
  { to: '/policies',  icon: ShieldCheck,     label: 'Policies' },
  { to: '/claims',    icon: BriefcaseMedical,label: 'Claims' },
  { to: '/reminders', icon: Bell,            label: 'Reminders' },
  { to: '/emergency', icon: Siren,           label: 'Emergency' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const isForcedChange = !!user?.mustChangePassword;

  useEffect(() => {
    if (isForcedChange) {
      setShowPasswordModal(true);
    }
  }, [isForcedChange]);

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  const close = () => setOpen(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!isForcedChange && !passwordForm.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword || undefined,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {open && <div className="sidebar-backdrop" onClick={close} />}

      {/* Sidebar */}
      <nav className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Brand />
          <button className="icon-button sidebar-close-btn" onClick={close} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* Family Photo Showcase Banner */}
        <div className="sidebar-family-showcase">
          <div
            className="sidebar-family-frame"
            onClick={() => { close(); navigate('/family'); }}
            title="My Family • Father, Mother & 2 Children (Click to view family dossier)"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { close(); navigate('/family'); } }}
          >
            <img
              src={familyPhoto}
              alt="My Family - Father, Mother, Daughter and Son"
              className="sidebar-family-img"
            />
          </div>
        </div>

        <div className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={close}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName || 'User'}</div>
              <div className="sidebar-user-sub muted">{user?.mobileNumber || ''}</div>
            </div>
          </div>

          {/* Change Password button in user profile section */}
          <button
            type="button"
            className="sidebar-action-btn"
            onClick={() => {
              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setShowPasswordModal(true);
            }}
          >
            <KeyRound size={14} />
            <span>Change Password</span>
          </button>

          <button className="button button-secondary sidebar-logout" onClick={handleLogout}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="main-area">
        {/* Mobile topbar */}
        <header className="mobile-topbar">
          <button className="icon-button" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <Brand />
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => { if (!isForcedChange) setShowPasswordModal(false); }}>
          <div className="modal-inner" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={18} />
                </div>
                <div>
                  <h2 className="modal-title" style={{ fontSize: 19 }}>
                    {isForcedChange ? 'Set New Password' : 'Change Password'}
                  </h2>
                  {isForcedChange && (
                    <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>Temporary password update required</div>
                  )}
                </div>
              </div>
              {!isForcedChange && (
                <button className="icon-button" onClick={() => setShowPasswordModal(false)} aria-label="Close">
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="modal-body form-stack">
                {!isForcedChange && (
                  <label className="field">
                    <span>Current Password <span className="required">*</span></span>
                    <input
                      type="password"
                      placeholder="Enter your current password"
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                      required
                      autoFocus
                    />
                  </label>
                )}

                <label className="field">
                  <span>New Password <span className="required">*</span></span>
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                    required
                    autoFocus={isForcedChange}
                  />
                </label>

                <label className="field">
                  <span>Confirm New Password <span className="required">*</span></span>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    required
                  />
                </label>
              </div>

              <div className="modal-footer">
                {!isForcedChange ? (
                  <button type="button" className="button button-secondary" onClick={() => setShowPasswordModal(false)}>
                    Cancel
                  </button>
                ) : (
                  <button type="button" className="button button-secondary" onClick={handleLogout}>
                    Sign Out
                  </button>
                )}
                <button type="submit" className="button button-primary" disabled={savingPassword}>
                  {savingPassword ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}