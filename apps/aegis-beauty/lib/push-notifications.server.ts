// ============================================================================
// AEGIS SUITE - PUSH NOTIFICATIONS (server-only)
// File: packages/core/src/lib/push-notifications.server.ts
// Contains web-push which requires Node.js — never import on client.
// ============================================================================

import webpush from 'web-push';
import type { PushSubscriptionData, PushPayload } from '@aegis/core';

export type { PushSubscriptionData, PushPayload };

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<boolean> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT ?? 'mailto:support@aegisbeauty.app';

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error('[push] VAPID keys not configured');
    return false;
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const fullPayload: PushPayload = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    ...payload,
  };

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth_key,
        },
      },
      JSON.stringify(fullPayload)
    );
    return true;
  } catch (err) {
    console.error('[push] send failed:', err);
    return false;
  }
}
