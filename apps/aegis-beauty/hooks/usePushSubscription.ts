'use client';

// ============================================================================
// AEGIS BEAUTY - usePushSubscription
// Requests push permission and saves subscription to backend.
// Call once from an authenticated layout (dashboard or customer).
// ============================================================================

import { useEffect } from 'react';
import { subscribeToPush, isPushSupported } from '@aegis/core';

export function usePushSubscription() {
  useEffect(() => {
    if (!isPushSupported()) return;

    // Only request permission when running as installed PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (!isStandalone) return;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    // On iOS with default permission, NotificationPrompt handles the UX
    // (shows a custom banner before triggering the native dialog).
    // Avoid racing with it by exiting early here.
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos && Notification.permission === 'default') return;

    // Delay so it doesn't fire on every page mount simultaneously
    const t = setTimeout(async () => {
      // If permission is already granted and a subscription exists, just
      // re-register it with the backend (handles token rotation / new devices).
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();

      if (Notification.permission === 'granted' && existing) {
        // Subscription already live — re-upsert silently to keep DB in sync
        const key = existing.getKey('p256dh');
        const auth = existing.getKey('auth');
        if (!key || !auth) return;
        const p256dh = btoa(String.fromCharCode(...new Uint8Array(key)));
        const authKey = btoa(String.fromCharCode(...new Uint8Array(auth)));
        try {
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: existing.endpoint, p256dh, auth_key: authKey }),
          });
        } catch {
          // Silent fail
        }
        return;
      }

      // Permission not yet granted (Android/desktop standalone): request it
      const subscription = await subscribeToPush(vapidKey);
      if (!subscription) return;

      const key = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');
      if (!key || !auth) return;

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(key)));
      const authKey = btoa(String.fromCharCode(...new Uint8Array(auth)));

      try {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint, p256dh, auth_key: authKey }),
        });
      } catch {
        // Silent fail — will retry next session
      }
    }, 3000);

    return () => clearTimeout(t);
  }, []);
}
