// ============================================================================
// AEGIS BEAUTY - CUSTOMER LAYOUT WRAPPER
// File: apps/aegis-beauty/app/(customer)/CustomerLayoutWrapper.tsx
// Thin 'use client' shell — provides usePathname + useRouter to CustomerLayout
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { CustomerLayout, InstallPrompt, NotificationPrompt } from '@aegis/ui';
import type { CustomerLayoutProps, CustomerLayoutBusiness } from '@aegis/ui';
import { usePushSubscription } from '@/hooks/usePushSubscription';

type WrapperProps = Omit<CustomerLayoutProps, 'currentPath' | 'onNavigate'>;

export function CustomerLayoutWrapper({ children, business, ...props }: WrapperProps & { business: CustomerLayoutBusiness }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasBooked, setHasBooked] = useState(false);

  usePushSubscription();

  // Install PWA solo DOPO la prima prenotazione e MAI durante il flusso prenota
  // (lì compare già il banner notifiche). Ricontrolla a ogni navigazione perché
  // il flag viene settato al termine del booking.
  useEffect(() => {
    setHasBooked(localStorage.getItem('aegis_has_booked') === 'true');
  }, [pathname]);

  const isPrenota = pathname.includes('/prenota');
  const showInstall = hasBooked && !isPrenota;

  return (
    <>
      <Toaster position="top-center" richColors />
      {showInstall && <InstallPrompt businessName={business.name} />}
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
