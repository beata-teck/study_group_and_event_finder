
import React, { useState } from "react";

function CalendarView({ events, joinedEvents, onJoin, onLeave }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", {
    month: "long",
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const eventMap = {};
  events.forEach((event) => {
    const eventDate = new Date(event.date);
    if (
      eventDate.getFullYear() === currentYear &&
      eventDate.getMonth() === currentMonth
    ) {
      const day = eventDate.getDate();
      if (!eventMap[day]) eventMap[day] = [];
      eventMap[day].push(event);
    }
  });

  // Build calendar cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="empty"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      d === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();

    const hasEvents = eventMap[d];
    const hasJoined =
      hasEvents && hasEvents.some((e) => joinedEvents.some((je) => je.id === e.id));

    const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    cells.push(
      <div
        key={d}
        className={`day 
          ${hasEvents ? "has-event" : ""} 
          ${isToday ? "today" : ""} 
          ${isWeekend ? "weekend" : ""}
          ${hasJoined ? "joined-day" : ""}`}
        onClick={() => hasEvents && setSelectedDay({ day: d, events: hasEvents })}
      >
        <span className="date">{d}</span>
        {hasEvents && (
          <ul className="event-list">
            {hasEvents.map((e) => (
              <li key={e.id}>{e.title}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Navigation handlers
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="btn btn-ghost" onClick={prevMonth} aria-label="Previous month">◀</button>
        <h2>{monthName} {currentYear}</h2>
        <button className="btn btn-ghost" onClick={nextMonth} aria-label="Next month">▶</button>
        <button className="btn btn-primary today-btn" onClick={goToToday}>Today</button>
        <div style={{ marginLeft: "auto", display: "inline-flex", gap: 6 }}>
          <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }).map((_, i) => (
              <option value={i} key={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <input
            type="number"
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            style={{ width: 90 }}
          />
        </div>
      </div>

      <div className="calendar-grid">
        <div className="day-name">Sun</div>
        <div className="day-name">Mon</div>
        <div className="day-name">Tue</div>
        <div className="day-name">Wed</div>
        <div className="day-name">Thu</div>
        <div className="day-name">Fri</div>
        <div className="day-name">Sat</div>
        {cells}
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted)' }}>
        <span className="chip">Legend:</span>
        <span className="chip">Weekend</span>
        <span className="chip">Has event</span>
        <span className="chip">Joined</span>
      </div>

      {selectedDay && (
        <div className="event-popup">
          <div className="popup-content">
            <h3>Events on {selectedDay.day} {monthName} {currentYear}</h3>
            <ul>
              {selectedDay.events.map((e) => {
                const isJoined = joinedEvents.some((je) => je.id === e.id);
                return (
                  <li key={e.id}>
                    <strong>{e.title}</strong><br />
                    {e.description || "No description"}<br />
                    {e.time && <em>{e.time}</em>}<br />
                    <div className="sticky-actions">
                      {isJoined ? (
                        <button className="btn btn-danger" onClick={() => onLeave(e.id)}>Leave</button>
                      ) : (
                        <button className="btn btn-primary" onClick={() => onJoin(e)}>Join</button>
                      )}
                    </div>
                    {e.custom && (
                      <>
                        {' '}
                        <button className="btn btn-ghost" onClick={() => setSelectedDay(null)}>Close</button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
            <button onClick={() => setSelectedDay(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;