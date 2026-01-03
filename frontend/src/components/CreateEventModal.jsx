// src/components/CreateEventModal.jsx
import React, { useState } from "react";

function Field({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

export default function CreateEventModal({ onClose, onSave, initialEvent, onDelete }) {
  const [title, setTitle] = useState(initialEvent?.title || "");
  const [subject, setSubject] = useState(initialEvent?.subject || "");
  const [date, setDate] = useState(initialEvent?.date || "");
  const [time, setTime] = useState(initialEvent?.time || "");
  const [location, setLocation] = useState(initialEvent?.location || "");
  const [category, setCategory] = useState(initialEvent?.category || "");
  const [description, setDescription] = useState(initialEvent?.description || "");
  const [organizer, setOrganizer] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError("Title and date are required.");
      return;
    }
    const newEvent = {
      id: initialEvent?.id ?? Date.now(),
      title: title.trim(),
      subject: subject.trim() || undefined,
      date,
      time: time || undefined,
      location: location.trim() || undefined,
      category: category.trim() || "General",
      description: description.trim() || undefined,
      custom: true,
      organizer: organizer.trim() || undefined,
    };
    onSave && onSave(newEvent);
  };

  return (
    <div className="event-popup" role="dialog" aria-modal="true">
      <div className="popup-content">
        <h3>{initialEvent ? "Edit Event" : "Create Event"}</h3>
        {error && (
          <div style={{ color: "var(--danger)", marginBottom: 8 }}>{error}</div>
        )}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <Field label="Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>
          <Field label="Subject">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
              />
            </Field>
            <Field label="Time">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
              />
            </Field>
          </div>
          <Field label="Location">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>
          <Field label="Category">
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Math, Web, Python"
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>
          <Field label="Organizer">
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="Your name or club"
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 8 }}>
            {initialEvent && onDelete && (
              <button type="button" className="btn btn-danger" onClick={() => onDelete(initialEvent.id)}>Delete</button>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}