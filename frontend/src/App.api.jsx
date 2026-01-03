// App.jsx with API Integration
// This version uses the backend API instead of localStorage
// Replace App.jsx with this file when ready to use the backend

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import EventList from "./components/EventList";
import MyEvents from "./components/MyEvents";
import EventFilter from "./components/EventFilter";
import CalendarView from "./components/CalanderVeiw"; 
import CreateEventModal from "./components/CreateEventModal";
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal";
import EventDetailModal from "./components/EventDetailModal";
import NotificationCenter from "./components/NotificationCenter";
import { useToast } from "./components/Toaster.jsx";
import EventCard from "./components/EventCard";
import { scheduleEventReminders } from "./utils/notifications";
import * as API from "./services/api";

function App() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [showCreate, setShowCreate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  
  // Data state
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const toast = useToast();

  // Apply theme
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
    loadEvents();
  }, []);

  // Load joined events when user changes
  useEffect(() => {
    if (currentUser) {
      loadJoinedEvents();
    } else {
      setJoinedEvents([]);
    }
  }, [currentUser]);

  // Schedule reminders when joined events change
  useEffect(() => {
    if (joinedEvents.length > 0 && toast) {
      scheduleEventReminders(events, joinedEvents, (reminder) => {
        toast.show(reminder);
      });
    }
  }, [joinedEvents, events, toast]);

  // Check authentication
  const checkAuth = async () => {
    try {
      const response = await API.authAPI.getCurrentUser();
      if (response.success && response.data) {
        setCurrentUser(response.data);
      }
    } catch (error) {
      // Not logged in
      setCurrentUser(null);
    }
  };

  // Load events
  const loadEvents = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (searchQuery) filters.search = searchQuery;
      
      const response = await API.eventsAPI.getAll(filters);
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (error) {
      toast?.show({ title: "Error", message: "Failed to load events", variant: "error" });
      console.error("Load events error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load joined events
  const loadJoinedEvents = async () => {
    try {
      const response = await API.joinedEventsAPI.getJoined(false);
      if (response.success) {
        setJoinedEvents(response.data || []);
      }
    } catch (error) {
      console.error("Load joined events error:", error);
    }
  };

  // Reload events when filters change
  useEffect(() => {
    loadEvents();
  }, [selectedCategory, searchQuery]);

  // Authentication handlers
  const handleLogin = async (credentials) => {
    try {
      const response = await API.authAPI.login(credentials);
      if (response.success) {
        setCurrentUser(response.data);
        setShowAuth(false);
        toast?.show({ title: "Login successful", message: `Welcome back, ${response.data.name}!`, variant: "success" });
        loadJoinedEvents();
      }
    } catch (error) {
      toast?.show({ title: "Login failed", message: error.message || "Invalid email or password", variant: "error" });
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await API.authAPI.register(userData);
      if (response.success) {
        setCurrentUser(response.data);
        setShowAuth(false);
        toast?.show({ title: "Registration successful", message: `Welcome, ${response.data.name}!`, variant: "success" });
      }
    } catch (error) {
      toast?.show({ title: "Registration failed", message: error.message || "Registration failed", variant: "error" });
    }
  };

  const handleLogout = async () => {
    try {
      await API.authAPI.logout();
      setCurrentUser(null);
      setJoinedEvents([]);
      setShowProfile(false);
      toast?.show({ title: "Logged out", message: "You have been logged out", variant: "info" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSaveProfile = async (profileData) => {
    try {
      const response = await API.usersAPI.updateProfile(profileData);
      if (response.success) {
        setCurrentUser(response.data);
        setShowProfile(false);
        toast?.show({ title: "Profile updated", message: "Your profile has been updated", variant: "success" });
      }
    } catch (error) {
      toast?.show({ title: "Update failed", message: error.message || "Failed to update profile", variant: "error" });
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await API.usersAPI.deleteAccount();
      setCurrentUser(null);
      setJoinedEvents([]);
      setShowProfile(false);
      toast?.show({ title: "Account deleted", message: "Your account has been deleted", variant: "info" });
    } catch (error) {
      toast?.show({ title: "Delete failed", message: error.message || "Failed to delete account", variant: "error" });
    }
  };

  // Event handlers
  const handleJoin = async (event) => {
    if (!currentUser) {
      setShowAuth(true);
      return;
    }

    try {
      const response = await API.joinedEventsAPI.join(event.id);
      if (response.success) {
        setJoinedEvents((prev) => [...prev, response.data]);
        toast?.show({ title: "Joined", message: event.title, variant: "success" });
        loadEvents(); // Reload to update join counts
      }
    } catch (error) {
      toast?.show({ title: "Error", message: error.message || "Failed to join event", variant: "error" });
    }
  };

  const handleLeave = async (id) => {
    try {
      const response = await API.joinedEventsAPI.leave(id);
      if (response.success) {
        setJoinedEvents((prev) => prev.filter((e) => e.id !== id));
        toast?.show({ title: "Left event", message: "You have left the event", variant: "info" });
        loadEvents(); // Reload to update join counts
      }
    } catch (error) {
      toast?.show({ title: "Error", message: error.message || "Failed to leave event", variant: "error" });
    }
  };

  const handleSaveCustom = async (ev) => {
    try {
      const isEdit = ev.id && events.some((e) => e.id === ev.id);
      
      let response;
      if (isEdit) {
        response = await API.eventsAPI.update(ev.id, ev);
      } else {
        response = await API.eventsAPI.create(ev);
      }
      
      if (response.success) {
        loadEvents();
        setShowCreate(false);
        toast?.show({ 
          title: isEdit ? "Event updated" : "Event created", 
          message: ev.title, 
          variant: "success" 
        });
      }
    } catch (error) {
      toast?.show({ title: "Error", message: error.message || "Failed to save event", variant: "error" });
    }
  };

  const handleDeleteCustom = async (id) => {
    if (!confirm("Delete this event?")) return;
    
    try {
      const response = await API.eventsAPI.delete(id);
      if (response.success) {
        loadEvents();
        setShowCreate(false);
        toast?.show({ title: "Event deleted", message: "Event has been deleted", variant: "error" });
      }
    } catch (error) {
      toast?.show({ title: "Error", message: error.message || "Failed to delete event", variant: "error" });
    }
  };

  // Filter events
  const now = new Date();
  const upcomingEvents = events.filter((e) => {
    if (!e.date) return true;
    try {
      const eventDate = new Date(e.date);
      return eventDate >= now;
    } catch {
      return true;
    }
  });

  const pastEvents = events.filter((e) => {
    if (!e.date) return false;
    try {
      const eventDate = new Date(e.date);
      return eventDate < now;
    } catch {
      return false;
    }
  });

  const eventsToFilter = showPastEvents ? pastEvents : upcomingEvents;
  const filteredEvents = eventsToFilter.filter((e) => {
    const matchesCategory = selectedCategory ? e.category === selectedCategory : true;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q
      ? [e.title, e.subject, e.location, e.category]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      : true;
    return matchesCategory && matchesSearch;
  });

  // Separate joined events
  const upcomingJoinedEvents = joinedEvents.filter((e) => {
    if (!e.date) return true;
    try {
      const eventDate = new Date(e.date);
      return eventDate >= now;
    } catch {
      return true;
    }
  });

  const pastJoinedEvents = joinedEvents.filter((e) => {
    if (!e.date) return false;
    try {
      const eventDate = new Date(e.date);
      return eventDate < now;
    } catch {
      return false;
    }
  });

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const goToCalendar = () => {
    const el = document.getElementById("calendar-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Get join count (from events data)
  const getJoinCount = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    return event?.join_count || 0;
  };

  return (
    <div>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <span className="brand-badge" />
            <span>Study Finder</span>
          </div>
          <div>
            {currentUser ? (
              <>
                <span style={{ marginRight: "0.75rem" }}>
                  Hello, <strong>{currentUser.name}</strong>
                </span>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowProfile(true)}
                  style={{ marginRight: "0.5rem" }}
                >
                  Profile
                </button>
              </>
            ) : (
              <button
                className="btn btn-ghost"
                onClick={() => setShowAuth(true)}
                style={{ marginRight: "0.5rem" }}
              >
                Login / Register
              </button>
            )}
            <NotificationCenter
              joinedEvents={joinedEvents}
              onEventClick={(event) => setSelectedEvent(event)}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!currentUser) {
                  setShowAuth(true);
                } else {
                  setShowCreate(true);
                }
              }}
              aria-label="Create event"
              title="Create event"
              style={{ marginRight: "0.5rem" }}
            >
              + Create Event
            </button>
            <button
              className="btn btn-ghost"
              onClick={goToCalendar}
              aria-label="Go to calendar"
              title="Calendar"
              style={{ marginRight: "0.5rem" }}
            >
              📅 Calendar
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
          </div>
        </div>
      </div>

      <Header />

      <main>
        <div className="container">
          <section>
            <h2 className="section-title">Trending this week</h2>
            <p className="section-subtitle">Most joined recently</p>
            {loading ? (
              <p className="section-subtitle">Loading...</p>
            ) : (
              <div className="grid-list">
                {upcomingEvents
                  .map((e) => ({ e, c: getJoinCount(e.id) }))
                  .sort((a, b) => b.c - a.c)
                  .slice(0, 5)
                  .map(({ e }) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      onJoin={handleJoin}
                      isJoined={joinedEvents.some((j) => j.id === e.id)}
                      onViewDetails={(ev) => setSelectedEvent(ev)}
                    />
                  ))}
              </div>
            )}
          </section>
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h2 className="section-title">
                  {showPastEvents ? "Past Events" : "Upcoming Events"}
                </h2>
                <p className="section-subtitle">
                  {showPastEvents
                    ? "Browse events you've attended or missed."
                    : "Browse and join sessions that fit your schedule."}
                </p>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowPastEvents(!showPastEvents);
                  clearFilters();
                }}
              >
                {showPastEvents ? "Show Upcoming" : "Show Past Events"}
              </button>
            </div>
            <EventFilter
              selectedCategory={selectedCategory}
              onFilterChange={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearAll={clearFilters}
            />
            {loading ? (
              <p className="section-subtitle">Loading events...</p>
            ) : (
              <EventList
                events={filteredEvents}
                onJoin={handleJoin}
                onEdit={(ev) => setShowCreate(ev)}
                onDelete={handleDeleteCustom}
                joinedEvents={joinedEvents}
                onViewDetails={(ev) => setSelectedEvent(ev)}
              />
            )}
          </section>

          {currentUser && (
            <section>
              <h2 className="section-title">My Events</h2>
              <p className="section-subtitle">Your joined events and groups.</p>
              <div style={{ marginBottom: "1rem" }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowPastEvents(false)}
                  style={{ marginRight: "0.5rem" }}
                >
                  Upcoming ({upcomingJoinedEvents.length})
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowPastEvents(true)}
                >
                  Past ({pastJoinedEvents.length})
                </button>
              </div>
              <MyEvents
                joinedEvents={showPastEvents ? pastJoinedEvents : upcomingJoinedEvents}
                onRemove={handleLeave}
                onRemoveAll={() => {
                  // Leave all events
                  const eventsToLeave = showPastEvents ? pastJoinedEvents : upcomingJoinedEvents;
                  eventsToLeave.forEach((e) => handleLeave(e.id));
                }}
                onViewDetails={(ev) => setSelectedEvent(ev)}
              />
            </section>
          )}

          <section id="calendar-section">
            <h2 className="section-title">Calendar View</h2>
            <p className="section-subtitle">See events across the month at a glance.</p>
            <CalendarView
              events={events}
              joinedEvents={joinedEvents}
              onJoin={handleJoin}
              onLeave={handleLeave}
            />
          </section>
        </div>
      </main>

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onSave={handleSaveCustom}
          initialEvent={typeof showCreate === 'object' ? showCreate : undefined}
          onDelete={(id) => {
            handleDeleteCustom(id);
            setShowCreate(false);
          }}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      {showProfile && currentUser && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          user={currentUser}
          onSave={handleSaveProfile}
          onDelete={handleDeleteProfile}
          onLogout={handleLogout}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onJoin={handleJoin}
          onLeave={handleLeave}
          isJoined={joinedEvents.some((j) => j.id === selectedEvent.id)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

export default App;