
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import EventList from "./components/EventList";
import MyEvents from "./components/MyEvents";
import EventFilter from "./components/EventFilter";
import eventsData from "./data/events.json";
import CalendarView from "./components/CalanderVeiw"; 
import CreateEventModal from "./components/CreateEventModal";
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal";
import EventDetailModal from "./components/EventDetailModal";
import NotificationCenter from "./components/NotificationCenter";
import { useToast } from "./components/Toaster.jsx";
import EventCard from "./components/EventCard";
import { scheduleEventReminders } from "./utils/notifications";

function App() {
  // Joined events persisted in localStorage
  const [joinedEvents, setJoinedEvents] = useState(() => {
    const saved = localStorage.getItem("joinedEvents");
    return saved ? JSON.parse(saved) : [];
  });

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Theme persisted in localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [showCreate, setShowCreate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  
  // User authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });
  
  const toast = useToast();
  const [customEvents, setCustomEvents] = useState(() => {
    const saved = localStorage.getItem("customEvents");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist joined events
  useEffect(() => {
    localStorage.setItem("joinedEvents", JSON.stringify(joinedEvents));
  }, [joinedEvents]);

  // Apply and persist theme
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Persist custom events
  useEffect(() => {
    localStorage.setItem("customEvents", JSON.stringify(customEvents));
  }, [customEvents]);

  // Persist current user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  // Join event (expects full event object)
  const handleJoin = (event) => {
    if (!joinedEvents.find((e) => e.id === event.id)) {
      setJoinedEvents((prev) => [...prev, event]);
      incrementJoinCount(event.id);
      const undo = () => setJoinedEvents((prev) => prev.filter((e) => e.id !== event.id));
      toast?.show({ title: "Joined", message: event.title, actionLabel: "Undo", onAction: undo, variant: "success" });
    }
  };

  // Leave/remove event (by id)
  const handleLeave = (id) => {
    setJoinedEvents((prev) => prev.filter((e) => e.id !== id));
    toast?.show({ title: "Left event", message: String(id), variant: "info" });
  };

  const incrementJoinCount = (eventId) => {
    try {
      const counts = JSON.parse(localStorage.getItem('joinCounts') || '{}');
      counts[eventId] = (counts[eventId] || 0) + 1;
      localStorage.setItem('joinCounts', JSON.stringify(counts));
    } catch {}
  };

  const getJoinCount = (eventId) => {
    try {
      const counts = JSON.parse(localStorage.getItem('joinCounts') || '{}');
      return counts[eventId] || 0;
    } catch { return 0 }
  };

  const allEvents = [...eventsData, ...customEvents];

  // Schedule event reminders
  useEffect(() => {
    if (joinedEvents.length > 0 && toast) {
      scheduleEventReminders(allEvents, joinedEvents, (reminder) => {
        toast.show(reminder);
      });
    }
  }, [joinedEvents, allEvents, toast]);

  // Separate past and upcoming events
  const now = new Date();
  const upcomingEvents = allEvents.filter((e) => {
    if (!e.date) return true;
    try {
      const eventDate = new Date(e.date);
      return eventDate >= now;
    } catch {
      return true;
    }
  });

  const pastEvents = allEvents.filter((e) => {
    if (!e.date) return false;
    try {
      const eventDate = new Date(e.date);
      return eventDate < now;
    } catch {
      return false;
    }
  });

  // Filter events by category and search
  const eventsToFilter = showPastEvents ? pastEvents : upcomingEvents;
  const filteredEvents = (eventsToFilter || []).filter((e) => {
    const matchesCategory = selectedCategory ? e.category === selectedCategory : true;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q
      ? [e.title, e.subject, e.location, e.category]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      : true;
    return matchesCategory && matchesSearch;
  });

  // Separate joined events into upcoming and past
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

  const handleSaveCustom = (ev) => {
    setCustomEvents((prev) => {
      const exists = prev.some((p) => p.id === ev.id);
      return exists ? prev.map((p) => (p.id === ev.id ? ev : p)) : [...prev, ev];
    });
  };

  const handleDeleteCustom = (id) => {
    if (!confirm("Delete this event?")) return;
    setCustomEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const goToCalendar = () => {
    const el = document.getElementById("calendar-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Authentication handlers
  const handleLogin = (credentials) => {
    // In a real app, this would call an API
    // For now, we'll check localStorage for registered users
    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const user = users.find((u) => u.email === credentials.email && u.password === credentials.password);
    
    if (user) {
      setCurrentUser({ ...user, password: undefined }); // Don't store password in state
      setShowAuth(false);
      toast?.show({ title: "Login successful", message: `Welcome back, ${user.name}!`, variant: "success" });
    } else {
      toast?.show({ title: "Login failed", message: "Invalid email or password", variant: "error" });
    }
  };

  const handleRegister = (userData) => {
    // In a real app, this would call an API
    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    
    if (users.find((u) => u.email === userData.email)) {
      toast?.show({ title: "Registration failed", message: "Email already registered", variant: "error" });
      return;
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    
    setCurrentUser({ ...newUser, password: undefined });
    setShowAuth(false);
    toast?.show({ title: "Registration successful", message: `Welcome, ${newUser.name}!`, variant: "success" });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowProfile(false);
    toast?.show({ title: "Logged out", message: "You have been logged out", variant: "info" });
  };

  const handleSaveProfile = (profileData) => {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, ...profileData } : u
    );
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
    
    setCurrentUser({ ...currentUser, ...profileData });
    setShowProfile(false);
    toast?.show({ title: "Profile updated", message: "Your profile has been updated", variant: "success" });
  };

  const handleDeleteProfile = () => {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const updatedUsers = users.filter((u) => u.id !== currentUser.id);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
    
    setCurrentUser(null);
    setShowProfile(false);
    setJoinedEvents([]);
    toast?.show({ title: "Account deleted", message: "Your account has been deleted", variant: "info" });
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
              onClick={() => setShowCreate(true)}
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
            <EventList
              events={filteredEvents}
              onJoin={handleJoin}
              onEdit={(ev) => setShowCreate(ev)}
              onDelete={handleDeleteCustom}
              joinedEvents={joinedEvents}
              onViewDetails={(ev) => setSelectedEvent(ev)}
            />
          </section>

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
                if (showPastEvents) {
                  setJoinedEvents(upcomingJoinedEvents);
                } else {
                  setJoinedEvents(pastJoinedEvents);
                }
              }}
              onViewDetails={(ev) => setSelectedEvent(ev)}
            />
          </section>

          <section id="calendar-section">
            <h2 className="section-title">Calendar View</h2>
            <p className="section-subtitle">See events across the month at a glance.</p>
            <CalendarView
              events={allEvents}
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
          onSave={(ev) => {
            const isEdit = customEvents.some((c) => c.id === ev.id);
            handleSaveCustom(ev);
            setShowCreate(false);
            toast?.show({ title: isEdit ? "Event updated" : "Event created", message: ev.title, variant: "success" });
          }}
          initialEvent={typeof showCreate === 'object' ? showCreate : undefined}
          onDelete={(id) => {
            handleDeleteCustom(id);
            setShowCreate(false);
            toast?.show({ title: "Event deleted", message: String(id), variant: "error" });
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
