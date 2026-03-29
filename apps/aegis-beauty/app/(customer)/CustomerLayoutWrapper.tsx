// ============================================================================
// AEGIS BEAUTY - CUSTOMER LAYOUT WRAPPER
// File: apps/aegis-beauty/app/(customer)/CustomerLayoutWrapper.tsx
// Thin 'use client' shell — provides usePathname + useRouter to CustomerLayout
// ============================================================================

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { CustomerLayout } from '@aegis/ui';
import type { CustomerLayoutProps } from '@aegis/ui';

type WrapperProps = Omit<CustomerLayoutProps, 'currentPath' | 'onNavigate'>;

export function CustomerLayoutWrapper({ children, ...props }: WrapperProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <CustomerLayout
      {...props}
      currentPath={pathname}
      onNavigate={(href) => router.push(href)}
    >
      {children}
    </CustomerLayout>
  );
}
