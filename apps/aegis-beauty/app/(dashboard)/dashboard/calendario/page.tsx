// ============================================================================
// AEGIS BEAUTY - CALENDARIO PAGE (v2 — Complete Data Fetch)
// File: apps/aegis-beauty/app/(dashboard)/dashboard/calendario/page.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import { CalendarioContent } from './CalendarioContent';
import type { CalendarEventData, BusinessHoursData, ClosureData } from '@aegis/ui';

export default async function CalendarioPage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);

  if (!user) redirect('/login');

  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single() as { data: { business_id: string } | null };

  if (!businessMember) redirect('/login');

  const businessId = businessMember.business_id;

  // ========================================================================
  // FETCH ALL DATA IN PARALLEL
  // ========================================================================

  // Date range for initial load (current week)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const [
    appointmentsResult,
    staffResult,
    businessHoursResult,
    closuresResult,
    servicesResult,
    businessResult,
  ] = await Promise.all([
    // Appointments for this week
    supabase
      .from('appointments')
      .select(`
        id, start_time, end_time, status, staff_notes, staff_id, include_shampoo,
        customer:customers(full_name),
        staff:staff(full_name, color),
        appointment_services(service_name)
      `)
      .eq('business_id', businessId)
      .gte('start_time', startOfWeek.toISOString())
      .lte('start_time', endOfWeek.toISOString())
      .order('start_time', { ascending: true }),

    // Staff con i servizi associati (join unica, elimina query separata)
    supabase
      .from('staff')
      .select('id, full_name, color, staff_services(service_id)')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('full_name'),

    // Business hours
    supabase
      .from('business_hours')
      .select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
      .eq('business_id', businessId),

    // Closures
    supabase
      .from('business_closures')
      .select('start_date, end_date, title, is_recurring_yearly')
      .eq('business_id', businessId),

    // Services (for appointment modal)
    supabase
      .from('services')
      .select('id, name, duration_minutes, price, category_id, service_categories(name)')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('display_order'),

    // Business shampoo price
    supabase
      .from('businesses')
      .select('shampoo_price')
      .eq('id', businessId)
      .single(),

  ]);

  // ========================================================================
  // TRANSFORM DATA
  // ========================================================================

  // Events
  const events: CalendarEventData[] = (appointmentsResult.data || []).map((a: Record<string, unknown>) => {
    const customer = a.customer as { full_name: string } | null;
    const staff = a.staff as { full_name: string; color: string | null } | null;
    const services = a.appointment_services as Array<{ service_name: string }> | null;

    return {
      id: a.id as string,
      title: services?.[0]?.service_name || 'Appuntamento',
      startTime: new Date(a.start_time as string),
      endTime: new Date(a.end_time as string),
      customerName: customer?.full_name,
      staffName: staff?.full_name,
      staffColor: staff?.color || undefined,
      staffId: a.staff_id as string,
      status: (a.status as CalendarEventData['status']) || 'confirmed',
      notes: a.staff_notes as string | undefined,
      includeShampoo: (a.include_shampoo as boolean) || false,
    };
  });

  // Staff
  const staffWithServices = (staffResult.data || []) as Array<{
    id: string;
    full_name: string;
    color: string | null;
    staff_services: Array<{ service_id: string }> | null;
  }>;
  const staff = staffWithServices.map(({ staff_services: _ss, ...s }) => s);

  // Business hours
  const businessHours = (businessHoursResult.data || []) as BusinessHoursData[];

  // Closures — flatten date ranges into individual dates for the calendar
  const rawClosures = (closuresResult.data || []) as Array<{
    start_date: string; end_date: string; title: string; is_recurring_yearly: boolean;
  }>;
  const closures: ClosureData[] = rawClosures.flatMap(c => {
    const dates: ClosureData[] = [];
    const start = new Date(c.start_date);
    const end = new Date(c.end_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      dates.push({ date: dateStr, reason: c.title });
    }
    return dates;
  });

  // Services for modal
  const services = (servicesResult.data || []).map((s: Record<string, unknown>) => {
    const category = s.service_categories as { name: string } | null;
    return {
      id: s.id as string,
      name: s.name as string,
      duration: s.duration_minutes as number,
      price: s.price as number,
      categoryId: (s.category_id as string) || undefined,
      categoryName: category?.name || undefined,
    };
  });

  // Staff-Services map (derivata dalla join inclusa nella query staff)
  const staffServicesMap: Record<string, string[]> = {};
  for (const s of staffWithServices) {
    staffServicesMap[s.id] = (s.staff_services || []).map(ss => ss.service_id);
  }

  const shampooPrice = (businessResult.data as { shampoo_price: number } | null)?.shampoo_price ?? 5;

  return (
    <CalendarioContent
      businessId={businessId}
      initialEvents={events}
      initialStaff={staff}
      businessHours={businessHours}
      closures={closures}
      services={services}
      staffServices={staffServicesMap}
      shampooPrice={shampooPrice}
    />
  );
}