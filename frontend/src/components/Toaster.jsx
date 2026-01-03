// src/components/Toaster.jsx
import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export default function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const entry = { id, ...toast };
    setToasts((prev) => [...prev, entry]);
    if (entry.duration !== 0) {
      const ms = entry.duration ?? 3000;
      setTimeout(() => remove(id), ms);
    }
    return id;
  }, [remove]);

  const value = useMemo(() => ({ show, remove }), [show, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ title, message, actionLabel, onAction, onClose, variant = "success" }) {
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <div className={`toast toast-${variant}`} role="status">
      <div className="toast-body">
        <div>
          {title && <strong>{title}</strong>}
          {message && <div style={{ fontSize: "0.92rem" }}>{message}</div>}
        </div>
        <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          {actionLabel && (
            <button className="btn btn-ghost" onClick={onAction}>{actionLabel}</button>
          )}
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>
      </div>
    </div>
  );
}