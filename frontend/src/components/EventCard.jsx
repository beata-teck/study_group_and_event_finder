// src/components/EventCard.jsx
import React from "react";

function EventCard({ event, onJoin, onRemove, isJoined, onEdit, onDelete, onViewDetails }) {
  return (
    <div className="event-card card">
      <h3>{event.title}</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "6px 0" }}>
        {event.category && (
          <span className="chip" title={event.category}>
            {categoryEmoji(event.category)} {event.category}
          </span>
        )}
        {event.custom && <span className="badge">Verified organizer</span>}
      </div>
      {event.organizer && (
        <div className="organizer" style={{ marginBottom: 6 }}>
          <span className="avatar" aria-hidden>{initials(event.organizer)}</span>
          <span>By {event.organizer}</span>
        </div>
      )}
      <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
        <strong>Subject:</strong> {event.subject}
      </p>
      <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
        <strong>Date:</strong> {event.date}
      </p>
      <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
        <strong>Location:</strong> {event.location}
      </p>

      {!isJoined && onJoin && (
        <button className="btn btn-primary" onClick={() => onJoin(event)}>
          Join
        </button>
      )}

      {isJoined && (
        <span style={{ marginLeft: 8, color: "#047857", fontWeight: 600 }}>Joined</span>
      )}

      {isJoined && onRemove && (
        <button className="btn btn-danger" onClick={() => onRemove(event.id)} style={{ marginLeft: 8 }}>
          Remove
        </button>
      )}

      {event.custom && (
        <div style={{ display: "inline-flex", gap: 8, marginLeft: 8 }}>
          {onEdit && (
            <button className="btn btn-ghost" onClick={() => onEdit(event)}>Edit</button>
          )}
          {onDelete && (
            <button className="btn btn-danger" onClick={() => onDelete(event.id)}>Delete</button>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {onViewDetails && (
          <button className="btn btn-primary" onClick={() => onViewDetails(event)}>
            View Details
          </button>
        )}
        <button
          className="btn btn-ghost"
          onClick={() => {
            const shareText = `${event.title} on ${event.date}${event.time ? ' at ' + event.time : ''} - ${event.location || ''}`.trim();
            if (navigator.share) {
              navigator.share({ title: event.title, text: shareText, url: window.location.href }).catch(() => {});
            } else {
              navigator.clipboard?.writeText(shareText);
              alert('Event details copied to clipboard');
            }
          }}
        >
          Share
        </button>
        <a
          className="btn btn-ghost"
          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${(() => {
            try {
              const d = new Date(event.date);
              const start = new Date(d);
              const end = new Date(d);
              end.setHours(end.getHours() + 1);
              const fmt = (x) => x.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
              return `${fmt(start)}/${fmt(end)}`;
            } catch { return '' }
          })()}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`}
          target="_blank"
          rel="noreferrer"
        >
          Add to Google Calendar
        </a>
      </div>
    </div>
  );
}

function categoryEmoji(category) {
  const map = {
    Math: "📐",
    Web: "🌐",
    Python: "🐍",
    Java: "☕",
    "C++": "💻",
    Sports: "🏅",
    Social: "🎉",
  };
  return map[category] || "📘";
}

function initials(name) {
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts[1]?.[0] || '';
  return (first + last).toUpperCase() || 'U';
}

export default EventCard;