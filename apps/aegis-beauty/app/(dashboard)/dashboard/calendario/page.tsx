// ============================================================================
// AEGIS BEAUTY - CALENDARIO PAGE
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

  if (!user) {
    redirect('/login');
  }

  // Get user's business
  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single() as { data: { business_id: string } | null };

  if (!businessMember) {
    redirect('/login');
  }

  const businessId = businessMember.business_id;

  // Fetch appointments for this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id, start_time, end_time, status, notes,
      customer:customers(full_name),
      staff:staff(full_name, color),
      appointment_services(service_name)
    `)
    .eq('business_id', businessId)
    .gte('start_time', startOfWeek.toISOString())
    .lte('start_time', endOfWeek.toISOString())
    .order('start_time', { ascending: true }) as { data: any[] | null };

  // Fetch staff
  const { data: staff } = await supabase
    .from('staff')
    .select('id, full_name, color')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('full_name') as { data: { id: string; full_name: string; color: string | null }[] | null };

  // Fetch business hours
  const { data: businessHours } = await supabase
    .from('business_hours')
    .select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
    .eq('business_id', businessId) as { data: BusinessHoursData[] | null };

  // Fetch closures
  const { data: closures } = await supabase
    .from('business_closures')
    .select('date, reason')
    .eq('business_id', businessId)
    .gte('date', startOfWeek.toISOString().split('T')[0]) as { data: ClosureData[] | null };

  // Fetch customers for modal
  const { data: customers } = await supabase
    .from('customers')
    .select('id, full_name, phone, email')
    .eq('business_id', businessId)
    .order('full_name') as { data: { id: string; full_name: string; phone: string | null; email: string | null }[] | null };

  // Fetch services for modal
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price, category:service_categories(id, name)')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('name') as { data: { id: string; name: string; duration_minutes: number; price: number; category: { id: string; name: string } | null }[] | null };

  // Fetch staff_services for compatibility checking
  const { data: staffServices } = await supabase
    .from('staff_services')
    .select('staff_id, service_id')
    .in('staff_id', (staff || []).map(s => s.id)) as { data: { staff_id: string; service_id: string }[] | null };

  // Transform appointments to calendar events
  const events: CalendarEventData[] = (appointments || []).map((apt) => ({
    id: apt.id,
    title: apt.appointment_services?.[0]?.service_name || 'Appuntamento',
    startTime: new Date(apt.start_time),
    endTime: new Date(apt.end_time),
    customerName: apt.customer?.full_name,
    staffName: apt.staff?.full_name,
    staffColor: apt.staff?.color,
    status: apt.status as 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show',
    notes: apt.notes,
  }));

  // Transform customers
  const customersForModal = (customers || []).map(c => ({
    id: c.id,
    name: c.full_name,
    phone: c.phone || undefined,
    email: c.email || undefined,
  }));

  // Transform services
  const servicesForModal = (services || []).map(s => ({
    id: s.id,
    name: s.name,
    duration: s.duration_minutes,
    price: s.price,
    categoryId: s.category?.id,
    categoryName: s.category?.name,
  }));

  return (
    <CalendarioContent
      initialEvents={events}
      staffList={staff || []}
      businessId={businessId}
      businessHours={businessHours || []}
      closures={closures || []}
      customers={customersForModal}
      services={servicesForModal}
      staffServices={staffServices || []}
    />
  );
}