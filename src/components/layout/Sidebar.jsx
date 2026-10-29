import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/family', icon: '👨‍👩‍👧‍👦', label: 'My Family' },
  { to: '/records', icon: '📋', label: 'Medical Records' },
  { to: '/policies', icon: '🛡️', label: 'Insurance Policies' },
  { to: '/claims', icon: '📄', label: 'Claim Documents' },
  { to: '/reminders', icon: '🔔', label: 'Reminders' },
  { to: '/emergency', icon: '🚨', label: 'Emergency Summary' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div className="brand-logo">
        <div className="brand-icon">💊</div>
        <div className="brand-text">
          <div className="brand-name">My Friend Insurancewala</div>
          <div className="brand-app">My Family Medical Records</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-section">
        <div className="nav-section-title">Navigation</div>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-item-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      {/* User & Logout */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem' }}>
        {user && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.fullName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.mobileNumber}</div>
          </div>
        )}
        <button className="btn btn-ghost btn-full" onClick={handleLogout} style={{ justifyContent: 'flex-start' }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </nav>
  );
}
