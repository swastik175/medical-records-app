import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Files, ShieldCheck,
  BriefcaseMedical, Bell, Siren, LogOut, Menu, X
} from 'lucide-react';
import { Brand } from '../common/UI';
import { authService } from '../../services/authService';

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
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  const close = () => setOpen(false);

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
    </div>
  );
}
