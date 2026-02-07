// ============================================================================
// AEGIS BEAUTY - DASHBOARD LAYOUT CLIENT
// File: apps/aegis-beauty/app/(dashboard)/DashboardLayoutClient.tsx
// ============================================================================

'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardLayout,
  beautyTheme,
  ContentThemeProvider,
  beautyContentTheme,
} from '@aegis/ui';
import type { SidebarMenuItem } from '@aegis/ui';
import { createClient } from '@aegis/core';
import { beautyMenuSections, getActiveMenuId } from '@/config/menu';

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

export function DashboardLayoutClient({ data, children }: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Se siamo in onboarding, non mostrare il layout dashboard
  if (pathname.startsWith('/onboarding')) {
    return <>{children}</>;
  }

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
    <ContentThemeProvider theme={beautyContentTheme}>
      <DashboardLayout
        theme={beautyTheme}
        platformLogo={<AegisLogo />}
        menuSections={beautyMenuSections}
        activeItemId={activeItemId}
        businessName={data.business.name}
        businessLogo={data.business.logoUrl || undefined}
        userName={data.user.name}
        userEmail={data.user.email}
        onMenuItemClick={handleMenuItemClick}
        onLogout={handleLogout}
        onProfileClick={() => router.push('/dashboard/impostazioni')}
        onSettingsClick={() => router.push('/dashboard/impostazioni')}
        onHelp={() => router.push('/dashboard/aiuto')}
        showHelp
        showLogout
      >
        {children}
      </DashboardLayout>
    </ContentThemeProvider>
  );
}