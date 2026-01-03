// src/components/NotificationCenter.jsx
import React, { useState, useEffect } from "react";
import { getUpcomingEvents } from "../utils/notifications";

export default function NotificationCenter({ joinedEvents, onEventClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const events = getUpcomingEvents(joinedEvents, 7);
    setUpcomingEvents(events);
  }, [joinedEvents]);

  const unreadCount = upcomingEvents.length;

  if (unreadCount === 0 && !isOpen) {
    return null;
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn btn-ghost"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        style={{ position: "relative" }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "var(--danger)",
              color: "white",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "0.5rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              minWidth: "300px",
              maxWidth: "400px",
              maxHeight: "500px",
              overflowY: "auto",
              zIndex: 1001,
            }}
          >
            <div
              style={{
                padding: "1rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h4 style={{ margin: 0 }}>Upcoming Events</h4>
              <button
                className="btn btn-ghost"
                onClick={() => setIsOpen(false)}
                style={{ padding: "0.25rem 0.5rem" }}
              >
                ✕
              </button>
            </div>
            <div>
              {upcomingEvents.length === 0 ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>
                  No upcoming events
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const daysUntil = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div
                      key={event.id}
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        onEventClick?.(event);
                        setIsOpen(false);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--surface)";
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                        {event.title}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                        {eventDate.toLocaleDateString()} {event.time && `at ${event.time}`}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                        {daysUntil === 0
                          ? "Today"
                          : daysUntil === 1
                          ? "Tomorrow"
                          : `In ${daysUntil} days`}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}