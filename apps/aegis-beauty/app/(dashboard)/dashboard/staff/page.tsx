// ============================================================================
// AEGIS BEAUTY - STAFF PAGE
// File: apps/aegis-beauty/app/(dashboard)/dashboard/staff/page.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import { StaffContent } from './StaffContent';

// ============================================================================
// PAGE
// ============================================================================

export default async function StaffPage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect('/login');
  }

  // Get user's business with slug
  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id, businesses(slug)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single() as { data: { business_id: string; businesses: { slug: string } | null } | null };

  if (!businessMember) {
    redirect('/login');
  }

  const businessId = businessMember.business_id;
  const businessSlug = businessMember.businesses?.slug || '';

  // Fetch staff, services e business hours in parallelo
  const [staffResult, servicesResult, hoursResult] = await Promise.all([
    supabase
      .from('staff')
      .select('id, user_id, full_name, email, phone, color, is_active, role, staff_services(service_id)')
      .eq('business_id', businessId)
      .order('full_name', { ascending: true }),
    supabase
      .from('services')
      .select('id, name, duration_minutes, price, category:service_categories(name)')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('business_hours')
      .select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
      .eq('business_id', businessId)
      .order('day_of_week'),
  ]);

  const staff = staffResult.data as Array<{
    id: string; user_id: string | null; full_name: string; email: string | null;
    phone: string | null; color: string | null; is_active: boolean | null;
    role: 'owner' | 'employee' | null; staff_services?: { service_id: string }[];
  }> | null;
  if (staffResult.error) console.error('Error fetching staff:', JSON.stringify(staffResult.error));

  const services = servicesResult.data as Array<{
    id: string; name: string; duration_minutes: number; price: number;
    category: { name: string } | null;
  }> | null;

  const businessHours = hoursResult.data as Array<{
    day_of_week: string; is_open: boolean;
    open_time_1: string | null; close_time_1: string | null;
    open_time_2: string | null; close_time_2: string | null;
  }> | null;

  return (
    <StaffContent
      initialStaff={staff || []}
      initialServices={services || []}
      initialBusinessHours={businessHours || []}
      businessId={businessId}
      businessSlug={businessSlug}
    />
  );
}