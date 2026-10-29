import { LoaderCircle, FilePlus2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

/* ─── Brand ───────────────────────────────────────────────── */
export function Brand({ inverse = false }) {
  return (
    <div className={`brand${inverse ? ' brand-inverse' : ''}`}>
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M20 3 34 8v10c0 9-5.7 15.7-14 19C11.7 33.7 6 27 6 18V8l14-5Z"
          fill={inverse ? 'rgba(255,255,255,0.18)' : 'var(--mint-200)'}
        />
        <path
          d="M20 11v14M13 18h14"
          stroke={inverse ? 'var(--mint-200)' : 'var(--accent)'}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
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
      <LoaderCircle size={28} className="spin" />
      <p className="muted" style={{ marginTop: 12 }}>{message}</p>
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
        : <FilePlus2 size={36} className="muted" />
      }
      <h3 style={{ fontFamily: 'var(--display)', fontWeight: 500, marginBottom: 8 }}>{title}</h3>
      {description && <p className="muted" style={{ maxWidth: '40ch', textAlign: 'center' }}>{description}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
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

  // Close on backdrop click
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
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button>
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
      <div className="modal-inner" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="icon-button" onClick={onCancel} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ margin: 0 }}>{message}</p>
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
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="muted" style={{ marginBottom: 0 }}>{description}</p>}
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
