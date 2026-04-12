'use client';

// ============================================================================
// AEGIS BEAUTY - usePushSubscription
// Requests push permission and saves subscription to backend.
// Call once from an authenticated layout (dashboard or customer).
// ============================================================================

import { useEffect } from 'react';
import { subscribeToPush, isPushSupported } from '@aegis/core';

const STORAGE_KEY = 'aegis_push_subscribed';

export function usePushSubscription() {
  useEffect(() => {
    if (!isPushSupported()) return;

    // Don't ask again if already subscribed this session
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') return;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    // Delay so it doesn't fire on every page mount simultaneously
    const t = setTimeout(async () => {
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
        sessionStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // Silent fail — will retry next session
      }
    }, 3000);

    return () => clearTimeout(t);
  }, []);
}
