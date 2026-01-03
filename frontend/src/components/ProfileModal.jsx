// src/components/ProfileModal.jsx
import React, { useState, useEffect } from "react";

function Field({ label, children, error }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontWeight: 600 }}>{label}</label>
      {children}
      {error && <div style={{ color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>}
    </div>
  );
}

export default function ProfileModal({ onClose, user, onSave, onDelete, onLogout }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [year, setYear] = useState(user?.year || "");
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setDepartment(user.department || "");
      setYear(user.year || "");
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!department.trim()) {
      newErrors.department = "Department is required";
    }
    if (!year.trim()) {
      newErrors.year = "Year of study is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave?.({ name, email, department, year });
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete?.();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="event-popup" role="dialog" aria-modal="true">
      <div className="popup-content" style={{ maxWidth: "500px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3>Edit Profile</h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <Field label="Full Name" error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>

          <Field label="Department" error={errors.department}>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Computer Science, Mathematics, etc."
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>

          <Field label="Year of Study" error={errors.year}>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
              <option value="Graduate">Graduate</option>
            </select>
          </Field>

          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {showDeleteConfirm ? (
                <>
                  <button type="button" className="btn btn-danger" onClick={handleDelete}>
                    Confirm Delete
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Delete Account
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button type="button" className="btn btn-ghost" onClick={onLogout}>
                Logout
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}