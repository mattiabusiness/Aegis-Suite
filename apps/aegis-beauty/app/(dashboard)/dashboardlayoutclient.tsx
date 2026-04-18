// ============================================================================
// AEGIS BEAUTY - DASHBOARD LAYOUT CLIENT
// File: apps/aegis-beauty/app/(dashboard)/DashboardLayoutClient.tsx
// ============================================================================

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
// LOGO COMPONENT
// ============================================================================

function AegisLogo() {
  return (
    <svg
      className="w-6 h-6 text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
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

    // Permesso non ancora chiesto: mostra toast dopo 3s
    if (Notification.permission === 'default') {
      const t = setTimeout(() => {
        toast.info('Ricevi notifiche per le nuove prenotazioni', {
          duration: Infinity,
          action: {
            label: 'Abilita',
            onClick: registerSubscription,
          },
          cancel: { label: 'Non ora', onClick: () => {} },
        });
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
          platformLogo={<AegisLogo />}
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