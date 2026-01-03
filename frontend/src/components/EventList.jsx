import React from "react";
import EventCard from "./EventCard";

export default function EventList({ events = [], onJoin, onEdit, onDelete, joinedEvents = [], onViewDetails }) {
  if (!events || events.length === 0) {
    return <p className="section-subtitle">No events found.</p>;
  }

  return (
    <div className="grid-list">
      {events.map((ev) => {
        const isJoined = joinedEvents.some((j) => j.id === ev.id);
        return (
          <EventCard
            key={ev.id}
            event={ev}
            onJoin={onJoin}
            onEdit={onEdit}
            onDelete={onDelete}
            isJoined={isJoined}
            onViewDetails={onViewDetails}
          />
        );
      })}
    </div>
  );
}