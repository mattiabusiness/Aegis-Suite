// ============================================================================
// AEGIS BEAUTY - BUSINESS LANDING PAGE (Public, SSR+revalidate)
// File: apps/aegis-beauty/app/(customer)/[businessSlug]/page.tsx
// Server Component — no auth required
// ============================================================================

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabaseClient, getBusinessBySlug } from '@aegis/core';
import type { ServiceCategory } from '@aegis/types';
import { BusinessContent } from './BusinessContent';

// ============================================================================
// SSR with 1-hour revalidation (zero cold-start cost)
// ============================================================================

export const revalidate = 3600;

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}): Promise<Metadata> {
  const { businessSlug } = await params;
  const supabase = createServerSupabaseClient(await cookies());
  const business = await getBusinessBySlug(supabase, businessSlug);

  if (!business) {
    return { title: 'Salone non trovato' };
  }

  return {
    title: `${business.name} — Prenota online`,
    description:
      business.description ??
      `Prenota un appuntamento da ${business.name}. Online, veloce, senza chiamate.`,
    openGraph: {
      title: business.name,
      description:
        business.description ??
        `Prenota un appuntamento da ${business.name}`,
      images: business.logo_url ? [{ url: business.logo_url }] : [],
    },
  };
}

// ============================================================================
// PAGE
// ============================================================================

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;
  const supabase = createServerSupabaseClient(await cookies());

  const business = await getBusinessBySlug(supabase, businessSlug);
  if (!business) notFound();

  // Fetch services + staff + business hours + categories in parallel
  const [servicesResult, staffResult, hoursResult, categoriesResult] = await Promise.all([
    supabase
      .from('services')
      .select('id, category_id, name, description, short_description, duration_minutes, buffer_minutes, price, price_from, image_url, display_order, is_active, requires_deposit, deposit_amount, is_addon, parent_service_id')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),

    supabase
      .from('staff')
      .select('id, full_name, nickname, bio, avatar_url, specializations, display_order, is_active, accepts_bookings, color')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .eq('accepts_bookings', true)
      .order('display_order', { ascending: true }),

    supabase
      .from('business_hours')
      .select('id, day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
      .eq('business_id', business.id)
      .order('day_of_week'),

    supabase
      .from('service_categories')
      .select('id, name, description, display_order, icon, is_active')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
  ]);

  const services   = servicesResult.data ?? [];
  const staff      = staffResult.data ?? [];
  const hours      = hoursResult.data ?? [];
  const categories = (categoriesResult.data ?? []) as ServiceCategory[];

  return (
    <BusinessContent
      business={business}
      services={services}
      staff={staff}
      hours={hours}
      categories={categories}
    />
  );
}
