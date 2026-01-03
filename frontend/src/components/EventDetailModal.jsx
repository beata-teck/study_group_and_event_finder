// src/components/EventDetailModal.jsx
import React from "react";
import EventDiscussion from "./EventDiscussion";

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

export default function EventDetailModal({ event, onClose, onJoin, onLeave, isJoined, currentUser }) {
  if (!event) return null;

  return (
    <div className="event-popup" role="dialog" aria-modal="true">
      <div className="popup-content" style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, marginBottom: "0.5rem" }}>{event.title}</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
              {event.category && (
                <span className="chip" title={event.category}>
                  {categoryEmoji(event.category)} {event.category}
                </span>
              )}
              {event.custom && <span className="badge">Verified organizer</span>}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>
          {event.organizer && (
            <div>
              <strong>Organizer:</strong> {event.organizer}
            </div>
          )}

          {event.subject && (
            <div>
              <strong>Subject:</strong> {event.subject}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {event.date && (
              <div>
                <strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}
            {event.time && (
              <div>
                <strong>Time:</strong> {event.time}
              </div>
            )}
            {event.location && (
              <div>
                <strong>Location:</strong> {event.location}
              </div>
            )}
          </div>

          {event.description && (
            <div>
              <strong>Description:</strong>
              <p style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap" }}>{event.description}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
            {isJoined ? (
              <button className="btn btn-danger" onClick={() => onLeave?.(event.id)}>
                Leave Event
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => onJoin?.(event)}>
                Join Event
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
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "1.5rem 0" }} />

          <EventDiscussion eventId={event.id} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}