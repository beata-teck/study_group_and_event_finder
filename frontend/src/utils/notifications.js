// src/utils/notifications.js

// Check for upcoming events and schedule reminders
export function scheduleEventReminders(events, joinedEvents, onReminder) {
  if (!onReminder) return;

  // Clear existing reminders
  const reminderKeys = Object.keys(localStorage).filter(key => key.startsWith('reminder-'));
  reminderKeys.forEach(key => {
    const reminderId = localStorage.getItem(key);
    if (reminderId) {
      clearTimeout(parseInt(reminderId));
    }
    localStorage.removeItem(key);
  });

  const now = new Date();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds

  joinedEvents.forEach(event => {
    if (!event.date) return;

    try {
      const eventDate = new Date(event.date);
      if (event.time) {
        const [hours, minutes] = event.time.split(':').map(Number);
        eventDate.setHours(hours, minutes, 0, 0);
      } else {
        eventDate.setHours(12, 0, 0, 0); // Default to noon if no time
      }

      const timeUntilEvent = eventDate.getTime() - now.getTime();

      // Schedule reminder 1 day before
      if (timeUntilEvent > oneDay && timeUntilEvent <= oneDay * 2) {
        const reminderTime = timeUntilEvent - oneDay;
        if (reminderTime > 0) {
          const timeoutId = setTimeout(() => {
            onReminder({
              title: "Event Reminder",
              message: `${event.title} is happening tomorrow!`,
              variant: "info",
              event: event
            });
          }, reminderTime);
          localStorage.setItem(`reminder-${event.id}-1day`, timeoutId.toString());
        }
      }

      // Schedule reminder 1 hour before
      if (timeUntilEvent > oneHour && timeUntilEvent <= oneHour * 2) {
        const reminderTime = timeUntilEvent - oneHour;
        if (reminderTime > 0) {
          const timeoutId = setTimeout(() => {
            onReminder({
              title: "Event Starting Soon",
              message: `${event.title} starts in 1 hour!`,
              variant: "warning",
              event: event
            });
          }, reminderTime);
          localStorage.setItem(`reminder-${event.id}-1hour`, timeoutId.toString());
        }
      }

      // Schedule reminder 15 minutes before
      const fifteenMinutes = 15 * 60 * 1000;
      if (timeUntilEvent > fifteenMinutes && timeUntilEvent <= fifteenMinutes * 2) {
        const reminderTime = timeUntilEvent - fifteenMinutes;
        if (reminderTime > 0) {
          const timeoutId = setTimeout(() => {
            onReminder({
              title: "Event Starting Soon",
              message: `${event.title} starts in 15 minutes!`,
              variant: "warning",
              event: event
            });
          }, reminderTime);
          localStorage.setItem(`reminder-${event.id}-15min`, timeoutId.toString());
        }
      }
    } catch (error) {
      console.error('Error scheduling reminder for event:', event.id, error);
    }
  });
}

// Get upcoming events for dashboard notifications
export function getUpcomingEvents(joinedEvents, daysAhead = 7) {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return joinedEvents.filter(event => {
    if (!event.date) return false;
    try {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= futureDate;
    } catch {
      return false;
    }
  }).sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
}