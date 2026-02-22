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

  // Fetch staff
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('id, user_id, full_name, email, phone, color, is_active, role, staff_services(service_id)')
    .eq('business_id', businessId)
    .order('full_name', { ascending: true }) as { 
      data: Array<{
        id: string;
        user_id: string | null;
        full_name: string;
        email: string | null;
        phone: string | null;
        color: string | null;
        is_active: boolean | null;
        role: 'owner' | 'employee' | null;
        staff_services?: { service_id: string }[];
      }> | null;
      error: unknown;
    };

  if (staffError) {
    console.error('Error fetching staff:', JSON.stringify(staffError));
  }

  // Fetch services for services modal
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price, category:service_categories(name)')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('name') as {
      data: Array<{
        id: string;
        name: string;
        duration_minutes: number;
        price: number;
        category: { name: string } | null;
      }> | null;
    };

  // Fetch business hours for hours modal
  const { data: businessHours } = await supabase
    .from('business_hours')
    .select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
    .eq('business_id', businessId)
    .order('day_of_week') as {
      data: Array<{
        day_of_week: string;
        is_open: boolean;
        open_time_1: string | null;
        close_time_1: string | null;
        open_time_2: string | null;
        close_time_2: string | null;
      }> | null;
    };

  // Map staff with empty services count
  const staffWithServices = (staff || []).map(s => ({
    ...s,
    staff_services: [] as { service_id: string }[],
  }));

  return (
    <StaffContent
      initialStaff={staffWithServices}
      initialServices={services || []}
      initialBusinessHours={businessHours || []}
      businessId={businessId}
      businessSlug={businessSlug}
    />
  );
}