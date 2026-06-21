// ============================================================================
// AEGIS BEAUTY - DASHBOARD LAYOUT CLIENT
// File: apps/aegis-beauty/app/(dashboard)/DashboardLayoutClient.tsx
// ============================================================================

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import {
  DashboardLayout,
  beautyTheme,
  ContentThemeProvider,
  beautyContentTheme,
  InstallPrompt,
  NotificationPrompt,
} from '@aegis/ui';
import type { SidebarMenuItem } from '@aegis/ui';
import { createClient, subscribeToPush, isPushSupported } from '@aegis/core';
import type { StaffPermissions } from '@aegis/core';
import { getMenuForRole, getActiveMenuId } from '@/config/menu';
import { StaffPermissionsProvider } from '@/lib/staff-permissions-context';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { useNotifications } from '@/hooks/useNotifications';
import type { HeaderNotification } from '@aegis/ui';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardData {
  business: {
    id: string;
    name: string;
    logoUrl: string | null;
    onboardingCompleted: boolean;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface DashboardLayoutClientProps {
  data: DashboardData;
  permissions: StaffPermissions;
  children: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DashboardLayoutClient({ data, permissions, children }: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  usePushSubscription();
  const { notifications, unreadCount, markRead } = useNotifications();

  // Desktop browser (non-standalone): gestisce permesso notifiche push
  useEffect(() => {
    if (!isPushSupported()) return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return; // gestito da usePushSubscription

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

    // Permesso già concesso: registra silenziosamente senza mostrare nulla
    if (Notification.permission === 'granted') {
      registerSubscription();
      return;
    }

    // Permesso non ancora chiesto: mostra toast custom dopo 3s
    if (Notification.permission === 'default') {
      const TOAST_ID = 'push-permission';
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
                Ricevi notifiche per le nuove prenotazioni
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
                    // Request permission immediately within user gesture (no ops before this)
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
                  Abilita
                </motion.button>
              </div>
            </div>
          ),
          { id: TOAST_ID, duration: Infinity }
        );
      }, 3000);
      return () => clearTimeout(t);
    }

    // 'denied': non fare nulla
  }, []);

  // Se siamo in onboarding, non mostrare il layout dashboard
  if (pathname.startsWith('/onboarding')) {
    return <>{children}</>;
  }

  // Determina menu corretto in base al ruolo
  const menuSections = getMenuForRole(permissions.isOwnerOrAdmin);

  // Determina menu item attivo
  const activeItemId = getActiveMenuId(pathname);

  // Handler per click su menu item
  const handleMenuItemClick = (item: SidebarMenuItem) => {
    router.push(item.href);
  };

  // Handler click su notifica: mark read + naviga all'URL se presente
  const handleNotificationClick = (notification: HeaderNotification) => {
    markRead([notification.id]);
    const full = notifications.find(n => n.id === notification.id);
    if (full?.url) router.push(full.url);
  };

  // Handler logout
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <StaffPermissionsProvider permissions={permissions}>
      <ContentThemeProvider theme={beautyContentTheme}>
        <Toaster position="top-right" richColors />
        <InstallPrompt businessName={data.business.name} />
        <NotificationPrompt />
        <DashboardLayout
          theme={beautyTheme}
          platformLogo="/logo-orizzontale.png?v=3"
          menuSections={menuSections}
          activeItemId={activeItemId}
          businessName={data.business.name}
          businessLogo={data.business.logoUrl || undefined}
          userName={data.user.name}
          userEmail={data.user.email}
          notifications={notifications}
          unreadCount={unreadCount}
          onNotificationClick={handleNotificationClick}
          onMenuItemClick={handleMenuItemClick}
          onLogout={handleLogout}
          onProfileClick={() => router.push('/dashboard/impostazioni?tab=account')}
          onSettingsClick={() => router.push('/dashboard/impostazioni?tab=generale')}
          onHelp={() => router.push('/dashboard/aiuto')}
          showHelp
          showLogout
          currentPath={pathname}
        >
          {children}
        </DashboardLayout>
      </ContentThemeProvider>
    </StaffPermissionsProvider>
  );
}