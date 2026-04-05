// ============================================================================
// AEGIS BEAUTY - ACCOUNT PAGE (Protected)
// File: apps/aegis-beauty/app/(customer)/[businessSlug]/account/page.tsx
// Server Component — login required
// ============================================================================

import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import {
  createServerSupabaseClient,
  getCurrentUser,
  getCurrentProfile,
  getBusinessBySlug,
  getCustomerByUserId,
  getUpcomingAppointments,
  getPastAppointments,
} from '@aegis/core';
import { AccountContent } from './AccountContent';

export default async function AccountPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;
  const supabase = createServerSupabaseClient(await cookies());

  // Auth guard — must be logged in
  const user = await getCurrentUser(supabase);
  if (!user) {
    redirect(`/login?redirect=/${businessSlug}/account`);
  }

  const [business, profile] = await Promise.all([
    getBusinessBySlug(supabase, businessSlug),
    getCurrentProfile(supabase),
  ]);

  if (!business) notFound();

  const customer = await getCustomerByUserId(supabase, user.id, business.id);

  const [upcoming, past] = await Promise.all([
    customer
      ? getUpcomingAppointments(supabase, customer.id, business.id)
      : Promise.resolve([]),
    customer
      ? getPastAppointments(supabase, customer.id, business.id, 50)
      : Promise.resolve([]),
  ]);

  // Fallback a user_metadata se il profilo non è ancora stato creato nel DB
  const meta = user.user_metadata ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effectiveProfile = (profile ?? {
    id: user.id,
    full_name: (meta.full_name as string) || customer?.full_name || '',
    email: user.email ?? '',
    phone: (meta.phone as string) || customer?.phone || null,
    avatar_url: null,
    created_at: null,
    updated_at: null,
  }) as any;

  return (
    <AccountContent
      business={business}
      customer={customer}
      profile={effectiveProfile}
      upcoming={upcoming}
      past={past}
      userId={user.id}
      userEmail={user.email ?? ''}
    />
  );
}
