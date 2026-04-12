// ============================================================================
// AEGIS SUITE - PUSH NOTIFICATIONS
// File: packages/core/src/lib/push-notifications.ts
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  actions?: Array<{
    action: string;
    title: string;
  }>;
  tag?: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// CLIENT-SIDE HELPERS
// ============================================================================

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

export async function subscribeToPush(
  publicVapidKey: string
): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });

    return subscription;
  } catch {
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;
    return await subscription.unsubscribe();
  } catch {
    return false;
  }
}

// ============================================================================
// SERVER-SIDE — send push notification via web-push
// ============================================================================

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<boolean> {
  // Dynamic import so this module doesn't break on the client
  const webpush = await import('web-push');

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT ?? 'mailto:support@aegisbeauty.app';

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error('[push] VAPID keys not configured');
    return false;
  }

  webpush.default.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const pushPayload: PushPayload = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    ...payload,
  };

  try {
    await webpush.default.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth_key,
        },
      },
      JSON.stringify(pushPayload)
    );
    return true;
  } catch (err) {
    console.error('[push] send failed:', err);
    return false;
  }
}

// ============================================================================
// INTERNAL UTIL
// ============================================================================

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    arr[i] = rawData.charCodeAt(i);
  }
  return buffer;
}
