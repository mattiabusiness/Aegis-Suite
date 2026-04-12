// ============================================================================
// AEGIS BEAUTY - CUSTOMER LAYOUT WRAPPER
// File: apps/aegis-beauty/app/(customer)/CustomerLayoutWrapper.tsx
// Thin 'use client' shell — provides usePathname + useRouter to CustomerLayout
// ============================================================================

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { CustomerLayout, InstallPrompt, NotificationPrompt } from '@aegis/ui';
import type { CustomerLayoutProps, CustomerLayoutBusiness } from '@aegis/ui';
import { usePushSubscription } from '@/hooks/usePushSubscription';

type WrapperProps = Omit<CustomerLayoutProps, 'currentPath' | 'onNavigate'>;

export function CustomerLayoutWrapper({ children, business, ...props }: WrapperProps & { business: CustomerLayoutBusiness }) {
  const pathname = usePathname();
  const router = useRouter();

  usePushSubscription();

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
