// ============================================================================
// AEGIS BEAUTY - CUSTOMER LAYOUT WRAPPER
// File: apps/aegis-beauty/app/(customer)/CustomerLayoutWrapper.tsx
// Thin 'use client' shell — provides usePathname + useRouter to CustomerLayout
// ============================================================================

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { CustomerLayout, InstallPrompt, NotificationPrompt } from '@aegis/ui';
import type { CustomerLayoutProps, CustomerLayoutBusiness } from '@aegis/ui';
import { subscribeToPush, isPushSupported } from '@aegis/core';
import { usePushSubscription } from '@/hooks/usePushSubscription';

type WrapperProps = Omit<CustomerLayoutProps, 'currentPath' | 'onNavigate'>;

export function CustomerLayoutWrapper({ children, business, ...props }: WrapperProps & { business: CustomerLayoutBusiness }) {
  const pathname = usePathname();
  const router = useRouter();

  usePushSubscription();

  // Notifiche push per cliente: browser desktop/Android non-standalone
  useEffect(() => {
    if (!isPushSupported()) return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    const registerSubscription = async () => {
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
      } catch { /* silent fail */ }
    };

    if (Notification.permission === 'granted') {
      registerSubscription();
      return;
    }

    if (Notification.permission === 'default') {
      const TOAST_ID = 'push-permission-customer';
      const t = setTimeout(() => {
        toast.custom(
          () => (
            <div style={{
              background: 'rgba(15,23,42,0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(168,85,247,0.25)',
              borderRadius: 16,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 8px 32px rgba(126,34,206,0.25)',
              minWidth: 300,
              maxWidth: 380,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #7e22ce, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bell style={{ width: 16, height: 16, color: '#fff' }} />
              </div>
              <p style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.4 }}>
                Ricevi promemoria prima dei tuoi appuntamenti
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => toast.dismiss(TOAST_ID)}
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px' }}
                >
                  Non ora
                </button>
                <motion.button
                  onClick={async () => {
                    const permission = await Notification.requestPermission();
                    toast.dismiss(TOAST_ID);
                    if (permission !== 'granted') return;
                    await registerSubscription();
                  }}
                  style={{
                    position: 'relative', overflow: 'hidden',
                    background: 'linear-gradient(135deg, #7e22ce, #a855f7)',
                    border: 'none', borderRadius: 10, cursor: 'pointer',
                    padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#fff',
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 4px 14px rgba(168,85,247,0.4)',
                  }}
                  whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(168,85,247,0.55)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.span
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 10,
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
                      pointerEvents: 'none',
                    }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }}
                  />
                  <Bell style={{ width: 13, height: 13 }} />
                  Attiva
                </motion.button>
              </div>
            </div>
          ),
          { id: TOAST_ID, duration: Infinity }
        );
      }, 5000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <>
      <Toaster position="top-center" richColors />
      <InstallPrompt businessName={business.name} />
      <NotificationPrompt />
      <CustomerLayout
        {...props}
        business={business}
        currentPath={pathname}
        onNavigate={(href) => router.push(href)}
      >
        {children}
      </CustomerLayout>
    </>
  );
}
