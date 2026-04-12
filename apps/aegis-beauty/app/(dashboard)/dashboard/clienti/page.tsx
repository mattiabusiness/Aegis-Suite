// ============================================================================
// AEGIS BEAUTY - CLIENTI PAGE
// File: apps/aegis-beauty/app/(dashboard)/dashboard/clienti/page.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import { ClientiContent } from './CustomersContent';

// ============================================================================
// PAGE
// ============================================================================

export default async function ClientiPage() {
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

  // Fetch customers with counts
  const { data: customers, count: totalCount } = await supabase
    .from('customers')
    .select('id, full_name, email, phone, total_appointments, total_spent, last_visit_at, is_active, notes, preferences, tags, birth_date, gender, source, accepts_marketing, created_at, user_id, invited_at', { count: 'exact' })
    .eq('business_id', businessId)
    .order('full_name', { ascending: true })
    .range(0, 19) as {
      data: Array<{
        id: string;
        full_name: string;
        email: string | null;
        phone: string | null;
        total_appointments: number;
        total_spent: number;
        last_visit_at: string | null;
        is_active: boolean;
        notes: string | null;
        preferences: string | null;
        tags: string[] | null;
        birth_date: string | null;
        gender: string | null;
        source: string | null;
        accepts_marketing: boolean;
        created_at: string;
        user_id: string | null;
        invited_at: string | null;
      }> | null;
      count: number | null;
    };

  // ============================================================================
  // CALCULATE REAL TOTAL SPENT FROM APPOINTMENT_SERVICES
  // The customers.total_spent field may not be updated automatically,
  // so we calculate the real total from completed appointments.
  // ============================================================================

  const customerIds = (customers || []).map(c => c.id);
  
  let spentByCustomer: Record<string, number> = {};
  let visitsByCustomer: Record<string, number> = {};

  if (customerIds.length > 0) {
    // Fetch completed appointments with their services prices for these customers
    const { data: completedAppointments } = await supabase
      .from('appointments')
      .select(`
        id, customer_id, status,
        appointment_services(price)
      `)
      .eq('business_id', businessId)
      .in('customer_id', customerIds)
      .eq('status', 'completed') as { 
        data: Array<{
          id: string;
          customer_id: string;
          status: string;
          appointment_services: Array<{ price: number }>;
        }> | null 
      };

    // Sum up prices per customer
    (completedAppointments || []).forEach(apt => {
      const customerId = apt.customer_id;
      const aptTotal = (apt.appointment_services || []).reduce((sum, s) => sum + (s.price || 0), 0);
      
      spentByCustomer[customerId] = (spentByCustomer[customerId] || 0) + aptTotal;
      visitsByCustomer[customerId] = (visitsByCustomer[customerId] || 0) + 1;
    });
  }

  // Merge real totals into customer data
  const customersWithRealTotals = (customers || []).map(c => ({
    ...c,
    total_spent: spentByCustomer[c.id] || c.total_spent || 0,
    total_appointments: visitsByCustomer[c.id] || c.total_appointments || 0,
  }));

  // Get filter counts
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  // Count queries in parallelo
  const [activeResult, newResult, inactiveResult] = await Promise.all([
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', businessId).gte('last_visit_at', thirtyDaysAgoStr),
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', businessId).gte('created_at', sevenDaysAgoStr),
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', businessId).or(`last_visit_at.is.null,last_visit_at.lt.${thirtyDaysAgoStr}`),
  ]);
  const activeCount = activeResult.count;
  const newCount = newResult.count;
  const inactiveCount = inactiveResult.count;

  // Fetch staff (con staff_services join), services, hours e closures in parallelo
  const [staffResult, servicesResult, hoursResult, closuresResult] = await Promise.all([
    supabase.from('staff').select('id, full_name, color, staff_services(service_id)').eq('business_id', businessId).eq('is_active', true),
    supabase.from('services').select('id, name, duration_minutes, price, category:service_categories(id, name)').eq('business_id', businessId).eq('is_active', true).order('name'),
    supabase.from('business_hours').select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2').eq('business_id', businessId),
    supabase.from('business_closures').select('date, reason').eq('business_id', businessId),
  ]);

  const staffWithServices = (staffResult.data || []) as Array<{
    id: string; full_name: string; color: string | null;
    staff_services: Array<{ service_id: string }> | null;
  }>;
  const staffList = staffWithServices.map(({ staff_services: _ss, ...s }) => s);
  const staffServices = staffWithServices.flatMap(s =>
    (s.staff_services || []).map(ss => ({ staff_id: s.id, service_id: ss.service_id }))
  );

  const services = (servicesResult.data || []) as Array<{
    id: string; name: string; duration_minutes: number; price: number;
    category: { id: string; name: string } | null;
  }>;
  const businessHours = (hoursResult.data || []) as Array<{
    day_of_week: string; is_open: boolean;
    open_time_1: string | null; close_time_1: string | null;
    open_time_2: string | null; close_time_2: string | null;
  }>;
  const closures = (closuresResult.data || []) as Array<{ date: string; reason: string }>;

  // Transform services for modal
  const servicesForModal = services.map(s => ({
    id: s.id,
    name: s.name,
    duration: s.duration_minutes,
    price: s.price,
    categoryId: s.category?.id,
    categoryName: s.category?.name,
  }));

  return (
    <ClientiContent
      initialCustomers={customersWithRealTotals}
      totalCount={totalCount || 0}
      filterCounts={{
        all: totalCount || 0,
        active: activeCount || 0,
        new: newCount || 0,
        inactive: inactiveCount || 0,
      }}
      staffList={staffList}
      servicesList={servicesForModal}
      staffServices={staffServices}
      businessHours={businessHours}
      closures={closures}
      businessId={businessId}
    />
  );
}