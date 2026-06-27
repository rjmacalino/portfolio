// Service Worker for Pomodoro Timer background notifications
//
// IMPORTANT LIMITATION: setTimeout inside a SW is not guaranteed to fire when
// the SW goes idle (browser can suspend it). This is best-effort — works reliably
// when the tab is just closed but browser is still open. For true background
// notifications when the browser is fully closed, you'd need the Web Push API
// with a server, which is out of scope here.
// The in-app "missed session" banner on page reload is the reliable fallback.

let scheduledTimeoutId = null;

self.addEventListener('install', () => {
  // take control immediately without waiting for old SW to go away
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'CANCEL_NOTIFICATION') {
    if (scheduledTimeoutId !== null) {
      clearTimeout(scheduledTimeoutId);
      scheduledTimeoutId = null;
    }
    return;
  }

  if (data.type === 'SCHEDULE_NOTIFICATION') {
    // clear any previous one first
    if (scheduledTimeoutId !== null) {
      clearTimeout(scheduledTimeoutId);
      scheduledTimeoutId = null;
    }

    const delay = data.endTimestamp - Date.now();
    if (delay <= 0) return; // already passed, nothing to schedule

    scheduledTimeoutId = setTimeout(() => {
      const isFocus = data.mode === 'focus';
      const title = isFocus ? '✅ Focus session complete!' : '☕ Break time is over!';
      const body = isFocus ? "Nice work. Time for a quick break." : "Ready for the next focus session?";

      self.registration.showNotification(title, {
        body,
        tag: 'pomodoro-timer', // replaces previous notification if still visible
        icon: '/favicon.ico',
      });

      scheduledTimeoutId = null;
    }, delay);
  }
});
