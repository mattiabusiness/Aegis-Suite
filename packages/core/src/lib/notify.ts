// ============================================================================
// AEGIS SUITE - UNIFIED NOTIFY
// File: packages/core/src/lib/notify.ts
// Sends push notification; falls back to email for clients.
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { sendPushNotification } from './push-notifications';
import type { PushPayload, PushSubscriptionData } from './push-notifications';
import { sendReminderEmail, sendReminderHourEmail } from './email';
import type { EmailFallbackData } from './email';

export type { EmailFallbackData };

// ============================================================================
// HELPERS
// ============================================================================

async function getPushSubscription(
  userId: string,
  supabase: SupabaseClient
): Promise<PushSubscriptionData | null> {
  const { data } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth_key')
    .eq('user_id', userId)
    .limit(1)
    .single();

  return data ?? null;
}

// ============================================================================
// MAIN
// ============================================================================

export async function notify(
  userId: string,
  payload: PushPayload,
  supabase: SupabaseClient,
  emailFallback?: EmailFallbackData
): Promise<void> {
  const subscription = await getPushSubscription(userId, supabase);

  if (subscription) {
    const success = await sendPushNotification(subscription, payload);
    if (success) return;
  }

  // No subscription or push failed — try email fallback (clients only)
  if (!emailFallback) return;

  if (emailFallback.type === 'reminder_24h') {
    await sendReminderEmail(emailFallback.to, emailFallback.toName, emailFallback.data);
  } else if (emailFallback.type === 'reminder_1h') {
    await sendReminderHourEmail(emailFallback.to, emailFallback.toName, emailFallback.data);
  }
}
