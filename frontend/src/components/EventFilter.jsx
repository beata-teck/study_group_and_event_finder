// src/components/EventFilter.jsx
import React from "react";
import eventsData from "../data/events.json";

function EventFilter({ selectedCategory, onFilterChange, searchQuery = "", onSearchChange, onClearAll }) {
  const categories = Array.from(
    new Set((eventsData || []).map((e) => e.category).filter(Boolean))
  );

  return (
    <div className="filter-bar">
      <h3>Filter by Category</h3>
      <div className="filter-section">
        <input
          type="search"
          placeholder="Search by title, subject, location..."
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          aria-label="Search events"
          style={{ width: "100%", padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
        />
      </div>
      <div className="filter-section">
        <label style={{ marginRight: "0.5rem" }}>Category:</label>
        <select
          value={selectedCategory || ""}
          onChange={(e) =>
            onFilterChange(
              e.target.value === "" ? null : e.target.value
            )
          }
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-section" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        {categories.map((c) => (
          <button
            key={c}
            className={`btn ${selectedCategory === c ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onFilterChange && onFilterChange(c)}
            type="button"
          >
            {c}
          </button>
        ))}
        <button className="btn btn-ghost" onClick={onClearAll} type="button">Clear all</button>
      </div>
    </div>
  );
}

export default EventFilter;