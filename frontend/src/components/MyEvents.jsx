import React from "react";
import EventCard from "./EventCard";

function sortByUpcoming(events) {
  return [...events].sort((a, b) => {
    const ad = new Date(a.date).getTime();
    const bd = new Date(b.date).getTime();
    if (isNaN(ad) && isNaN(bd)) return 0;
    if (isNaN(ad)) return 1;
    if (isNaN(bd)) return -1;
    return ad - bd;
  });
}

export default function MyEvents({ joinedEvents = [], onRemove, onRemoveAll, onViewDetails }) {
  if (!joinedEvents || joinedEvents.length === 0) {
    return <p className="section-subtitle">You haven't joined any events yet.</p>;
  }

  const sorted = sortByUpcoming(joinedEvents);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <p className="section-subtitle" style={{ margin: 0 }}>{sorted.length} joined</p>
        {onRemoveAll && (
          <button className="btn btn-ghost" onClick={onRemoveAll} type="button">Leave all</button>
        )}
      </div>
      <div className="grid-list">
        {sorted.map((ev) => (
          <EventCard key={ev.id} event={ev} isJoined onRemove={onRemove} onViewDetails={onViewDetails} />
        ))}
      </div>
    </>
  );
}