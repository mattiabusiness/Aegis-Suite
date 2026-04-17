/// <reference lib="webworker" />
// ============================================================================
// AEGIS BEAUTY - Custom Service Worker
// Handles push notifications and notification click events.
// Merged by @ducanh2912/next-pwa into the generated Workbox service worker.
// ============================================================================

// ============================================================================
// PUSH EVENT — shows the notification on the device
// ============================================================================

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json() as {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    actions?: Array<{ action: string; title: string }>;
    tag?: string;
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? '/icons/icon-192x192.png',
      badge: data.badge ?? '/icons/icon-96x96.png',
      data: { url: data.url ?? '/' },
      actions: data.actions,
      tag: data.tag,
    })
  );
});

// ============================================================================
// NOTIFICATION CLICK — opens/focuses the app on the correct URL
// ============================================================================

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const url = (event.notification.data as { url?: string })?.url ?? '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window if already open
        for (const client of clients) {
          if ('focus' in client) {
            return (client as WindowClient).focus().then((c) => c.navigate(url));
          }
        }
        // Otherwise open a new window
        return self.clients.openWindow(url);
      })
  );
});

// ============================================================================
// NOTIFICATION CLOSE — optional, for analytics/cleanup
// ============================================================================

self.addEventListener('notificationclose', (_event: NotificationEvent) => {
  // No-op for now — can be used for analytics
});
