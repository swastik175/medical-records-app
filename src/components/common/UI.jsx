import { LoaderCircle, FilePlus2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

/* ─── High-Fidelity Thematic Logo ────────────────────────────── */
export function LogoIcon({ size = 40, inverse = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="app-logo-icon"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1f7a5e" />
          <stop offset="60%" stopColor="#136049" />
          <stop offset="100%" stopColor="#0b4634" />
        </linearGradient>
        <linearGradient id="shieldGradInverse" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="heartGrad" x1="16" y1="16" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb7185" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#e11d48" stopOpacity="0.95" />
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0b4634" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Main Protective Shield */}
      <path
        d="M24 4L40 9.8C40 23.5 33.5 37 24 44C14.5 37 8 23.5 8 9.8L24 4Z"
        fill={inverse ? 'rgba(255, 255, 255, 0.16)' : 'url(#shieldGrad)'}
        stroke={inverse ? '#6ee7b7' : '#2dd4bf'}
        strokeWidth="2.2"
        strokeLinejoin="round"
        filter="url(#logoGlow)"
      />

      {/* Inner Heart silhouette representing Family Care */}
      <path
        d="M24 33C24 33 16.5 28 16.5 21C16.5 18 18.5 16 21 16C22.6 16 23.5 16.9 24 17.6C24.5 16.9 25.4 16 27 16C29.5 16 31.5 18 31.5 21C31.5 28 24 33 24 33Z"
        fill={inverse ? 'rgba(255, 255, 255, 0.22)' : 'url(#heartGrad)'}
      />

      {/* ECG Heartbeat Vitality Line */}
      <path
        d="M13 22.5H19L21.5 17L24.5 28.5L27 19.5L29 22.5H35"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Golden Accreditation / Trust Seal */}
      <circle cx="37" cy="11" r="5.5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.6" />
      <path d="M37 8.5V13.5M34.5 11H39.5" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Brand ───────────────────────────────────────────────── */
export function Brand({ inverse = false }) {
  return (
    <div className={`brand${inverse ? ' brand-inverse' : ''}`}>
      <LogoIcon size={38} inverse={inverse} />
      <span>
        <strong>My Family</strong>
        <small>Medical Records</small>
      </span>
    </div>
  );
}

/* ─── Loading ──────────────────────────────────────────────── */
export function Loading({ message = 'Loading…' }) {
  return (
    <div className="loading-screen">
      <div className="loading-pulse-ring">
        <LoaderCircle size={32} className="spin" />
      </div>
      <p className="muted" style={{ marginTop: 14, fontWeight: 500 }}>{message}</p>
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading…' }) {
  return <Loading message={message} />;
}

/* ─── EmptyState ───────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon
        ? <div className="empty-state-icon">{icon}</div>
        : <FilePlus2 size={40} className="muted empty-state-svg" />
      }
      <h3 style={{ fontFamily: 'var(--display)', fontWeight: 600, marginBottom: 8, fontSize: '1.25rem' }}>{title}</h3>
      {description && <p className="muted" style={{ maxWidth: '42ch', textAlign: 'center', fontSize: '0.92rem' }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

/* ─── Modal ────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, maxWidth = 580 }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  const handleClick = (e) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      style={{ maxWidth, width: '100%' }}
      onClick={handleClick}
      onCancel={onClose}
    >
      <div className="modal-inner">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="icon-button modal-close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

/* ─── ConfirmModal ─────────────────────────────────────────── */
export function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Delete', confirmClass = 'button-danger' }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-inner confirm-modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="icon-button modal-close-btn" onClick={onCancel} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="button button-secondary" onClick={onCancel}>Cancel</button>
          <button className={`button ${confirmClass}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── PageHeader ───────────────────────────────────────────── */
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="muted page-description" style={{ marginBottom: 0 }}>{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}

/* ─── Field helpers ────────────────────────────────────────── */
export function Field({ label, required, hint, children }) {
  return (
    <label className="field">
      <span>{label}{required && <span className="required"> *</span>}</span>
      {children}
      {hint && <span className="field-hint muted">{hint}</span>}
    </label>
  );
}

export function InputField({ label, required, hint, ...props }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <input {...props} />
    </Field>
  );
}

export function SelectField({ label, required, hint, children, ...props }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <select {...props}>{children}</select>
    </Field>
  );
}

export function TextAreaField({ label, required, hint, ...props }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <textarea {...props} />
    </Field>
  );
}
