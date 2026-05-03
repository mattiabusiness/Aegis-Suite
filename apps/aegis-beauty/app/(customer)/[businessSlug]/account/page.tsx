// ============================================================================
// AEGIS BEAUTY - ACCOUNT PAGE (Protected)
// File: apps/aegis-beauty/app/(customer)/[businessSlug]/account/page.tsx
// Server Component — login required
// ============================================================================

import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
  getCurrentUser,
  getCurrentProfile,
  getBusinessBySlug,
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

  // Use admin client for customer + appointments queries to bypass any RLS policy
  // gaps on the customer-facing side. Safe because user.id comes from the validated
  // server-side session (not from the URL), and every query is filtered by it.
  const admin = createAdminSupabaseClient();

  const { data: customer } = await (admin as any)
    .from('customers')
    .select('id, user_id, business_id, full_name, email, phone, is_active, created_at, last_visit_at, total_spent, notes, tags, preferences')
    .eq('user_id', user.id)
    .eq('business_id', business.id)
    .eq('is_active', true)
    .maybeSingle();

  const [upcoming, past] = await Promise.all([
    customer
      ? getUpcomingAppointments(admin, customer.id, business.id)
      : Promise.resolve([]),
    customer
      ? getPastAppointments(admin, customer.id, business.id, 50)
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
