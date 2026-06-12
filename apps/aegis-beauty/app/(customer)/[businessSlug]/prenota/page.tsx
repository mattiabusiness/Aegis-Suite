// ============================================================================
// AEGIS BEAUTY - BOOKING PAGE (Protected, customer auth required)
// File: apps/aegis-beauty/app/(customer)/[businessSlug]/prenota/page.tsx
// Server Component — redirects to login if not authenticated
// ============================================================================

import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import {
  createServerSupabaseClient,
  getCurrentUser,
  getBusinessBySlug,
  getCustomerByUserId,
} from '@aegis/core';
import { PrenotaContent } from './PrenotaContent';

export default async function PrenotaPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;
  const supabase = createServerSupabaseClient(await cookies());

  // Auth guard — customer must be logged in
  const user = await getCurrentUser(supabase);
  if (!user) {
    redirect(`/login?redirect=/${businessSlug}/prenota`);
  }

  const business = await getBusinessBySlug(supabase, businessSlug);
  if (!business) notFound();

  // Fetch all data needed for the booking flow in parallel
  const [servicesResult, staffResult, hoursResult, customerResult, categoriesResult, shampooPriceResult, closuresResult] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, duration_minutes, price, price_from, category_id, display_order')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),

    supabase
      .from('staff')
      .select('id, full_name, nickname, avatar_url, specializations, display_order')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .eq('accepts_bookings', true)
      .order('display_order', { ascending: true }),

    supabase
      .from('business_hours')
      .select('day_of_week, is_open')
      .eq('business_id', business.id),

    getCustomerByUserId(supabase, user.id, business.id),

    supabase
      .from('service_categories')
      .select('id, name, display_order')
      .eq('business_id', business.id)
      .order('display_order', { ascending: true }),

    supabase
      .from('businesses')
      .select('shampoo_price')
      .eq('id', business.id)
      .single(),

    supabase
      .from('business_closures')
      .select('start_date, end_date, is_recurring_yearly')
      .eq('business_id', business.id),
  ]);

  const services   = servicesResult.data   ?? [];
  const staff      = staffResult.data      ?? [];
  const hours      = hoursResult.data      ?? [];
  const customer   = customerResult;
  const categories = categoriesResult.data ?? [];
  const shampooPrice = (shampooPriceResult.data as { shampoo_price: number } | null)?.shampoo_price ?? 3;

  const closures = ((closuresResult.data ?? []) as Array<{ start_date: string; end_date: string; is_recurring_yearly: boolean }>).map(c => ({
    startDate: c.start_date,
    endDate: c.end_date,
    isRecurringYearly: c.is_recurring_yearly,
  }));

  const businessWithShampoo = { ...business, shampoo_price: shampooPrice };

  return (
    <PrenotaContent
      business={businessWithShampoo}
      services={services}
      staff={staff}
      hours={hours}
      closures={closures}
      customer={customer}
      categories={categories}
    />
  );
}
