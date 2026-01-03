// src/components/AuthModal.jsx
import React, { useState } from "react";

function Field({ label, children, error }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontWeight: 600 }}>{label}</label>
      {children}
      {error && <div style={{ color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>}
    </div>
  );
}

export default function AuthModal({ onClose, onLogin, onRegister, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // "login" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (mode === "register") {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      }
      if (!department.trim()) {
        newErrors.department = "Department is required";
      }
      if (!year.trim()) {
        newErrors.year = "Year of study is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "login") {
      onLogin?.({ email, password });
    } else {
      onRegister?.({ email, password, name, department, year });
    }
  };

  return (
    <div className="event-popup" role="dialog" aria-modal="true">
      <div className="popup-content" style={{ maxWidth: "400px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3>{mode === "login" ? "Login" : "Register"}</h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          {mode === "register" && (
            <Field label="Full Name" error={errors.name}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
              />
            </Field>
          )}

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>

          <Field label="Password" error={errors.password}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>

          {mode === "register" && (
            <>
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
            </>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 8 }}>
            <button type="submit" className="btn btn-primary">
              {mode === "login" ? "Login" : "Register"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setErrors({});
                setEmail("");
                setPassword("");
                setName("");
                setDepartment("");
                setYear("");
              }}
              style={{ fontSize: "0.875rem" }}
            >
              {mode === "login" ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}