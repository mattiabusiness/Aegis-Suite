// ============================================================================
// AEGIS BEAUTY - DASHBOARD LAYOUT CLIENT
// File: apps/aegis-beauty/app/(dashboard)/DashboardLayoutClient.tsx
// ============================================================================

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import {
  DashboardLayout,
  beautyTheme,
  ContentThemeProvider,
  beautyContentTheme,
  InstallPrompt,
} from '@aegis/ui';
import type { SidebarMenuItem } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { StaffPermissions } from '@aegis/core';
import { getMenuForRole, getActiveMenuId } from '@/config/menu';
import { StaffPermissionsProvider } from '@/lib/staff-permissions-context';
import { usePushSubscription } from '@/hooks/usePushSubscription';

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

  // Handler per logout
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
        <DashboardLayout
          theme={beautyTheme}
          platformLogo={<AegisLogo />}
          menuSections={menuSections}
          activeItemId={activeItemId}
          businessName={data.business.name}
          businessLogo={data.business.logoUrl || undefined}
          userName={data.user.name}
          userEmail={data.user.email}
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