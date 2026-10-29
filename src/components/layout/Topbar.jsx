import { useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your family health records' },
  '/family': { title: 'My Family', subtitle: 'Manage family member profiles' },
  '/records': { title: 'Medical Records', subtitle: 'Prescriptions, reports, bills and more' },
  '/policies': { title: 'Insurance Policies', subtitle: 'Health insurance policy details and renewals' },
  '/claims': { title: 'Claim Documents', subtitle: 'Insurance claim dossier and checklist' },
  '/reminders': { title: 'Reminders', subtitle: 'Medicine, appointments and renewal reminders' },
  '/emergency': { title: 'Emergency Summary', subtitle: 'Printable health summary for hospital visits' },
};

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const user = authService.getCurrentUser();
  const page = PAGE_TITLES[location.pathname] || { title: 'My Family Medical Records', subtitle: '' };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem', display: 'none' }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <div>
          <h2 style={{ fontSize: '1.125rem', margin: 0 }}>{page.title}</h2>
          {page.subtitle && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>{page.subtitle}</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* User Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '0.875rem'
        }}>
          {initials}
        </div>
        <div style={{ display: 'none' }} className="user-name-desktop">
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.fullName}</div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .user-name-desktop { display: block !important; }
        }
      `}</style>
    </header>
  );
}
