// ============================================================================
// AEGIS BEAUTY - DASHBOARD OVERVIEW PAGE
// File: apps/aegis-beauty/app/(dashboard)/page.tsx
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser } from '@aegis/core';
import { OverviewContent } from './OverviewContent';

// ============================================================================
// TYPES
// ============================================================================

interface BusinessStats {
  appointmentsToday: number;
  appointmentsWeek: number;
  revenueMonth: number;
  totalCustomers: number;
  noShowRate: number;
}

interface ROIData {
  weeklyHours: number;
  monthlyHours: number;
  yearlyHours: number;
  noShowReduction: number;
  hourlyValue: number;
}

// ============================================================================
// SERVER COMPONENT
// ============================================================================

export default async function DashboardOverviewPage() {
  // Next.js 15: cookies() è async
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect('/login');
  }

  // Ottieni business member
  const { data: businessMember } = await supabase
    .from('business_members')
    .select('business_id, role, can_see_business_calendar')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!businessMember) {
    redirect('/login?reason=no_access');
  }

  const businessId = (businessMember as { business_id: string; role: string; can_see_business_calendar: boolean }).business_id;
  const memberRole = (businessMember as { business_id: string; role: string; can_see_business_calendar: boolean }).role;
  const canSeeBusinessCalendar = (businessMember as { business_id: string; role: string; can_see_business_calendar: boolean }).can_see_business_calendar ?? false;

  // Determina se è staff per filtrare i dati server-side
  const isStaff = memberRole === 'staff';

  // Se è staff, recupera il suo staff.id per filtrare gli appuntamenti della overview
  let currentStaffId: string | null = null;
  if (isStaff) {
    const { data: staffRecord } = await supabase
      .from('staff')
      .select('id')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .single() as { data: { id: string } | null };
    currentStaffId = staffRecord?.id ?? null;
  }

  // Ottieni dati business (incluso ROI data)
  const { data: business } = await supabase
    .from('businesses')
    .select('name, slug, business_type, roi_data, onboarding_completed')
    .eq('id', businessId)
    .single();

  // Se onboarding non completato, redirect
  if (!(business as any)?.onboarding_completed) {
    redirect('/onboarding');
  }

  // ============================================================================
  // FETCH STATISTICHE (per ora valori placeholder, poi implementeremo query reali)
  // ============================================================================

  // Conta appuntamenti di oggi
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Per staff: la overview mostra sempre i propri appuntamenti
  const filterByStaff = isStaff && currentStaffId;

  const apptTodayQuery = supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString())
    .neq('status', 'cancelled');
  if (filterByStaff) apptTodayQuery.eq('staff_id', currentStaffId!);
  const { count: appointmentsToday } = await apptTodayQuery;

  // Conta appuntamenti settimana
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lunedì
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const apptWeekQuery = supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('start_time', weekStart.toISOString())
    .lt('start_time', weekEnd.toISOString())
    .neq('status', 'cancelled');
  if (filterByStaff) apptWeekQuery.eq('staff_id', currentStaffId!);
  const { count: appointmentsWeek } = await apptWeekQuery;

  // Conta clienti totali (solo per owner/admin)
  const { count: totalCustomers } = !isStaff
    ? await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', businessId)
    : { count: 0 };

  // Conta servizi attivi (solo per owner/admin)
  const { count: totalServices } = !isStaff
    ? await supabase.from('services').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('is_active', true)
    : { count: 0 };

  // Conta staff attivo (solo per owner/admin)
  const { count: totalStaff } = !isStaff
    ? await supabase.from('staff').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('is_active', true)
    : { count: 0 };

  // Conta staff incompleti (solo per owner/admin)
  const { count: incompleteStaff } = !isStaff
    ? await supabase.from('staff').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('is_active', true).is('email', null)
    : { count: 0 };

  // Prepara dati per il client
  const stats = {
    appointmentsToday: appointmentsToday || 0,
    appointmentsWeek: appointmentsWeek || 0,
    totalCustomers: totalCustomers || 0,
    totalServices: totalServices || 0,
    totalStaff: totalStaff || 0,
    incompleteStaff: incompleteStaff || 0,
  };

  // Statistiche business-wide (solo per staff con canSeeBusinessCalendar)
  let businessAppointmentsToday = 0;
  let businessAppointmentsWeek = 0;
  if (isStaff && canSeeBusinessCalendar) {
    const [bToday, bWeek] = await Promise.all([
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .neq('status', 'cancelled'),
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .gte('start_time', weekStart.toISOString())
        .lt('start_time', weekEnd.toISOString())
        .neq('status', 'cancelled'),
    ]);
    businessAppointmentsToday = bToday.count ?? 0;
    businessAppointmentsWeek = bWeek.count ?? 0;
  }

  type ApptDetailRow = {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    customer: { full_name: string } | null;
    staff: { full_name: string; color: string | null } | null;
    appointment_services: Array<{ service_name: string }>;
  };

  // Fetch appuntamenti di oggi con dettagli (filtrati per staff se necessario)
  const todayApptDetailQuery = supabase
    .from('appointments')
    .select(`
      id, start_time, end_time, status,
      customer:customers(full_name),
      staff:staff(full_name, color),
      appointment_services(service_name)
    `)
    .eq('business_id', businessId)
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString())
    .neq('status', 'cancelled');
  if (filterByStaff) todayApptDetailQuery.eq('staff_id', currentStaffId!);
  const { data: todayAppointments } = await todayApptDetailQuery
    .order('start_time', { ascending: true }) as { data: ApptDetailRow[] | null };

  // Fetch tutti gli appuntamenti di oggi (senza filtro staff) per il tab "Team"
  let allTodayAppointmentsRaw: ApptDetailRow[] = [];
  if (isStaff && canSeeBusinessCalendar) {
    const { data } = await supabase
      .from('appointments')
      .select(`
        id, start_time, end_time, status,
        customer:customers(full_name),
        staff:staff(full_name, color),
        appointment_services(service_name)
      `)
      .eq('business_id', businessId)
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString())
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true }) as { data: ApptDetailRow[] | null };
    allTodayAppointmentsRaw = data ?? [];
  }

  // ============================================================================
  // FETCH DATA FOR APPOINTMENT MODAL
  // ============================================================================

  // Fetch modal data in parallel (tutte indipendenti tranne staffServices che dipende dagli ID staff)
  const [
    { data: staffList },
    { data: servicesList },
    { data: businessHoursData },
    { data: closuresData },
    { data: customersList },
    { data: categoriesList },
  ] = await Promise.all([
    supabase.from('staff').select('id, full_name, color').eq('business_id', businessId).eq('is_active', true) as unknown as Promise<{ data: Array<{ id: string; full_name: string; color: string | null }> | null }>,
    supabase.from('services').select('id, name, duration_minutes, price, category:service_categories(id, name)').eq('business_id', businessId).eq('is_active', true).order('name') as unknown as Promise<{ data: Array<{ id: string; name: string; duration_minutes: number; price: number; category: { id: string; name: string } | null }> | null }>,
    supabase.from('business_hours').select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2').eq('business_id', businessId) as unknown as Promise<{ data: Array<{ day_of_week: string; is_open: boolean; open_time_1: string | null; close_time_1: string | null; open_time_2: string | null; close_time_2: string | null }> | null }>,
    supabase.from('business_closures').select('start_date, title').eq('business_id', businessId) as unknown as Promise<{ data: Array<{ start_date: string; title: string }> | null }>,
    supabase.from('customers').select('id, full_name, email, phone').eq('business_id', businessId).order('full_name') as unknown as Promise<{ data: Array<{ id: string; full_name: string; email: string | null; phone: string | null }> | null }>,
    supabase.from('service_categories').select('id, name').eq('business_id', businessId).eq('is_active', true).order('name') as unknown as Promise<{ data: Array<{ id: string; name: string }> | null }>,
  ]);

  // staffServices dipende dagli ID staff — fetch separato
  const { data: staffServices } = await supabase
    .from('staff_services')
    .select('staff_id, service_id')
    .in('staff_id', (staffList || []).map(s => s.id)) as { data: Array<{ staff_id: string; service_id: string }> | null };

  const mapAppt = (apt: ApptDetailRow) => ({
    id: apt.id,
    time: new Date(apt.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    endTime: new Date(apt.end_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    customerName: apt.customer?.full_name || 'Cliente',
    staffName: apt.staff?.full_name || '',
    staffColor: apt.staff?.color || '#9333ea',
    serviceName: apt.appointment_services?.[0]?.service_name || 'Appuntamento',
    status: apt.status,
  });

  return (
    <OverviewContent
      stats={stats}
      roiData={null}
      businessName={(business as any)?.name || 'Il tuo salone'}
      businessSlug={(business as any)?.slug || ''}
      businessType={(business as any)?.business_type || 'mixed'}
      businessId={businessId}
      todayAppointments={(todayAppointments || []).map(mapAppt)}
      allTodayAppointments={allTodayAppointmentsRaw.map(mapAppt)}
      businessStats={isStaff && canSeeBusinessCalendar ? { appointmentsToday: businessAppointmentsToday, appointmentsWeek: businessAppointmentsWeek } : undefined}
      customers={customersList || []}
      services={(servicesList || []).map(s => ({
        id: s.id,
        name: s.name,
        duration: s.duration_minutes,
        price: s.price,
        categoryId: s.category?.id,
        categoryName: s.category?.name,
      }))}
      staff={staffList || []}
      staffServices={staffServices || []}
      businessHours={businessHoursData || []}
      closures={(closuresData || []).map(c => ({ date: c.start_date, reason: c.title }))}
      categories={categoriesList || []}
    />
  );
}