export function Spinner({ size = 24 }) {
  return (
    <div className="spinner" style={{ width: size, height: size }} />
  );
}

export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="loading-overlay">
      <Spinner />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p style={{ marginBottom: '1rem' }}>{description}</p>}
      {action}
    </div>
  );
}

export function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Delete', confirmClass = 'btn-danger' }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
