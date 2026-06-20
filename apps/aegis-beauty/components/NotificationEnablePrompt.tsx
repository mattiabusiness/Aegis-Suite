'use client';

// ============================================================================
// AEGIS BEAUTY - NOTIFICATION ENABLE PROMPT (Android/desktop, post-booking)
// File: apps/aegis-beauty/components/NotificationEnablePrompt.tsx
//
// Banner "Abilita notifiche" mostrato sullo step finale della prenotazione.
// Solo NON-iOS: su iOS il push richiede la PWA installata, quindi lì si usa
// l'InstallPrompt. Su Android/desktop il push funziona da browser → qui chiediamo
// direttamente il permesso e iscriviamo.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { subscribeToPush, isPushSupported } from '@aegis/core';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function NotificationEnablePrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isIOS()) return;                              // iOS → usa l'install prompt
    if (!isPushSupported()) return;
    if (Notification.permission !== 'default') return; // una volta abilitato non riappare
    // Nessun cooldown: ricompare a OGNI prenotazione finché il cliente non abilita.
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const dismiss = useCallback(() => {
    // "Non ora": niente cooldown → ricompare alla prossima prenotazione
    setVisible(false);
  }, []);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { setVisible(false); return; }
      const sub = await subscribeToPush(vapidKey); // chiede il permesso internamente
      if (!sub) { setVisible(false); return; }
      const k = sub.getKey('p256dh');
      const a = sub.getKey('auth');
      if (!k || !a) { setVisible(false); return; }
      const p256dh = btoa(String.fromCharCode(...new Uint8Array(k)));
      const authKey = btoa(String.fromCharCode(...new Uint8Array(a)));
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint, p256dh, auth_key: authKey }),
      });
    } catch { /* silent */ }
    finally { setBusy(false); setVisible(false); }
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '120%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '120%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          style={{ zIndex: 10001 }}
          className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:max-w-sm md:rounded-3xl rounded-t-3xl backdrop-blur-3xl bg-white/10 border border-white/20 shadow-2xl shadow-purple-900/40"
        >
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold text-sm flex-1">Abilita le notifiche</span>
              <button onClick={dismiss} className="text-white/50 hover:text-white/80 transition-colors p-1 -mr-1" aria-label="Chiudi">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white/75 text-sm leading-relaxed mb-4">
              Ricevi un promemoria prima dell&apos;appuntamento per non perderti il tuo servizio.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={dismiss} className="text-white/50 text-sm hover:text-white/70 transition-colors flex-1 text-left">
                Non ora
              </button>
              <button
                onClick={enable}
                disabled={busy}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Bell className="w-4 h-4" />
                {busy ? 'Attivazione…' : 'Abilita'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
