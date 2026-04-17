/// <reference lib="webworker" />
// ============================================================================
// AEGIS BEAUTY - Custom Service Worker
// Handles push notifications and notification click events.
// Merged by @ducanh2912/next-pwa into the generated Workbox service worker.
// ============================================================================

// Cast self to ServiceWorkerGlobalScope so TypeScript resolves the correct types.
const sw = self as unknown as ServiceWorkerGlobalScope;

// ============================================================================
// PUSH EVENT — shows the notification on the device
// ============================================================================

sw.addEventListener('push', (event: PushEvent) => {
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
    sw.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? '/icons/icon-192x192.png',
      badge: data.badge ?? '/icons/icon-96x96.png',
      data: { url: data.url ?? '/' },
      actions: data.actions,
      tag: data.tag,
    } as unknown as NotificationOptions)
  );
});

// ============================================================================
// NOTIFICATION CLICK — opens/focuses the app on the correct URL
// ============================================================================

sw.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const url = (event.notification.data as { url?: string })?.url ?? '/';

  event.waitUntil(
    sw.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) {
            return (client as WindowClient).focus().then((c) => c.navigate(url));
          }
        }
        return sw.clients.openWindow(url);
      })
  );
});

// ============================================================================
// NOTIFICATION CLOSE — no-op, available for future analytics
// ============================================================================

sw.addEventListener('notificationclose', (_event: NotificationEvent) => {
  // no-op
});
