// ============================================================================
// AEGIS BEAUTY - BUSINESS CUSTOMER LAYOUT
// File: apps/aegis-beauty/app/(customer)/[businessSlug]/layout.tsx
// Server Component: loads business + customer, renders CustomerLayout
// ============================================================================

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  createServerSupabaseClient,
  getCurrentUser,
  getBusinessBySlug,
  getCustomerByUserId,
} from '@aegis/core';
import { beautyTheme } from '@aegis/ui';
import { CustomerProvider } from '@/lib/customer-context';
import { CustomerLayoutWrapper } from '../CustomerLayoutWrapper';

// ============================================================================
// LAYOUT
// ============================================================================

export default async function BusinessCustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;
  const supabase = createServerSupabaseClient(await cookies());

  const business = await getBusinessBySlug(supabase, businessSlug);
  if (!business) notFound();

  // Toggle booking_page_enabled (if the field doesn't exist, default to showing the page)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((business as any).booking_page_enabled === false) notFound();

  // Load customer only if user is logged in — page is public, customer is optional
  const user = await getCurrentUser(supabase);
  const customer = user
    ? await getCustomerByUserId(supabase, user.id, business.id)
    : null;

  return (
    <CustomerProvider business={business} customer={customer}>
      <CustomerLayoutWrapper business={business} customer={customer} theme={beautyTheme}>
        {children}
      </CustomerLayoutWrapper>
    </CustomerProvider>
  );
}
