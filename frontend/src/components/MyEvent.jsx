// src/components/MyEvents.jsx
import React from "react";
import EventCard from "./EventCard";

function MyEvents({ joinedEvents, onRemove }) {
  if (joinedEvents.length === 0) {
    return <p>You haven’t joined any events yet.</p>;
  }

  return (
    <div className="my-events">
      {joinedEvents.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          onRemove={onRemove} 
          isJoined={true} 
        />
      ))}
    </div>
  );
}

export default MyEvents;