'use client';

// ============================================================================
// AEGIS SUITE - NOTIFICATION PROMPT (iOS PWA)
// Custom banner to request push permission on iOS standalone.
// On Android/desktop the browser shows its own dialog; on iOS we show ours.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';

function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return buffer;
}

async function subscribeToPush(publicVapidKey: string): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToArrayBuffer(publicVapidKey),
    });
  } catch {
    return null;
  }
}

const DISMISSED_KEY = 'aegis_notif_prompt_dismissed_at';
const SUBSCRIBED_KEY = 'aegis_push_subscribed';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

interface NotificationPromptProps {
  vapidKey?: string;
}

export function NotificationPrompt({ vapidKey }: NotificationPromptProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOS()) return;
    if (!isStandalone()) return;
    if (!isPushSupported()) return;
    if (sessionStorage.getItem(SUBSCRIBED_KEY) === 'true') return;
    if (Notification.permission !== 'default') return;

    const dismissedAt = parseInt(localStorage.getItem(DISMISSED_KEY) ?? '0', 10);
    if (dismissedAt && Date.now() - dismissedAt < COOLDOWN_MS) return;

    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  }, []);

  const handleActivate = useCallback(async () => {
    setVisible(false);
    const key = vapidKey ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!key) return;

    const subscription = await subscribeToPush(key);
    if (!subscription) return;

    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');
    if (!p256dhKey || !authKey) return;

    const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
    const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));

    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint, p256dh, auth_key: auth }),
      });
      sessionStorage.setItem(SUBSCRIBED_KEY, 'true');
    } catch {
      // silent fail
    }
  }, [vapidKey]);

  const prompt = (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          style={{ zIndex: 9999 }}
          className="fixed bottom-0 left-0 right-0 rounded-t-3xl backdrop-blur-3xl bg-white/10 border border-white/20 shadow-2xl shadow-purple-900/40"
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold text-sm flex-1">
                Attiva le notifiche
              </span>
              <button
                onClick={dismiss}
                className="text-white/50 hover:text-white/80 transition-colors p-1 -mr-1"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <p className="text-white/75 text-sm leading-relaxed mb-4">
              Ricevi promemoria automatici prima dei tuoi appuntamenti e non dimenticartene mai.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={dismiss}
                className="text-white/50 text-sm hover:text-white/70 transition-colors flex-1 text-left"
              >
                Non ora
              </button>
              <button
                onClick={handleActivate}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Bell className="w-4 h-4" />
                Attiva
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(prompt, document.body);
}
